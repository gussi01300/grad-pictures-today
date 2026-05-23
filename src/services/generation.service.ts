import { Queue, Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { generateImage, type GenerationParams } from "@/lib/openrouter";
import { db } from "@/lib/db";
import { uploadToR2, getSignedDownloadUrl } from "@/lib/r2";

const QUEUE_NAME = "image-generation";

export interface GenerationJobData {
  generationId: string;
  userId: string;
  params: GenerationParams;
}

export const generationQueue = new Queue<GenerationJobData>(QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export async function addGenerationJob(
  generationId: string,
  userId: string,
  params: GenerationParams
): Promise<void> {
  await generationQueue.add(
    "generate",
    { generationId, userId, params },
    {
      jobId: generationId,
    }
  );
}

export async function processGenerationJob(
  job: Job<GenerationJobData>
): Promise<void> {
  const { generationId, params } = job.data;

  // Update status to processing
  await db.generation.update({
    where: { id: generationId },
    data: { status: "PROCESSING", attempts: job.attemptsMade + 1 },
  });

  try {
    // Generate image using AI
    const imageUrl = await generateImage(params);

    // Download the generated image with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const imageResponse = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeout);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Upload to R2
    const outputKey = `generations/${generationId}/output.png`;
    await uploadToR2(outputKey, imageBuffer, "image/png");

    // Generate signed URL for download
    const signedUrl = await getSignedDownloadUrl(outputKey);

    // Update generation record
    await db.generation.update({
      where: { id: generationId },
      data: {
        status: "COMPLETED",
        outputUrl: signedUrl,
      },
    });

    // Update generation with watermark URL (frontend adds watermark overlay)
    await db.generation.update({
      where: { id: generationId },
      data: {
        watermarkUrl: signedUrl, // Same URL, frontend adds watermark overlay
      },
    });
  } catch (error) {
    // Update attempt count
    await db.generation.update({
      where: { id: generationId },
      data: { attempts: job.attemptsMade + 1 },
    });

    // If max attempts reached, mark as failed
    if (job.attemptsMade + 1 >= (job.opts.attempts ?? 3)) {
      await db.generation.update({
        where: { id: generationId },
        data: { status: "FAILED" },
      });
    }

    throw error;
  }
}

export function createGenerationWorker(): Worker<GenerationJobData> {
  // Parse Redis URL properly
  const redisUrl = new URL(process.env.REDIS_URL ?? "redis://localhost:6379");
  const redisHost = redisUrl.hostname;
  const redisPort = parseInt(redisUrl.port) || 6379;

  return new Worker<GenerationJobData>(
    QUEUE_NAME,
    async (job) => processGenerationJob(job),
    {
      connection: {
        host: redisHost,
        port: redisPort,
        maxRetriesPerRequest: null,
      },
      concurrency: 5,
    }
  );
}

export async function getGenerationStatus(
  generationId: string
): Promise<{
  status: string;
  attempts: number;
  outputUrl: string | null;
  watermarkUrl: string | null;
} | null> {
  const generation = await db.generation.findUnique({
    where: { id: generationId },
    select: {
      status: true,
      attempts: true,
      outputUrl: true,
      watermarkUrl: true,
    },
  });

  return generation;
}
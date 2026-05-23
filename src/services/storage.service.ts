import { db } from "@/lib/db";
import { deleteFromR2, listR2Objects } from "@/lib/r2";
import { redis } from "@/lib/redis";
const GENERATION_EXPIRY_HOURS = parseInt(
  process.env.GENERATION_EXPIRY_HOURS ?? "168"
);

interface CleanupResult {
  deletedCount: number;
  deletedSize: number;
}

export async function cleanupExpiredUploads(): Promise<CleanupResult> {
  const now = new Date();
  let deletedCount = 0;
  let deletedSize = 0;

  // Find expired uploads
  const expiredUploads = await db.upload.findMany({
    where: { expiresAt: { lt: now } },
    select: { id: true, key: true, size: true },
  });

  for (const upload of expiredUploads) {
    try {
      await deleteFromR2(upload.key);
      await db.upload.delete({ where: { id: upload.id } });
      deletedCount++;
      deletedSize += upload.size;
    } catch (error) {
      console.error(`Failed to delete upload ${upload.id}:`, error);
    }
  }

  // Log cleanup
  await db.cleanupLog.create({
    data: {
      type: "uploads",
      deletedCount,
      deletedSize: BigInt(deletedSize),
    },
  });

  return { deletedCount, deletedSize };
}

export async function cleanupExpiredGenerations(): Promise<CleanupResult> {
  const now = new Date();
  const expiryDate = new Date(
    now.getTime() - GENERATION_EXPIRY_HOURS * 60 * 60 * 1000
  );
  let deletedCount = 0;
  const deletedSize = 0;

  // Find expired generations (completed ones older than expiry)
  const expiredGenerations = await db.generation.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { lt: expiryDate },
      payment: null, // Only delete if not paid
    },
    select: { id: true },
  });

  for (const gen of expiredGenerations) {
    try {
      // Delete associated uploads
      const uploads = await db.upload.findMany({
        where: { userId: gen.id },
        select: { key: true, size: true },
      });

      for (const upload of uploads) {
        await deleteFromR2(upload.key);
      }

      // Delete R2 objects
      const r2Keys = await listR2Objects(`generations/${gen.id}/`);
      for (const key of r2Keys) {
        await deleteFromR2(key);
      }

      await db.generation.delete({ where: { id: gen.id } });
      deletedCount++;
    } catch (error) {
      console.error(`Failed to delete generation ${gen.id}:`, error);
    }
  }

  // Log cleanup
  await db.cleanupLog.create({
    data: {
      type: "generations",
      deletedCount,
      deletedSize: BigInt(deletedSize),
    },
  });

  return { deletedCount, deletedSize };
}

export async function runCleanup(): Promise<{
  uploads: CleanupResult;
  generations: CleanupResult;
}> {
  // Use Redis lock to prevent concurrent cleanup runs
  const lockKey = "cleanup:lock";
  const lockValue = Date.now().toString();
  const lockDuration = 60 * 60 * 1000; // 1 hour

  const acquired = await redis.set(lockKey, lockValue, "PX", lockDuration, "NX");

  if (!acquired) {
    throw new Error("Cleanup already in progress");
  }

  try {
    const uploads = await cleanupExpiredUploads();
    const generations = await cleanupExpiredGenerations();

    return { uploads, generations };
  } finally {
    await redis.del(lockKey);
  }
}

// Cron job schedule: run every hour
export const CLEANUP_SCHEDULE = "0 * * * *";
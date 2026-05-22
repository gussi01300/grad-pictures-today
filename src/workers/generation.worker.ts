import { createGenerationWorker } from "@/services/generation.service";

const worker = createGenerationWorker();

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down worker...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Shutting down worker...");
  await worker.close();
  process.exit(0);
});

console.log("Generation worker started");
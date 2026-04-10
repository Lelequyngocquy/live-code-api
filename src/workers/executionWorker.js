const { Worker } = require("bullmq");
const redisConnection = require("../config/redis");
const Execution = require("../models/Execution");
const executor = require("../services/executor");

// init worker to process code execution jobs from the "code-executions" queue
const worker = new Worker(
  "code-executions",
  async (job) => {
    const { execution_id, source_code, language } = job.data;

    try {
      // update execution status to RUNNING
      await Execution.updateResult(execution_id, "RUNNING");

      // execute the code and get results (stdout, stderr, execution time)
      const result = await executor.executeCode(language, source_code);

      // update execution record in DB with results and status COMPLETED
      await Execution.updateResult(
        execution_id,
        "COMPLETED",
        result.stdout,
        result.stderr,
        result.executionTimeMs,
      );
    } catch (error) {
      // 4. error handling: update execution status to FAILED or TIMEOUT based on error type
      const isTimeout = error.message.includes("Timeout");
      await Execution.updateResult(
        execution_id,
        isTimeout ? "TIMEOUT" : "FAILED",
        null,
        error.message,
        null,
      );

      // show error in worker logs for debugging
      throw error;
    }
  },
  { connection: redisConnection },
);

// listen for worker events to log to terminal
worker.on("completed", (job) => {
  console.log(`~~~[FROM WORKER] Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(
    `___[FROM WORKER] Job ${job.id} failed with error: ${err.message}`,
  );
});

module.exports = worker;

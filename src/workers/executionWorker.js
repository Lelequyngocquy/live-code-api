const { Worker } = require("bullmq");
const redisConnection = require("../config/redis");
const db = require("../config/db");
const { executeCode } = require("../utils/executor");

const executionWorker = new Worker(
  "code-executions",
  async (job) => {
    const { execution_id, session_id, source_code, language } = job.data;
    console.log(
      `~~~[FROM WORKERS] Job ${job.id} started for execution_id: ${execution_id} (Language: ${language})`,
    );

    try {
      await db.query("UPDATE executions SET status = $1 WHERE id = $2", [
        "RUNNING",
        execution_id,
      ]);

      // running user's code and capture output
      let stdout = "";
      let stderr = "";
      let executionTimeMs = 0;
      let status = "COMPLETED";

      try {
        const result = await executeCode(language, source_code);
        stdout = result.stdout;
        stderr = result.stderr;
        executionTimeMs = result.executionTimeMs;

        // if error apears
        if (stderr.trim() !== "") {
          status = "FAILED";
        }
      } catch (execError) {
        // timeout or runtime error
        status = execError.message.includes("Timeout") ? "TIMEOUT" : "FAILED";
        stderr = execError.message;
        executionTimeMs = 5000; // timeout limit
      }

      // update execution record in DB with status, output and execution time
      await db.query(
        "UPDATE executions SET status = $1, stdout = $2, stderr = $3, execution_time_ms = $4 WHERE id = $5",
        [status, stdout, stderr, executionTimeMs, execution_id],
      );

      console.log(
        `~~~[FROM WORKERS] Job ${job.id} finished with status: ${status}.`,
      );
      return { status, stdout };
    } catch (error) {
      console.error(`___[FROM WORKERS] Error in job ${job.id}:`, error);

      // Lỗi này là lỗi của hệ thống DB/Worker, không phải do code của user sai
      await db.query(
        "UPDATE executions SET status = $1, stderr = $2 WHERE id = $3",
        ["FAILED", "System Error: " + error.message, execution_id],
      );
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

// listen to worker events for logging
executionWorker.on("completed", (job) => {
  console.log(`~~~[FROM WORKERS] Job ${job.id} completed.`);
});

executionWorker.on("failed", (job, err) => {
  console.log(`___[FROM WORKERS] Job ${job.id} failed. Error: ${err.message}`);
});

module.exports = executionWorker;

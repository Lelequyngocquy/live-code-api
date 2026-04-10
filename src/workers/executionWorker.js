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
      // 1. Chuyển sang RUNNING
      await Execution.updateResult(execution_id, "RUNNING");

      // 2. Thực thi code
      const result = await executor.executeCode(language, source_code);

      // 3. Cập nhật thành công (Lưu ý: Thêm "COMPLETED" vì executor không trả về status)
      await Execution.updateResult(
        execution_id,
        "COMPLETED",
        result.stdout,
        result.stderr,
        result.executionTimeMs,
      );
    } catch (error) {
      // 4. BẮT LỖI Ở ĐÂY: Nếu Timeout hoặc lỗi, cập nhật trạng thái FAILED/TIMEOUT vào DB
      const isTimeout = error.message.includes("Timeout");
      await Execution.updateResult(
        execution_id,
        isTimeout ? "TIMEOUT" : "FAILED",
        null,
        error.message,
        null,
      );

      // Vẫn quăng lỗi để BullMQ biết job này đã fail
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

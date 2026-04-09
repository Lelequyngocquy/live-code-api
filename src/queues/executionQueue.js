const { Queue } = require("bullmq");
const redisConnection = require("../config/redis");

// create an queue named 'code-executions'
const executionQueue = new Queue("code-executions", {
  connection: redisConnection,
});

const addExecutionJob = async (data) => {
  try {
    // add 'run-code' into queue
    // jobId created by execution_id avoiding duplicates
    const job = await executionQueue.add("run-code", data, {
      jobId: data.execution_id,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: true, // free up mem
      removeOnFail: false, // keep failed jobs for debugging
    });
    console.log(
      `~~~[FROM QUEUES] Pushed job to execution queue with ID: ${job.id}`,
    );
    return job;
  } catch (error) {
    console.error(
      `___[FROM QUEUES] Error pushing job to execution queue:`,
      error,
    );
    throw error;
  }
};

module.exports = {
  executionQueue,
  addExecutionJob,
};

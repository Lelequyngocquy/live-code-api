const Execution = require("../models/Execution.js");
const Session = require("../models/Session.js");

const { addExecutionJob } = require("../queues/executionQueue");
exports.runCode = async (req, res) => {
  try {
    const { session_id } = req.params;

    // find session by id
    const session = await Session.findById(session_id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    // unset previous execution results if any
    const execution = await Execution.create(session_id);

    // unset previous execution results if any
    await addExecutionJob({
      execution_id: execution.id,
      session_id: session_id,
      language: session.language,
      source_code: session.sourceCode,
    });

    res.status(202).json({
      execution_id: execution.id,
      status: execution.status,
    });
  } catch (error) {
    console.error("___Error running code:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getExecutionStatus = async (req, res) => {
  try {
    const { execution_id } = req.params;
    const execution = await Execution.findById(execution_id);

    if (!execution)
      return res.status(404).json({ error: "Execution not found" });

    // return execution status and results if available
    res.status(200).json({
      execution_id: execution.id,
      status: execution.status,
      stdout: execution.stdout,
      stderr: execution.stderr,
      execution_time_ms: execution.executionTimeMs,
    });
  } catch (error) {
    console.error("___Error fetching execution:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const db = require("../config/db");

const getExecutionStatus = async (req, res) => {
  try {
    const { execution_id } = req.params;

    const result = await db.query(
      "SELECT id, status, stdout, stderr, execution_time_ms FROM executions WHERE id = $1",
      [execution_id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Execution not found" });
    }

    const execution = result.rows[0];

    // return execution status and result (if completed)
    res.status(200).json({
      execution_id: execution.id,
      status: execution.status,
      stdout: execution.stdout,
      stderr: execution.stderr,
      execution_time_ms: execution.execution_time_ms,
    });
  } catch (error) {
    console.error(
      "___[FROM CONTROLLERS] Error fetching execution status:",
      error,
    );
    res.status(500).json({ error: "___Internal Server Error" });
  }
};

module.exports = { getExecutionStatus };

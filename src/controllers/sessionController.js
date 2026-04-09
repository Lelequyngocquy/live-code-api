const db = require("../config/db");
const { addExecutionJob } = require("../queues/executionQueue");

const createSession = async (req, res) => {
  try {
    const { language = "python", source_code = "" } = req.body;

    const result = await db.query(
      "INSERT INTO code_sessions (language, source_code) VALUES ($1, $2) RETURNING id, status",
      [language, source_code],
    );

    const session = result.rows[0];

    // formart requirement: session_id, status
    res.status(201).json({
      session_id: session.id,
      status: session.status,
    });
  } catch (error) {
    console.error("___[FROM CONTROLLERS] Error creating session:", error);
    res.status(500).json({ error: "[FROM CONTROLLERS] Internal Server Error" });
  }
};

const updateSession = async (req, res) => {
  try {
    const { session_id } = req.params;
    const { language = "python", source_code = "" } = req.body || {};

    const result = await db.query(
      "UPDATE code_sessions SET language = $1, source_code = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, status",
      [language, source_code, session_id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.status(200).json({
      session_id: result.rows[0].id,
      status: result.rows[0].status,
    });
  } catch (error) {
    console.error("___[FROM CONTROLLERS] Error updating session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const runSession = async (req, res) => {
  try {
    const { session_id } = req.params;

    // get session details from DB (language, source_code)
    const sessionResult = await db.query(
      "SELECT language, source_code FROM code_sessions WHERE id = $1",
      [session_id],
    );

    if (sessionResult.rowCount === 0) {
      return res.status(404).json({ error: "Session not found" });
    }
    const { language, source_code } = sessionResult.rows[0];

    // create a new execution record in DB with status = QUEUED
    const execResult = await db.query(
      "INSERT INTO executions (session_id, status) VALUES ($1, $2) RETURNING id, status",
      [session_id, "QUEUED"],
    );
    const execution = execResult.rows[0];

    // push a new job to the queue with execution details (execution_id, session_id, language, source_code)
    await addExecutionJob({
      execution_id: execution.id,
      session_id: session_id,
      language: language,
      source_code: source_code,
    });

    // return response with execution_id and initial status (QUEUED)
    res.status(202).json({
      execution_id: execution.id,
      status: execution.status,
    });
  } catch (error) {
    console.error("___[FROM CONTROLLERS] Error running session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { createSession, updateSession, runSession };

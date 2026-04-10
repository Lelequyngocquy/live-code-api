const db = require("../config/db");

class Execution {
  constructor(data) {
    this.id = data.id;
    this.sessionId = data.session_id;
    this.status = data.status;
    this.stdout = data.stdout;
    this.stderr = data.stderr;
    this.executionTimeMs = data.execution_time_ms;
  }

  static async create(sessionId, status = "QUEUED") {
    const query = `
      INSERT INTO executions (session_id, status) 
      VALUES ($1, $2) RETURNING *`;
    const { rows } = await db.query(query, [sessionId, status]);
    return new Execution(rows[0]);
  }

  static async findById(id) {
    const { rows } = await db.query("SELECT * FROM executions WHERE id = $1", [
      id,
    ]);
    return rows[0] ? new Execution(rows[0]) : null;
  }

  static async updateResult(
    id,
    status,
    stdout = null,
    stderr = null,
    timeMs = null,
  ) {
    const query = `
    UPDATE executions 
    SET status = $1, stdout = $2, stderr = $3, execution_time_ms = $4 
    WHERE id = $5`;
    await db.query(query, [
      //ensure we pass null for stdout/stderr/timeMs if they are undefined to avoid DB errors
      status,
      stdout || null,
      stderr || null,
      timeMs || null,
      id,
    ]);
  }
}

module.exports = Execution;

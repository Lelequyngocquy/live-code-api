const db = require("../config/db");

class Session {
  constructor(data) {
    this.id = data.id;
    this.language = data.language;
    this.sourceCode = data.source_code;
    this.status = data.status;
    this.updatedAt = data.updated_at;
  }

  static async create(language, sourceCode = "") {
    const query = `
      INSERT INTO code_sessions (language, source_code) 
      VALUES ($1, $2) RETURNING *`;
    const { rows } = await db.query(query, [language, sourceCode]);
    return new Session(rows[0]);
  }

  static async findById(id) {
    const { rows } = await db.query(
      "SELECT * FROM code_sessions WHERE id = $1",
      [id],
    );
    return rows[0] ? new Session(rows[0]) : null;
  }

  static async updateCode(id, sourceCode, language) {
    const query = `
    UPDATE code_sessions 
    SET source_code = $1, language = $2, updated_at = NOW() 
    WHERE id = $3 RETURNING *`;
    const { rows } = await db.query(query, [sourceCode, language, id]);
    return rows[0] ? new Session(rows[0]) : null;
  }
}

module.exports = Session;

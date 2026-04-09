const db = require("./db");

const initializeDatabase = async () => {
  const createTablesQuery = `
 
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS code_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      language VARCHAR(50) NOT NULL,
      source_code TEXT,
      status VARCHAR(20) DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS executions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID REFERENCES code_sessions(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL,
      stdout TEXT,
      stderr TEXT,
      execution_time_ms INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(createTablesQuery);
    console.log("~~~[FROM CONFIG] Database initialized successfully");
  } catch (error) {
    console.error("___[FROM CONFIG] Database initialization failed:", error);
    process.exit(1);
  }
};

module.exports = initializeDatabase;

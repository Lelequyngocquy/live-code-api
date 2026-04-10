const Session = require("../models/Session.js");
const db = require("../config/db");

const createSession = async (req, res) => {
  try {
    const { language = "python", source_code = "" } = req.body; //default values
    const session = await Session.create(language, source_code); // from Model

    res.status(201).json({ session_id: session.id, status: session.status });
  } catch (error) {
    console.error("___Error creating session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateSession = async (req, res) => {
  try {
    const { session_id } = req.params;

    const { source_code, language } = req.body || {};

    // fetch current session to check if exists and get current code/language
    const currentSession = await Session.findById(session_id);
    if (!currentSession)
      return res.status(404).json({ error: "Session not found" });

    const updatedSession = await Session.updateCode(
      session_id,
      source_code !== undefined ? source_code : currentSession.sourceCode,
      language !== undefined ? language : currentSession.language,
    );

    res
      .status(200)
      .json({ session_id: updatedSession.id, status: updatedSession.status });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = { createSession, updateSession };

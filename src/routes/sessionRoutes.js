const express = require("express");
const router = express.Router();
const {
  createSession,
  updateSession,
} = require("../controllers/sessionController");
const { runCode } = require("../controllers/executionController");
router.post("/", createSession); // create new code session
router.patch("/:session_id", updateSession); //update code session (language, source_code)
router.post("/:session_id/run", runCode); // run code session

module.exports = router;

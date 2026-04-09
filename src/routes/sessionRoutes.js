const express = require("express");
const router = express.Router();
const {
  createSession,
  updateSession,
  runSession,
} = require("../controllers/sessionController");

router.post("/", createSession); // create new code session
router.patch("/:session_id", updateSession); //update code session (language, source_code)
router.post("/:session_id/run", runSession); // run code session

module.exports = router;

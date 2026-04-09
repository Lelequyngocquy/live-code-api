const express = require("express");
const router = express.Router();
const { getExecutionStatus } = require("../controllers/executionController");

router.get("/:execution_id", getExecutionStatus); // fetch execution result
module.exports = router;

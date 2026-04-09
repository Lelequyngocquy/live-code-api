const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// pluging routes
app.use("/code-sessions", require("./routes/sessionRoutes"));
app.use("/executions", require("./routes/executionRoutes"));

module.exports = app;

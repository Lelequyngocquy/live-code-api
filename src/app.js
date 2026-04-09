const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

const runLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // maximum 10 requests/ip/minute
  message: { error: "Too many execution requests, please try again later." },
});

// pluging routes
app.use("/code-sessions", require("./routes/sessionRoutes"));
app.use("/executions", require("./routes/executionRoutes"));
app.use("/code-sessions/:id/run", runLimiter);
module.exports = app;

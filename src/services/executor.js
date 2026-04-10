const fs = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");
const crypto = require("crypto");

const executeCode = async (language, sourceCode) => {
  // create unique execution ID and temp file path
  const executionId = crypto.randomUUID();
  const tempDir = path.join(__dirname, "../../temp");
  let fileName = "";
  let command = "";
  let args = [];

  // language restrictions
  if (language === "python") {
    fileName = `${executionId}.py`;
    command = process.platform === "win32" ? "python" : "python3";
    args = ["-X", "utf8"];
  } else if (language === "javascript" || language === "node") {
    fileName = `${executionId}.js`;
    command = "node";
  } else if (language === "php") {
    fileName = `${executionId}.php`;
    command = "php";
  } else if (language === "ruby") {
    fileName = `${executionId}.rb`;
    command = "ruby";
  } else {
    throw new Error(`Unsupported language: ${language}`);
  }

  const filePath = path.join(tempDir, fileName);
  args.push(filePath);

  try {
    // ensure temp directory exists and write file
    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(filePath, sourceCode);

    const startTime = Date.now();

    return await new Promise((resolve, reject) => {
      // run the code in a child process
      const child = spawn(command, args, {
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      });

      // add timeout to prevent infinite loops (5 seconds)
      const timeoutId = setTimeout(() => {
        child.kill("SIGKILL"); // kill the process if it exceeds time limit
        reject(new Error("Timeout: Execution Time Limit Exceeded (5000ms)"));
      }, 5000);

      child.on("error", (err) => {
        clearTimeout(timeoutId);
        reject(
          new Error(
            `System Error: Failed to execute '${command}'. Error: ${err.message}`,
          ),
        );
      });
      let stdout = "";
      let stderr = "";

      // listen to stdout data
      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      // listen to stderr data
      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      // when the process finishes
      child.on("close", (code) => {
        clearTimeout(timeoutId); // clear the timeout
        const executionTimeMs = Date.now() - startTime;

        // return the result
        resolve({
          stdout,
          stderr:
            code !== 0 && stderr === ""
              ? `~~~Process exited with code ${code}`
              : stderr,
          executionTimeMs,
        });
      });
    });
  } finally {
    // cleanup the temp file after execution
    try {
      await fs.unlink(filePath);
    } catch (cleanupError) {
      console.error(
        "___Error occurred while deleting temporary file:",
        cleanupError,
      );
    }
  }
};

module.exports = { executeCode };

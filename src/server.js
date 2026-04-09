const app = require("./app");
const initializeDatabase = require("./config/db-init");
const port = process.env.PORT || 3000;
require("./workers/executionWorker");
const startServer = async () => {
  await initializeDatabase();
  app.listen(port, () => {
    console.log(
      `~~~[FROM SERVER] LIVE CODE SERVER is running at http://localhost:${port}`,
    );
  });
};

startServer();

const connectDB = require("./config/db");
const app = require("./app");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception:");
  console.error(err.name, err.message);
  const stackLines = err.stack.split("\n");
  if (stackLines.length > 1) {
    console.error(stackLines[1].trim());
  }
  process.exit(1);
});

const port = process.env.PORT || 3000;

connectDB();
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection:");
  console.error(err.name, err.message);
  server.close(() => {
    console.error("Server is closing");
    process.exit(1);
  });
});

module.exports = server;

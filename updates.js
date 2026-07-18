const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const updater = require("./updater");
const serverControl = require("./server-control");

const logFilePath = path.join(__dirname, "update-log.txt");

function logToFile(line) {
  fs.appendFileSync(logFilePath, line + "\n");
}

async function updateRelay(onLog) {
  const log = (line) => { onLog(line); logToFile(line); };
  log("=== Updating Nexum Relay ===");

  const wasRunning = serverControl.isRunning();
  if (wasRunning) {
    log("Stopping server before update...");
    await serverControl.stopServerAsync();
  }

  await updater.pullAndInstall(config.relayPath, log);

  if (wasRunning) {
    log("Restarting server...");
    serverControl.startServer();
  }

  log("=== Nexum Relay update complete ===");
}

async function updateNexum(onLog) {
  const log = (line) => { onLog(line); logToFile(line); };
  log("=== Updating Nexum ===");
  await updater.pullAndInstall(config.nexumPath, log);
  await updater.runBuild(config.nexumPath, log);
  log("=== Nexum update complete (rebuilt) ===");
}

async function updateController(onLog) {
  const log = (line) => { onLog(line); logToFile(line); };
  log("=== Updating Relay Controller ===");
  await updater.pullAndInstall(config.controllerPath, log);
  log("=== Controller update complete — restarting app ===");
}

module.exports = {
  updateRelay,
  updateNexum,
  updateController,
};
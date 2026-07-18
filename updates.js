const config = require("./config.json");
const updater = require("./updater");
const serverControl = require("./server-control");

async function updateRelay(onLog) {
  onLog("=== Updating Nexum Relay ===");

  const wasRunning = serverControl.isRunning();
  if (wasRunning) {
    onLog("Stopping server before update...");
    await serverControl.stopServerAsync();
  }

  await updater.pullAndInstall(config.relayPath, onLog);

  if (wasRunning) {
    onLog("Restarting server...");
    serverControl.startServer();
  }

  onLog("=== Nexum Relay update complete ===");
}

async function updateNexum(onLog) {
  onLog("=== Updating Nexum ===");
  await updater.pullAndInstall(config.nexumPath, onLog);
  await updater.runBuild(config.nexumPath, onLog);
  onLog("=== Nexum update complete (rebuilt) ===");
}

async function updateController(onLog) {
  onLog("=== Updating Relay Controller ===");
  await updater.pullAndInstall(config.controllerPath, onLog);
  onLog("=== Controller update complete — restarting app ===");
}

module.exports = {
  updateRelay,
  updateNexum,
  updateController,
};
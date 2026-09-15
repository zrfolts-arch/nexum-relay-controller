const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
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

async function downloadPokemonSymbols(onLog) {
  const log = (line) => { onLog(line); logToFile(line); };
  log("=== Downloading Pokémon Set Symbols ===");

  await new Promise((resolve, reject) => {
    const child = spawn("node", ["scripts/download-pokemon-symbols.js"], {
      cwd: config.relayPath,
      shell: true,
    });

    child.stdout.on("data", (data) => {
      data.toString().split("\n").filter(Boolean).forEach(log);
    });
    child.stderr.on("data", (data) => {
      data.toString().split("\n").filter(Boolean).forEach(log);
    });

    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Symbol download exited with code ${code}`));
    });

    child.on("error", (err) => reject(err));
  });

  log("=== Pokémon symbol download complete ===");
}

module.exports = {
  updateRelay,
  updateNexum,
  updateController,
  downloadPokemonSymbols,
};
const { spawn } = require("child_process");
const path = require("path");
const config = require("./config.json");

let relayProcess = null;
let logListeners = [];
let statusListeners = [];

function onLog(callback) {
  logListeners.push(callback);
}

function onStatusChange(callback) {
  statusListeners.push(callback);
}

function emitLog(line) {
  logListeners.forEach((cb) => cb(line));
}

function emitStatus(isRunning) {
  statusListeners.forEach((cb) => cb(isRunning));
}

function isRunning() {
  return relayProcess !== null;
}

function startServer() {
  if (relayProcess) {
    emitLog("Server is already running.");
    return;
  }

  relayProcess = spawn("node", [config.relayEntryFile], {
    cwd: config.relayPath,
    shell: true,
  });

  emitLog(`Starting Relay server from ${config.relayPath}...`);
  emitStatus(true);

  relayProcess.stdout.on("data", (data) => {
    emitLog(data.toString());
  });

  relayProcess.stderr.on("data", (data) => {
    emitLog(`ERROR: ${data.toString()}`);
  });

  relayProcess.on("close", (code) => {
    emitLog(`Relay server stopped (exit code ${code}).`);
    relayProcess = null;
    emitStatus(false);
  });
}

function stopServer() {
  if (!relayProcess) {
    emitLog("Server is not running.");
    return;
  }
  const pid = relayProcess.pid;
  spawn("taskkill", ["/pid", pid, "/f", "/t"]);
}

function stopServerAsync() {
  return new Promise((resolve) => {
    if (!relayProcess) {
      resolve();
      return;
    }
    const pid = relayProcess.pid;
    relayProcess.once("close", () => resolve());
    spawn("taskkill", ["/pid", pid, "/f", "/t"]);
  });
}

module.exports = {
  startServer,
  stopServer,
  stopServerAsync,
  isRunning,
  onLog,
  onStatusChange,
};
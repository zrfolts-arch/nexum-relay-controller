const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const serverControl = require("./server-control");
const updates = require("./updates");

const fs = require("fs");

const configPath = path.join(__dirname, "config.json");

function readConfig() {
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

function writeConfig(updatedFields) {
  const current = readConfig();
  const merged = { ...current, ...updatedFields };
  fs.writeFileSync(configPath, JSON.stringify(merged, null, 2));
  return merged;
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  serverControl.onLog((line) => {
    if (mainWindow) mainWindow.webContents.send("log-line", line);
  });

  serverControl.onStatusChange((isRunning) => {
    if (mainWindow) mainWindow.webContents.send("status-change", isRunning);
  });
});

ipcMain.handle("start-server", () => {
  serverControl.startServer();
});

ipcMain.handle("stop-server", () => {
  serverControl.stopServer();
});

ipcMain.handle("get-status", () => {
  return serverControl.isRunning();
});

function sendUpdateLog(line) {
  if (mainWindow) mainWindow.webContents.send("update-log", line);
}

ipcMain.handle("update-relay", async () => {
  try {
    await updates.updateRelay(sendUpdateLog);
  } catch (err) {
    sendUpdateLog(`ERROR: ${err.message}`);
  }
});

ipcMain.handle("update-nexum", async () => {
  try {
    await updates.updateNexum(sendUpdateLog);
  } catch (err) {
    sendUpdateLog(`ERROR: ${err.message}`);
  }
});

ipcMain.handle("update-controller", async () => {
  try {
    if (serverControl.isRunning()) {
      sendUpdateLog("Stopping server before restart...");
      await serverControl.stopServerAsync();
    }
    await updates.updateController(sendUpdateLog);
    sendUpdateLog("Relaunching app...");
    app.relaunch();
    app.exit();
  } catch (err) {
    sendUpdateLog(`ERROR: ${err.message}`);
  }
});

ipcMain.handle("update-all", async () => {
  try {
    await updates.updateNexum(sendUpdateLog);
    await updates.updateRelay(sendUpdateLog);
    if (serverControl.isRunning()) {
      sendUpdateLog("Stopping server before restart...");
      await serverControl.stopServerAsync();
    }
    await updates.updateController(sendUpdateLog);
    sendUpdateLog("Relaunching app...");
    app.relaunch();
    app.exit();
  } catch (err) {
    sendUpdateLog(`ERROR: ${err.message}`);
  }
});

ipcMain.handle("open-nexum", () => {
  require("electron").shell.openExternal("http://localhost:3939");
});

ipcMain.handle("get-discord-webhook", () => {
  const config = readConfig();
  return config.discordWebhookUrl || "";
});

ipcMain.handle("save-discord-webhook", (event, webhookUrl) => {
  writeConfig({ discordWebhookUrl: webhookUrl });
  return true;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
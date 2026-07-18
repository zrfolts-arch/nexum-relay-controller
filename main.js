const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const serverControl = require("./server-control");

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

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
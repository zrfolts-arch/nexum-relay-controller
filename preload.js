const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("serverControl", {
  start: () => ipcRenderer.invoke("start-server"),
  stop: () => ipcRenderer.invoke("stop-server"),
  getStatus: () => ipcRenderer.invoke("get-status"),
  onLog: (callback) => ipcRenderer.on("log-line", (_event, line) => callback(line)),
  onStatusChange: (callback) => ipcRenderer.on("status-change", (_event, isRunning) => callback(isRunning)),
});
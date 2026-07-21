const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("serverControl", {
  start: () => ipcRenderer.invoke("start-server"),
  stop: () => ipcRenderer.invoke("stop-server"),
  getStatus: () => ipcRenderer.invoke("get-status"),
  onLog: (callback) => ipcRenderer.on("log-line", (_event, line) => callback(line)),
  onStatusChange: (callback) => ipcRenderer.on("status-change", (_event, isRunning) => callback(isRunning)),
  openNexum: () => ipcRenderer.invoke("open-nexum"),
  openAdmin: () => ipcRenderer.invoke("open-admin"),
  getDiscordWebhook: () => ipcRenderer.invoke("get-discord-webhook"),
  saveDiscordWebhook: (url) => ipcRenderer.invoke("save-discord-webhook", url),
  testDiscordWebhook: () => ipcRenderer.invoke("test-discord-webhook"),
});

contextBridge.exposeInMainWorld("updater", {
  updateRelay: () => ipcRenderer.invoke("update-relay"),
  updateNexum: () => ipcRenderer.invoke("update-nexum"),
  updateController: () => ipcRenderer.invoke("update-controller"),
  updateAll: () => ipcRenderer.invoke("update-all"),
  onUpdateLog: (callback) => ipcRenderer.on("update-log", (_event, line) => callback(line)),
});
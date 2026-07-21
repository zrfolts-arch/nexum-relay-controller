const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const logDiv = document.getElementById("log");

function setStatus(isRunning) {
  statusDot.classList.toggle("running", isRunning);
  statusText.textContent = isRunning ? "Running" : "Stopped";
}

startBtn.addEventListener("click", () => {
  window.serverControl.start();
});

stopBtn.addEventListener("click", () => {
  window.serverControl.stop();
});

window.serverControl.onLog((line) => {
  logDiv.textContent += line + "\n";
  logDiv.scrollTop = logDiv.scrollHeight;
});

window.serverControl.onStatusChange((isRunning) => {
  setStatus(isRunning);
});

window.serverControl.getStatus().then(setStatus);
const updateLogDiv = document.getElementById("updateLog");

function appendUpdateLog(line) {
  updateLogDiv.textContent += line + "\n";
  updateLogDiv.scrollTop = updateLogDiv.scrollHeight;
}

document.getElementById("openNexumBtn").addEventListener("click", () => {
  window.serverControl.openNexum();
});

document.getElementById("openAdminBtn").addEventListener("click", () => {
  window.serverControl.openAdmin();
});

const webhookInput = document.getElementById("webhookInput");
const saveWebhookBtn = document.getElementById("saveWebhookBtn");
const webhookSavedMsg = document.getElementById("webhookSavedMsg");

window.serverControl.getDiscordWebhook().then((url) => {
  webhookInput.value = url;
});

saveWebhookBtn.addEventListener("click", async () => {
  await window.serverControl.saveDiscordWebhook(webhookInput.value.trim());
  webhookSavedMsg.style.display = "inline";
  setTimeout(() => { webhookSavedMsg.style.display = "none"; }, 2000);
});

document.getElementById("updateRelayBtn").addEventListener("click", () => {
  appendUpdateLog("Starting Relay update...");
  window.updater.updateRelay();
});

document.getElementById("updateNexumBtn").addEventListener("click", () => {
  appendUpdateLog("Starting Nexum update...");
  window.updater.updateNexum();
});

document.getElementById("updateControllerBtn").addEventListener("click", () => {
  appendUpdateLog("Starting Controller update (app will restart when done)...");
  window.updater.updateController();
});

document.getElementById("updateAllBtn").addEventListener("click", () => {
  appendUpdateLog("Starting update of all three projects (app will restart when done)...");
  window.updater.updateAll();
});

window.updater.onUpdateLog((line) => {
  appendUpdateLog(line);
});
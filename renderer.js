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
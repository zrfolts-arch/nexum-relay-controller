const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "config.json");

let lastKnownStatus = null; // null = not yet checked, true = up, false = down
let suppressUntil = 0;
let intervalHandle = null;

function readWebhookUrl() {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return config.discordWebhookUrl || null;
  } catch {
    return null;
  }
}

async function sendDiscordMessage(content) {
  const webhookUrl = readWebhookUrl();
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch (err) {
    console.error("Failed to send Discord message:", err);
  }
}

function suppressAlertsFor(ms) {
  suppressUntil = Date.now() + ms;
}

async function checkHealth() {
  const isSuppressed = Date.now() < suppressUntil;

  let isUp = false;
  try {
    const response = await fetch("http://localhost:3939/api/health", {
      signal: AbortSignal.timeout(5000),
    });
    isUp = response.ok;
  } catch {
    isUp = false;
  }

  if (lastKnownStatus === null) {
    lastKnownStatus = isUp;
    return;
  }

  if (isUp !== lastKnownStatus && !isSuppressed) {
    if (isUp) {
      sendDiscordMessage("🟢 Nexum Relay is back up.");
    } else {
      sendDiscordMessage("🔴 Nexum Relay appears to be down.");
    }
  }

  lastKnownStatus = isUp;
}

function startMonitoring() {
  if (intervalHandle) return;
  intervalHandle = setInterval(checkHealth, 30000);
  checkHealth();
}

function stopMonitoring() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}

module.exports = {
  startMonitoring,
  stopMonitoring,
  suppressAlertsFor,
};
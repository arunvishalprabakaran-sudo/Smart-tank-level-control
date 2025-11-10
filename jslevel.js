// ======== ThingSpeak Details ========
const channelID = "3150868";       // your channel ID
const readKey = "S8MLK8YR293S0IC5"; // your READ API key
const writeKey = "S72I63Y8XIPYKUN5"; // your WRITE API key

// ======== DOM Elements ========
const waterDiv = document.getElementById("waterLevel");
const levelText = document.getElementById("level");
const statusText = document.getElementById("status");
const modeText = document.getElementById("modeStatus");
const modeBtn = document.getElementById("modeBtn");

let currentMode = 0; // 0 = AUTO, 1 = MANUAL

// ======== Fetch Live Data from ThingSpeak ========
async function fetchData() {
  try {
    const url = `https://api.thingspeak.com/channels/${channelID}/feeds/last.json?api_key=${readKey}`;
    const response = await fetch(url);
    const data = await response.json();

    const level = parseFloat(data.field1) || 0;
    const pump = parseInt(data.field2) || 0;
    currentMode = parseInt(data.field3) || 0;

    updateLevel(level);
    updatePumpStatus(pump);
    updateMode(currentMode);
  } catch (err) {
    console.error("Error fetching ThingSpeak data:", err);
  }
}

// ======== Update Tank Level ========
function updateLevel(level) {
  const percent = Math.min(100, Math.max(0, level));
  waterDiv.style.height = `${percent}%`;
  levelText.textContent = `Level: ${percent.toFixed(1)}%`;
}

// ======== Update Pump Status ========
function updatePumpStatus(pump) {
  if (pump === 1) {
    statusText.textContent = "Pump Status: ON";
    statusText.style.color = "green";
  } else {
    statusText.textContent = "Pump Status: OFF";
    statusText.style.color = "red";
  }
}

// ======== Update Mode ========
function updateMode(mode) {
  if (mode === 0) {
    modeText.textContent = "Mode: AUTO";
    modeBtn.textContent = "Switch to MANUAL";
  } else {
    modeText.textContent = "Mode: MANUAL";
    modeBtn.textContent = "Switch to AUTO";
  }
}

// ======== Send Mode to ThingSpeak ========
async function sendMode(mode) {
  const url = `https://api.thingspeak.com/update?api_key=${writeKey}&field3=${mode}`;
  await fetch(url);
}

// ======== Send Pump Command ========
async function sendPumpCommand(state) {
  const url = `https://api.thingspeak.com/update?api_key=${writeKey}&field2=${state}`;
  await fetch(url);
}

// ======== Button Actions ========
modeBtn.addEventListener("click", async () => {
  currentMode = currentMode === 0 ? 1 : 0;
  updateMode(currentMode);
  await sendMode(currentMode);
});

document.getElementById("startBtn").addEventListener("click", async () => {
  if (currentMode === 1) {
    await sendPumpCommand(1);
    statusText.textContent = "Pump Status: ON";
    statusText.style.color = "green";
  } else {
    alert("Switch to MANUAL mode first!");
  }
});

document.getElementById("stopBtn").addEventListener("click", async () => {
  await sendPumpCommand(0);
  statusText.textContent = "Pump Status: OFF";
  statusText.style.color = "red";
});

// ======== Refresh Data Every 10 Seconds ========
setInterval(fetchData, 10000);
fetchData();

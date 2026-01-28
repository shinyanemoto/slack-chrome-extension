const DEFAULT_SETTINGS = {
  enabled: true,
  highlightColor: "#fff3a3"
};

const enabledInput = document.getElementById("enabled");
const colorInput = document.getElementById("highlightColor");

function applySettings(settings) {
  enabledInput.checked = settings.enabled;
  colorInput.value = settings.highlightColor;
}

function saveSettings() {
  chrome.storage.sync.set({
    enabled: enabledInput.checked,
    highlightColor: colorInput.value
  });
}

chrome.storage.sync.get(DEFAULT_SETTINGS, applySettings);

enabledInput.addEventListener("change", saveSettings);
colorInput.addEventListener("input", saveSettings);

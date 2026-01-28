# Slack Bracket Highlighter (Chrome Extension)

Highlights text wrapped in full-width brackets (e.g. `【...】`) inside the Slack web
client sidebar.

## Install (local)

1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select this repository folder.
3. Open Slack in the browser and confirm the sidebar highlight appears.

## Options

Open the extension options page to:
- Enable or disable highlighting.
- Customize the highlight color.

## Notes

- Targets the Slack web client (`https://*.slack.com/*`).
- Uses a content script with a `MutationObserver` to handle dynamic updates.
- No data is sent externally; settings are stored in Chrome sync storage.

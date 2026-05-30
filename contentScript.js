const DEFAULT_SETTINGS = {
  enabled: true,
  highlightColor: "#fff3a3"
};

const HIGHLIGHT_CLASS = "slack-bracket-highlight";
const HIGHLIGHT_ATTR = "data-slack-bracket-highlight";
const ROOT_SELECTORS = [
  '[data-qa="sidebar"]',
  '[data-qa="channel_sidebar"]',
  '[data-qa="sidebar_content"]',
  '[data-qa="sidebar_sections"]',
  'nav[aria-label="Slack sidebar"]',
  'nav[aria-label="Navigation"]'
];

let currentSettings = { ...DEFAULT_SETTINGS };
let observer;
let mutationTimeout;

function getSidebarRoots() {
  const roots = ROOT_SELECTORS.flatMap((selector) =>
    Array.from(document.querySelectorAll(selector))
  );

  if (roots.length > 0) {
    return roots;
  }

  const fallback = document.querySelector("#client-ui nav");
  return fallback ? [fallback] : [];
}

function setHighlightColor(color) {
  document.documentElement.style.setProperty(
    "--slack-bracket-highlight-color",
    color
  );
}

function unwrapHighlights(root) {
  const highlights = root.querySelectorAll(`.${HIGHLIGHT_CLASS}`);
  highlights.forEach((highlight) => {
    const parent = highlight.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
    parent.normalize();
  });
}

function shouldProcessTextNode(node) {
  if (!node || !node.parentElement) return false;
  if (node.parentElement.closest(`.${HIGHLIGHT_CLASS}`)) return false;
  if (!node.textContent || !node.textContent.includes("【")) return false;
  return true;
}

function wrapBracketTextNode(node) {
  const text = node.textContent;
  const regex = /【([^】]+)】/g;
  let match;
  let lastIndex = 0;
  const fragment = document.createDocumentFragment();

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      fragment.appendChild(
        document.createTextNode(text.slice(lastIndex, match.index))
      );
    }

    const span = document.createElement("span");
    span.className = HIGHLIGHT_CLASS;
    span.setAttribute(HIGHLIGHT_ATTR, "true");
    span.textContent = `【${match[1]}】`;
    fragment.appendChild(span);

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  node.parentNode.replaceChild(fragment, node);
}

function highlightBrackets(root) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!shouldProcessTextNode(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const nodes = [];
  let current;
  while ((current = walker.nextNode())) {
    nodes.push(current);
  }

  nodes.forEach(wrapBracketTextNode);
}

function refreshHighlights() {
  const roots = getSidebarRoots();
  if (roots.length === 0) return;

  roots.forEach((root) => {
    unwrapHighlights(root);
    if (currentSettings.enabled) {
      highlightBrackets(root);
    }
  });
}

function scheduleRefresh() {
  if (mutationTimeout) {
    window.clearTimeout(mutationTimeout);
  }

  mutationTimeout = window.setTimeout(refreshHighlights, 150);
}

function startObserver() {
  if (observer) {
    observer.disconnect();
  }

  observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

function applySettings(settings) {
  currentSettings = { ...DEFAULT_SETTINGS, ...settings };
  setHighlightColor(currentSettings.highlightColor);
  refreshHighlights();
}

chrome.storage.sync.get(DEFAULT_SETTINGS, applySettings);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  const updated = { ...currentSettings };
  Object.keys(changes).forEach((key) => {
    updated[key] = changes[key].newValue;
  });
  applySettings(updated);
});

startObserver();

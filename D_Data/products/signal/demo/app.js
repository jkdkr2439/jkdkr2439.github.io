const MAX_LOG_ENTRIES = 40;
const runLog = [];

function recordIPOD(process, input, output, detail = {}) {
  runLog.push({ at: new Date().toISOString(), process, input, output, detail });
  if (runLog.length > MAX_LOG_ENTRIES) runLog.splice(0, runLog.length - MAX_LOG_ENTRIES);
  window.__SIGNAL_DEBUG__ = { goal: "newsroom-web-001", runLog: [...runLog] };
}

const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#primary-navigation");
const menuLabel = menuButton.querySelector(".sr-only");

function setMenu(open, reason) {
  menuButton.setAttribute("aria-expanded", String(open));
  navigation.dataset.open = String(open);
  menuLabel.textContent = open ? "Close navigation" : "Open navigation";
  recordIPOD("navigation", { reason }, open ? "open" : "closed");
}

menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true", "button"));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenu(false, "Escape");
    menuButton.focus();
  }
});
navigation.addEventListener("click", event => {
  if (event.target.matches("a") && window.matchMedia("(max-width: 640px)").matches) setMenu(false, "selection");
});

const form = document.querySelector(".briefing form");
form.addEventListener("submit", event => {
  event.preventDefault();
  const status = form.querySelector(".form-status");
  status.textContent = "You're on the list. The first signal arrives Saturday.";
  recordIPOD("subscription", "valid email", "acknowledged");
  form.reset();
});

recordIPOD("bootstrap", "document ready", "interactive");

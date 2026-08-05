/**
 * COMPOSE Execution View Module
 * Run progress timeline with per-step status.
 */

let appStateRef = null;

/**
 * Initialize execution view module.
 */
export function initExecutionView(appState) {
  appStateRef = appState;
}

/**
 * Show the execution panel with a timeline for the given run.
 * @param {string} runId
 */
export function showExecution(runId) {
  const canvasPanel = document.getElementById('canvas-panel');
  const execPanel = document.getElementById('execution-panel');
  const historyPanel = document.getElementById('history-panel');

  if (canvasPanel) canvasPanel.hidden = true;
  if (historyPanel) historyPanel.setAttribute('aria-hidden', 'true');
  if (execPanel) execPanel.setAttribute('aria-hidden', 'false');

  // Clear timeline
  const timeline = document.getElementById('execution-timeline');
  if (timeline) timeline.textContent = '';
}

/**
 * Append a step to the execution timeline.
 * @param {Object} event - execution event
 */
export function appendStep(event) {
  const timeline = document.getElementById('execution-timeline');
  if (!timeline) return;

  const li = document.createElement('li');
  li.className = 'compose-execution__step';
  li.setAttribute('data-status', event.status);
  li.setAttribute('role', 'listitem');

  const label = document.createElement('strong');
  label.textContent = event.nodeId;

  const status = document.createElement('span');
  status.textContent = ` — ${event.status}`;
  if (event.duration) {
    status.textContent += ` (${event.duration}ms)`;
  }
  if (event.attempt && event.attempt > 1) {
    status.textContent += ` [attempt ${event.attempt}]`;
  }

  li.appendChild(label);
  li.appendChild(status);

  if (event.error) {
    const err = document.createElement('div');
    err.textContent = event.error;
    err.style.color = 'var(--color-danger)';
    err.style.fontSize = 'var(--font-size-sm)';
    li.appendChild(err);
  }

  timeline.appendChild(li);
}

/**
 * Hide the execution panel and show the canvas.
 */
export function hideExecution() {
  const canvasPanel = document.getElementById('canvas-panel');
  const execPanel = document.getElementById('execution-panel');

  if (canvasPanel) canvasPanel.hidden = false;
  if (execPanel) execPanel.setAttribute('aria-hidden', 'true');
}

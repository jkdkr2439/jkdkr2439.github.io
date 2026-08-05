/**
 * COMPOSE History Module
 * Past runs list with summary.
 */

let appStateRef = null;

/**
 * Initialize history module.
 */
export function initHistory(appState) {
  appStateRef = appState;
}

/**
 * Show the history panel with a list of past runs.
 * @param {Array<Object>} runs
 */
export function showHistory(runs) {
  const canvasPanel = document.getElementById('canvas-panel');
  const execPanel = document.getElementById('execution-panel');
  const historyPanel = document.getElementById('history-panel');
  const historyList = document.getElementById('history-list');

  if (canvasPanel) canvasPanel.hidden = true;
  if (execPanel) execPanel.setAttribute('aria-hidden', 'true');
  if (historyPanel) historyPanel.setAttribute('aria-hidden', 'false');

  if (!historyList) return;
  historyList.textContent = '';

  if (runs.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No runs yet.';
    li.setAttribute('role', 'listitem');
    historyList.appendChild(li);
    return;
  }

  for (const run of runs) {
    const li = document.createElement('li');
    li.className = 'compose-history__item';
    li.setAttribute('role', 'listitem');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `Run ${run.id}: ${run.status}`);

    const title = document.createElement('strong');
    title.textContent = run.id;

    const meta = document.createElement('div');
    meta.style.fontSize = 'var(--font-size-sm)';
    meta.style.color = 'var(--color-text-muted)';
    meta.textContent = `${run.status} · ${run.startedAt ? new Date(run.startedAt).toLocaleString() : 'unknown'} · ${run.events?.length || 0} events`;

    li.appendChild(title);
    li.appendChild(meta);
    historyList.appendChild(li);
  }
}

/**
 * Hide the history panel and show the canvas.
 */
export function hideHistory() {
  const canvasPanel = document.getElementById('canvas-panel');
  const historyPanel = document.getElementById('history-panel');

  if (canvasPanel) canvasPanel.hidden = false;
  if (historyPanel) historyPanel.setAttribute('aria-hidden', 'true');
}

/**
 * COMPOSE Persistence Store
 * localStorage-based save/load for workflows and runs.
 * Designed for browser; provides a mock for Node testing.
 */

const WORKFLOW_KEY = 'compose_workflows';
const RUNS_KEY = 'compose_runs';

function getStorage() {
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  // In-memory fallback for Node.js testing
  const mem = new Map();
  return {
    getItem: (k) => mem.get(k) || null,
    setItem: (k, v) => mem.set(k, v),
    removeItem: (k) => mem.delete(k)
  };
}

/**
 * Save a workflow definition.
 * @param {Object} workflow
 */
export function saveWorkflow(workflow) {
  const storage = getStorage();
  const all = loadAllWorkflows();
  const idx = all.findIndex(w => w.id === workflow.id);
  if (idx >= 0) {
    all[idx] = { ...workflow, updatedAt: new Date().toISOString() };
  } else {
    all.push({ ...workflow, createdAt: new Date().toISOString() });
  }
  storage.setItem(WORKFLOW_KEY, JSON.stringify(all));
}

/**
 * Load all saved workflows.
 * @returns {Array<Object>}
 */
export function loadAllWorkflows() {
  const storage = getStorage();
  const raw = storage.getItem(WORKFLOW_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Load a single workflow by id.
 * @param {string} id
 * @returns {Object|null}
 */
export function loadWorkflow(id) {
  return loadAllWorkflows().find(w => w.id === id) || null;
}

/**
 * Delete a workflow by id.
 * @param {string} id
 */
export function deleteWorkflow(id) {
  const storage = getStorage();
  const all = loadAllWorkflows().filter(w => w.id !== id);
  storage.setItem(WORKFLOW_KEY, JSON.stringify(all));
}

/**
 * Save an execution run.
 * @param {Object} run
 */
export function saveRun(run) {
  const storage = getStorage();
  const all = loadAllRuns();
  const idx = all.findIndex(r => r.id === run.id);
  if (idx >= 0) {
    all[idx] = run;
  } else {
    all.push(run);
  }
  storage.setItem(RUNS_KEY, JSON.stringify(all));
}

/**
 * Load all execution runs.
 * @returns {Array<Object>}
 */
export function loadAllRuns() {
  const storage = getStorage();
  const raw = storage.getItem(RUNS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Load runs for a specific workflow.
 * @param {string} workflowId
 * @returns {Array<Object>}
 */
export function loadRunsForWorkflow(workflowId) {
  return loadAllRuns().filter(r => r.workflowId === workflowId);
}

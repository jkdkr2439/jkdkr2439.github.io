/**
 * COMPOSE Main Module
 * Bootstrap, keyboard dispatch, module registry.
 * Imports from packages/engine/ and infrastructure/persistence/.
 */

import { topologicalSort, selectReadyNodes } from './scheduler.js';
import { executeStep } from './executor.js';
import { validateWorkflow } from './validator.js';
import { executeWithRetry, DEFAULT_POLICY } from './retry.js';
import { saveWorkflow, loadAllWorkflows, saveRun, loadAllRuns } from './store.js';
import { EventLog } from './event-log.js';

import { initCanvas, renderWorkflow, getSelectedNodeId, selectNode, deselectAll, removeNode } from './canvas.js';
import { initPalette } from './palette.js';
import { initConnections } from './connections.js';
import { initInspector, showNodeInspector, clearInspector } from './inspector.js';
import { initExecutionView, showExecution, hideExecution } from './execution-view.js';
import { initHistory, showHistory, hideHistory } from './history.js';

/**
 * Module Registry — the only source of destination navigation.
 * Kernel validates module manifests before mounting.
 */
const MODULE_REGISTRY = new Map();

function registerModule(name, manifest, initFn) {
  if (!manifest || !manifest.id || !manifest.version) {
    console.error(`[COMPOSE] Module "${name}" rejected: invalid manifest`);
    return false;
  }
  MODULE_REGISTRY.set(name, { manifest, initFn, mounted: false });
  return true;
}

function mountModules() {
  for (const [name, mod] of MODULE_REGISTRY) {
    try {
      mod.initFn();
      mod.mounted = true;
    } catch (err) {
      // Fault boundary: isolate failed module from canvas
      console.error(`[COMPOSE] Module "${name}" failed to mount:`, err.message);
      mod.mounted = false;
      announce(`Module ${name} failed to load`);
    }
  }
}

/**
 * Application state — bounded runtime context for display modules.
 */
export const appState = {
  workflow: {
    id: 'wf-default',
    name: 'Untitled Workflow',
    nodes: [],
    edges: [],
    createdAt: new Date().toISOString()
  },
  selectedNodeId: null,
  selectedEdgeId: null,
  view: 'canvas', // canvas | execution | history
  runs: []
};

/**
 * Announce to screen readers via live region.
 */
export function announce(message) {
  const el = document.getElementById('live-region');
  if (el) el.textContent = message;
}

/**
 * Update the status bar.
 */
export function updateStatus() {
  const statusEl = document.getElementById('status-text');
  const countEl = document.getElementById('node-count');
  if (statusEl) statusEl.textContent = appState.view === 'canvas' ? 'Ready' : appState.view;
  if (countEl) countEl.textContent = `${appState.workflow.nodes.length} nodes · ${appState.workflow.edges.length} edges`;
}

/**
 * Run the current workflow.
 */
async function runWorkflow() {
  const validation = validateWorkflow(appState.workflow.nodes, appState.workflow.edges);
  if (!validation.valid) {
    announce(`Cannot run: ${validation.errors[0].message}`);
    return;
  }

  const { sorted } = topologicalSort(appState.workflow.nodes, appState.workflow.edges);
  const nodeMap = new Map(appState.workflow.nodes.map(n => [n.id, n]));
  const runId = `run-${Date.now()}`;
  const eventLog = new EventLog(runId);

  appState.view = 'execution';
  showExecution(runId);
  announce('Workflow execution started');

  for (const nodeId of sorted) {
    const node = nodeMap.get(nodeId);
    eventLog.append({ nodeId, status: 'started' });

    const handler = async (n, ctx) => {
      // Simulated execution for UI demo
      await new Promise(r => setTimeout(r, 300));
      return { executed: n.id };
    };

    const { outcomes, finalStatus } = await executeWithRetry(
      node, {}, handler, executeStep, DEFAULT_POLICY, { timeoutMs: 5000 }
    );

    eventLog.append({ nodeId, status: finalStatus, duration: outcomes[outcomes.length - 1]?.duration });

    if (finalStatus !== 'completed') {
      announce(`Node ${nodeId} failed`);
      break;
    }
  }

  const run = {
    id: runId,
    workflowId: appState.workflow.id,
    status: eventLog.events.every(e => e.status !== 'failed') ? 'completed' : 'failed',
    startedAt: eventLog.events[0]?.timestamp,
    completedAt: new Date().toISOString(),
    events: eventLog.getAll()
  };

  saveRun(run);
  appState.runs.push(run);
  announce(`Workflow execution ${run.status}`);
}

/**
 * Keyboard dispatch.
 */
function handleKeyboard(event) {
  // Don't capture when typing in inputs
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

  switch (event.key) {
    case 'Tab':
      // Tab between nodes handled by browser focus management
      break;
    case 'Enter':
      if (appState.selectedNodeId) {
        showNodeInspector(appState.selectedNodeId, appState.workflow);
        announce(`Inspecting node ${appState.selectedNodeId}`);
      }
      break;
    case 'Delete':
    case 'Backspace':
      if (appState.selectedNodeId) {
        removeNode(appState.selectedNodeId, appState.workflow);
        announce(`Removed node ${appState.selectedNodeId}`);
        appState.selectedNodeId = null;
        clearInspector();
        renderWorkflow(appState.workflow);
        updateStatus();
      }
      event.preventDefault();
      break;
    case 'Escape':
      deselectAll();
      appState.selectedNodeId = null;
      appState.selectedEdgeId = null;
      clearInspector();
      announce('Selection cleared');
      break;
    case 'r':
    case 'R':
      if (!event.ctrlKey && !event.metaKey) {
        runWorkflow();
      }
      break;
    case 'h':
    case 'H':
      if (!event.ctrlKey && !event.metaKey) {
        if (appState.view === 'history') {
          hideHistory();
          appState.view = 'canvas';
        } else {
          showHistory(appState.runs);
          appState.view = 'history';
        }
        announce(appState.view === 'history' ? 'History panel opened' : 'History panel closed');
      }
      break;
  }
}

/**
 * Bootstrap.
 */
function boot() {
  // Register modules with manifest validation (kernel)
  registerModule('canvas', { id: 'canvas', version: '1.0.0' }, () => initCanvas(appState));
  registerModule('palette', { id: 'palette', version: '1.0.0' }, () => initPalette(appState));
  registerModule('connections', { id: 'connections', version: '1.0.0' }, () => initConnections(appState));
  registerModule('inspector', { id: 'inspector', version: '1.0.0' }, () => initInspector(appState));
  registerModule('execution-view', { id: 'execution-view', version: '1.0.0' }, () => initExecutionView(appState));
  registerModule('history', { id: 'history', version: '1.0.0' }, () => initHistory(appState));

  // Mount all modules (fault boundary per module)
  mountModules();

  // Keyboard dispatch
  document.addEventListener('keydown', handleKeyboard);

  // Button handlers
  document.getElementById('btn-run')?.addEventListener('click', runWorkflow);
  document.getElementById('btn-history')?.addEventListener('click', () => {
    if (appState.view === 'history') {
      hideHistory();
      appState.view = 'canvas';
    } else {
      showHistory(appState.runs);
      appState.view = 'history';
    }
  });
  document.getElementById('btn-save')?.addEventListener('click', () => {
    saveWorkflow(appState.workflow);
    announce('Workflow saved');
  });
  document.getElementById('btn-back-to-canvas')?.addEventListener('click', () => {
    hideExecution();
    appState.view = 'canvas';
  });
  document.getElementById('btn-close-history')?.addEventListener('click', () => {
    hideHistory();
    appState.view = 'canvas';
  });

  // Load saved workflows
  const saved = loadAllWorkflows();
  if (saved.length > 0) {
    Object.assign(appState.workflow, saved[0]);
    renderWorkflow(appState.workflow);
  }

  appState.runs = loadAllRuns();
  updateStatus();
  announce('COMPOSE workflow builder ready');
}

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

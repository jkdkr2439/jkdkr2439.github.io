/**
 * COMPOSE Inspector Module
 * Shows selected node or edge detail in the inspector panel.
 */

let appStateRef = null;

/**
 * Initialize inspector module.
 */
export function initInspector(appState) {
  appStateRef = appState;

  const form = document.getElementById('inspector-form');
  const labelInput = document.getElementById('inspector-label');

  if (labelInput && form) {
    labelInput.addEventListener('input', () => {
      if (!appStateRef?.selectedNodeId) return;
      const node = appStateRef.workflow.nodes.find(n => n.id === appStateRef.selectedNodeId);
      if (node) {
        node.config.label = labelInput.value;
        // Trigger re-render
        const event = new CustomEvent('compose:workflow-changed', { detail: { action: 'update-label' } });
        document.dispatchEvent(event);
      }
    });
  }
}

/**
 * Show node details in the inspector.
 * @param {string} nodeId
 * @param {Object} workflow
 */
export function showNodeInspector(nodeId, workflow) {
  const node = workflow.nodes.find(n => n.id === nodeId);
  if (!node) return;

  const emptyEl = document.getElementById('inspector-empty');
  const form = document.getElementById('inspector-form');
  const idInput = document.getElementById('inspector-id');
  const typeInput = document.getElementById('inspector-type');
  const labelInput = document.getElementById('inspector-label');

  if (emptyEl) emptyEl.hidden = true;
  if (form) form.hidden = false;
  if (idInput) idInput.value = node.id;
  if (typeInput) typeInput.value = node.type;
  if (labelInput) labelInput.value = node.config.label || '';
}

/**
 * Clear the inspector panel.
 */
export function clearInspector() {
  const emptyEl = document.getElementById('inspector-empty');
  const form = document.getElementById('inspector-form');

  if (emptyEl) emptyEl.hidden = false;
  if (form) form.hidden = true;
}

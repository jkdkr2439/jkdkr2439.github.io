/**
 * COMPOSE Palette Module
 * 5 node types: trigger, condition, action, delay, end.
 * Handles drag start and keyboard activation.
 */

const NODE_TYPES = [
  { type: 'trigger', label: 'Trigger', description: 'Starts a workflow execution' },
  { type: 'condition', label: 'Condition', description: 'Branches based on a condition' },
  { type: 'action', label: 'Action', description: 'Performs an operation' },
  { type: 'delay', label: 'Delay', description: 'Waits for a duration' },
  { type: 'end', label: 'End', description: 'Terminates a branch' }
];

let appStateRef = null;

/**
 * Initialize the palette module.
 */
export function initPalette(appState) {
  appStateRef = appState;

  const items = document.querySelectorAll('.compose-palette__item');
  items.forEach(item => {
    // Drag start
    item.addEventListener('dragstart', (e) => {
      const nodeType = item.getAttribute('data-node-type');
      e.dataTransfer.setData('text/plain', nodeType);
      e.dataTransfer.effectAllowed = 'copy';
    });

    // Click to select node type, then click canvas to place
    item.addEventListener('click', () => {
      const nodeType = item.getAttribute('data-node-type');
      // Deselect previous
      items.forEach(i => i.classList.remove('compose-palette__item--active'));
      item.classList.add('compose-palette__item--active');
      appStateRef.pendingNodeType = nodeType;
      const liveRegion = document.getElementById('live-region');
      if (liveRegion) liveRegion.textContent = `Selected ${nodeType} — click canvas to place`;
    });

    // Keyboard activation (Enter/Space to add node at center)
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const nodeType = item.getAttribute('data-node-type');
        addNodeAtCenter(nodeType);
      }
    });
  });
}

/**
 * Add a node at the center of the canvas (keyboard activation).
 */
function addNodeAtCenter(type) {
  const svg = document.getElementById('canvas-svg');
  if (!svg || !appStateRef) return;

  const rect = svg.getBoundingClientRect();
  const x = rect.width / 2 - 80;
  const y = rect.height / 2 - 30 + (appStateRef.workflow.nodes.length * 20);

  const id = `${type}-${Date.now().toString(36)}`;
  const node = {
    id,
    type,
    config: { label: type.charAt(0).toUpperCase() + type.slice(1) },
    position: { x, y }
  };

  appStateRef.workflow.nodes.push(node);

  // Trigger re-render through canvas module
  const event = new CustomEvent('compose:workflow-changed', { detail: { action: 'add-node', node } });
  document.dispatchEvent(event);

  const liveRegion = document.getElementById('live-region');
  if (liveRegion) liveRegion.textContent = `Added ${type} node`;
}

/**
 * Get available node types.
 */
export function getNodeTypes() {
  return [...NODE_TYPES];
}

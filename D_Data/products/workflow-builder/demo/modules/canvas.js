/**
 * COMPOSE Canvas Module
 * SVG DAG rendering: nodes as rounded rects with typed ports, edges as paths.
 */

const NODE_WIDTH = 160;
const NODE_HEIGHT = 60;
const PORT_RADIUS = 6;

const NODE_COLORS = {
  trigger: 'var(--color-node-trigger)',
  condition: 'var(--color-node-condition)',
  action: 'var(--color-node-action)',
  delay: 'var(--color-node-delay)',
  end: 'var(--color-node-end)'
};

let svgEl = null;
let nodesLayer = null;
let edgesLayer = null;
let appStateRef = null;

/**
 * Initialize the canvas module.
 */
export function initCanvas(appState) {
  appStateRef = appState;
  svgEl = document.getElementById('canvas-svg');
  nodesLayer = document.getElementById('nodes-layer');
  edgesLayer = document.getElementById('edges-layer');

  if (!svgEl || !nodesLayer || !edgesLayer) {
    throw new Error('Canvas SVG elements not found');
  }

  // Handle drop from palette
  const canvasPanel = document.getElementById('canvas-panel');
  if (canvasPanel) {
    canvasPanel.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    canvasPanel.addEventListener('drop', handleDrop);

    // Handle click-to-place (palette click → canvas click)
    svgEl.addEventListener('click', (e) => {
      if (!appStateRef.pendingNodeType) return;
      const rect = svgEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addNode(appStateRef.pendingNodeType, x, y);
      appStateRef.pendingNodeType = null;
      // Clear active palette item
      document.querySelectorAll('.compose-palette__item--active').forEach(i => i.classList.remove('compose-palette__item--active'));
    });
  }
}

function handleDrop(event) {
  event.preventDefault();
  const nodeType = event.dataTransfer.getData('text/plain');
  if (!nodeType) return;

  const rect = svgEl.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  addNode(nodeType, x, y);
}

/**
 * Add a node to the workflow at position.
 */
function addNode(type, x, y) {
  const id = `${type}-${Date.now().toString(36)}`;
  const node = {
    id,
    type,
    config: { label: type.charAt(0).toUpperCase() + type.slice(1) },
    position: { x, y }
  };

  appStateRef.workflow.nodes.push(node);
  renderWorkflow(appStateRef.workflow);

  const { updateStatus, announce } = getMainExports();
  updateStatus();
  announce(`Added ${type} node`);
}

function getMainExports() {
  // Lazy reference to avoid circular — uses global announce/updateStatus
  return {
    updateStatus: () => {
      const countEl = document.getElementById('node-count');
      if (countEl) countEl.textContent = `${appStateRef.workflow.nodes.length} nodes · ${appStateRef.workflow.edges.length} edges`;
    },
    announce: (msg) => {
      const el = document.getElementById('live-region');
      if (el) el.textContent = msg;
    }
  };
}

/**
 * Render the entire workflow on the SVG canvas.
 */
export function renderWorkflow(workflow) {
  if (!nodesLayer || !edgesLayer) return;

  // Clear layers
  nodesLayer.textContent = '';
  edgesLayer.textContent = '';

  // Auto-layout if no positions
  const positioned = assignPositions(workflow.nodes, workflow.edges);

  // Render edges first (behind nodes)
  for (const edge of workflow.edges) {
    const fromNode = positioned.find(n => n.id === edge.from);
    const toNode = positioned.find(n => n.id === edge.to);
    if (fromNode && toNode) {
      renderEdge(edge, fromNode, toNode);
    }
  }

  // Render nodes
  for (const node of positioned) {
    renderNode(node);
  }
}

/**
 * Assign positions to nodes that don't have them using simple vertical layout.
 */
function assignPositions(nodes, edges) {
  const positioned = nodes.map(n => ({ ...n }));
  let needsLayout = positioned.some(n => !n.position);

  if (needsLayout) {
    const spacing = { x: 200, y: 100 };
    positioned.forEach((node, i) => {
      if (!node.position) {
        node.position = { x: 100, y: 60 + i * spacing.y };
      }
    });
  }

  return positioned;
}

/**
 * Render a single node as SVG group.
 */
function renderNode(node) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'compose-canvas__node');
  g.setAttribute('data-node-id', node.id);
  g.setAttribute('tabindex', '0');
  g.setAttribute('role', 'button');
  g.setAttribute('aria-label', `${node.type} node: ${node.config.label}`);
  g.setAttribute('aria-selected', node.id === appStateRef?.selectedNodeId ? 'true' : 'false');

  const x = node.position.x;
  const y = node.position.y;

  // Rounded rect body
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', NODE_WIDTH);
  rect.setAttribute('height', NODE_HEIGHT);
  rect.setAttribute('rx', '8');
  rect.setAttribute('ry', '8');
  rect.setAttribute('fill', 'var(--color-bg)');
  rect.setAttribute('stroke', NODE_COLORS[node.type] || 'var(--color-border)');
  rect.setAttribute('stroke-width', '2');
  g.appendChild(rect);

  // Type indicator bar at top
  const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bar.setAttribute('x', x);
  bar.setAttribute('y', y);
  bar.setAttribute('width', NODE_WIDTH);
  bar.setAttribute('height', '6');
  bar.setAttribute('rx', '8');
  bar.setAttribute('ry', '8');
  bar.setAttribute('fill', NODE_COLORS[node.type] || 'var(--color-border)');
  g.appendChild(bar);

  // Label text
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', x + NODE_WIDTH / 2);
  text.setAttribute('y', y + NODE_HEIGHT / 2 + 5);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', 'var(--color-text)');
  text.setAttribute('font-size', '13');
  text.setAttribute('font-family', 'var(--font-sans)');
  text.textContent = node.config.label;
  g.appendChild(text);

  // Input port (left center) — except triggers
  if (node.type !== 'trigger') {
    const inPort = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    inPort.setAttribute('cx', x);
    inPort.setAttribute('cy', y + NODE_HEIGHT / 2);
    inPort.setAttribute('r', PORT_RADIUS);
    inPort.setAttribute('fill', 'var(--color-bg)');
    inPort.setAttribute('stroke', NODE_COLORS[node.type]);
    inPort.setAttribute('stroke-width', '2');
    inPort.setAttribute('data-port', 'input');
    g.appendChild(inPort);
  }

  // Output port (right center) — except end nodes
  if (node.type !== 'end') {
    const outPort = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outPort.setAttribute('cx', x + NODE_WIDTH);
    outPort.setAttribute('cy', y + NODE_HEIGHT / 2);
    outPort.setAttribute('r', PORT_RADIUS);
    outPort.setAttribute('fill', 'var(--color-bg)');
    outPort.setAttribute('stroke', NODE_COLORS[node.type]);
    outPort.setAttribute('stroke-width', '2');
    outPort.setAttribute('data-port', 'output');
    g.appendChild(outPort);
  }

  // Click to select
  g.addEventListener('click', () => {
    selectNode(node.id);
  });

  g.addEventListener('focus', () => {
    selectNode(node.id);
  });

  nodesLayer.appendChild(g);
}

/**
 * Render an edge as SVG path.
 */
function renderEdge(edge, fromNode, toNode) {
  const x1 = fromNode.position.x + NODE_WIDTH;
  const y1 = fromNode.position.y + NODE_HEIGHT / 2;
  const x2 = toNode.position.x;
  const y2 = toNode.position.y + NODE_HEIGHT / 2;

  // Bezier curve
  const midX = (x1 + x2) / 2;
  const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('class', 'compose-canvas__edge');
  path.setAttribute('d', d);
  path.setAttribute('data-edge-id', edge.id);
  path.setAttribute('marker-end', 'url(#arrowhead)');
  path.setAttribute('role', 'img');
  path.setAttribute('aria-label', `Connection from ${fromNode.config.label} to ${toNode.config.label}`);

  edgesLayer.appendChild(path);
}

/**
 * Select a node.
 */
export function selectNode(nodeId) {
  deselectAll();
  if (appStateRef) appStateRef.selectedNodeId = nodeId;
  const g = nodesLayer?.querySelector(`[data-node-id="${nodeId}"]`);
  if (g) g.setAttribute('aria-selected', 'true');
}

/**
 * Deselect all nodes.
 */
export function deselectAll() {
  if (appStateRef) {
    appStateRef.selectedNodeId = null;
    appStateRef.selectedEdgeId = null;
  }
  const allNodes = nodesLayer?.querySelectorAll('.compose-canvas__node');
  if (allNodes) {
    allNodes.forEach(g => g.setAttribute('aria-selected', 'false'));
  }
}

/**
 * Remove a node and its edges from the workflow.
 */
export function removeNode(nodeId, workflow) {
  workflow.nodes = workflow.nodes.filter(n => n.id !== nodeId);
  workflow.edges = workflow.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
}

/**
 * Get currently selected node id.
 */
export function getSelectedNodeId() {
  return appStateRef?.selectedNodeId || null;
}

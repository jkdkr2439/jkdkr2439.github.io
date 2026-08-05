/**
 * COMPOSE Workflow Validator
 * Pure domain module — no DOM dependencies.
 * Graph validation: cycles, missing connections, type compatibility.
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {Array<{code: string, message: string, nodeId?: string}>} errors
 */

/**
 * Validate a workflow graph.
 * @param {Array<{id: string, type: string}>} nodes
 * @param {Array<{id: string, from: string, to: string}>} edges
 * @returns {ValidationResult}
 */
export function validateWorkflow(nodes, edges) {
  const errors = [];

  if (nodes.length === 0) {
    errors.push({ code: 'EMPTY_GRAPH', message: 'Workflow has no nodes' });
    return { valid: false, errors };
  }

  // Check for cycles using DFS
  const cycleErrors = detectCycles(nodes, edges);
  errors.push(...cycleErrors);

  // Check missing required connections
  const connectionErrors = checkRequiredConnections(nodes, edges);
  errors.push(...connectionErrors);

  // Check type compatibility
  const typeErrors = checkTypeCompatibility(nodes, edges);
  errors.push(...typeErrors);

  // Check for orphan nodes (no connections at all, except single-node workflows)
  if (nodes.length > 1) {
    const orphanErrors = checkOrphanNodes(nodes, edges);
    errors.push(...orphanErrors);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Detect cycles using DFS with coloring.
 * @returns {Array<{code: string, message: string}>}
 */
export function detectCycles(nodes, edges) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map();
  const adjacency = new Map();

  for (const node of nodes) {
    color.set(node.id, WHITE);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    if (adjacency.has(edge.from)) {
      adjacency.get(edge.from).push(edge.to);
    }
  }

  let hasCycle = false;

  function dfs(nodeId) {
    color.set(nodeId, GRAY);
    for (const neighbor of (adjacency.get(nodeId) || [])) {
      if (color.get(neighbor) === GRAY) {
        hasCycle = true;
        return;
      }
      if (color.get(neighbor) === WHITE) {
        dfs(neighbor);
        if (hasCycle) return;
      }
    }
    color.set(nodeId, BLACK);
  }

  for (const node of nodes) {
    if (color.get(node.id) === WHITE) {
      dfs(node.id);
      if (hasCycle) break;
    }
  }

  if (hasCycle) {
    return [{ code: 'CYCLE_DETECTED', message: 'Workflow contains a cycle' }];
  }
  return [];
}

/**
 * Check that nodes have required connections based on type.
 * - trigger: must have at least one outgoing edge
 * - end: must have at least one incoming edge
 * - action/condition/delay: must have both incoming and outgoing (unless terminal)
 */
function checkRequiredConnections(nodes, edges) {
  const errors = [];
  const outgoing = new Map();
  const incoming = new Map();

  for (const node of nodes) {
    outgoing.set(node.id, 0);
    incoming.set(node.id, 0);
  }

  for (const edge of edges) {
    outgoing.set(edge.from, (outgoing.get(edge.from) || 0) + 1);
    incoming.set(edge.to, (incoming.get(edge.to) || 0) + 1);
  }

  for (const node of nodes) {
    switch (node.type) {
      case 'trigger':
        if (outgoing.get(node.id) === 0) {
          errors.push({
            code: 'MISSING_OUTPUT',
            message: `Trigger node "${node.id}" has no outgoing connection`,
            nodeId: node.id
          });
        }
        break;
      case 'end':
        if (incoming.get(node.id) === 0) {
          errors.push({
            code: 'MISSING_INPUT',
            message: `End node "${node.id}" has no incoming connection`,
            nodeId: node.id
          });
        }
        break;
      case 'action':
      case 'condition':
      case 'delay':
        if (incoming.get(node.id) === 0) {
          errors.push({
            code: 'MISSING_INPUT',
            message: `Node "${node.id}" of type "${node.type}" has no incoming connection`,
            nodeId: node.id
          });
        }
        if (outgoing.get(node.id) === 0) {
          errors.push({
            code: 'MISSING_OUTPUT',
            message: `Node "${node.id}" of type "${node.type}" has no outgoing connection`,
            nodeId: node.id
          });
        }
        break;
    }
  }

  return errors;
}

/**
 * Check type compatibility of connections.
 * - trigger cannot have incoming edges
 * - end cannot have outgoing edges
 */
function checkTypeCompatibility(nodes, edges) {
  const errors = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  for (const edge of edges) {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);

    if (!fromNode || !toNode) {
      errors.push({
        code: 'INVALID_REFERENCE',
        message: `Edge references non-existent node: ${!fromNode ? edge.from : edge.to}`
      });
      continue;
    }

    if (toNode.type === 'trigger') {
      errors.push({
        code: 'INVALID_CONNECTION',
        message: `Cannot connect to trigger node "${toNode.id}"`,
        nodeId: toNode.id
      });
    }

    if (fromNode.type === 'end') {
      errors.push({
        code: 'INVALID_CONNECTION',
        message: `Cannot connect from end node "${fromNode.id}"`,
        nodeId: fromNode.id
      });
    }
  }

  return errors;
}

/**
 * Check for orphan nodes with no connections.
 */
function checkOrphanNodes(nodes, edges) {
  const errors = [];
  const connected = new Set();

  for (const edge of edges) {
    connected.add(edge.from);
    connected.add(edge.to);
  }

  for (const node of nodes) {
    if (!connected.has(node.id)) {
      errors.push({
        code: 'ORPHAN_NODE',
        message: `Node "${node.id}" has no connections`,
        nodeId: node.id
      });
    }
  }

  return errors;
}

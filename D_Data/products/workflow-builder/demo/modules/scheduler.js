/**
 * COMPOSE Workflow Scheduler
 * Pure domain module — no DOM dependencies.
 * Topological sort with ready-node selection.
 * Priority: retry > mandatory > id (lexicographic).
 */

/**
 * Perform Kahn's topological sort on a workflow graph.
 * @param {Array<{id: string}>} nodes
 * @param {Array<{from: string, to: string}>} edges
 * @returns {{sorted: string[], hasCycle: boolean}}
 */
export function topologicalSort(nodes, edges) {
  const inDegree = new Map();
  const adjacency = new Map();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    if (!adjacency.has(edge.from) || !inDegree.has(edge.to)) continue;
    adjacency.get(edge.from).push(edge.to);
    inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
  }

  const queue = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted = [];
  while (queue.length > 0) {
    queue.sort(); // stable lexicographic within same level
    const current = queue.shift();
    sorted.push(current);
    for (const neighbor of adjacency.get(current)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  const hasCycle = sorted.length !== nodes.length;
  return { sorted, hasCycle };
}

/**
 * Select nodes that are ready to execute.
 * A node is ready when all its dependencies (incoming edges) have status 'completed'.
 * Priority order: retry > mandatory > id (lexicographic).
 * @param {Array<{id: string, type: string}>} nodes
 * @param {Array<{from: string, to: string}>} edges
 * @param {Map<string, {status: string, retryCount?: number}>} nodeStates
 * @returns {string[]} ordered list of ready node ids
 */
export function selectReadyNodes(nodes, edges, nodeStates) {
  const ready = [];

  for (const node of nodes) {
    const state = nodeStates.get(node.id);
    if (!state) continue;
    if (state.status === 'completed' || state.status === 'running') continue;

    // Check all dependencies are completed
    const deps = edges.filter(e => e.to === node.id).map(e => e.from);
    const allDepsCompleted = deps.every(depId => {
      const depState = nodeStates.get(depId);
      return depState && depState.status === 'completed';
    });

    if (allDepsCompleted && (state.status === 'pending' || state.status === 'retry')) {
      ready.push(node.id);
    }
  }

  // Priority sort: retry > mandatory (non-end, non-delay) > id
  ready.sort((a, b) => {
    const stateA = nodeStates.get(a);
    const stateB = nodeStates.get(b);
    const nodeA = nodes.find(n => n.id === a);
    const nodeB = nodes.find(n => n.id === b);

    // Retry nodes first
    const aRetry = stateA.status === 'retry' ? 0 : 1;
    const bRetry = stateB.status === 'retry' ? 0 : 1;
    if (aRetry !== bRetry) return aRetry - bRetry;

    // Mandatory nodes (action, condition, trigger) before optional (delay, end)
    const mandatoryTypes = new Set(['trigger', 'condition', 'action']);
    const aMandatory = mandatoryTypes.has(nodeA.type) ? 0 : 1;
    const bMandatory = mandatoryTypes.has(nodeB.type) ? 0 : 1;
    if (aMandatory !== bMandatory) return aMandatory - bMandatory;

    // Lexicographic by id
    return a.localeCompare(b);
  });

  return ready;
}

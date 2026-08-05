/**
 * COMPOSE Connections Module
 * Edge validation and cycle detection for the canvas.
 * Uses validator from packages/engine/ for graph checks.
 */

import { detectCycles } from './validator.js';

let appStateRef = null;

/**
 * Initialize connections module.
 */
export function initConnections(appState) {
  appStateRef = appState;
}

/**
 * Attempt to create a connection between two nodes.
 * Validates the connection before adding.
 * @param {string} fromId - source node id
 * @param {string} toId - target node id
 * @returns {{success: boolean, error?: string}}
 */
export function createConnection(fromId, toId) {
  if (!appStateRef) return { success: false, error: 'Not initialized' };

  const workflow = appStateRef.workflow;
  const fromNode = workflow.nodes.find(n => n.id === fromId);
  const toNode = workflow.nodes.find(n => n.id === toId);

  if (!fromNode || !toNode) {
    return { success: false, error: 'Node not found' };
  }

  // Validate: no self-loops
  if (fromId === toId) {
    return { success: false, error: 'Cannot connect a node to itself' };
  }

  // Validate: no duplicate edges
  const exists = workflow.edges.some(e => e.from === fromId && e.to === toId);
  if (exists) {
    return { success: false, error: 'Connection already exists' };
  }

  // Validate: type compatibility
  if (fromNode.type === 'end') {
    return { success: false, error: 'Cannot connect from an end node' };
  }
  if (toNode.type === 'trigger') {
    return { success: false, error: 'Cannot connect to a trigger node' };
  }

  // Validate: adding this edge would not create a cycle
  const testEdges = [...workflow.edges, { id: 'test', from: fromId, to: toId }];
  const cycleErrors = detectCycles(workflow.nodes, testEdges);
  if (cycleErrors.length > 0) {
    return { success: false, error: 'Connection would create a cycle' };
  }

  // Create the edge
  const edge = {
    id: `e${Date.now().toString(36)}`,
    from: fromId,
    to: toId
  };

  workflow.edges.push(edge);

  const event = new CustomEvent('compose:workflow-changed', { detail: { action: 'add-edge', edge } });
  document.dispatchEvent(event);

  return { success: true };
}

/**
 * Remove a connection by id.
 * @param {string} edgeId
 * @returns {boolean}
 */
export function removeConnection(edgeId) {
  if (!appStateRef) return false;
  const idx = appStateRef.workflow.edges.findIndex(e => e.id === edgeId);
  if (idx < 0) return false;
  appStateRef.workflow.edges.splice(idx, 1);
  return true;
}

/**
 * Get all connections for a node.
 * @param {string} nodeId
 * @returns {{incoming: Array, outgoing: Array}}
 */
export function getConnectionsForNode(nodeId) {
  if (!appStateRef) return { incoming: [], outgoing: [] };
  return {
    incoming: appStateRef.workflow.edges.filter(e => e.to === nodeId),
    outgoing: appStateRef.workflow.edges.filter(e => e.from === nodeId)
  };
}

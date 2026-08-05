/**
 * COMPOSE Event Log
 * Append-only execution event log with causal parent_ids.
 * Events form a causal chain: each event references its parent.
 */

let eventCounter = 0;

/**
 * Generate a unique event id.
 * @returns {string}
 */
function generateEventId() {
  eventCounter++;
  return `evt-${Date.now()}-${eventCounter}`;
}

/**
 * Create an execution event.
 * @param {Object} params
 * @param {string} params.runId
 * @param {string} params.nodeId
 * @param {string} params.status - started|completed|failed|timeout|retrying
 * @param {string|null} params.parentId - causal parent event id
 * @param {number} params.attempt
 * @param {string|null} params.error
 * @param {string|null} params.failureSignature
 * @param {number|null} params.duration
 * @returns {Object}
 */
export function createEvent({ runId, nodeId, status, parentId = null, attempt = 1, error = null, failureSignature = null, duration = null }) {
  return {
    id: generateEventId(),
    runId,
    nodeId,
    status,
    parentId,
    attempt,
    error,
    failureSignature,
    duration,
    timestamp: new Date().toISOString()
  };
}

/**
 * Append-only event log for a single execution run.
 */
export class EventLog {
  constructor(runId) {
    this.runId = runId;
    this.events = [];
    this.lastEventId = null;
  }

  /**
   * Append an event to the log.
   * Automatically sets parentId to the last event for the same node.
   * @param {Object} params - same as createEvent minus runId and parentId
   * @returns {Object} the created event
   */
  append({ nodeId, status, attempt = 1, error = null, failureSignature = null, duration = null }) {
    // Find last event for this node as causal parent
    const parentId = this.findLastEventForNode(nodeId);

    const event = createEvent({
      runId: this.runId,
      nodeId,
      status,
      parentId,
      attempt,
      error,
      failureSignature,
      duration
    });

    this.events.push(event);
    this.lastEventId = event.id;
    return event;
  }

  /**
   * Find the most recent event id for a given node.
   * @param {string} nodeId
   * @returns {string|null}
   */
  findLastEventForNode(nodeId) {
    for (let i = this.events.length - 1; i >= 0; i--) {
      if (this.events[i].nodeId === nodeId) {
        return this.events[i].id;
      }
    }
    return null;
  }

  /**
   * Get all events in order.
   * @returns {Array<Object>}
   */
  getAll() {
    return [...this.events];
  }

  /**
   * Get events for a specific node.
   * @param {string} nodeId
   * @returns {Array<Object>}
   */
  getForNode(nodeId) {
    return this.events.filter(e => e.nodeId === nodeId);
  }

  /**
   * Get the causal chain ending at a specific event.
   * @param {string} eventId
   * @returns {Array<Object>}
   */
  getCausalChain(eventId) {
    const chain = [];
    let current = this.events.find(e => e.id === eventId);
    while (current) {
      chain.unshift(current);
      current = current.parentId ? this.events.find(e => e.id === current.parentId) : null;
    }
    return chain;
  }
}

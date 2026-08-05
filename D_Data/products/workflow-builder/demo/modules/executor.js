/**
 * COMPOSE Workflow Executor
 * Pure domain module — no DOM dependencies.
 * Step runner with timeout and outcome reporting.
 */

/**
 * @typedef {Object} StepOutcome
 * @property {string} nodeId
 * @property {'completed'|'failed'|'timeout'} status
 * @property {*} result
 * @property {string|null} error
 * @property {string|null} failureSignature
 * @property {number} duration - milliseconds
 * @property {string} startedAt - ISO timestamp
 * @property {string} completedAt - ISO timestamp
 */

/**
 * Execute a single workflow step.
 * @param {Object} node - {id, type, config}
 * @param {Object} context - runtime context passed to the handler
 * @param {Function} handler - async function(node, context) => result
 * @param {Object} options - {timeoutMs: number}
 * @returns {Promise<StepOutcome>}
 */
export async function executeStep(node, context, handler, options = {}) {
  const timeoutMs = options.timeoutMs || 30000;
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  try {
    const result = await Promise.race([
      handler(node, context),
      createTimeout(timeoutMs)
    ]);

    const completedAt = new Date().toISOString();
    return {
      nodeId: node.id,
      status: 'completed',
      result,
      error: null,
      failureSignature: null,
      duration: Date.now() - startTime,
      startedAt,
      completedAt
    };
  } catch (err) {
    const completedAt = new Date().toISOString();
    const isTimeout = err.message === '__COMPOSE_TIMEOUT__';

    return {
      nodeId: node.id,
      status: isTimeout ? 'timeout' : 'failed',
      result: null,
      error: err.message,
      failureSignature: err.failureSignature || null,
      duration: Date.now() - startTime,
      startedAt,
      completedAt
    };
  }
}

/**
 * Execute an entire workflow run sequentially following topological order.
 * @param {string[]} executionOrder - topologically sorted node ids
 * @param {Map<string, Object>} nodeMap - id -> node
 * @param {Function} handler - step handler
 * @param {Object} options - {timeoutMs, onStep}
 * @returns {Promise<StepOutcome[]>}
 */
export async function executeWorkflow(executionOrder, nodeMap, handler, options = {}) {
  const outcomes = [];
  const context = { outcomes, attempt: new Map() };

  for (const nodeId of executionOrder) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    const attemptCount = (context.attempt.get(nodeId) || 0) + 1;
    context.attempt.set(nodeId, attemptCount);
    context.currentAttempt = attemptCount;

    const outcome = await executeStep(node, context, handler, options);
    outcomes.push(outcome);

    if (options.onStep) {
      options.onStep(outcome);
    }

    if (outcome.status === 'failed' || outcome.status === 'timeout') {
      // Halt execution on failure (retry logic handled externally)
      break;
    }
  }

  return outcomes;
}

function createTimeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('__COMPOSE_TIMEOUT__'));
    }, ms);
  });
}

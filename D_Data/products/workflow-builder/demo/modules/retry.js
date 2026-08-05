/**
 * COMPOSE Retry Policy
 * Pure domain module — no DOM dependencies.
 * Retry limit: 2 attempts total (1 initial + 1 retry).
 * Stable failure signature for deduplication.
 */

/**
 * @typedef {Object} RetryPolicy
 * @property {number} maxAttempts - total attempts allowed (including first)
 * @property {number} delayMs - delay between retries
 * @property {Set<string>} retryableSignatures - failure signatures eligible for retry
 */

/**
 * Default retry policy.
 */
export const DEFAULT_POLICY = {
  maxAttempts: 2,
  delayMs: 0,
  retryableSignatures: null // null = all failures are retryable
};

/**
 * Determine if a failed step should be retried.
 * @param {Object} outcome - StepOutcome from executor
 * @param {number} attemptCount - how many attempts have been made
 * @param {RetryPolicy} policy
 * @returns {{shouldRetry: boolean, reason: string}}
 */
export function shouldRetry(outcome, attemptCount, policy = DEFAULT_POLICY) {
  if (outcome.status === 'completed') {
    return { shouldRetry: false, reason: 'step_succeeded' };
  }

  if (attemptCount >= policy.maxAttempts) {
    return { shouldRetry: false, reason: 'max_attempts_reached' };
  }

  if (policy.retryableSignatures !== null && outcome.failureSignature) {
    if (!policy.retryableSignatures.has(outcome.failureSignature)) {
      return { shouldRetry: false, reason: 'signature_not_retryable' };
    }
  }

  return { shouldRetry: true, reason: 'eligible' };
}

/**
 * Execute a step with retry logic.
 * @param {Object} node
 * @param {Object} context
 * @param {Function} handler - async (node, context) => result; may throw with .failureSignature
 * @param {Function} executeStep - from executor module
 * @param {RetryPolicy} policy
 * @param {Object} options - {timeoutMs, onAttempt}
 * @returns {Promise<{outcomes: Array, finalStatus: string}>}
 */
export async function executeWithRetry(node, context, handler, executeStep, policy = DEFAULT_POLICY, options = {}) {
  const outcomes = [];
  let attemptCount = 0;
  let lastOutcome = null;

  while (attemptCount < policy.maxAttempts) {
    attemptCount++;
    const attemptContext = { ...context, currentAttempt: attemptCount };

    lastOutcome = await executeStep(node, attemptContext, handler, options);
    outcomes.push({ ...lastOutcome, attempt: attemptCount });

    if (options.onAttempt) {
      options.onAttempt(lastOutcome, attemptCount);
    }

    if (lastOutcome.status === 'completed') {
      return { outcomes, finalStatus: 'completed' };
    }

    const retryDecision = shouldRetry(lastOutcome, attemptCount, policy);
    if (!retryDecision.shouldRetry) {
      return { outcomes, finalStatus: lastOutcome.status };
    }

    // Wait before retry
    if (policy.delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, policy.delayMs));
    }
  }

  return { outcomes, finalStatus: lastOutcome ? lastOutcome.status : 'failed' };
}

/**
 * Create a stable failure signature from an error.
 * Used to deduplicate identical failures.
 * @param {string} nodeId
 * @param {string} errorMessage
 * @returns {string}
 */
export function createFailureSignature(nodeId, errorMessage) {
  // Simple stable hash: nodeId + normalized error
  const normalized = errorMessage.replace(/\d+/g, 'N').trim();
  return `${nodeId}::${normalized}`;
}

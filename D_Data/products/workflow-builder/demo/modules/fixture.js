/**
 * COMPOSE Deterministic Fixture
 * Pure domain module — no DOM dependencies.
 *
 * Scenario: 4-node linear workflow (trigger → action → action → end)
 * - First action (action-1) fails on attempt 1 with signature 'fixture_transient_failure'
 * - First action succeeds on attempt 2
 * - All other nodes succeed immediately
 */

import { topologicalSort, selectReadyNodes } from './scheduler.js';
import { executeStep } from './executor.js';
import { executeWithRetry, DEFAULT_POLICY } from './retry.js';

/**
 * Create the fixture workflow definition.
 * @returns {{nodes: Array, edges: Array}}
 */
export function createFixtureWorkflow() {
  const nodes = [
    { id: 'trigger-1', type: 'trigger', config: { label: 'Start' } },
    { id: 'action-1', type: 'action', config: { label: 'Process Data', failOnFirstAttempt: true } },
    { id: 'action-2', type: 'action', config: { label: 'Transform' } },
    { id: 'end-1', type: 'end', config: { label: 'Finish' } }
  ];

  const edges = [
    { id: 'e1', from: 'trigger-1', to: 'action-1' },
    { id: 'e2', from: 'action-1', to: 'action-2' },
    { id: 'e3', from: 'action-2', to: 'end-1' }
  ];

  return { nodes, edges };
}

/**
 * Fixture handler: simulates node execution.
 * action-1 fails on attempt 1 with 'fixture_transient_failure'.
 * @param {Object} node
 * @param {Object} context - must include currentAttempt
 * @returns {Promise<*>}
 */
export async function fixtureHandler(node, context) {
  if (node.id === 'action-1' && context.currentAttempt === 1) {
    const err = new Error('Transient failure in action-1');
    err.failureSignature = 'fixture_transient_failure';
    throw err;
  }
  return { executed: node.id, attempt: context.currentAttempt };
}

/**
 * Run the complete fixture scenario.
 * @returns {Promise<{workflow: Object, executionLog: Array, finalStatus: string}>}
 */
export async function runFixture() {
  const workflow = createFixtureWorkflow();
  const { sorted, hasCycle } = topologicalSort(workflow.nodes, workflow.edges);

  if (hasCycle) {
    throw new Error('Fixture workflow has a cycle — this should not happen');
  }

  const nodeMap = new Map(workflow.nodes.map(n => [n.id, n]));
  const executionLog = [];
  const nodeStates = new Map(workflow.nodes.map(n => [n.id, { status: 'pending' }]));

  // Execute in topological order, with retry for failures
  for (const nodeId of sorted) {
    const node = nodeMap.get(nodeId);

    const { outcomes, finalStatus } = await executeWithRetry(
      node,
      { executionLog },
      fixtureHandler,
      executeStep,
      DEFAULT_POLICY,
      {
        timeoutMs: 5000,
        onAttempt: (outcome, attempt) => {
          executionLog.push({
            nodeId,
            attempt,
            status: outcome.status,
            error: outcome.error,
            failureSignature: outcome.failureSignature,
            duration: outcome.duration
          });
        }
      }
    );

    nodeStates.set(nodeId, { status: finalStatus });

    if (finalStatus !== 'completed') {
      return {
        workflow,
        executionLog,
        finalStatus: 'failed',
        failedAt: nodeId
      };
    }
  }

  return {
    workflow,
    executionLog,
    finalStatus: 'completed',
    failedAt: null
  };
}

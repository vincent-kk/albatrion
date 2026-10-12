import { expect } from 'vitest';
import type { ScenarioExpectation } from '@aileron/schema-form-scenarios';

import type { SchemaNode } from '../../../SchemaNode';

/**
 * Compare requested observations with the settled public node surface.
 * @param root - Root node after a completed scenario action
 * @param expectation - Shape, raw values, output, and diagnostic assertions
 * @returns Nothing; assertion failures identify the mismatched observation
 */
export function assertCoreScenarioExpectation(
  root: SchemaNode, expectation: ScenarioExpectation,
): void {
  for (const [path, presence] of Object.entries(expectation.shape ?? {}))
    expect(root.find(path) !== null, `shape ${path}`).toBe(presence === 'present');
  for (const [path, value] of Object.entries(expectation.values ?? {})) {
    const node = root.find(path);
    expect(node, `value node ${path}`).not.toBeNull();
    expect(node?.value, `value ${path}`).toEqual(value);
  }
  for (const [path, states] of Object.entries(expectation.states ?? {})) {
    const node = root.find(path);
    expect(node, `state node ${path}`).not.toBeNull();
    if (states.visible !== undefined)
      expect(node?.visible, `state ${path}.visible`).toBe(states.visible);
    if (states.readOnly !== undefined)
      expect(node?.readOnly, `state ${path}.readOnly`).toBe(states.readOnly);
    if (states.disabled !== undefined)
      expect(node?.disabled, `state ${path}.disabled`).toBe(states.disabled);
    if (states.enabled !== undefined)
      expect(node?.enabled, `state ${path}.enabled`).toBe(states.enabled);
  }
  if ('outputValue' in expectation)
    expect(root.outputValue, 'outputValue').toEqual(expectation.outputValue);
  if (expectation.diagnostics)
    expect(root.diagnostics, 'diagnostics').toMatchObject(expectation.diagnostics);
  if (expectation.errors)
    throw new Error('Core scenario errors require the PR-4 validation surface');
}

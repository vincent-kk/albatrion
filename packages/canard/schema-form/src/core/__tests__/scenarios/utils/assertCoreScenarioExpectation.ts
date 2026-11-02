import { expect } from 'vitest';

import type { ScenarioExpectation } from '@aileron/schema-form-scenarios';

import type { FieldNode } from '@/schema-form/core/surface';

/**
 * Compare requested observations with the settled public node surface.
 * @param root - Root node after a completed scenario action
 * @param expectation - Shape, raw values, output, and diagnostic assertions
 * @returns Nothing; assertion failures identify the mismatched observation
 */
export function assertCoreScenarioExpectation(
  root: FieldNode,
  expectation: ScenarioExpectation,
): void {
  for (const [path, presence] of Object.entries(expectation.shape ?? {}))
    expect(root.find(path) !== null, `shape ${path}`).toBe(
      presence === 'present',
    );
  for (const [path, value] of Object.entries(expectation.values ?? {})) {
    const node = root.find(path);
    expect(node, `value node ${path}`).not.toBeNull();
    expect(node?.value, `value ${path}`).toEqual(value);
  }
  for (const [path, states] of Object.entries(expectation.states ?? {})) {
    const node = root.find(path);
    expect(node, `state node ${path}`).not.toBeNull();
    if (states.isVisible !== undefined)
      expect(node?.isVisible, `state ${path}.isVisible`).toBe(states.isVisible);
    if (states.isReadOnly !== undefined)
      expect(node?.isReadOnly, `state ${path}.isReadOnly`).toBe(states.isReadOnly);
    if (states.isDisabled !== undefined)
      expect(node?.isDisabled, `state ${path}.isDisabled`).toBe(states.isDisabled);
    if (states.isPresent !== undefined)
      expect(node?.isPresent, `state ${path}.isPresent`).toBe(states.isPresent);
  }
  if ('outputValue' in expectation)
    expect(root.outputValue, 'outputValue').toEqual(expectation.outputValue);
  if (expectation.diagnostics)
    expect(root.diagnostics, 'diagnostics').toMatchObject(
      expectation.diagnostics,
    );
  if (expectation.errors)
    throw new Error('Core scenario errors require the PR-4 validation surface');
}

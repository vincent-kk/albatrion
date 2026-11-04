import { describe, expect, it } from 'vitest';

import type { PlainNode } from '@/schema-form/core/engine/__tests__/fixtures/createPlainNode';
import { createTestTree } from '@/schema-form/core/engine/__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '@/schema-form/core/engine/settle';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { evaluateDeriveRound } from '../evaluateDeriveRound';
import type { DeriveState } from '../types/state';
import { evaluateResetInteraction } from '../utils/evaluate/evaluateResetInteraction';

/**
 * Build a load-scan state whose empty baselines make every rule fire once.
 * @param root - Mounted root whose committed declarations select the rules
 * @returns Fresh call-local state without trace allocation
 */
const createLoadState = (root: PlainNode): DeriveState<PlainNode> => ({
  root,
  selectedDeclarationIds: new Map(),
  committedRuleValues: new Map(),
  consumedRuleValues: new Map(),
  activeRuleKeys: new Set(),
  activeRuleKeysBySource: new Map(),
  activeUnsetTargets: new Set(),
  appliedRanks: new Map(),
  visitedSourcePaths: new Set(),
  loadScope: root,
  entered: new Set(),
  revived: new Set(),
  suppressAutomaticWrites: false,
  trace: false,
});

// filid:contract derive-failures
describe('derive failure lists', () => {
  it('ERROR-004 58C-01 reuses one frozen empty list when no rule fails', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
        d: { type: 'string', controls: { derived: '../source' } },
        r: { type: 'string', controls: { resetInteraction: '../source' } },
      },
    });
    loadFieldNodeAtMount(root, { source: 'S' }, WriteOption.Overwrite);
    const first = evaluateDeriveRound(root, createLoadState(root));
    const second = evaluateDeriveRound(root, createLoadState(root));
    expect(first.writes.length).toBeGreaterThan(0);
    expect(first.failures).toHaveLength(0);
    expect(Object.isFrozen(first.failures)).toBe(true);
    expect(second.failures).toBe(first.failures);
    const reset = evaluateResetInteraction(root, createLoadState(root));
    const resetAgain = evaluateResetInteraction(root, createLoadState(root));
    expect(reset.failures).toHaveLength(0);
    expect(Object.isFrozen(reset.failures)).toBe(true);
    expect(resetAgain.failures).toBe(reset.failures);
  });

  it('ERROR-004 58C-01 allocates a list naming the source occurrence on the first failure', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
        bad: {
          type: 'string',
          controls: { derived: '(() => { throw new Error("bad") })()' },
        },
      },
    });
    expect(() =>
      loadFieldNodeAtMount(root, { source: 'S' }, WriteOption.Overwrite),
    ).toThrow();
    const first = evaluateDeriveRound(root, createLoadState(root));
    const second = evaluateDeriveRound(root, createLoadState(root));
    expect(first.failures).toEqual([
      expect.objectContaining({
        sourcePath: '/bad',
        schemaPath: '#/properties/bad/controls/derived',
        kind: 'expression',
      }),
    ]);
    expect(Object.isFrozen(first.failures)).toBe(false);
    expect(second.failures).not.toBe(first.failures);
  });
});

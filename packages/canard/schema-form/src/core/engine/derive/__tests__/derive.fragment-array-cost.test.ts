import { describe, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../../settle';
import { WriteOption } from '../../types/value';
import { evaluateDeriveRound } from '../evaluateDeriveRound';
import { evaluateResetInteraction } from '../utils/evaluate/evaluateResetInteraction';
import { createFragmentLoadState } from './fixtures/createFragmentLoadState';

// filid:contract derive-fragment-array-cost
describe('CONTROLS-077 reset candidate membership cost', () => {
  it('at most doubles membership work when live items double and returns each item once', () => {
    /** Membership probes for the two live item counts, in ascending order. */
    const work: number[] = [];
    for (const count of [64, 128]) {
      /** Two firing rules share every target but retain independent edges. */
      const { root } = createTestTree({
        type: 'array',
        allOf: [
          { items: { type: 'string' }, controls: { resetInteraction: 'true' } },
          { items: { type: 'string' }, controls: { resetInteraction: 'true' } },
        ],
      });
      loadFieldNodeAtMount(
        root,
        Array.from({ length: count }, () => 'a'),
        WriteOption.Overwrite,
      );
      /** Loaded state makes both rules fire on every live target. */
      const state = { ...createFragmentLoadState(root), trace: true };
      /** Target identities restrict instrumentation to candidate membership. */
      const targets = new Map<unknown, number>(
        root.children?.map((child, index) => [child, index]),
      );
      /** Original methods restored even if evaluation or assertions fail. */
      const includes = Array.prototype.includes;
      /** Original identity lookup used by the linear collector. */
      const has = Set.prototype.has;
      /** Array element comparisons or constant-time identity probes. */
      let membershipWork = 0;
      /** Only candidate arrays pass a live node to includes during this call. */
      const arrayMembership = vi
        .spyOn(Array.prototype, 'includes')
        .mockImplementation(function (this: unknown[], value, fromIndex) {
          if (targets.has(value) && fromIndex === undefined) {
            for (let index = 0; index < this.length; index++) {
              membershipWork++;
              if (this[index] === value) break;
            }
          }
          return includes.call(this, value, fromIndex);
        });
      /** Loaded targets bypass entered/revived checks before collection. */
      const setMembership = vi
        .spyOn(Set.prototype, 'has')
        .mockImplementation(function (this: Set<unknown>, value) {
          if (targets.has(value)) membershipWork++;
          return has.call(this, value);
        });
      /** Wrappers are active only while collecting reset candidates. */
      const decision = (() => {
        try {
          return evaluateResetInteraction(root, state);
        } finally {
          arrayMembership.mockRestore();
          setMembership.mockRestore();
        }
      })();
      work.push(membershipWork);
      expect(decision.nodes).toEqual(root.children);
      expect(decision.nodes).toHaveLength(count);
      expect(decision.trace).toHaveLength(count * 2);
      expect(state.consumedRuleValues.size).toBe(count * 2);
      for (const [index, child] of (root.children ?? []).entries()) {
        expect(decision.nodes[index]).toBe(child);
        expect(decision.nodes.filter((node) => node === child)).toHaveLength(1);
        expect(
          decision.trace.filter((entry) => entry.targetPath === child.path),
        ).toHaveLength(2);
      }
    }
    expect(work[0]).toBeGreaterThan(0);
    expect(work[1]).toBeLessThanOrEqual(work[0] * 2);
  });
});

describe.each(['derived', 'unsetValue', 'resetInteraction'] as const)(
  'CONTROLS-077 %s host expression cost',
  (kind) => {
    it('shares one host evaluation across prefixItems and the remaining item template', () => {
      /** Invocation counter for the authored host expression. */
      const evaluate = vi.fn(() => 'X');
      /** Mounted tree and public operations for this rule scenario. */
      const { root } = createTestTree({
        type: 'array',
        allOf: [
          {
            prefixItems: [{ type: 'string' }, { type: 'string' }],
            items: { type: 'string' },
            controls: { [kind]: '@.evaluate()' },
          },
        ],
      });
      root.runtime.context = { evaluate };
      loadFieldNodeAtMount(root, ['a', 'b', 'c', 'd'], WriteOption.Overwrite);
      evaluate.mockClear();
      /** Independent load baselines for one explicit evaluation round. */
      const state = createFragmentLoadState(root);
      /** Per-item decisions returned without applying settlement writes. */
      const decision =
        kind === 'resetInteraction'
          ? evaluateResetInteraction(root, state)
          : evaluateDeriveRound(root, state);
      expect(
        'writes' in decision ? decision.writes : decision.nodes,
      ).toHaveLength(4);
      expect(state.consumedRuleValues.size).toBe(4);
      expect(evaluate).toHaveBeenCalledOnce();
    });

    it.each([1, 8, 64])(
      'evaluates once for %i current items in each round',
      (count) => {
        /** Invocation counter for the authored host expression. */
        const evaluate = vi.fn(() => 'X');
        /** Mounted tree and public operations for this rule scenario. */
        const { root, blueprint } = createTestTree({
          type: 'array',
          allOf: [
            { items: { type: 'string' }, controls: { [kind]: '@.evaluate()' } },
          ],
        });
        root.runtime.context = { evaluate };
        loadFieldNodeAtMount(
          root,
          Array.from({ length: count }, () => 'a'),
          WriteOption.Overwrite,
        );
        /** Compiled occurrence confirming that the authored control is executable. */
        const expression = blueprint.expressions.find((entry) =>
          entry.schemaPath.endsWith('/' + kind),
        );
        if (!expression)
          throw new Error('Expected a compiled fragment expression');
        evaluate.mockClear();
        try {
          for (const round of [0, 1]) {
            /** Independent load baselines for one explicit evaluation round. */
            const state = createFragmentLoadState(root);
            /** Per-item decisions returned without applying settlement writes. */
            const decision =
              kind === 'resetInteraction'
                ? evaluateResetInteraction(root, state)
                : evaluateDeriveRound(root, state);
            /** Write or reset targets whose count must track current items. */
            const targets =
              'writes' in decision ? decision.writes : decision.nodes;
            expect(targets).toHaveLength(count);
            expect(state.consumedRuleValues.size).toBe(count);
            expect(evaluate).toHaveBeenCalledTimes(round + 1);
          }
        } finally {
          evaluate.mockRestore();
        }
      },
    );
  },
);

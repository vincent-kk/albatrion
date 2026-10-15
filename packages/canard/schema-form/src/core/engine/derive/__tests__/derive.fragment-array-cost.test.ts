import { describe, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../../settle';
import { WriteOption } from '../../types/value';
import { evaluateDeriveRound } from '../evaluateDeriveRound';
import { evaluateResetInteraction } from '../utils/evaluate/evaluateResetInteraction';
import { createFragmentLoadState } from './fixtures/createFragmentLoadState';

// filid:contract derive-fragment-array-cost
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

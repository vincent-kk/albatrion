import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../../../__tests__/fixtures/createDispatchTree';
import { WriteOption } from '../../../../types/value';
import * as equality from '../../../../utils/compute/sameValue';
import { dispatchMount } from '../../../../write';
import { getSettlementScratch } from '../../scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../../scratch/releaseSettlementScratch';
import { createSettlementContext } from '../../settlement/createSettlementContext';
import { markWrite } from '../markWrite';

describe('extras comparison admission', () => {
  it.each([
    { merge: false, input: { seed: { value: 1 } }, changed: false },
    { merge: false, input: { seed: { value: 2 } }, changed: true },
    { merge: false, input: { seed: { value: 1 }, added: 2 }, changed: true },
    { merge: true, input: { seed: { value: 1 } }, changed: false },
    { merge: true, input: { seed: { value: 2 } }, changed: true },
    { merge: true, input: { added: 2 }, changed: true },
  ])(
    'compares object extras at most once for %j',
    ({ merge, input, changed }) => {
      const { root } = createDispatchTree({ type: 'object' });
      dispatchMount(root, { seed: { value: 1 } });
      const previous = root.undeclaredValues;
      const scratch = getSettlementScratch(root.runtime);
      const context = createSettlementContext(
        root,
        merge ? 'callerPartial' : 'callerReplace',
        merge ? WriteOption.Merge : WriteOption.Overwrite,
        scratch,
      );
      const compare = vi.spyOn(equality, 'sameValue');
      let calls: number;
      try {
        markWrite(root, input, context);
        calls = compare.mock.calls.filter(([left]) => left === previous).length;
        expect(context.changedRaw.has(root.path)).toBe(changed);
        expect(root.undeclaredValues === previous).toBe(!changed);
      } finally {
        compare.mockRestore();
        releaseSettlementScratch(scratch);
      }
      expect(calls).toBeLessThanOrEqual(1);
    },
  );

  it.each([
    { input: [1, NaN, undefined], changed: false },
    { input: [2, NaN, undefined], changed: true },
  ])('compares array extras at most once for %j', ({ input, changed }) => {
    const { root } = createDispatchTree({ type: 'array' });
    dispatchMount(root, [1, NaN, undefined]);
    const previous = root.undeclaredValues;
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(
      root,
      'callerReplace',
      WriteOption.Overwrite,
      scratch,
    );
    const compare = vi.spyOn(equality, 'sameValue');
    let calls: number;
    try {
      markWrite(root, input, context);
      calls = compare.mock.calls.filter(([left]) => left === previous).length;
      expect(context.changedRaw.has(root.path)).toBe(changed);
      expect(root.undeclaredValues === previous).toBe(!changed);
    } finally {
      compare.mockRestore();
      releaseSettlementScratch(scratch);
    }
    expect(calls).toBeLessThanOrEqual(1);
  });
});

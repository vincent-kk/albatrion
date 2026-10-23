import { afterEach, describe, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchMount,
  dispatchSetValue,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import * as values from '../../utils/compute/sameValue';
import * as recalculation from '../utils/dependencies/registerRecalculation';
import * as settlement from '../utils/settlement/finishSettlement';

afterEach(() => vi.restoreAllMocks());

/**
 * Count the per-child work of one whole object write to the host `h`.
 * @param count - Number K of number keys on the host `h`
 * @param changed - Number of leading keys the write changes, each to its negated index minus one
 * @returns Nodes `markWrite` recorded before recalculation, nodes the calculation reached, and leaf value comparisons made while `markWrite` is on the stack
 */
const measureWrite = (count: number, changed: number) => {
  const properties: Record<string, { type: 'number' }> = {};
  const value: Record<string, number> = {};
  for (let index = 0; index < count; index++) {
    properties['k' + index] = { type: 'number' };
    value['k' + index] = index;
  }
  const { root } = createDispatchTree({
    type: 'object',
    properties: { h: { type: 'object', properties } },
  });
  dispatchMount(root, { h: value }, WriteOption.Overwrite, {
    deferValidation: true,
  });
  const register = recalculation.registerRecalculation;
  const finish = settlement.finishSettlement;
  const counts = { marked: 0, computed: 0, compared: 0 };
  const compare = values.sameValue;
  vi.spyOn(values, 'sameValue').mockImplementation((left, right) => {
    if (
      typeof left === 'number' &&
      typeof right === 'number' &&
      new Error().stack?.includes('/utils/input/markWrite.ts')
    )
      counts.compared++;
    return compare(left, right);
  });
  vi.spyOn(recalculation, 'registerRecalculation').mockImplementation(
    (context) => {
      counts.marked = context.writtenInputs.size;
      register(context);
    },
  );
  vi.spyOn(settlement, 'finishSettlement').mockImplementation(
    (context, scratch, scalarWrite) => {
      counts.computed = context.stateDirtyNodes.size;
      finish(context, scratch, scalarWrite);
    },
  );
  const host = root.structure!.h;
  const next: Record<string, number> = { ...value };
  for (let index = 0; index < changed; index++) next['k' + index] = -index - 1;
  dispatchSetValue(host, next);
  vi.restoreAllMocks();
  expect(Object(root.emit).h).toEqual(next);
  return counts;
};

// filid:contract settle-static-same-value-write-cost
describe('a one-key whole write marks and computes independently of the key count', () => {
  it('marks the host and the changed leaf, and computes the root, host and leaf, at K = 100 and K = 1,000', () => {
    const small = measureWrite(100, 1);
    const large = measureWrite(1000, 1);
    expect(small).toEqual({ marked: 2, computed: 3, compared: 100 });
    expect(large).toEqual({ ...small, compared: 1000 });
  });

  it('interprets and compares each changed leaf once when every key changes, at K = 100 and K = 1,000', () => {
    for (const count of [100, 1000]) {
      const { marked, compared } = measureWrite(count, count);
      expect(marked).toBe(count + 1);
      expect(compared).toBe(count);
    }
  });
});

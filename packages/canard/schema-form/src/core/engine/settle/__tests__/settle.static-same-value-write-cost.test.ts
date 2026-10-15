import { afterEach, describe, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchMount,
  dispatchSetValue,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import * as recalculation from '../utils/dependencies/registerRecalculation';
import * as settlement from '../utils/settlement/finishSettlement';

afterEach(() => vi.restoreAllMocks());

/**
 * Count the per-child work of one whole object write that changes a single key.
 * @param count - Number K of number keys on the host `h`
 * @returns Nodes `markWrite` recorded before recalculation and nodes the calculation reached
 */
const measureOneKey = (count: number) => {
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
  const counts = { marked: 0, computed: 0 };
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
  dispatchSetValue(host, { ...Object(host.emit), k0: -1 });
  expect(Reflect.get(Object(root.emit).h, 'k0')).toBe(-1);
  return counts;
};

// filid:contract settle-static-same-value-write-cost
describe('a one-key whole write marks and computes independently of the key count', () => {
  it('marks the host and the changed leaf, and computes the root, host and leaf, at K = 100 and K = 1,000', () => {
    const small = measureOneKey(100);
    const large = measureOneKey(1000);
    expect(small).toEqual({ marked: 2, computed: 3 });
    expect(large).toEqual(small);
  });
});

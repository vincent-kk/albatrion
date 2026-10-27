import { afterEach, describe, expect, it, vi } from 'vitest';
import { beforeEach } from 'vitest';

import * as blueprint from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchMount,
  dispatchPop,
  dispatchRemove,
} from '@/schema-form/core/engine/write';

import { pinSlotShipping } from '../../../../__tests__/fixtures/pinSlotShipping';
import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';
import * as reuseProof from '../../utils/compute/childSelection/canReuseArrayChildren';
import * as reuse from '../../utils/compute/childSelection/reuseArrayChildren';
import * as ids from '../../utils/compute/childSelection/staticIds';
import * as alignment from '../../utils/loadValues/alignArraySnapshotSlots';
import * as tailProof from '../utils/arraySlots/canApplyArrayTail';
import * as admission from '../utils/arraySlots/prepareArrayPop';

afterEach(() => vi.restoreAllMocks());
// These internal operation counts describe the shipping tree, excluding replay.
beforeEach(() => pinSlotShipping());

/** Arrays this long or longer are item-count-sized at both measured counts (a pop leaves N-1). */
const ITEM_SIZED = 900;

/** Array methods whose item-count-sized calls are counted. */
const COUNTED = [
  'slice',
  'concat',
  'every',
  'some',
  'filter',
  'map',
  'forEach',
  'indexOf',
  'includes',
  'reduce',
] as const;

/**
 * Count the prefix work of one public truncation on a drained static array.
 * @param count - Items mounted before the verb
 * @param verb - Public truncation applied to the mounted root
 * @returns Call counts of every prefix-proportional site, item-count-sized array calls, push calls and wide key listings
 */
const measure = (count: number, verb: (root: DispatchTestNode) => unknown) => {
  const { root } = createDispatchTree({
    type: 'array',
    items: { type: 'number' },
  });
  dispatchMount(
    root,
    Array.from({ length: count }, (_, index) => index),
    WriteOption.Overwrite,
    { deferValidation: true },
  );
  const admit = vi.spyOn(admission, 'prepareArrayPop');
  const spies = {
    canApplyArrayTail: vi.spyOn(tailProof, 'canApplyArrayTail'),
    canReuseArrayChildren: vi.spyOn(reuseProof, 'canReuseArrayChildren'),
    reuseArrayChildren: vi.spyOn(reuse, 'reuseArrayChildren'),
    getItemEntry: vi.spyOn(blueprint, 'getItemEntry'),
    mergeEffectiveSchema: vi.spyOn(blueprint, 'mergeEffectiveSchema'),
    staticIds: vi.spyOn(ids, 'staticIds'),
    alignArraySnapshotSlots: vi.spyOn(alignment, 'alignArraySnapshotSlots'),
  };
  const sized: Record<string, number> = { push: 0, keys: 0 };
  const restore: (() => void)[] = [];
  for (const name of COUNTED) {
    sized[name] = 0;
    const original = Reflect.get(Array.prototype, name);
    Object.defineProperty(Array.prototype, name, {
      configurable: true,
      writable: true,
      value: function (this: unknown[], ...args: unknown[]) {
        if (this.length >= ITEM_SIZED) sized[name]++;
        return Reflect.apply(original, this, args);
      },
    });
    restore.push(() =>
      Object.defineProperty(Array.prototype, name, {
        configurable: true,
        writable: true,
        value: original,
      }),
    );
  }
  const push = Array.prototype.push;
  Object.defineProperty(Array.prototype, 'push', {
    configurable: true,
    writable: true,
    value: function (this: unknown[], ...args: unknown[]) {
      sized.push++;
      return Reflect.apply(push, this, args);
    },
  });
  restore.push(() =>
    Object.defineProperty(Array.prototype, 'push', {
      configurable: true,
      writable: true,
      value: push,
    }),
  );
  const keys = Object.keys;
  Object.keys = (target: object) => {
    const listed = keys(target);
    if (listed.length >= ITEM_SIZED) sized.keys++;
    return listed;
  };
  restore.push(() => {
    Object.keys = keys;
  });
  let removed: unknown;
  try {
    removed = verb(root);
  } finally {
    for (const undo of restore) undo();
  }
  expect(removed).toBe(count - 1);
  expect(root.local).toHaveLength(count - 1);
  expect(admit.mock.results.some((call) => call.value !== undefined)).toBe(
    true,
  );
  const aligned = spies.alignArraySnapshotSlots.mock.calls.reduce(
    (hosts, [list]) => hosts + list.length,
    0,
  );
  const calls = Object.fromEntries(
    Object.entries(spies).map(([name, spy]) => [name, spy.mock.calls.length]),
  );
  vi.restoreAllMocks();
  return { calls, aligned, sized };
};

/** Pop the last position. */
const pop = (root: DispatchTestNode) => dispatchPop(root);

/** Remove the last position by index. */
const removeLast = (root: DispatchTestNode) =>
  dispatchRemove(root, root.itemCount - 1);

// filid:contract settle-array-pop-cost
describe('an admitted pop does prefix work independent of the item count', () => {
  it('counts the same prefix work at 1,000 and 8,000 items, with no slot plan, tail proof, per-item selection or alignment', () => {
    const small = measure(1000, pop);
    const large = measure(8000, pop);
    expect(large.calls).toEqual(small.calls);
    expect(small.calls.canApplyArrayTail).toBe(0);
    expect(small.calls.staticIds).toBe(0);
    expect(small.aligned).toBe(0);
    expect(large.aligned).toBe(0);
  });

  it('keeps the accepted copies as the only item-count-sized work', () => {
    const small = measure(1000, pop);
    const large = measure(8000, pop);
    expect(large.sized).toEqual(small.sized);
    // The children and local truncations; the load-snapshot copy is an indexed loop, not an Array method.
    // Equal push counts also show that no N-slot row plan was built.
    expect(large.sized.slice).toBe(2);
    expect(large.sized.keys).toBe(0);
  });

  it('takes the same path and the same work for remove(N-1)', () => {
    expect(measure(8000, removeLast)).toEqual(measure(8000, pop));
  });
});

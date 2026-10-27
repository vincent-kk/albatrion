import { afterEach, describe, expect, it, vi } from 'vitest';
import { beforeEach } from 'vitest';

import * as blueprint from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import { dispatchMount, dispatchPush } from '@/schema-form/core/engine/write';

import { pinSlotShipping } from '../../../../__tests__/fixtures/pinSlotShipping';
import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import * as reuseProof from '../../utils/compute/childSelection/canReuseArrayChildren';
import * as reuse from '../../utils/compute/childSelection/reuseArrayChildren';
import * as ids from '../../utils/compute/childSelection/staticIds';
import * as alignment from '../../utils/loadValues/alignArraySnapshotSlots';
import * as emissions from '../../utils/output/utils/keepsChildEmissions';
import * as tailProof from '../utils/arraySlots/canApplyArrayTail';
import * as admission from '../utils/arraySlots/prepareArrayAppend';

afterEach(() => vi.restoreAllMocks());
// These internal operation counts describe the shipping tree, excluding replay.
beforeEach(() => pinSlotShipping());

/** Arrays this long or longer are the prefix-sized ones for both measured counts. */
const PREFIX_SIZED = 1000;

/**
 * Count the prefix work of one public push on a drained static array.
 * @param count - Items mounted before the push
 * @returns Call counts of every prefix-proportional site and of N-sized array operations
 */
const measurePush = (count: number) => {
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
  const admit = vi.spyOn(admission, 'prepareArrayAppend');
  const spies = {
    canApplyArrayTail: vi.spyOn(tailProof, 'canApplyArrayTail'),
    canReuseArrayChildren: vi.spyOn(reuseProof, 'canReuseArrayChildren'),
    reuseArrayChildren: vi.spyOn(reuse, 'reuseArrayChildren'),
    getItemEntry: vi.spyOn(blueprint, 'getItemEntry'),
    staticIds: vi.spyOn(ids, 'staticIds'),
    alignArraySnapshotSlots: vi.spyOn(alignment, 'alignArraySnapshotSlots'),
  };
  const sized = { slice: 0, concat: 0, every: 0, push: 0 };
  const originals = (['slice', 'concat', 'every', 'push'] as const).map(
    (name) => {
      const original = Reflect.get(Array.prototype, name);
      Object.defineProperty(Array.prototype, name, {
        configurable: true,
        writable: true,
        value: function (this: unknown[], ...args: unknown[]) {
          if (name === 'push' || this.length >= PREFIX_SIZED) sized[name]++;
          return Reflect.apply(original, this, args);
        },
      });
      return [name, original] as const;
    },
  );
  let length: number;
  try {
    length = dispatchPush(root, count);
  } finally {
    for (const [name, original] of originals)
      Object.defineProperty(Array.prototype, name, {
        configurable: true,
        writable: true,
        value: original,
      });
  }
  expect(length).toBe(count + 1);
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

// filid:contract settle-array-append-cost
describe('an admitted push does prefix work independent of the item count', () => {
  it('counts the same prefix work at 1,000 and 8,000 items', () => {
    const small = measurePush(1000);
    const large = measurePush(8000);
    expect(large.calls).toEqual(small.calls);
    expect(small.calls.canApplyArrayTail).toBe(0);
    expect(small.aligned).toBe(0);
    expect(large.aligned).toBe(0);
  });

  it('keeps the three accepted copies as the only item-count-sized work', () => {
    const small = measurePush(1000);
    const large = measurePush(8000);
    expect(large.sized.slice).toBe(1);
    expect(large.sized.concat).toBe(1);
    expect(large.sized.every).toBe(0);
    expect(small.sized.slice).toBe(1);
    expect(small.sized.concat).toBe(1);
    expect(large.sized.push).toBe(small.sized.push);
  });

  it('skips the item-count-wide revival scan when a defaulted object item reassembles its host', () => {
    const { root } = createDispatchTree({
      type: 'array',
      items: {
        type: 'object',
        properties: { a: { type: 'number', default: 1 } },
      },
    });
    dispatchMount(
      root,
      Array.from({ length: 2000 }, () => ({ a: 2 })),
      WriteOption.Overwrite,
      { deferValidation: true },
    );
    const admit = vi.spyOn(admission, 'prepareArrayAppend');
    const scan = vi.spyOn(emissions, 'keepsChildEmissions');

    expect(dispatchPush(root, {})).toBe(2001);

    expect(admit.mock.results.some((call) => call.value !== undefined)).toBe(
      true,
    );
    expect(root.children![2000].structure!.a.emit).toBe(1);
    expect(
      scan.mock.calls.filter(([, children]) => children.length >= 1000),
    ).toHaveLength(0);
  });
});

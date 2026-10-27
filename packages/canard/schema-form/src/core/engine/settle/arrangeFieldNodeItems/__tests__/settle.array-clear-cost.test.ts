import { afterEach, describe, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';
import { dispatchClear, dispatchMount } from '@/schema-form/core/engine/write';

import { pinLatentBaseline } from '../../../../__tests__/fixtures/pinLatentBaseline';
import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import * as gates from '../../utils/gates/getGateRegistry';
import * as loadValues from '../../utils/loadValues/getLoadValue';
import * as prune from '../../utils/transition/prunePerishedPaths';
import * as bulk from '../utils/rekey/clearArrayRuntimePaths';
import * as rekey from '../utils/rekey/rekeyArrayRuntimePaths';

afterEach(() => vi.restoreAllMocks());

/**
 * Count the per-node cleanup work of one public clear on a static number array.
 * @param count - Items mounted before the clear
 * @returns Calls of every site that used to run once per removed item
 */
const measure = (count: number) => {
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
  const index = Object.getPrototypeOf(root.runtime.latentRaw.pathIndex);
  const spies = {
    under: vi.spyOn(index, 'under'),
    intersecting: vi.spyOn(index, 'intersecting'),
    rekeyArrayRuntimePaths: vi.spyOn(rekey, 'rekeyArrayRuntimePaths'),
    clearArrayRuntimePaths: vi.spyOn(bulk, 'clearArrayRuntimePaths'),
    prunePerishedPaths: vi.spyOn(prune, 'prunePerishedPaths'),
    getLoadValue: vi.spyOn(loadValues, 'getLoadValue'),
    getGateRegistry: vi.spyOn(gates, 'getGateRegistry'),
  };
  dispatchClear(root);
  expect(root.local).toEqual([]);
  const calls: Record<string, number> = {};
  for (const [name, spy] of Object.entries(spies))
    calls[name] = spy.mock.calls.length;
  vi.restoreAllMocks();
  return calls;
};

// filid:contract settle-array-clear-cost
describe('clear cleanup constants', () => {
  it('does not grow host-prefix path-store lookups, re-keying, item load reads or registry lookups with the item count', () => {
    // This count contract measures the latent-store path-index cleanup implementation.
    pinLatentBaseline();
    const small = measure(1_000);
    const large = measure(8_000);
    // The perish finalization's prune still asks the one store holding entries elsewhere in the tree once per removed item.
    expect(large.under - small.under).toBe(7_000);
    expect({ ...large, under: 0 }).toEqual({ ...small, under: 0 });
    expect(small.rekeyArrayRuntimePaths).toBe(0);
    expect(small.clearArrayRuntimePaths).toBe(1);
    expect(small.under - 1_000 + small.intersecting).toBeLessThan(50);
    expect(small.getLoadValue).toBeLessThan(10);
    expect(small.getGateRegistry).toBeLessThan(10);
  });
});

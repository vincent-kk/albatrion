import { afterEach, describe, expect, it, vi } from 'vitest';
import { beforeEach } from 'vitest';

import * as blueprint from '@/schema-form/core/engine/blueprint';
import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import * as records from '@/schema-form/core/engine/record';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchInsert,
  dispatchMount,
  dispatchRemove,
} from '@/schema-form/core/engine/write';

import { pinSlotShipping } from '../../../../__tests__/fixtures/pinSlotShipping';
import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';
import * as proof from '../../utils/compute/childSelection/canReuseArrayChildren';
import * as reuse from '../../utils/compute/childSelection/reuseArrayChildren';
import * as ids from '../../utils/compute/childSelection/staticIds';
import * as registration from '../../utils/dependencies/registerRecalculation';
import * as rawTree from '../../utils/latent/readRawTree';
import * as output from '../../utils/output/updateOutput';
import * as general from '../utils/arraySlots/applyArraySlots';
import * as splicing from '../utils/arraySlots/applyArraySplice';
import * as tailProof from '../utils/arraySlots/canApplyArrayTail';
import * as admission from '../utils/arraySlots/prepareArraySplice';

afterEach(() => vi.restoreAllMocks());
// These internal work bounds measure one shipping tree, excluding oracle replay.
beforeEach(() => pinSlotShipping());

/** Number items, the measured shape. */
const NUMBERS: BlueprintSchema = { type: 'array', items: { type: 'number' } };

/** A middle verb at a position, applied to a mounted root. */
type Verb = (root: DispatchTestNode, index: number) => unknown;

/** Remove at a position. */
const remove: Verb = (root, index) => dispatchRemove(root, index);

/** Insert at a position. */
const insert: Verb = (root, index) => dispatchInsert(root, index, -1);

/** Unspied implementations the counting wrappers delegate to. */
const original = {
  getItemEntry: blueprint.getItemEntry,
  registerRecalculation: registration.registerRecalculation,
  prepareArraySplice: admission.prepareArraySplice,
  applyArraySplice: splicing.applyArraySplice,
  canReuseArrayChildren: proof.canReuseArrayChildren,
  reuseArrayChildren: reuse.reuseArrayChildren,
};

/**
 * Count the work of one public middle verb on a drained array.
 * @param count - Items mounted before the verb
 * @param tail - T = N - i, the length of the re-keyed tail
 * @param verb - Public remove or insert
 * @param schema - Array schema; number items by default
 * @returns Calls of every counted site, prefix entry requests inside admission, application and child selection, and the registered dirty paths
 */
const measure = (
  count: number,
  tail: number,
  verb: Verb,
  schema: BlueprintSchema = NUMBERS,
) => {
  const { root } = createDispatchTree(schema);
  dispatchMount(
    root,
    Array.from({ length: count }, (_, index) => index),
    WriteOption.Overwrite,
    { deferValidation: true },
  );
  const index = count - tail;
  let phase = false;
  const within =
    <Args extends unknown[], Result>(original: (...args: Args) => Result) =>
    (...args: Args): Result => {
      phase = true;
      try {
        return original(...args);
      } finally {
        phase = false;
      }
    };
  const admit = vi
    .spyOn(admission, 'prepareArraySplice')
    .mockImplementation(within(original.prepareArraySplice));
  vi.spyOn(splicing, 'applyArraySplice').mockImplementation(
    within(original.applyArraySplice),
  );
  vi.spyOn(proof, 'canReuseArrayChildren').mockImplementation(
    within(original.canReuseArrayChildren),
  );
  vi.spyOn(reuse, 'reuseArrayChildren').mockImplementation(
    within(original.reuseArrayChildren),
  );
  let prefixEntries = 0;
  vi.spyOn(blueprint, 'getItemEntry').mockImplementation(
    (template, position) => {
      if (phase && position < index) prefixEntries++;
      return original.getItemEntry(template, position);
    },
  );
  let registered = 0;
  vi.spyOn(registration, 'registerRecalculation').mockImplementation(
    (context) => {
      original.registerRecalculation(context);
      registered += context.dirtyPaths.size;
    },
  );
  const spies = {
    readRawTree: vi.spyOn(rawTree, 'readRawTree'),
    canApplyArrayTail: vi.spyOn(tailProof, 'canApplyArrayTail'),
    applyArraySlots: vi.spyOn(general, 'applyArraySlots'),
    updateOutput: vi.spyOn(output, 'updateOutput'),
    updateFieldNodeNameAndPath: vi.spyOn(records, 'updateFieldNodeNameAndPath'),
    staticIds: vi.spyOn(ids, 'staticIds'),
  };
  verb(root, index);
  const admitted = admit.mock.results.some((call) => call.value !== undefined);
  const calls = Object.fromEntries(
    Object.entries(spies).map(([name, spy]) => [name, spy.mock.calls.length]),
  );
  vi.restoreAllMocks();
  return { admitted, calls, prefixEntries, registered };
};

// filid:contract settle-array-splice-cost
describe('an admitted middle remove or insert does tail-sized work', () => {
  it.each<[string, Verb]>([
    ['remove', remove],
    ['insert', insert],
  ])(
    '%s counts the same admission, application, selection, registration and calculation work at 1,000 and 8,000 items for a fixed tail',
    (_, verb) => {
      const small = measure(1000, 10, verb);
      const large = measure(8000, 10, verb);
      expect(small.admitted).toBe(true);
      expect(large.admitted).toBe(true);
      expect(large.calls).toEqual(small.calls);
      expect(large.registered).toBe(small.registered);
      expect(large.calls.readRawTree).toBe(0);
      expect(large.calls.canApplyArrayTail).toBe(0);
      expect(large.calls.applyArraySlots).toBe(0);
      expect(small.prefixEntries).toBe(0);
      expect(large.prefixEntries).toBe(0);
    },
  );

  it.each<[string, Verb, number]>([
    ['remove', remove, -1],
    ['insert', insert, 0],
  ])(
    '%s renames only the tail and calculates the same nodes for a short and a long tail',
    (_, verb, renamedOffset) => {
      const short = measure(8000, 10, verb);
      const long = measure(8000, 1000, verb);
      expect(short.calls.updateFieldNodeNameAndPath).toBe(10 + renamedOffset);
      expect(long.calls.updateFieldNodeNameAndPath).toBe(1000 + renamedOffset);
      expect(long.calls.updateOutput).toBe(short.calls.updateOutput);
      expect(long.registered).toBe(short.registered);
    },
  );
});

describe('the general slot path reads the raw tree only when a slot needs it', () => {
  it('reads nothing for an item-template array and still reads a tuple array', () => {
    const declined = (schema: BlueprintSchema) => {
      vi.spyOn(admission, 'prepareArraySplice').mockReturnValue(undefined);
      const read = vi.spyOn(rawTree, 'readRawTree');
      const slots = vi.spyOn(general, 'applyArraySlots');
      const { root } = createDispatchTree(schema);
      dispatchMount(root, [0, 1, 2, 3, 4], WriteOption.Overwrite, {
        deferValidation: true,
      });
      read.mockClear();
      const removed = dispatchRemove(root, 1);
      dispatchInsert(root, 1, 9);
      const counts = [slots.mock.calls.length, read.mock.calls.length];
      vi.restoreAllMocks();
      return { removed, counts, emit: root.emit };
    };
    expect(declined(NUMBERS)).toEqual({
      removed: 1,
      counts: [2, 0],
      emit: [0, 9, 2, 3, 4],
    });
    const tuple = declined({
      type: 'array',
      prefixItems: [{ type: 'number' }],
      items: { type: 'number' },
    });
    expect(tuple.counts[0]).toBe(2);
    expect(tuple.counts[1]).toBeGreaterThan(0);
    expect(tuple.emit).toEqual([0, 9, 2, 3, 4]);
  });
});

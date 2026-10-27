import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchPop,
  dispatchPush,
  dispatchRemove,
  dispatchResetSubtree,
  dispatchSetValue,
} from '@/schema-form/core/engine/write';

import { pinLatentBaseline } from '../../../../__tests__/fixtures/pinLatentBaseline';
import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';
import * as admission from '../utils/arraySlots/prepareArrayPop';
import { compareArrayPop } from './fixtures/compareArrayPop';
import { defaultsOf } from './fixtures/defaultsOf';
import { runArrayWrite } from './fixtures/runArrayWrite';
import type { ArrayWriteRun } from './fixtures/runArrayWrite';
import { slotsOf } from './fixtures/slotsOf';

afterEach(() => vi.restoreAllMocks());

/** Object items with a nested array, a literal default and a plain field. */
const OBJECTS: BlueprintSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      fill: { type: 'number', default: 7 },
      nested: { type: 'array', items: { type: 'number' } },
    },
  },
};

/** Public observations a truncation shares with the whole write of the remaining items. */
const observe = (run: ArrayWriteRun) => ({
  result: run.result,
  local: slotsOf(run.root.local),
  emit: slotsOf(run.root.emit),
  deliveredPaths: run.deliveredPaths,
  changes: run.changes,
  revisions: run.root.revisionLedger,
  items: (run.root.children ?? []).map((item, index) => ({
    same: item === run.before[index],
    key: item.itemKey === run.keys[index],
    name: item.name,
    path: item.path,
    parent: item.parent === run.root,
  })),
  removed: run.before
    .slice(run.root.children?.length ?? 0)
    .map((item) => [item.detached, slotsOf(item.local)]),
});

// filid:contract settle-array-pop
describe('static pop through the truncation path matches the general path', () => {
  it('pops a misfit NaN on the general path, then -0, undefined and numbers down to empty, then pops the empty array as a no-op', () => {
    const { candidate } = compareArrayPop(
      { type: 'array', items: { type: 'number' } },
      [1, 2],
      [
        { apply: (root) => dispatchPush(root, undefined), pop: false },
        { apply: (root) => dispatchPush(root, -0), pop: false },
        { apply: (root) => dispatchPush(root, Number.NaN), pop: false },
        { apply: (root) => dispatchPop(root), pop: false },
        { apply: (root) => dispatchPop(root), pop: true },
        { apply: (root) => dispatchPop(root), pop: true },
        { apply: (root) => dispatchPop(root), pop: true },
        { apply: (root) => dispatchPop(root), pop: true },
        { apply: (root) => dispatchPop(root), pop: false },
        { apply: (root) => dispatchRemove(root, 0), pop: false },
      ],
    );
    expect(candidate.local).toEqual([]);
    expect(candidate.children).toEqual([]);
  });

  it('takes the same path for remove(N-1) and declines every other position', () => {
    const { candidate } = compareArrayPop(
      { type: 'array', items: { type: 'string' } },
      ['a', 'b', 'c', 'd', 'e'],
      [
        { apply: (root) => dispatchRemove(root, 4), pop: true },
        { apply: (root) => dispatchRemove(root, 0), pop: false },
        { apply: (root) => dispatchRemove(root, 3), pop: false },
        { apply: (root) => dispatchRemove(root, 2), pop: true },
        { apply: (root) => dispatchRemove(root, -1), pop: false },
        { apply: (root) => dispatchRemove(root, 1.5), pop: false },
      ],
    );
    expect(candidate.local).toEqual(['b', 'c']);
  });

  it('retires a nested object item and keeps its detached reads and latent-free runtime', () => {
    // These assertions inspect the latent-store baseline directly.
    pinLatentBaseline();
    let popped: DispatchTestNode | undefined;
    const { candidate } = compareArrayPop(
      OBJECTS,
      [{ name: 'a', nested: [1, 2] }, { name: 'b', nested: [3] }, {}],
      [
        { apply: (root) => dispatchPop(root), pop: true },
        {
          apply: (root) => {
            popped = root.children![1];
            return dispatchPop(root);
          },
          pop: true,
        },
      ],
    );
    expect(popped?.detached).toBe(true);
    expect(popped?.local).toEqual({ name: 'b', fill: 7, nested: [3] });
    expect(candidate.runtime.latentRaw.size).toBe(0);
    expect(candidate.emit).toEqual([{ name: 'a', fill: 7, nested: [1, 2] }]);
  });

  it('pops a non-root array until its emission is omitted, then pops it as a no-op', () => {
    const { candidate } = compareArrayPop(
      {
        type: 'object',
        properties: {
          rows: { type: 'array', items: { type: 'number' } },
          sibling: { type: 'string' },
        },
      },
      { rows: [1, 2], sibling: 'same' },
      [
        { apply: (root) => dispatchPop(root.structure!.rows), pop: true },
        { apply: (root) => dispatchPop(root.structure!.rows), pop: true },
        { apply: (root) => dispatchPop(root.structure!.rows), pop: false },
      ],
      (root) => root.structure!.rows,
    );
    expect(candidate.structure!.rows.local).toEqual([]);
    expect(candidate.structure!.sibling.emit).toBe('same');
  });

  it('densifies a sparse and a short load snapshot on an admitted pop without changing them', () => {
    const sparse: unknown[] = [];
    sparse.length = 4;
    sparse[1] = 'snapshot';
    const short: unknown[] = ['x'];
    const runs = [sparse, short].map(
      (snapshot) =>
        compareArrayPop(
          { type: 'array', items: { type: 'string' } },
          ['a', 'b', 'c', 'd'],
          [
            {
              apply: (root) => {
                root.runtime.loadSnapshot = snapshot;
              },
              pop: false,
            },
            { apply: (root) => dispatchPop(root), pop: true },
          ],
        ).candidate,
    );

    expect(slotsOf(runs[0].runtime.loadSnapshot)).toEqual([
      'undefined',
      'snapshot',
      'undefined',
    ]);
    expect(slotsOf(runs[1].runtime.loadSnapshot)).toEqual([
      'x',
      'undefined',
      'undefined',
    ]);
    expect(Object.keys(sparse)).toEqual(['1']);
    expect(short).toEqual(['x']);
  });

  it('alternates push and pop, a leaf edit and a reset on their shortcuts', () => {
    const { candidate } = compareArrayPop(
      OBJECTS,
      [{ name: 'a' }, { name: 'b' }],
      [
        { apply: (root) => dispatchPush(root, { name: 'c' }), pop: false },
        { apply: (root) => dispatchPop(root), pop: true },
        {
          apply: (root) =>
            dispatchSetValue(
              root.children![1].structure!.name,
              'B',
              WriteOption.Overwrite,
            ),
          pop: false,
        },
        { apply: (root) => dispatchPop(root), pop: true },
        { apply: (root) => dispatchPush(root), pop: false },
        { apply: (root) => dispatchResetSubtree(root), pop: false },
        { apply: (root) => dispatchPop(root), pop: true },
      ],
    );
    expect(candidate.emit).toEqual([{ name: 'a', fill: 7 }]);
  });

  it.each([1000, 8000])(
    'repeats pops on a %i-item array with the same history',
    (count) => {
      const { candidate } = compareArrayPop(
        { type: 'array', items: { type: 'number' } },
        Array.from({ length: count }, (_, index) => index),
        [
          { apply: (root) => dispatchPop(root), pop: true },
          { apply: (root) => dispatchRemove(root, count - 2), pop: true },
        ],
      );
      expect(candidate.local).toHaveLength(count - 2);
    },
  );

  it.each<[string, BlueprintSchema, readonly unknown[]]>([
    ['number items', { type: 'array', items: { type: 'number' } }, [1, 2, 3]],
    [
      'object items',
      OBJECTS,
      [
        { name: 'a', fill: 7, nested: [1] },
        { name: 'b', fill: 7 },
      ],
    ],
  ])(
    'matches the whole write of the remaining %s in values, deliveries, revisions and identity',
    (_, schema, input) => {
      const admit = vi.spyOn(admission, 'prepareArrayPop');
      const popped = runArrayWrite(schema, input, (root) => dispatchPop(root));
      expect(admit.mock.results.some((call) => call.value !== undefined)).toBe(
        true,
      );
      const whole = runArrayWrite(schema, input, (root) => {
        dispatchSetValue(root, input.slice(0, -1), WriteOption.Overwrite);
        return popped.result;
      });
      expect(observe(popped)).toEqual(observe(whole));
      expect(defaultsOf(popped.root)).toEqual(defaultsOf(whole.root));
      expect(
        popped.root.children?.every(
          (item, index) => item.name === String(index),
        ),
      ).toBe(true);
    },
  );

  it('pops an empty array with no error, warning or delivery (35C-06)', () => {
    const report = vi.fn();
    const warn = vi.spyOn(console, 'warn');
    const run = runArrayWrite(
      { type: 'array', items: { type: 'number' } },
      [],
      (root) => {
        root.runtime.errorReporter = { hasConsumer: () => true, report };
        return dispatchPop(root);
      },
    );
    expect(run.result).toBeUndefined();
    expect(run.root.local).toEqual([]);
    expect(run.deliveredPaths).toEqual([]);
    expect(report).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });
});

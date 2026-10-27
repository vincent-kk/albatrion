import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchInsert,
  dispatchPush,
  dispatchRemove,
  dispatchResetSubtree,
  dispatchSetValue,
} from '@/schema-form/core/engine/write';

import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';
import * as output from '../../utils/output/updateOutput';
import { compareArraySplice } from './fixtures/compareArraySplice';
import type { SpliceStep } from './fixtures/compareArraySplice';
import { runArrayWrite } from './fixtures/runArrayWrite';

afterEach(() => vi.restoreAllMocks());

/** Number items. */
const NUMBERS: BlueprintSchema = { type: 'array', items: { type: 'number' } };

/** Object items with a nested array, a literal default and a nested object, so renamed tails have descendants. */
const OBJECTS: BlueprintSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      fill: { type: 'number', default: 7 },
      nested: { type: 'array', items: { type: 'number' } },
      inner: { type: 'object', properties: { deep: { type: 'string' } } },
    },
  },
};

/** Remove at a position. */
const remove = (index: number, splice = true): SpliceStep => ({
  apply: (root) => dispatchRemove(root, index),
  splice,
});

/** Insert a value at a position. */
const insert = (index: number, value: unknown, splice = true): SpliceStep => ({
  apply: (root) => dispatchInsert(root, index, value),
  splice,
});

// filid:contract settle-array-splice
describe('static middle remove and insert through the splice path match the general path', () => {
  it('removes number items at 0, 1, N/2 and N-2, then leaves N-1 to pop', () => {
    const { candidate } = compareArraySplice(
      NUMBERS,
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [remove(0), remove(1), remove(4), remove(5), remove(5, false)],
    );
    expect(candidate.emit).toEqual([1, 3, 4, 5, 7]);
  });

  it('inserts number items, undefined and -0 at 0, 1, N/2 and N-2, leaves N to push, and declines after a misfit NaN', () => {
    const { candidate } = compareArraySplice(
      NUMBERS,
      [1, 2, 3, 4],
      [
        insert(0, 0),
        insert(1, undefined),
        insert(3, -0),
        insert(5, 5),
        insert(8, 9, false),
        insert(2, Number.NaN, true),
        insert(1, 1, false),
      ],
    );
    expect(candidate.itemCount).toBe(11);
  });

  it('moves nested object items with their descendants and fills an inserted item default', () => {
    const items = Array.from({ length: 6 }, (_, index) => ({
      name: 'n' + index,
      nested: [index, index + 1],
      inner: { deep: 'd' + index },
    }));
    const { candidate } = compareArraySplice(OBJECTS, items, [
      remove(1),
      insert(0, { name: 'front' }),
      insert(3, {}),
      remove(0),
      remove(4),
      insert(4, { nested: [7] }),
    ]);
    expect(candidate.emit).toHaveLength(6);
    expect(candidate.children!.map((child) => child.path)).toEqual([
      '/0',
      '/1',
      '/2',
      '/3',
      '/4',
      '/5',
    ]);
  });

  it('keeps the removed node detached with its reads and sends its later write to latent raw', () => {
    let removed: DispatchTestNode | undefined;
    compareArraySplice(
      OBJECTS,
      [{ name: 'a' }, { name: 'b', inner: { deep: 'x' } }, { name: 'c' }],
      [
        {
          apply: (root) => {
            removed = root.children![1];
            return dispatchRemove(root, 1);
          },
          splice: true,
        },
        {
          apply: () =>
            dispatchSetValue(
              removed!.children![0],
              'occupied',
              WriteOption.Overwrite,
            ),
          splice: false,
        },
        { apply: (root) => dispatchRemove(root, 1), splice: false },
        {
          apply: () => {
            const written = dispatchSetValue(
              removed!.children![0],
              'late',
              WriteOption.Overwrite,
            );
            return written;
          },
          splice: false,
        },
        insert(0, { name: 'z' }, false),
      ],
    );
  });

  it('alternates splices with push, a leaf edit and a reset', () => {
    compareArraySplice(
      OBJECTS,
      [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
      [
        insert(1, { name: 'x' }),
        {
          apply: (root) =>
            dispatchSetValue(
              root.children![2].children![0],
              'edited',
              WriteOption.Overwrite,
            ),
          splice: false,
        },
        remove(0),
        { apply: (root) => dispatchPush(root, { name: 'p' }), splice: false },
        { apply: (root) => dispatchResetSubtree(root), splice: false },
        insert(0, { name: 'z' }),
      ],
    );
  });
});

describe('a static form skips recomputing renamed tail descendants and loses nothing', () => {
  /** Twelve nested object items whose renamed tails carry descendants. */
  const twelve = Array.from({ length: 12 }, (_, index) => ({
    name: 'n' + index,
    nested: [index],
    inner: { deep: 'd' + index },
  }));

  /**
   * Wrap a verb so each run records the paths it calculated.
   * @param runs - Receives one path list per run: the candidate first, then the declined oracle
   * @param verb - Public verb applied to the root
   * @returns A splice step running the verb under the calculation spy
   */
  const recording = (
    runs: string[][],
    verb: (root: DispatchTestNode) => unknown,
  ): SpliceStep => ({
    apply: (root) => {
      const spy = vi.spyOn(output, 'updateOutput');
      try {
        return verb(root);
      } finally {
        runs.push(spy.mock.calls.map(([node]) => node.path));
        spy.mockRestore();
      }
    },
    splice: true,
  });

  it.each<[string, number]>([
    ['0', 0],
    ['1', 1],
    ['N/2', 6],
    ['N-2', 10],
  ])(
    'remove(%s) and insert at the same position calculate no renamed tail item where the general path does',
    (_, index) => {
      // Shipping-path compute counts exclude the independent verification replay.
      const removals: string[][] = [];
      compareArraySplice(OBJECTS, twelve, [
        recording(removals, (root) => dispatchRemove(root, index)),
      ]);
      expect(removals[0]).toEqual(['']);
      expect(removals[1]).toContain('/' + index);

      const insertions: string[][] = [];
      compareArraySplice(OBJECTS, twelve, [
        recording(insertions, (root) =>
          dispatchInsert(root, index, { name: 'new' }),
        ),
      ]);
      const tail = (path: string) =>
        path !== '' &&
        path !== '/' + index &&
        !path.startsWith('/' + index + '/');
      expect(insertions[0].filter(tail)).toEqual([]);
      expect(insertions[1].filter(tail)).toContain('/' + (index + 1));
    },
  );
});

describe('NODE-051 identity on the splice path', () => {
  it('keeps prefix nodes and keys, moves tail nodes with their keys and gives the inserted item a new key', () => {
    const run = runArrayWrite(NUMBERS, [10, 11, 12, 13], (root) =>
      dispatchInsert(root, 1, 99),
    );
    const children = run.root.children!;
    expect(children[0]).toBe(run.before[0]);
    expect(children[0].itemKey).toBe(run.keys[0]);
    expect(run.before).not.toContain(children[1]);
    expect(run.keys).not.toContain(children[1].itemKey);
    for (let index = 1; index < run.before.length; index++) {
      expect(children[index + 1]).toBe(run.before[index]);
      expect(children[index + 1].itemKey).toBe(run.keys[index]);
      expect(children[index + 1].name).toBe(String(index + 1));
      expect(children[index + 1].path).toBe('/' + (index + 1));
      expect(children[index + 1].parent).toBe(run.root);
    }

    const removed = runArrayWrite(NUMBERS, [10, 11, 12, 13], (root) =>
      dispatchRemove(root, 1),
    );
    const rest = removed.root.children!;
    expect(removed.result).toBe(11);
    expect(rest[0]).toBe(removed.before[0]);
    expect(removed.before[1].detached).toBe(true);
    for (let index = 2; index < removed.before.length; index++) {
      expect(rest[index - 1]).toBe(removed.before[index]);
      expect(rest[index - 1].itemKey).toBe(removed.keys[index]);
      expect(rest[index - 1].path).toBe('/' + (index - 1));
    }
  });
});

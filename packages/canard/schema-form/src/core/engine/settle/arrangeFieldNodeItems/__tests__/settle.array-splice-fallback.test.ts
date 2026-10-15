import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchBatch,
  dispatchInsert,
  dispatchMount,
  dispatchPop,
  dispatchRemove,
  dispatchSetValue,
  dispatchVisitSubtree,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';
import * as output from '../../utils/output/updateOutput';
import { getSettlementScratch } from '../../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../../utils/settlement/createSettlementContext';
import { applyArraySplice } from '../utils/arraySlots/applyArraySplice';
import * as appendAdmission from '../utils/arraySlots/prepareArrayAppend';
import * as popAdmission from '../utils/arraySlots/prepareArrayPop';
import { prepareArraySplice } from '../utils/arraySlots/prepareArraySplice';
import { compareArraySplice } from './fixtures/compareArraySplice';
import type { SpliceStep } from './fixtures/compareArraySplice';

afterEach(() => vi.restoreAllMocks());

/** Object items whose third field carries the given controls. */
const itemsWith = (controls: Record<string, unknown>): BlueprintSchema => ({
  type: 'array',
  items: {
    type: 'object',
    properties: {
      flag: { type: 'boolean' },
      key: { type: 'number' },
      field: { type: 'number', controls },
    },
  },
});

/** Remove at a position on the general path. */
const remove = (index: number): SpliceStep => ({
  apply: (root) => dispatchRemove(root, index),
  splice: false,
});

/** Insert a value at a position on the general path. */
const insert = (index: number, value: unknown): SpliceStep => ({
  apply: (root) => dispatchInsert(root, index, value),
  splice: false,
});

/** Mount an array and return its root. */
const mounted = (schema: BlueprintSchema, input: unknown): DispatchTestNode => {
  const { root } = createDispatchTree(schema);
  dispatchMount(root, input, WriteOption.Overwrite, { deferValidation: true });
  return root;
};

// filid:contract settle-array-splice-fallback
describe('splice admission declines and the general path settles', () => {
  it.each<[string, BlueprintSchema, unknown, unknown]>([
    [
      'gate',
      itemsWith({ active: '../flag' }),
      [{ flag: true, field: 1 }, { flag: true }, { flag: false, field: 3 }],
      { flag: true, field: 9 },
    ],
    [
      'derive',
      itemsWith({ derived: '../key + 1' }),
      [{ key: 1 }, { key: 2 }, { key: 3 }],
      { key: 9 },
    ],
    [
      'watch',
      itemsWith({ watch: ['../key'] }),
      [{ key: 1 }, { key: 2 }, { key: 3 }],
      { key: 9 },
    ],
    [
      'expression',
      itemsWith({ readOnly: '../flag' }),
      [{ flag: true }, {}, { flag: false }],
      { flag: true },
    ],
    [
      'state',
      itemsWith({ disabled: true }),
      [{ key: 1 }, { key: 2 }, { key: 3 }],
      { key: 9 },
    ],
    [
      'injectTo',
      itemsWith({ injectTo: (value: unknown) => ({ '../key': value }) }),
      [{ field: 1 }, { field: 2 }, { field: 3 }],
      { field: 9 },
    ],
    [
      'virtual',
      {
        type: 'array',
        items: {
          type: 'object',
          properties: { from: { type: 'string' }, to: { type: 'string' } },
          options: { virtual: { span: { fields: ['from', 'to'] } } },
        },
      },
      [{ from: 'a' }, { to: 'b' }, { from: 'c', to: 'd' }],
      { from: 'z' },
    ],
    [
      'omitTrailing',
      {
        type: 'array',
        items: { type: 'number' },
        options: { omitTrailing: true },
      },
      [1, 2, null],
      4,
    ],
    [
      'tuple position',
      {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        items: { type: 'boolean' },
      },
      ['a', 1, true, false],
      true,
    ],
    [
      'untemplated position and extras',
      { type: 'array', prefixItems: [{ type: 'string' }], items: false },
      ['a', 'x', 'y'],
      'z',
    ],
    [
      'terminal array',
      { type: 'array', items: { type: 'number' }, options: { terminal: true } },
      [1, 2, 3],
      4,
    ],
  ])('%s', (_, schema, input, value) => {
    compareArraySplice(schema, input, [
      remove(0),
      insert(1, value),
      remove(1),
      insert(0, value),
    ]);
  });

  it('a batch and a visit walk', () => {
    compareArraySplice(
      { type: 'array', items: { type: 'number' } },
      [1, 2, 3, 4],
      [
        {
          apply: (root) => dispatchBatch(root, () => dispatchRemove(root, 0)),
          splice: false,
        },
        {
          apply: (root) =>
            dispatchVisitSubtree(root, (node) => {
              if (node === root) dispatchInsert(root, 1, 9);
            }),
          splice: false,
        },
        { apply: (root) => dispatchRemove(root, 1), splice: true },
      ],
    );
  });

  it('a detached array and a tree holding its latent write', () => {
    let removed: DispatchTestNode | undefined;
    compareArraySplice(
      {
        type: 'array',
        items: { type: 'array', items: { type: 'number' } },
      },
      [[1, 2], [3, 4, 5], [6]],
      [
        {
          apply: (root) => {
            removed = root.children![1];
            return dispatchRemove(root, 1);
          },
          splice: true,
        },
        { apply: () => dispatchRemove(removed!, 0), splice: false },
        { apply: () => dispatchInsert(removed!, 0, 7), splice: false },
        { apply: (root) => dispatchPop(root), splice: false },
        {
          apply: () => {
            const written = dispatchSetValue(
              removed!,
              [8, 9],
              WriteOption.Overwrite,
            );
            return written;
          },
          splice: false,
        },
        {
          apply: (root) => {
            expect(root.runtime.latentRaw.size).toBeGreaterThan(0);
            return dispatchInsert(root, 0, [0]);
          },
          splice: false,
        },
      ],
    );
  });

  it('a retained misfit and a wrong-kind host raw', () => {
    compareArraySplice(
      { type: 'array', items: { type: 'number' } },
      [1, 2, 3],
      [
        {
          apply: (root) =>
            dispatchSetValue(root.children![0], 'text', WriteOption.Overwrite),
          splice: false,
        },
        remove(1),
        {
          apply: (root) => dispatchSetValue(root, null, WriteOption.Overwrite),
          splice: false,
        },
        remove(0),
        insert(0, 1),
      ],
    );
  });

  it('keeps the last position on the pop and append paths and the out-of-range positions as no-ops', () => {
    const pop = vi.spyOn(popAdmission, 'prepareArrayPop');
    const append = vi.spyOn(appendAdmission, 'prepareArrayAppend');
    compareArraySplice(
      { type: 'array', items: { type: 'number' } },
      [1, 2, 3],
      [
        remove(2),
        insert(2, 4),
        remove(3),
        remove(-1),
        remove(1.5),
        insert(4, 5),
        insert(-1, 5),
        insert(0.5, 5),
        { apply: (root) => dispatchRemove(root, 0), splice: true },
      ],
    );
    expect(pop.mock.results.some((call) => call.value !== undefined)).toBe(
      true,
    );
    expect(append.mock.results.some((call) => call.value !== undefined)).toBe(
      true,
    );
  });
});

describe('positional readers outside the static admission recompute the shifted tail', () => {
  it.each<[string, BlueprintSchema, unknown[]]>([
    [
      'a gate reading a position',
      {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: { type: 'number' },
            note: { type: 'string', controls: { active: '../../0/key > 0' } },
          },
        },
      },
      [
        { key: 1, note: 'a' },
        { key: 0, note: 'b' },
        { key: 2, note: 'c' },
      ],
    ],
    [
      'an expression',
      itemsWith({ readOnly: '../flag' }),
      [{ flag: true, field: 1 }, { field: 2 }, { flag: false, field: 3 }],
    ],
    [
      'a derive',
      itemsWith({ derived: '../key + 1' }),
      [{ key: 1 }, { key: 2 }, { key: 3 }],
    ],
    [
      'a watch',
      itemsWith({ watch: ['../key'] }),
      [{ key: 1 }, { key: 2 }, { key: 3 }],
    ],
  ])('%s', (_, schema, input) => {
    const root = mounted(schema, input);
    const computed = vi.spyOn(output, 'updateOutput');
    dispatchRemove(root, 0);
    const paths = computed.mock.calls.map(([node]) => node.path);
    expect(paths).toContain('/1');
    computed.mockClear();
    dispatchInsert(root, 0, input[0]);
    expect(computed.mock.calls.map(([node]) => node.path)).toContain('/2');
  });
});

describe('the splice admission reads the shared static admission and the tail', () => {
  it('admits middle positions only and checks every tail position against structure and children', () => {
    const root = mounted(
      { type: 'array', items: { type: 'number' } },
      [1, 2, 3, 4],
    );
    expect(prepareArraySplice(root, { kind: 'remove', index: 0 })?.index).toBe(
      0,
    );
    expect(prepareArraySplice(root, { kind: 'remove', index: 3 })).toBe(
      undefined,
    );
    expect(
      prepareArraySplice(root, { kind: 'insert', index: 3, value: 0 })?.entry,
    ).toBeDefined();
    expect(
      prepareArraySplice(root, { kind: 'insert', index: 4, value: 0 }),
    ).toBe(undefined);
    expect(prepareArraySplice(root, { kind: 'pop' })).toBe(undefined);
    const structure = root.structure!;
    root.structure = { ...structure, '3': structure['2'] };
    expect(prepareArraySplice(root, { kind: 'remove', index: 1 })).toBe(
      undefined,
    );
    root.structure = { ...structure, '0': structure['1'] };
    expect(prepareArraySplice(root, { kind: 'remove', index: 1 })?.count).toBe(
      4,
    );
    root.structure = structure;
  });

  it('the application alone publishes the cut prefix, the shifted tail and a dense snapshot before selection runs', () => {
    const splice = (operation: Parameters<typeof prepareArraySplice>[1]) => {
      const root = mounted(
        { type: 'array', items: { type: 'number' } },
        [1, 2, 3, 4, 5],
      );
      const before = [...root.children!];
      const proof = prepareArraySplice(root, operation)!;
      const scratch = getSettlementScratch(root.runtime);
      try {
        const context = createSettlementContext(
          root,
          'callerReplace',
          WriteOption.Overwrite,
          scratch,
        );
        const removed = applyArraySplice(root, proof, context);
        return {
          removed,
          before,
          keys: Object.keys(root.structure!),
          structure: Object.values(root.structure!),
          children: root.children,
          count: root.itemCount,
          snapshot: root.runtime.loadSnapshot,
        };
      } finally {
        releaseSettlementScratch(scratch);
      }
    };
    const removal = splice({ kind: 'remove', index: 1 });
    const kept = [0, 2, 3, 4].map((position) => removal.before[position]);
    expect(removal.removed).toBe(2);
    expect(removal.keys).toEqual(['0', '1', '2', '3']);
    expect(removal.structure).toEqual(kept);
    expect(removal.children).toEqual(kept);
    expect(removal.count).toBe(4);
    expect(removal.snapshot).toEqual([1, 3, 4, 5]);

    const insertion = splice({ kind: 'insert', index: 2, value: 9 });
    expect(insertion.keys).toEqual(['0', '1', '2', '3', '4', '5']);
    expect(insertion.children).toEqual(insertion.structure);
    expect(
      insertion.children!.filter((child, position) =>
        position === 2
          ? false
          : child !== insertion.before[position < 2 ? position : position - 1],
      ),
    ).toEqual([]);
    expect(insertion.before).not.toContain(insertion.children![2]);
    expect(insertion.snapshot).toEqual([1, 2, 9, 3, 4, 5]);
  });

  it('a tail that fails the check declines before application and the same call commits once on the general path', () => {
    const { candidate } = compareArraySplice(
      { type: 'array', items: { type: 'number' } },
      [1, 2, 3, 4],
      [
        {
          apply: (root) => {
            const children = [...root.children!];
            [children[2], children[3]] = [children[3], children[2]];
            root.children = children;
            const commit = root.runtime.commitNumber ?? 0;
            const removed = dispatchRemove(root, 1);
            expect(root.runtime.commitNumber).toBe(commit + 1);
            return removed;
          },
          splice: false,
        },
        { apply: (root) => dispatchRemove(root, 0), splice: true },
      ],
    );
    expect(candidate.emit).toEqual([3, 4]);
  });
});

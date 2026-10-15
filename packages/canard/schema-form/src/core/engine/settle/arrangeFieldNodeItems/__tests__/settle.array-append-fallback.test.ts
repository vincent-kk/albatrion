import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchBatch,
  dispatchPop,
  dispatchPush,
  dispatchSetValue,
  dispatchVisitSubtree,
} from '@/schema-form/core/engine/write';

import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';
import * as tail from '../utils/arraySlots/canApplyArrayTail';
import { compareArrayAppend } from './fixtures/compareArrayAppend';

afterEach(() => vi.restoreAllMocks());

/** Object items whose second field carries the given controls. */
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

// filid:contract settle-array-append-fallback
describe('append admission declines and the general path settles', () => {
  it.each<[string, BlueprintSchema, unknown, boolean]>([
    [
      'gate',
      itemsWith({ active: '../flag' }),
      [{ flag: true, field: 1 }],
      true,
    ],
    ['derive', itemsWith({ derived: '../key + 1' }), [{ key: 1 }], true],
    ['watch', itemsWith({ watch: ['../key'] }), [{ key: 1 }], true],
    ['expression', itemsWith({ readOnly: '../flag' }), [{ flag: true }], true],
    [
      'omitTrailing',
      {
        type: 'array',
        items: { type: 'number' },
        options: { omitTrailing: true },
      },
      [1, null],
      true,
    ],
    [
      'tuple position',
      {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        items: { type: 'boolean' },
      },
      [],
      true,
    ],
    [
      'untemplated position',
      { type: 'array', prefixItems: [{ type: 'string' }] },
      ['a'],
      true,
    ],
    [
      'terminal array',
      { type: 'array', items: { type: 'number' }, options: { terminal: true } },
      [1],
      false,
    ],
  ])('%s', (_, schema, input, slotted) => {
    const general = vi.spyOn(tail, 'canApplyArrayTail');
    compareArrayAppend(schema, input, [
      { apply: (root) => dispatchPush(root, 2), append: false },
      { apply: (root) => dispatchPush(root), append: false },
    ]);
    expect(general.mock.calls.length > 0).toBe(slotted);
  });

  it('batch and visit walks keep marking the push', () => {
    compareArrayAppend(
      { type: 'array', items: { type: 'number' } },
      [1],
      [
        {
          apply: (root) => dispatchBatch(root, () => dispatchPush(root, 2)),
          append: false,
        },
        {
          apply: (root) =>
            dispatchVisitSubtree(root, (node) => {
              if (node === root) dispatchPush(root, 3);
            }),
          append: false,
        },
        { apply: (root) => dispatchPush(root, 4), append: true },
      ],
    );
  });

  it('a detached array and a tree holding its latent write', () => {
    let popped: DispatchTestNode | undefined;
    compareArrayAppend(
      {
        type: 'array',
        items: { type: 'array', items: { type: 'number' } },
      },
      [[1], [2]],
      [
        {
          apply: (root) => {
            popped = root.children![1];
            return dispatchPop(root);
          },
          append: false,
        },
        { apply: () => dispatchPush(popped!, 5), append: false },
        {
          apply: (root) => {
            expect(root.runtime.latentRaw.size).toBeGreaterThan(0);
            expect(root.runtime.misfitPaths.size).toBe(0);
            return dispatchPush(root, [6]);
          },
          append: false,
        },
      ],
    );
  });

  it('a non-root empty array whose emission is omitted, until it holds an item', () => {
    compareArrayAppend(
      {
        type: 'object',
        properties: { rows: { type: 'array', items: { type: 'number' } } },
      },
      { rows: [] },
      [
        {
          apply: (root) => dispatchPush(root.structure!.rows, 1),
          append: false,
        },
        {
          apply: (root) => dispatchPush(root.structure!.rows, 2),
          append: true,
        },
      ],
      (root) => root.structure!.rows,
    );
  });

  it('a retained misfit and a wrong-kind host raw', () => {
    compareArrayAppend(
      { type: 'array', items: { type: 'number' } },
      [1],
      [
        {
          apply: (root) =>
            dispatchSetValue(root.children![0], 'text', WriteOption.Overwrite),
          append: false,
        },
        { apply: (root) => dispatchPush(root, 2), append: false },
        {
          apply: (root) => dispatchSetValue(root, null, WriteOption.Overwrite),
          append: false,
        },
        { apply: (root) => dispatchPush(root, 3), append: false },
      ],
    );
  });
});

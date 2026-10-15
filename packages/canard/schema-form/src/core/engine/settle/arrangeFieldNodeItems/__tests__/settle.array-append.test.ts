import { afterEach, describe, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchPush,
  dispatchRemove,
  dispatchResetSubtree,
  dispatchSetValue,
} from '@/schema-form/core/engine/write';

import { compareArrayAppend } from './fixtures/compareArrayAppend';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-array-append
describe('static push through the append path matches the general path', () => {
  it('appends numbers, undefined and an absent value, then a leaf edit, -0 and NaN', () => {
    const { candidate } = compareArrayAppend(
      { type: 'array', items: { type: 'number' } },
      [1, 2, 3],
      [
        { apply: (root) => dispatchPush(root, 4), append: true },
        { apply: (root) => dispatchPush(root, undefined), append: true },
        { apply: (root) => dispatchPush(root), append: true },
        {
          apply: (root) =>
            dispatchSetValue(root.children![1], 20, WriteOption.Overwrite),
          append: false,
        },
        { apply: (root) => dispatchPush(root, -0), append: true },
        { apply: (root) => dispatchPush(root, Number.NaN), append: true },
      ],
    );
    expect(candidate.children).toHaveLength(8);
  });

  it('appends into an empty root array', () => {
    const { candidate } = compareArrayAppend(
      { type: 'array', items: { type: 'string' } },
      [],
      [
        { apply: (root) => dispatchPush(root, 'a'), append: true },
        { apply: (root) => dispatchPush(root, 'b'), append: true },
      ],
    );
    expect(candidate.local).toEqual(['a', 'b']);
  });

  it('creates nested object items eagerly and fills only their missing literal defaults', () => {
    const { candidate } = compareArrayAppend(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            fill: { type: 'number', default: 7 },
            nested: {
              type: 'array',
              items: {
                type: 'object',
                properties: { leaf: { type: 'string', default: 'x' } },
              },
            },
          },
        },
      },
      [{ name: 'old', nested: [{}, {}] }],
      [
        {
          apply: (root) =>
            dispatchPush(root, { name: 'new', nested: [{ leaf: 'y' }] }),
          append: true,
        },
        { apply: (root) => dispatchPush(root), append: true },
        { apply: (root) => dispatchPush(root, {}), append: true },
      ],
    );
    expect(candidate.children![1].structure!.nested.children).toHaveLength(1);
  });

  it('appends to a non-root array without changing its sibling', () => {
    const { candidate } = compareArrayAppend(
      {
        type: 'object',
        properties: {
          rows: { type: 'array', items: { type: 'number' } },
          sibling: { type: 'string' },
        },
      },
      { rows: [1, 2], sibling: 'same' },
      [
        {
          apply: (root) => dispatchPush(root.structure!.rows, 3),
          append: true,
        },
        {
          apply: (root) => dispatchPush(root.structure!.rows, 4),
          append: true,
        },
      ],
      (root) => root.structure!.rows,
    );
    expect(candidate.emit).toEqual({ rows: [1, 2, 3, 4], sibling: 'same' });
  });

  it('keeps load-snapshot defaults and reset sources across pushes, a remove and a reset', () => {
    const { candidate } = compareArrayAppend(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: { v: { type: 'number', default: 1 } },
        },
      },
      [{ v: 5 }, {}],
      [
        { apply: (root) => dispatchPush(root, { v: 9 }), append: true },
        { apply: (root) => dispatchRemove(root, 0), append: false },
        { apply: (root) => dispatchPush(root), append: true },
        { apply: (root) => dispatchResetSubtree(root), append: false },
        { apply: (root) => dispatchPush(root, { v: 3 }), append: true },
      ],
    );
    expect(candidate.children).toHaveLength(4);
  });

  it.each([1000, 8000])(
    'repeats pushes on a %i-item array with the same history',
    (count) => {
      const { candidate } = compareArrayAppend(
        { type: 'array', items: { type: 'number' } },
        Array.from({ length: count }, (_, index) => index),
        [
          { apply: (root) => dispatchPush(root, count), append: true },
          { apply: (root) => dispatchPush(root, count + 1), append: true },
        ],
      );
      expect(candidate.local).toHaveLength(count + 2);
    },
  );
});

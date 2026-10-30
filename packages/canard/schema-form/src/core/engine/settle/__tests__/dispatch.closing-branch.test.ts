import { describe, expect, it } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import {
  type DispatchTestNode,
  createDispatchTree,
} from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';

import { dispatchBatch } from '../../write';
import { dispatchMount } from '../../write';
import { dispatchPush } from '../../write';
import { dispatchSetValue } from '../../write';
import { readFieldNodeInactiveValues } from '../utils/detached/readFieldNodeInactiveValues';
import { getDispatchNode as getDispatchChild } from './fixtures/getDispatchNode';
import { hasRetainedSlotOwnSource } from './fixtures/readRetainedSlotRaw';

/** A kind discriminator with a tag list in one branch (07c composite.finding-batch-push-into-closing-branch). */
const listSchema = {
  type: 'object',
  controls: { discriminator: 'kind' },
  required: ['kind'],
  oneOf: [
    {
      properties: {
        kind: { const: 'list' },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
    { properties: { kind: { const: 'single' }, tag: { type: 'string' } } },
  ],
} as const;

const mountList = () => {
  const tree = createDispatchTree(listSchema, undefined, createTestValidator());
  dispatchMount(tree.root, { kind: 'list', tags: ['a', 'b', 'c'] });
  return tree;
};

/** Close the list branch through `write`, then reopen it and read the tags. */
const closeAndReopen = (
  write: (root: DispatchTestNode) => void,
): {
  closedRaw: unknown;
  closedSize: number;
  reopened: unknown;
  reopenedSize: number;
  commits: number;
} => {
  const { root, runtime } = mountList();
  const before = runtime.commitNumber ?? 0;
  write(root);
  const commits = (runtime.commitNumber ?? 0) - before;
  const closed = readFieldNodeInactiveValues(root);
  const closedRaw = closed.find((entry) => entry.path === '/tags')?.value;
  const closedSize = closed.length;
  dispatchSetValue(getDispatchChild(root, 'kind'), 'list');
  return {
    closedRaw,
    closedSize,
    reopened: getDispatchChild(root, 'tags').emit,
    reopenedSize: readFieldNodeInactiveValues(root).length,
    commits,
  };
};

describe('array growth in the write that closes its branch (211C-01 A)', () => {
  it('keeps the new item on a whole write that closes the branch', () => {
    const result = closeAndReopen((root) =>
      dispatchSetValue(root, { kind: 'single', tags: ['a', 'b', 'c', 'd'] }),
    );
    expect(result.commits).toBe(1);
    expect(result.closedSize).toBe(1);
    expect(result.closedRaw).toEqual(['a', 'b', 'c', 'd']);
    expect(Object.isFrozen(result.closedRaw)).toBe(true);
    expect(result.reopened).toEqual(['a', 'b', 'c', 'd']);
    expect(result.reopenedSize).toBe(0);
  });

  it('keeps a pushed item when the same batch closes the branch', () => {
    const result = closeAndReopen((root) =>
      dispatchBatch(root, () => {
        dispatchPush(getDispatchChild(root, 'tags'), 'd');
        dispatchSetValue(getDispatchChild(root, 'kind'), 'single');
      }),
    );
    expect(result.commits).toBe(1);
    expect(result.closedRaw).toEqual(['a', 'b', 'c', 'd']);
    expect(result.reopened).toEqual(['a', 'b', 'c', 'd']);
  });

  it('keeps a pushed item when the batch closes the branch before the push', () => {
    const result = closeAndReopen((root) =>
      dispatchBatch(root, () => {
        dispatchSetValue(getDispatchChild(root, 'kind'), 'single');
        dispatchPush(getDispatchChild(root, 'tags'), 'd');
      }),
    );
    expect(result.commits).toBe(1);
    expect(result.reopened).toEqual(['a', 'b', 'c', 'd']);
  });

  it('interprets a new slot like an entering item', () => {
    const result = closeAndReopen((root) =>
      dispatchSetValue(root, { kind: 'single', tags: ['a', 'b', 'c', 7] }),
    );
    expect(result.reopened).toEqual(['a', 'b', 'c', '7']);
  });

  it('restores a pushed item when the push settled before the switch (control)', () => {
    const result = closeAndReopen((root) => {
      dispatchPush(getDispatchChild(root, 'tags'), 'd');
      dispatchSetValue(getDispatchChild(root, 'kind'), 'single');
    });
    expect(result.commits).toBe(2);
    expect(result.reopened).toEqual(['a', 'b', 'c', 'd']);
  });

  it('restores an existing item rewritten in the closing batch (control)', () => {
    const result = closeAndReopen((root) =>
      dispatchBatch(root, () => {
        dispatchSetValue(
          getDispatchChild(getDispatchChild(root, 'tags'), '0'),
          'z',
        );
        dispatchSetValue(getDispatchChild(root, 'kind'), 'single');
      }),
    );
    expect(result.closedRaw).toEqual(['z', 'b', 'c']);
    expect(result.reopened).toEqual(['z', 'b', 'c']);
  });
});

describe('nested array growth in the write that closes its branch (211C-01 A)', () => {
  const nestedSchema = {
    type: 'object',
    controls: { discriminator: 'kind' },
    required: ['kind'],
    oneOf: [
      {
        properties: {
          kind: { const: 'list' },
          group: {
            type: 'object',
            properties: { tags: { type: 'array', items: { type: 'string' } } },
          },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sub: { type: 'array', items: { type: 'string' } },
              },
            },
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: { n: { type: 'string' } },
            },
          },
        },
      },
      { properties: { kind: { const: 'single' } } },
    ],
  } as const;

  it('keeps growth under an object, inside a row and of object items', () => {
    const { root } = createDispatchTree(
      nestedSchema,
      undefined,
      createTestValidator(),
    );
    dispatchMount(root, {
      kind: 'list',
      group: { tags: ['a'] },
      rows: [{ sub: ['x'] }],
      items: [{ n: '1' }],
    });
    dispatchSetValue(root, {
      kind: 'single',
      group: { tags: ['a', 'b'] },
      rows: [{ sub: ['x', 'y'] }],
      items: [{ n: '1' }, { n: '2' }],
    });
    dispatchSetValue(getDispatchChild(root, 'kind'), 'list');
    expect(root.emit).toEqual({
      kind: 'list',
      group: { tags: ['a', 'b'] },
      rows: [{ sub: ['x', 'y'] }],
      items: [{ n: '1' }, { n: '2' }],
    });
  });
});

describe('object child first written in the write that closes its ancestor (211C-01 A′)', () => {
  const infoSchema = {
    type: 'object',
    controls: { discriminator: 'kind' },
    required: ['kind'],
    oneOf: [
      {
        properties: {
          kind: { const: 'list' },
          info: {
            type: 'object',
            properties: { a: { type: 'string' }, mode: { type: 'string' } },
            if: { properties: { mode: { const: 'b' } }, required: ['mode'] },
            then: {
              properties: {
                b: { type: 'string' },
                obj: { type: 'object', properties: { c: { type: 'string' } } },
                arr: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
      { properties: { kind: { const: 'single' } } },
    ],
  } as const;
  const written = {
    a: '1',
    mode: 'b',
    b: 'B',
    obj: { c: 'C' },
    arr: ['x'],
  };
  const mountInfo = () => {
    const tree = createDispatchTree(
      infoSchema,
      undefined,
      createTestValidator(),
    );
    dispatchMount(tree.root, { kind: 'list', info: { a: '0', mode: 'a' } });
    return tree;
  };
  const reopen = (root: DispatchTestNode) => {
    dispatchSetValue(getDispatchChild(root, 'kind'), 'list');
    const info = getDispatchChild(root, 'info');
    return {
      emit: info.emit,
      b: info.structure?.b !== undefined,
      c: getDispatchChild(info, 'obj').structure?.c !== undefined,
      x: getDispatchChild(info, 'arr').structure?.['0'] !== undefined,
    };
  };
  const restored = { emit: written, b: true, c: true, x: true };

  it('keeps string, object and array children on a whole write that closes the ancestor', () => {
    const { root } = mountInfo();
    dispatchSetValue(root, { kind: 'single', info: written });
    expect(hasRetainedSlotOwnSource(root, '/info/b', 'string')).toBe(true);
    expect(reopen(root)).toEqual(restored);
  });

  it('keeps the children when a batch writes them and closes the ancestor', () => {
    const { root } = mountInfo();
    dispatchBatch(root, () => {
      dispatchSetValue(getDispatchChild(root, 'info'), written);
      dispatchSetValue(getDispatchChild(root, 'kind'), 'single');
    });
    expect(reopen(root)).toEqual(restored);
  });

  it('restores the children when the info write settled before the switch (control)', () => {
    const { root } = mountInfo();
    dispatchSetValue(getDispatchChild(root, 'info'), written);
    dispatchSetValue(getDispatchChild(root, 'kind'), 'single');
    expect(reopen(root)).toEqual(restored);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../__tests__/fixtures/createDispatchTree';
import { WriteOption } from '../../types/value';
import {
  dispatchBatch,
  dispatchMount,
  dispatchSetValue,
  dispatchVisitSubtree,
} from '../../write';
import { DirtyPathSet } from '../utils/scratch/DirtyPathSet';
import { writeFieldNode } from '../utils/write/writeFieldNode';

afterEach(() => vi.restoreAllMocks());

/** Mounted static form with two independent write targets for batch and visit. */
const createTree = () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      h: {
        type: 'object',
        properties: { v: { type: 'number' }, w: { type: 'number' } },
      },
      s: { type: 'number' },
    },
  });
  dispatchMount(root, { h: { v: 1, w: 2 }, s: 3 });
  return root;
};

// filid:contract settle-write-epoch-fallback
describe('whole-write epoch entry guards', () => {
  it.each<[string, (root: DispatchTestNode) => void]>([
    [
      'batch',
      (root) =>
        dispatchBatch(root, () => {
          dispatchSetValue(root.structure!.h, { v: 4, w: 5 });
          dispatchSetValue(root.structure!.s, 6);
        }),
    ],
    [
      'visit',
      (root) =>
        dispatchVisitSubtree(root, (node) => {
          if (node !== root) return;
          dispatchSetValue(root.structure!.h, { v: 4, w: 5 });
          dispatchSetValue(root.structure!.s, 6);
        }),
    ],
    ['load', (root) => dispatchMount(root, { h: { v: 4, w: 5 }, s: 6 })],
    [
      'automatic',
      (root) =>
        writeFieldNode(
          root,
          { h: { v: 4, w: 5 }, s: 6 },
          'automatic',
          WriteOption.Overwrite,
        ),
    ],
  ])('keeps path bookkeeping for %s', (_, write) => {
    const root = createTree();
    const add = vi.spyOn(DirtyPathSet.prototype, 'add');
    write(root);
    expect(add.mock.calls.length).toBeGreaterThan(0);
    expect(root.emit).toEqual({ h: { v: 4, w: 5 }, s: 6 });
  });

  it('keeps path bookkeeping while correcting an existing misfit', () => {
    const root = createTree();
    dispatchSetValue(root.structure!.h.structure!.v, 'wrong');
    expect(root.runtime.misfitPaths.size).toBeGreaterThan(0);
    const add = vi.spyOn(DirtyPathSet.prototype, 'add');
    dispatchSetValue(root, { h: { v: 4, w: 5 }, s: 6 });
    expect(add.mock.calls.length).toBeGreaterThan(0);
    expect(root.emit).toEqual({ h: { v: 4, w: 5 }, s: 6 });
  });

  it('admits a static array replacement that retains the item count', () => {
    const { root } = createDispatchTree({
      type: 'array',
      items: { type: 'number' },
    });
    dispatchMount(root, [1, 2, 3]);
    const add = vi.spyOn(DirtyPathSet.prototype, 'add');
    dispatchSetValue(root, [4, 5, 6]);
    expect(add.mock.calls.length).toBe(0);
    expect(root.emit).toEqual([4, 5, 6]);
  });
});

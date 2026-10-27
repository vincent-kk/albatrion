import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { engineModes } from '../../utils/cache/engineModes';
import { dispatchMount, dispatchSetValue } from '../../write';
import { DirtyPathSet } from '../utils/scratch/DirtyPathSet';

/** Canonical depth-six, fanout-four bulk schema, including every branch. */
const nested = (depth: number): BlueprintSchema =>
  depth
    ? {
        type: 'object',
        properties: Object.fromEntries(
          Array.from({ length: 4 }, (_, index) => [
            'n' + index,
            nested(depth - 1),
          ]),
        ),
      }
    : { type: 'string', default: 'leaf' };

/** Change every leaf so same-value skipping cannot hide per-path deletion. */
const changed = (value: unknown): unknown =>
  value && typeof value === 'object'
    ? Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, changed(child)]),
      )
    : String(value) + '-changed';

it('nested-d6-f4 bulk consumes 5461 paths with zero parent-map slice calls', () => {
  const previous = engineModes.gateSelection;
  engineModes.setMode('gateSelection', 'table');
  const { root } = createDispatchTree(nested(6));
  dispatchMount(root, undefined);
  const input = changed(root.emit);
  const original = DirtyPathSet.prototype.delete;
  const slice = String.prototype.slice;
  let insideDelete = false;
  let slices = 0;
  let deletes = 0;
  let consumes = 0;
  vi.spyOn(String.prototype, 'slice').mockImplementation(function (
    this: string,
    start,
    end,
  ) {
    if (insideDelete) slices++;
    return slice.call(this, start, end);
  });
  vi.spyOn(DirtyPathSet.prototype, 'delete').mockImplementation(function (
    this: DirtyPathSet,
    path,
  ) {
    deletes++;
    insideDelete = true;
    try {
      return original.call(this, path);
    } finally {
      insideDelete = false;
    }
  });
  if ('consume' in DirtyPathSet.prototype) {
    const consume = DirtyPathSet.prototype.consume;
    vi.spyOn(DirtyPathSet.prototype, 'consume').mockImplementation(function (
      this: DirtyPathSet,
      path,
    ) {
      consumes++;
      insideDelete = true;
      try {
        return consume.call(this, path);
      } finally {
        insideDelete = false;
      }
    });
  }
  try {
    dispatchSetValue(root, input);
    console.log(
      'DIRTY_CONSUME_COST',
      JSON.stringify({ deletes, consumes, slices, nodes: 5461 }),
    );
    expect(root.emit).toEqual(input);
    expect(slices).toBe(0);
    expect(deletes).toBe(0);
    expect(consumes).toBeLessThanOrEqual(5461);
  } finally {
    vi.restoreAllMocks();
    engineModes.setMode('gateSelection', previous);
  }
});

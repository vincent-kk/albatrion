import { afterEach, expect, it, vi } from 'vitest';

import { isArray } from '@winglet/common-utils/filter';

import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchMount,
  dispatchPop,
  dispatchRemove,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../../../../__tests__/fixtures/createDispatchTree';
import { getSettlementScratch } from '../../../../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../../../../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../../../../utils/settlement/createSettlementContext';
import * as prune from '../../../../utils/transition/prunePerishedPaths';
import * as splice from '../applyArraySplice';
import * as tail from '../applyArrayTail';

afterEach(() => vi.restoreAllMocks());

/** Mount a static array before observing its structural cleanup. */
const mount = (count: number) => {
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
  return root;
};

it('passes one removed splice root as a singleton array', () => {
  const root = mount(3);
  const applied = vi.spyOn(splice, 'applyArraySplice');
  const pruned = vi.spyOn(prune, 'prunePerishedPaths');
  dispatchRemove(root, 1);
  expect(applied).toHaveBeenCalledOnce();
  expect(pruned).toHaveBeenCalled();
  expect(pruned.mock.calls[0][1]).toEqual(['/1']);
  expect(isArray(pruned.mock.calls[0][1])).toBe(true);
  expect(root.local).toEqual([0, 2]);
});

it.each([3, 65])(
  'passes a public pop root as a singleton array at N=%i',
  (count) => {
    const root = mount(count);
    const applied = vi.spyOn(tail, 'applyArrayTail');
    const pruned = vi.spyOn(prune, 'prunePerishedPaths');
    expect(dispatchPop(root)).toBe(count - 1);
    expect(applied).toHaveBeenCalledOnce();
    expect(pruned).toHaveBeenCalled();
    expect(pruned.mock.calls[0][1]).toEqual([`/${count - 1}`]);
    expect(isArray(pruned.mock.calls[0][1])).toBe(true);
    expect(root.local).toHaveLength(count - 1);
  },
);

/** Exercise the internal multi-root boundary; public pop removes exactly one root. */
const truncateTail = (count: number) => {
  const root = mount(count);
  const pruned = vi.spyOn(prune, 'prunePerishedPaths');
  const scratch = getSettlementScratch(root.runtime);
  try {
    const context = createSettlementContext(
      root,
      'callerReplace',
      WriteOption.Overwrite,
      scratch,
    );
    tail.applyArrayTail(
      root,
      { kind: 'slots', slots: [{ from: 0 }], result: { source: 'void' } },
      context,
    );
    // Tail cleanup is followed by the rekey helper's separate prune call.
    expect(pruned).toHaveBeenCalledTimes(2);
    expect(root.itemCount).toBe(1);
    expect(root.children).toHaveLength(1);
    expect(root.children![0].path).toBe('/0');
    expect(context.perished.size).toBe(count - 1);
    return pruned.mock.calls[0][1];
  } finally {
    releaseSettlementScratch(scratch);
  }
};

it('passes 64 removed tail roots as an ordered array', () => {
  const paths = truncateTail(65);
  expect(isArray(paths)).toBe(true);
  expect(paths).toEqual(
    Array.from({ length: 64 }, (_, index) => `/${index + 1}`),
  );
});

it('retains Set membership for 65 removed tail roots', () => {
  const paths = truncateTail(66);
  expect(paths).toBeInstanceOf(Set);
  expect([...paths]).toEqual(
    Array.from({ length: 65 }, (_, index) => `/${index + 1}`),
  );
});

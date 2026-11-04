import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../../../__tests__/fixtures/createDispatchTree';
import { WriteOption } from '../../../../types/value';
import { dispatchMount } from '../../../../write';
import { getSettlementScratch } from '../../scratch/getSettlementScratch';
import { createSettlementContext } from '../../settlement/createSettlementContext';
import { dirtyChildren } from '../dirtyChildren';

describe('dirty child membership allocation', () => {
  it.each([1, 64, 65])('preserves order for %i scheduled children', (count) => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: Object.fromEntries(
        Array.from({ length: count }, (_, index) => [
          'k' + index,
          { type: 'number' },
        ]),
      ),
    });
    dispatchMount(root, {});
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(
      root,
      'callerReplace',
      WriteOption.None,
      scratch,
    );
    const scheduled = new Map<string, string>();
    for (let index = count - 1; index >= 0; index--)
      scheduled.set('k' + index, 'k' + index);
    context.dirtyChildrenByParent.set(root.path, scheduled);
    const NativeSet = globalThis.Set;
    let allocations = 0;
    vi.stubGlobal(
      'Set',
      class<T> extends NativeSet<T> {
        constructor(values?: Iterable<T> | null) {
          super(values);
          allocations++;
        }
      },
    );
    let children;
    try {
      children = dirtyChildren(root, context);
    } finally {
      vi.unstubAllGlobals();
    }
    expect(children).toEqual([...root.children!].reverse());
    expect(allocations).toBe(count > 64 ? 1 : 0);
  });

  it('deduplicates repeated child identities in first occurrence order', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: { a: { type: 'number' }, b: { type: 'number' } },
    });
    dispatchMount(root, {});
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(
      root,
      'callerReplace',
      WriteOption.None,
      scratch,
    );
    context.dirtyChildrenByParent.set(
      root.path,
      new Map([
        ['first', 'b'],
        ['second', 'a'],
        ['duplicate', 'b'],
      ]),
    );
    expect(dirtyChildren(root, context)).toEqual([
      root.structure!.b,
      root.structure!.a,
    ]);
  });
});

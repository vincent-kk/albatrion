import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTestTree } from '../../../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../../../types/value';
import { loadFieldNodeAtMount } from '../../../loadFieldNodeAtMount';
import { getSettlementScratch } from '../../scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../../scratch/releaseSettlementScratch';
import { createSettlementContext } from '../../settlement/createSettlementContext';
import { registerRecalculation } from '../registerRecalculation';

afterEach(() => vi.restoreAllMocks());

describe('B2-P3 ancestor registration', () => {
  it('walks live node parents without slicing ancestor paths', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        nested: { type: 'object', properties: { leaf: { type: 'string' } } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { nested: { leaf: 'a' } },
      WriteOption.Overwrite,
    );
    const target = root.structure!.nested.structure!.leaf;
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(
      target,
      'callerReplace',
      WriteOption.Overwrite,
      scratch,
    );
    context.dirtyPaths.add(target.path);
    context.changedRaw.add(target.path);
    context.changedNodes.add(target);
    const slice = String.prototype.slice;
    const calls: string[] = [];
    vi.spyOn(String.prototype, 'slice').mockImplementation(function (
      this: string,
      ...args
    ) {
      const caller = new Error().stack
        ?.split('\n')
        .find(
          (frame) => frame.includes('/src/') && !frame.includes('__tests__'),
        );
      if (caller?.includes('/registerRecalculation.ts'))
        calls.push(String(this));
      return Reflect.apply(slice, this, args);
    });
    try {
      registerRecalculation(context);
      expect([...context.dirtyPaths]).toEqual(
        expect.arrayContaining(['', '/nested', '/nested/leaf']),
      );
      expect(calls).toEqual([]);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });
});

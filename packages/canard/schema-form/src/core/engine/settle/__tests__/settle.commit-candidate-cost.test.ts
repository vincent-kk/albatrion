import { describe, expect, it, vi } from 'vitest';

import { runDeliveryWaves } from '@/schema-form/core/engine/write/utils/chain/runDeliveryWaves';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { markCommitDeliveries } from '../utils/commit/markCommitDeliveries';
import { getSettlementScratch } from '../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';

describe('commit candidate Set work', () => {
  it('does not insert bulk changed/state candidates into either temporary candidate Set', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
        c: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(root, { a: 'A', b: 'B', c: 'C' }, 0);
    runDeliveryWaves(root);
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(root, 'callerReplace', 0, scratch);
    for (const node of [...root.children!, root]) {
      context.changedNodes.add(node);
      context.stateDirtyNodes.add(node);
    }
    const nativeAdd = Set.prototype.add;
    let adds = 0;
    const spy = vi.spyOn(Set.prototype, 'add').mockImplementation(function <T>(
      this: Set<T>,
      value: T,
    ) {
      adds++;
      return nativeAdd.call(this, value);
    });
    try {
      markCommitDeliveries(context);
      expect(adds).toBe(1);
    } finally {
      spy.mockRestore();
      releaseSettlementScratch(scratch);
    }
  });

  it('keeps only departing and disposal membership inserts when a node detaches', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: { a: { type: 'string' } },
    });
    loadFieldNodeAtMount(root, { a: 'A' }, 0);
    runDeliveryWaves(root);
    const a = root.structure!.a;
    a.detached = true;
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(root, 'callerReplace', 0, scratch);
    context.exited.add(a);
    const nativeAdd = Set.prototype.add;
    let adds = 0;
    const spy = vi.spyOn(Set.prototype, 'add').mockImplementation(function <T>(
      this: Set<T>,
      value: T,
    ) {
      adds++;
      return nativeAdd.call(this, value);
    });
    try {
      markCommitDeliveries(context);
      expect(adds).toBe(3);
    } finally {
      spy.mockRestore();
      releaseSettlementScratch(scratch);
    }
  });
});

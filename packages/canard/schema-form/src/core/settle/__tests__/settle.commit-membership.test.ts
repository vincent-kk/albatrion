import { describe, expect, it, vi } from 'vitest';

import { markSchemaNodeEvent, SchemaNodeEventType } from '../../record';
import { loadSchemaNodeAtMount } from '../index';
import { markCommitDeliveries } from '../utils/commit/markCommitDeliveries';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { getSettlementScratch } from '../utils/write/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/write/releaseSettlementScratch';
import { createTestTree } from './fixtures/createTestTree';

describe('commit candidate membership', () => {
  it('visits global-state candidates before extra event candidates exactly once', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' }, extra: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { a: 'a', b: 'b', extra: 'x' }, 0);
    const a = root.structure!.a, b = root.structure!.b, extra = root.structure!.extra;
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(root, 'callerReplace', 0, scratch);
    context.changedNodes.add(b);
    context.changedNodes.add(root);
    context.stateDirtyNodes.add(a);
    for (const node of [extra, b, a, root])
      markSchemaNodeEvent(node, SchemaNodeEventType.RequestFocus);
    const order: string[] = [];
    try {
      markCommitDeliveries(context, node => order.push(node.path));
      expect(order).toEqual(['/b', '', '/a', '/extra']);
      for (const node of [extra, b, a, root]) {
        expect(node.pendingRevision).toBe(0);
        expect(node.revisionLedger[SchemaNodeEventType.RequestFocus]).toBe(1);
      }
    } finally { releaseSettlementScratch(scratch); }
  });

  it('allocates no nonempty Set copy while merging candidate membership', () => {
    const { root } = createTestTree({ type: 'string' });
    loadSchemaNodeAtMount(root, 'before', 0);
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(root, 'callerReplace', 0, scratch);
    context.changedNodes.add(root);
    const NativeSet = Set;
    let copies = 0;
    vi.stubGlobal('Set', new Proxy(NativeSet, {
      construct(target, args) {
        if (args[0] instanceof NativeSet && args[0].size > 0) copies++;
        return Reflect.construct(target, args);
      },
    }));
    try {
      markCommitDeliveries(context);
      expect(copies).toBe(0);
    } finally {
      vi.unstubAllGlobals();
      releaseSettlementScratch(scratch);
    }
  });
});

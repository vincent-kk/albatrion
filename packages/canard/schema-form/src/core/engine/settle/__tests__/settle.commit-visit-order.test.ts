import { describe, expect, it } from 'vitest';

import {
  FieldNodeEventType as E,
  captureFieldNodeChange,
  markFieldNodeEvent,
} from '@/schema-form/core/engine/record';
import { dispatchBatch } from '@/schema-form/core/engine/write';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { markCommitDeliveries } from '../utils/commit/markCommitDeliveries';
import { createWatchDeliveryIndex } from '../utils/commit/utils/createWatchDeliveryIndex';
import { getSettlementScratch } from '../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';

/** Build committed siblings whose pending mount wave has already been consumed. */
const fixture = () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      a: { type: 'string' },
      b: { type: 'string' },
      c: { type: 'string' },
    },
  });
  loadFieldNodeAtMount(root, { a: 'A', b: 'B', c: 'C' }, 0);
  dispatchBatch(root, () => {});
  return root;
};

describe('commit source visit characterization', () => {
  it('keeps the bulk postorder and overlapping state candidates byte-identical', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        left: {
          type: 'object',
          properties: { a: { type: 'string' }, b: { type: 'string' } },
        },
        right: {
          type: 'object',
          properties: { a: { type: 'string' }, b: { type: 'string' } },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { left: { a: 'A', b: 'B' }, right: { a: 'C', b: 'D' } },
      0,
    );
    dispatchBatch(root, () => {});
    const { left, right } = root.structure!;
    const nodes = [
      left.structure!.a,
      left.structure!.b,
      left,
      right.structure!.a,
      right.structure!.b,
      right,
      root,
    ];
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(root, 'callerReplace', 0, scratch);
    for (const node of nodes) {
      context.changedNodes.add(node);
      context.stateDirtyNodes.add(node);
    }
    const order: string[] = [];
    try {
      markCommitDeliveries(context, (node) => order.push(node.path));
      expect(JSON.stringify(order)).toBe(
        '["/left/a","/left/b","/left","/right/a","/right/b","/right",""]',
      );
    } finally {
      releaseSettlementScratch(scratch);
    }
  });

  it('preserves entered-first order and arbitrary state-key counts in a gated tree', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        a: { type: 'string' },
        b: { type: 'string' },
      },
      if: { properties: { enabled: { const: true } } },
      then: { required: ['a'] },
    });
    loadFieldNodeAtMount(root, { enabled: true, a: 'A', b: 'B' }, 0);
    dispatchBatch(root, () => {});
    const { a, b } = root.structure!;
    a.interactionState = { arbitrary: true };
    root.runtime.globalStateCounts.set('arbitrary', 1);
    root.runtime.globalState = { arbitrary: true };
    a.interactionState = captureFieldNodeChange(a, 'interactionState', {});
    b.interactionState = captureFieldNodeChange(b, 'interactionState', {
      arbitrary: true,
    });
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(root, 'callerReplace', 0, scratch);
    context.entered.add(b);
    context.changedNodes.add(a);
    context.stateDirtyNodes.add(b);
    const order: string[] = [];
    try {
      expect(context.hasGates).toBe(true);
      markCommitDeliveries(context, (node) => order.push(node.path));
      expect(order).toEqual(['/b', '/a', '']);
      expect(root.runtime.globalStateCounts.get('arbitrary')).toBe(1);
      expect(root.runtime.globalState).toEqual({ arbitrary: true });
      expect(a.pendingDelivery?.type).toBe(E.UpdateState);
      expect(b.pendingDelivery?.type).toBe(E.UpdateState);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });

  it('visits unchanged load-only siblings after changed and state candidates', () => {
    const root = fixture();
    const { a, b, c } = root.structure!;
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(root, 'load', 0, scratch);
    context.changedNodes.add(b);
    context.stateDirtyNodes.add(a);
    const order: string[] = [];
    try {
      markCommitDeliveries(context, (node) => order.push(node.path));
      expect(order).toEqual(['/b', '/a', '', '/c']);
      expect(c.pendingDelivery).toBeUndefined();
      expect(b.pendingDelivery?.type).toBe(E.RequestRefresh);
      expect(a.pendingDelivery?.type).toBe(E.RequestRefresh);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });

  it('visits a required-only child after global candidates and before the root extra', () => {
    const root = fixture();
    const { a, b } = root.structure!;
    root.schema = {
      ...root.schema,
      schema: {
        ...(typeof root.schema.schema === 'object' ? root.schema.schema : {}),
        required: ['a'],
      },
    };
    root.deliveryPreviousSchema = root.schema;
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(root, 'callerReplace', 0, scratch);
    context.changedNodes.add(root);
    context.stateDirtyNodes.add(b);
    const revision = a.revisionLedger[E.UpdateControlledProperties] ?? 0;
    const order: string[] = [];
    try {
      markCommitDeliveries(context, (node) => order.push(node.path));
      expect(order).toEqual(['', '/b', '/a']);
      expect(a.required).toBe(true);
      expect(a.revisionLedger[E.UpdateControlledProperties]).toBe(revision + 1);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });

  it('commits diagnostics on a root outside changedNodes after the changed leaf', () => {
    const root = fixture();
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(root, 'callerReplace', 0, scratch);
    context.changedNodes.add(root.structure!.b);
    root.runtime.diagnostics = { status: 'degraded', cause: 'budget' };
    const before = root.revisionLedger[E.UpdateDiagnostics] ?? 0;
    const order: string[] = [];
    try {
      markCommitDeliveries(context, (node) => order.push(node.path));
      expect(order).toEqual(['/b', '']);
      expect(root.revisionLedger[E.UpdateDiagnostics]).toBe(before + 1);
      expect(root.pendingDelivery?.type).toBe(E.UpdateDiagnostics);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });

  it('deduplicates overlapping path and context watchers after global candidates', () => {
    const root = fixture();
    const { a, b, c } = root.structure!;
    const index = createWatchDeliveryIndex();
    index.update(a, ['/b', '@']);
    index.update(c, ['/b', '/old']);
    root.runtime.deliveryWatchIndex = index;
    root.runtime.context = { next: true };
    root.runtime.deliveryAffectedPaths = new Set(['/b', '/old']);
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(root, 'callerReplace', 0, scratch);
    context.changedNodes.add(a);
    context.pathChanges.push({ node: b, previous: '/old', current: '/b' });
    c.detached = true;
    const order: string[] = [];
    try {
      markCommitDeliveries(context, (node) => order.push(node.path));
      expect(order).toEqual(['/a', '', '/b', '/c']);
      expect(index.allNodes.has(c)).toBe(false);
      expect(index.allNodes.has(a)).toBe(true);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });

  it('keeps visit order and revisions when an earlier wave listener settles a later node', () => {
    const root = fixture();
    const { a, b } = root.structure!;
    const order: string[][] = [];
    const events: unknown[] = [];
    const commit = (node: typeof a, value: string) => {
      const scratch = getSettlementScratch(root.runtime);
      const context = createSettlementContext(
        root,
        'callerReplace',
        0,
        scratch,
      );
      node.local = captureFieldNodeChange(node, 'local', value);
      node.emit = captureFieldNodeChange(node, 'emit', value);
      context.changedNodes.add(node);
      const visited: string[] = [];
      try {
        markCommitDeliveries(context, (candidate) =>
          visited.push(candidate.path),
        );
        order.push(visited);
      } finally {
        releaseSettlementScratch(scratch);
      }
    };
    let feedback = false;
    root.runtime.listeners = new Map<
      unknown,
      Set<(event: NonNullable<typeof a.pendingDelivery>) => void>
    >([
      [
        a,
        new Set([
          () => {
            if (!feedback) {
              feedback = true;
              commit(b, 'B2');
            }
          },
        ]),
      ],
      [b, new Set([(event) => events.push(event.payload?.[E.UpdateValue])])],
    ]);
    commit(a, 'A1');
    commit(b, 'B1');
    const before = b.revisionLedger[E.UpdateValue] ?? 0;
    dispatchBatch(root, () => {});
    expect(order).toEqual([
      ['/a', ''],
      ['/b', ''],
      ['/b', ''],
    ]);
    expect(events).toEqual([
      { previous: 'B', current: 'B1' },
      { previous: 'B1', current: 'B2' },
    ]);
    expect(b.revisionLedger[E.UpdateValue]).toBe(before + 1);
  });

  it('preserves direct marks left by an exception in the next commit', () => {
    const root = fixture();
    const { a, b } = root.structure!;
    markFieldNodeEvent(a, E.RequestFocus);
    const scratch = getSettlementScratch(root.runtime);
    const first = createSettlementContext(root, 'callerReplace', 0, scratch);
    first.changedNodes.add(b);
    const failure = new Error('visitor failure');
    try {
      expect(() =>
        markCommitDeliveries(first, () => {
          throw failure;
        }),
      ).toThrow(failure);
    } finally {
      releaseSettlementScratch(scratch);
    }
    dispatchBatch(root, () => {});
    const nextScratch = getSettlementScratch(root.runtime);
    const next = createSettlementContext(root, 'callerReplace', 0, nextScratch);
    next.changedNodes.add(b);
    const order: string[] = [];
    try {
      markCommitDeliveries(next, (node) => order.push(node.path));
      expect(order).toEqual(['/b', '', '/a']);
      expect(a.revisionLedger[E.RequestFocus]).toBe(1);
      expect(a.pendingRevision).toBe(0);
    } finally {
      releaseSettlementScratch(nextScratch);
    }
  });

  it('visits departing descendants first and removes their pending signals', () => {
    const root = fixture();
    const { a, b } = root.structure!;
    markFieldNodeEvent(a, E.RequestFocus);
    a.detached = true;
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(root, 'callerReplace', 0, scratch);
    context.exited.add(a);
    context.stateDirtyNodes.add(b);
    const order: string[] = [];
    try {
      markCommitDeliveries(context, (node) => order.push(node.path));
      expect(order).toEqual(['/a', '/b', '']);
      expect(a.pendingDelivery).toBeUndefined();
      expect(root.runtime.deliveries?.has(a)).toBe(false);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });
});

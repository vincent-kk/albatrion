import { describe, expect, it } from 'vitest';

import {
  FieldNodeEventType as E,
  captureFieldNodeChange,
  markFieldNodeEvent,
} from '@/schema-form/core/engine/record';
import { dispatchBatch } from '@/schema-form/core/engine/write';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { FieldNodeWriteKind } from '../../types/value';
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
    const { left, right } = root.__childrenByName__!;
    const nodes = [
      left.__childrenByName__!.a,
      left.__childrenByName__!.b,
      left,
      right.__childrenByName__!.a,
      right.__childrenByName__!.b,
      right,
      root,
    ];
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(
      root,
      FieldNodeWriteKind.CallerReplace,
      0,
      scratch,
    );
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
    const { a, b } = root.__childrenByName__!;
    a.__state__ = { arbitrary: true };
    root.runtime.globalStateCounts.set('arbitrary', 1);
    root.runtime.globalState = { arbitrary: true };
    a.__state__ = captureFieldNodeChange(a, '__state__', {});
    b.__state__ = captureFieldNodeChange(b, '__state__', {
      arbitrary: true,
    });
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(
      root,
      FieldNodeWriteKind.CallerReplace,
      0,
      scratch,
    );
    context.enteredNodes.add(b);
    context.changedNodes.add(a);
    context.stateDirtyNodes.add(b);
    const order: string[] = [];
    try {
      expect(context.hasGates).toBe(true);
      markCommitDeliveries(context, (node) => order.push(node.path));
      expect(order).toEqual(['/b', '/a', '']);
      expect(root.runtime.globalStateCounts.get('arbitrary')).toBe(1);
      expect(root.runtime.globalState).toEqual({ arbitrary: true });
      expect(a.__pendingDelivery__?.type).toBe(E.UpdateState);
      expect(b.__pendingDelivery__?.type).toBe(E.UpdateState);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });

  it('visits unchanged load-only siblings after changed and state candidates', () => {
    const root = fixture();
    const { a, b, c } = root.__childrenByName__!;
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(
      root,
      FieldNodeWriteKind.Load,
      0,
      scratch,
    );
    context.changedNodes.add(b);
    context.stateDirtyNodes.add(a);
    const order: string[] = [];
    try {
      markCommitDeliveries(context, (node) => order.push(node.path));
      expect(order).toEqual(['/b', '/a', '', '/c']);
      expect(c.__pendingDelivery__).toBeUndefined();
      expect(b.__pendingDelivery__?.type).toBe(E.RequestRefresh);
      expect(a.__pendingDelivery__?.type).toBe(E.RequestRefresh);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });

  it('visits a required-only child after global candidates and before the root extra', () => {
    const root = fixture();
    const { a, b } = root.__childrenByName__!;
    root.__schema__ = {
      ...root.__schema__,
      schema: {
        ...(typeof root.__schema__.schema === 'object'
          ? root.__schema__.schema
          : {}),
        required: ['a'],
      },
    };
    root.__deliveryPreviousSchema__ = root.__schema__;
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(
      root,
      FieldNodeWriteKind.CallerReplace,
      0,
      scratch,
    );
    context.changedNodes.add(root);
    context.stateDirtyNodes.add(b);
    const revision = a.__revisionLedger__[E.UpdateControlledProperties] ?? 0;
    const order: string[] = [];
    try {
      markCommitDeliveries(context, (node) => order.push(node.path));
      expect(order).toEqual(['', '/b', '/a']);
      expect(a.isRequired).toBe(true);
      expect(a.__revisionLedger__[E.UpdateControlledProperties]).toBe(
        revision + 1,
      );
    } finally {
      releaseSettlementScratch(scratch);
    }
  });

  it('commits diagnostics on a root outside changedNodes after the changed leaf', () => {
    const root = fixture();
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(
      root,
      FieldNodeWriteKind.CallerReplace,
      0,
      scratch,
    );
    context.changedNodes.add(root.__childrenByName__!.b);
    root.runtime.diagnostics = { status: 'degraded', cause: 'budget' };
    const before = root.__revisionLedger__[E.UpdateDiagnostics] ?? 0;
    const order: string[] = [];
    try {
      markCommitDeliveries(context, (node) => order.push(node.path));
      expect(order).toEqual(['/b', '']);
      expect(root.__revisionLedger__[E.UpdateDiagnostics]).toBe(before + 1);
      expect(root.__pendingDelivery__?.type).toBe(E.UpdateDiagnostics);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });

  it('deduplicates overlapping path and context watchers after global candidates', () => {
    const root = fixture();
    const { a, b, c } = root.__childrenByName__!;
    const index = createWatchDeliveryIndex();
    index.update(a, ['/b', '@']);
    index.update(c, ['/b', '/old']);
    root.runtime.deliveryWatchIndex = index;
    root.runtime.context = { next: true };
    root.runtime.deliveryAffectedPaths = new Set(['/b', '/old']);
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(
      root,
      FieldNodeWriteKind.CallerReplace,
      0,
      scratch,
    );
    context.changedNodes.add(a);
    context.pathChanges.push({ node: b, previous: '/old', current: '/b' });
    c.isDetached = true;
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
    const { a, b } = root.__childrenByName__!;
    const order: string[][] = [];
    const events: unknown[] = [];
    const commit = (node: typeof a, value: string) => {
      const scratch = getSettlementScratch(root.runtime);
      const context = createSettlementContext(
        root,
        FieldNodeWriteKind.CallerReplace,
        0,
        scratch,
      );
      node.__value__ = captureFieldNodeChange(node, '__value__', value);
      node.__outputValue__ = captureFieldNodeChange(
        node,
        '__outputValue__',
        value,
      );
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
      Set<(event: NonNullable<typeof a.__pendingDelivery__>) => void>
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
    const before = b.__revisionLedger__[E.UpdateValue] ?? 0;
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
    expect(b.__revisionLedger__[E.UpdateValue]).toBe(before + 1);
  });

  it('preserves direct marks left by an exception in the next commit', () => {
    const root = fixture();
    const { a, b } = root.__childrenByName__!;
    markFieldNodeEvent(a, E.RequestFocus);
    const scratch = getSettlementScratch(root.runtime);
    const first = createSettlementContext(
      root,
      FieldNodeWriteKind.CallerReplace,
      0,
      scratch,
    );
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
    const next = createSettlementContext(
      root,
      FieldNodeWriteKind.CallerReplace,
      0,
      nextScratch,
    );
    next.changedNodes.add(b);
    const order: string[] = [];
    try {
      markCommitDeliveries(next, (node) => order.push(node.path));
      expect(order).toEqual(['/b', '', '/a']);
      expect(a.__revisionLedger__[E.RequestFocus]).toBe(1);
      expect(a.__pendingRevisionMask__).toBe(0);
    } finally {
      releaseSettlementScratch(nextScratch);
    }
  });

  it('visits departing descendants first and removes their pending signals', () => {
    const root = fixture();
    const { a, b } = root.__childrenByName__!;
    markFieldNodeEvent(a, E.RequestFocus);
    a.isDetached = true;
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(
      root,
      FieldNodeWriteKind.CallerReplace,
      0,
      scratch,
    );
    context.exitedNodes.add(a);
    context.stateDirtyNodes.add(b);
    const order: string[] = [];
    try {
      markCommitDeliveries(context, (node) => order.push(node.path));
      expect(order).toEqual(['/a', '/b', '']);
      expect(a.__pendingDelivery__).toBeUndefined();
      expect(root.runtime.deliveries?.has(a)).toBe(false);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });
});

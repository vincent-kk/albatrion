import { describe, expect, it } from 'vitest';

import { INJECT_TARGET_MISSING, MULTIPLE_ERRORS, SchemaFormError } from '../../../errors';
import { accumulateGlobalStateDeltas, publishGlobalStateDeltas,
  indexSchemaNodeWarning, SchemaNodeEventType, updateSchemaNodeNameAndPath } from '../../record';
import { SetValueOption } from '../../types/value';
import { arrangeSchemaNodeItems, writeSchemaNode } from '../index';
import { rekeyArrayRuntimePaths } from '../utils/structure/rekeyArrayRuntimePaths';
import { prunePerishedPaths } from '../utils/transition/prunePerishedPaths';
import { markCommitDeliveries } from '../utils/commit/markCommitDeliveries';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { getSettlementScratch } from '../utils/write/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/write/releaseSettlementScratch';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-array-integration
describe('array integration runtime stores', () => {
  it('58C-01 budget stop preserves earlier array-item injection errors in the bundle', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: ['string', 'boolean'] },
      list: { type: 'array', items: { type: 'number',
        controls: { injectTo: () => ({ '/missing': 1 }) } } },
    }, allOf: [
      { controls: { active: './a === "0"' }, properties: { a: { type: 'boolean' } } },
      { controls: { active: './a !== "0"' }, properties: { a: { type: 'string' } } },
    ] });
    let caught: unknown;
    try { writeSchemaNode(root, { a: 0, list: [1, 2] }, 'callerReplace', SetValueOption.Overwrite); }
    catch (error) { caught = error; }
    if (!(caught instanceof SchemaFormError)) throw new Error('Missing settlement errors');
    expect(caught.code).toBe('SCHEMA_FORM_ERROR.MULTIPLE_ERRORS');
    expect(caught.details.errors).toEqual([
      expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING',
        details: expect.objectContaining({ sourcePath: '/list/1' }) }),
      expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING',
        details: expect.objectContaining({ sourcePath: '/list/0' }) }),
      expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED' }),
    ]);
  });

  it('35C-02 path-only facts deliver shifted descendants even without value/control changes', () => {
    const { root } = createTestTree({ type: 'array', items: {
      type: 'object', properties: { n: { type: 'number' } },
    } });
    writeSchemaNode(root, [{ n: 1 }, { n: 2 }], 'callerReplace', SetValueOption.Overwrite);
    root.runtime.deliveries?.clear();
    const item = root.children![1];
    const leaf = item.structure!.n;
    const scratch = getSettlementScratch(root.runtime);
    try {
      const context = createSettlementContext(root, 'callerReplace', SetValueOption.Overwrite, scratch);
      for (const node of [item, leaf]) {
        const previous = node.path;
        updateSchemaNodeNameAndPath(node, node === item ? '0' : node.name, node.parent);
        context.pathChanges.push({ node, previous, current: node.path });
      }
      markCommitDeliveries(context);
      expect(root.runtime.deliveries?.get(item)?.payload?.[SchemaNodeEventType.UpdatePath])
        .toEqual({ previous: '/1', current: '/0' });
      expect(root.runtime.deliveries?.get(leaf)?.payload?.[SchemaNodeEventType.UpdatePath])
        .toEqual({ previous: '/1/n', current: '/0/n' });
    } finally { releaseSettlementScratch(scratch); }
  });

  it('43C-01 pop/remove subtract touched/dirty items and descendants from global counts', () => {
    for (const kind of ['pop', 'remove'] as const) {
      const { root } = createTestTree({ type: 'array', items: {
        type: 'object', properties: { n: { type: 'number' } },
      } });
      writeSchemaNode(root, [{ n: 1 }, { n: 2 }], 'callerReplace', SetValueOption.Overwrite);
      const item = root.children![kind === 'pop' ? 1 : 0];
      const leaf = item.structure!.n;
      item.interactionState = { touched: true };
      leaf.interactionState = { dirty: true };
      const deltas = new Map<string, number>();
      for (const node of [item, leaf]) {
        accumulateGlobalStateDeltas(deltas, {}, node.interactionState);
        const previous = root.runtime.deliverySnapshots!.get(node)!;
        root.runtime.deliverySnapshots!.set(node, { ...previous,
          interactionState: node.interactionState });
      }
      publishGlobalStateDeltas(root, deltas);
      expect(root.runtime.globalState).toEqual({ touched: true, dirty: true });
      arrangeSchemaNodeItems(root, kind === 'pop' ? { kind } : { kind, index: 0 });
      expect(root.runtime.globalState).toEqual({});
      expect(root.runtime.globalStateCounts.get('touched') ?? 0).toBe(0);
      expect(root.runtime.globalStateCounts.get('dirty') ?? 0).toBe(0);
    }
  });

  it('35C-09 deletes perished descendants from delivery/watch/error/event stores', () => {
    const { root } = createTestTree({ type: 'array', items: {
      type: 'object', properties: { n: { type: 'number', controls: { watch: ['.'] } } },
    } });
    writeSchemaNode(root, [{ n: 1 }], 'callerReplace', SetValueOption.Overwrite);
    const item = root.children![0];
    const leaf = item.structure!.n;
    const runtime = root.runtime;
    for (const node of [item, leaf]) {
      (runtime.nodeErrors ??= new Map()).set(node, [{ dataPath: node.path }]);
      (runtime.validationErrors ??= new Map()).set(node, [{ dataPath: node.path }]);
      (runtime.combinedErrors ??= new Map()).set(node, { errors: [] });
      (runtime.validationChangedNodes ??= new Set()).add(node);
      (runtime.validationTargets ??= new Set()).add(node);
      (runtime.validationPendingTargets ??= new Set()).add(node);
      (runtime.queuedNonSettleEvents ??= new Map()).set(node, { type: 1 });
      (runtime.queuedEvents ??= new Map()).set(node, { type: 1 });
      runtime.deliveries!.set(node, { type: 1 });
    }
    expect(runtime.deliveryWatchIndex?.allNodes.has(leaf)).toBe(true);
    arrangeSchemaNodeItems(root, { kind: 'clear' });
    for (const node of [item, leaf]) {
      expect(runtime.deliverySnapshots?.has(node)).toBe(false);
      expect(runtime.deliveryWatchIndex?.allNodes.has(node)).toBe(false);
      expect(runtime.deliveries?.has(node)).toBe(false);
      expect(runtime.queuedEvents?.has(node)).toBe(false);
      expect(runtime.queuedNonSettleEvents?.has(node)).toBe(false);
      expect(runtime.nodeErrors?.has(node)).toBe(false);
      expect(runtime.validationErrors?.has(node)).toBe(false);
      expect(runtime.combinedErrors?.has(node)).toBe(false);
      expect(runtime.validationChangedNodes?.has(node)).toBe(false);
      expect(runtime.validationTargets?.has(node)).toBe(false);
      expect(runtime.validationPendingTargets?.has(node)).toBe(false);
    }
  });

  it('35C-09 warning data paths re-key collision-free and perish without changing chain history', () => {
    const { root } = createTestTree({ type: 'array', items: { type: 'number' } });
    const runtime = root.runtime;
    const code = 'SCHEMA_FORM_WARNING.TYPE_MISMATCH';
    const oldKey = JSON.stringify([code, '/1/n', 3]);
    const newKey = JSON.stringify([code, '/0/n', 3]);
    // The perished item's key equals the shifted item's new key; the move must replace it, not collide.
    const removedKey = JSON.stringify([code, '/0/n', 3]);
    const record = { level: 'warning', code, path: '/1/n', message: 'mismatch',
      details: { path: '/1/n', innerPaths: ['/1/n/child'] } } as const;
    runtime.warningKeys = new Set([oldKey, removedKey, 'VALIDATOR_MISSING']);
    runtime.pendingWarningRecords = new Map([[oldKey, record], [removedKey, {
      ...record, path: '/0/n',
    }]]);
    indexSchemaNodeWarning(runtime, oldKey, '/1/n');
    indexSchemaNodeWarning(runtime, removedKey, '/0/n');
    runtime.chainOccurrences = [{ kind: 'record', record }];
    rekeyArrayRuntimePaths(runtime, '', [{ previous: '/0' },
      { previous: '/1', current: '/0' }]);
    expect(runtime.warningKeys.has(oldKey)).toBe(false);
    expect(runtime.warningKeys.has(newKey)).toBe(true);
    expect(runtime.warningKeys.has('VALIDATOR_MISSING')).toBe(true);
    expect(runtime.pendingWarningRecords.get(newKey)).toBe(record);
    expect(runtime.chainOccurrences).toEqual([{ kind: 'record', record }]);
    expect(record.path).toBe('/1/n');
    prunePerishedPaths(runtime, new Set(['/0']));
    expect(runtime.warningKeys.has(newKey)).toBe(false);
    expect(runtime.pendingWarningRecords.size).toBe(0);
    expect(runtime.chainOccurrences).toEqual([{ kind: 'record', record }]);
  });

  it('59C-01 58C-01 shared missing inject target keeps one error per item with sourcePath', () => {
    const { root } = createTestTree({ type: 'array', items: {
      type: 'number', controls: { injectTo: () => ({ '/missing': 1 }) },
    } });
    let caught: unknown;
    try { writeSchemaNode(root, [1, 2, 3], 'callerReplace', SetValueOption.Overwrite); }
    catch (error) { caught = error; }
    expect(caught).toBeInstanceOf(SchemaFormError);
    if (!(caught instanceof SchemaFormError)) throw new Error('Missing settlement error');
    expect(caught.code).toBe(`SCHEMA_FORM_ERROR.${MULTIPLE_ERRORS}`);
    expect(caught.details.errors).toHaveLength(3);
    expect(caught.details.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: `SCHEMA_FORM_ERROR.${INJECT_TARGET_MISSING}`,
        details: expect.objectContaining({ sourcePath: '/2' }) }),
      expect.objectContaining({ code: `SCHEMA_FORM_ERROR.${INJECT_TARGET_MISSING}`,
        details: expect.objectContaining({ sourcePath: '/1' }) }),
      expect.objectContaining({ code: `SCHEMA_FORM_ERROR.${INJECT_TARGET_MISSING}`,
        details: expect.objectContaining({ sourcePath: '/0' }) }),
    ]));
  });
});

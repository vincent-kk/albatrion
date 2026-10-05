import { afterEach, expect, it, vi } from 'vitest';

import { SchemaNodeEventType } from '../../record';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import * as caps from '../utils/transition/getTransitionCap';
import * as references from '../utils/compute/getVirtualReferenceIndex';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { getSettlementScratch } from '../utils/write/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/write/releaseSettlementScratch';
import type { DirtyPathSet } from '../utils/write/DirtyPathSet';
import { createTestTree } from './fixtures/createTestTree';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('does not prepare absent gates or virtual references on first or later writes', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    value: { type: 'string' }, sibling: { type: 'number', default: 3 },
  } });
  loadSchemaNodeAtMount(root, { value: 'before' }, SetValueOption.Overwrite);
  const cap = vi.spyOn(caps, 'getTransitionCap');
  const reference = vi.spyOn(references, 'getVirtualReferenceIndex');
  for (const value of ['first', 'later']) {
    writeSchemaNode(root.structure!.value, value, 'input', SetValueOption.Overwrite);
    expect(root.emit).toEqual({ value, sibling: 3 });
    expect([cap.mock.calls.length, reference.mock.calls.length]).toEqual([0, 0]);
  }
});

it('allocates no reused scratch containers and clears only populated work lists', () => {
  const { root } = createTestTree({ type: 'string' });
  const cached = getSettlementScratch(root.runtime);
  releaseSettlementScratch(cached);
  const allocations = { maps: 0, sets: 0 };
  let counting = false;
  vi.stubGlobal('Map', new Proxy(Map, { construct(target, args) {
    if (counting) allocations.maps++;
    return Reflect.construct(target, args);
  } }));
  vi.stubGlobal('Set', new Proxy(Set, { construct(target, args) {
    if (counting) allocations.sets++;
    return Reflect.construct(target, args);
  } }));
  for (let index = 0; index < 2; index++) {
    counting = true;
    const scratch = getSettlementScratch(root.runtime);
    counting = false;
    expect(scratch).toBe(cached);
    expect(allocations).toEqual({ maps: 0, sets: 0 });
    const unused = [scratch.entered, scratch.revived, scratch.exited,
      scratch.pendingExits, scratch.perished, scratch.selectedDeclarationIds,
      scratch.writtenInputs, scratch.distributedInputs, scratch.wrongKindHosts,
      scratch.arrayCounts, scratch.filledNodes, scratch.latentAutomaticLog,
      scratch.dependencyOwnerPaths, scratch.shapeDirtyPaths, scratch.explicitRaw,
      scratch.changedNodes, scratch.stateDirtyNodes, scratch.originalSchemas];
    const spies = unused.map(container => vi.spyOn(container, 'clear'));
    const dirty = vi.spyOn(scratch.dirtyPaths, 'clear');
    const parents = vi.spyOn(scratch.dirtyChildrenByParent, 'clear');
    const raw = vi.spyOn(scratch.changedRaw, 'clear');
    scratch.dirtyPaths.add('/value');
    scratch.changedRaw.add('/value');
    releaseSettlementScratch(scratch);
    expect(spies.map(spy => spy.mock.calls.length)).toEqual(unused.map(() => 0));
    expect(dirty).toHaveBeenCalledTimes(1);
    expect(parents).toHaveBeenCalledTimes(1);
    expect(raw).toHaveBeenCalledTimes(1);
    expect(scratch.dirtyPaths.size).toBe(0);
    expect(scratch.dirtyChildrenByParent.size).toBe(0);
    expect(scratch.changedRaw.size).toBe(0);
    expect(scratch.inUse).toBe(false);
  }
});

it('preserves output identity, payloads, revisions, commits and call-local flags', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    value: { type: 'string' }, sibling: { type: 'number', default: 3 },
  } });
  loadSchemaNodeAtMount(root, { value: 'before' }, SetValueOption.Overwrite);
  const leaf = root.structure!.value, sibling = root.structure!.sibling;
  const siblingRevision = sibling.revisionLedger;
  let previous = 'before';
  for (let index = 0; index < 2; index++) {
    for (const node of root.runtime.deliveries ?? []) node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    const value = index === 0 ? 'first' : 'later';
    const revision = leaf.revisionLedger[SchemaNodeEventType.UpdateValue] ?? 0;
    writeSchemaNode(leaf, value, 'input', index === 0 ?
      SetValueOption.DisableAutomaticWrites : SetValueOption.EnableAutomaticWrites);
    expect(root.emit).toEqual({ value, sibling: 3 });
    expect(leaf.pendingDelivery?.payload?.[SchemaNodeEventType.UpdateValue])
      .toEqual({ previous, current: value });
    expect(leaf.pendingDelivery?.options?.[SchemaNodeEventType.UpdateValue])
      .toEqual({ source: 'input' });
    expect(leaf.revisionLedger[SchemaNodeEventType.UpdateValue]).toBe(revision + 1);
    expect(sibling.revisionLedger).toBe(siblingRevision);
    expect([...root.runtime.deliveries ?? []].map(node => node.path)).toEqual(['/value', '']);
    expect(root.runtime.commitNumber).toBe(index + 2);
    expect(root.runtime.diagnostics.status).toBe('stable');
    expect(root.runtime.combinedErrors?.size ?? 0).toBe(0);
    expect(root.runtime.settlementTrace?.rounds).toEqual([]);
    previous = value;
  }
  const emit = root.emit;
  writeSchemaNode(leaf, previous, 'input', SetValueOption.Overwrite);
  expect(root.emit).toBe(emit);
});

it('retains preparation and cleanup for actual gates, derivation and errors', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    source: { type: 'number' },
    derived: { type: 'number', controls: { derived: '../source + 1' } },
    gated: { type: 'string', default: 'filled', controls: {
      active: '../source >= 0 ? true : missingFunction()',
    } },
  } });
  loadSchemaNodeAtMount(root, { source: 1 }, SetValueOption.Overwrite);
  const cap = vi.spyOn(caps, 'getTransitionCap');
  const reference = vi.spyOn(references, 'getVirtualReferenceIndex');
  const source = root.structure!.source;
  writeSchemaNode(source, 2, 'input', SetValueOption.Overwrite);
  expect(root.emit).toEqual({ source: 2, derived: 3, gated: 'filled' });
  expect(cap).toHaveBeenCalled();
  expect(reference).toHaveBeenCalled();
  expect(() => writeSchemaNode(source, -1, 'input', SetValueOption.Overwrite)).toThrow();
  const scratch = root.runtime.settlementScratch!;
  expect(scratch.inUse).toBe(false);
  for (const container of Object.values(scratch))
    if (container instanceof Map || container instanceof Set) expect(container.size).toBe(0);
  expect(() => writeSchemaNode(source, 3, 'input', SetValueOption.Overwrite)).not.toThrow();
  expect(root.runtime.settlementScratch).toBe(scratch);
  expect(root.emit).toEqual({ source: 3, derived: 4, gated: 'filled' });
});

it('keeps nested scratch independent and resets an empty postorder mode', () => {
  const { root } = createTestTree({ type: 'string' });
  const outer = getSettlementScratch(root.runtime);
  const first = createSettlementContext(root, 'input', SetValueOption.DisableAutomaticWrites, outer);
  const inner = getSettlementScratch(root.runtime);
  const nested = createSettlementContext(root, 'input', SetValueOption.EnableAutomaticWrites, inner);
  first.changedRaw.add('/outer');
  nested.changedRaw.add('/inner');
  (inner.dirtyPaths as DirtyPathSet).beginPostOrder();
  releaseSettlementScratch(inner);
  expect(first.changedRaw.has('/outer')).toBe(true);
  expect(outer.inUse).toBe(true);
  expect(first.suppressAutomaticWrites).toBe(true);
  expect(nested.suppressAutomaticWrites).toBe(false);
  inner.dirtyPaths.add('/group/value');
  expect(inner.dirtyPaths.has('')).toBe(false);
  expect(inner.dirtyChildrenByParent.get('')?.get('/group/value')).toBe('group');
  releaseSettlementScratch(inner);
  releaseSettlementScratch(outer);
  const reused = getSettlementScratch(root.runtime);
  const later = createSettlementContext(root, 'input', SetValueOption.Overwrite, reused);
  expect(reused).toBe(outer);
  expect(later).not.toBe(first);
  expect(later.changedRaw.size).toBe(0);
  expect(later.suppressAutomaticWrites).toBe(false);
  releaseSettlementScratch(reused);
});

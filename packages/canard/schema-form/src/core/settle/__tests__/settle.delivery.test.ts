import { describe, expect, it, vi } from 'vitest';

import { EMPTY_REVISION_LEDGER, markSchemaNodeEvent,
  SchemaNodeEventType, SchemaNodeRequestType } from '../../record';
import { SchemaNodeState } from '../../types/state';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, resetSchemaNodeSubtree, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-delivery
describe('settlement delivery ledger', () => {
  it('LANDING-170 keeps request aliases and omits retired commands', () => {
    expect(SchemaNodeRequestType.Refresh).toBe(SchemaNodeEventType.RequestRefresh);
    expect(SchemaNodeRequestType.Remount).toBe(SchemaNodeEventType.RequestRemount);
    expect(Object.keys(SchemaNodeEventType)).not.toContain('RequestEmitChange');
    expect(Object.keys(SchemaNodeEventType)).not.toContain('RequestInjection');
  });

  it('EVENT-006 and EVENT-007 mark changed nodes and raise each delivered bit once per commit', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    } });
    expect(root.revisionLedger).toBe(EMPTY_REVISION_LEDGER);
    expect(Object.isFrozen(root.revisionLedger)).toBe(true);
    writeSchemaNode(root, { a: 'first', b: 'same' },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.revisionLedger).not.toBe(EMPTY_REVISION_LEDGER);
    const a = root.structure!.a;
    const b = root.structure!.b;
    const previous = a.revisionLedger[SchemaNodeEventType.UpdateValue] ?? 0;
    writeSchemaNode(root, { a: 'second', b: 'same' },
      'callerReplace', SetValueOption.Overwrite);
    expect((a.pendingDelivery?.type ?? 0) & SchemaNodeEventType.UpdateValue)
      .toBe(SchemaNodeEventType.UpdateValue);
    expect(a.revisionLedger[SchemaNodeEventType.UpdateValue]).toBe(previous + 1);
    expect(b.revisionLedger[SchemaNodeEventType.UpdateValue]).toBe(1);
  });

  it('WRITE-096 carries old and new value references and the caller replacement source', () => {
    const { root } = createTestTree({ type: 'string' });
    writeSchemaNode(root, 'old', 'callerReplace', SetValueOption.Overwrite);
    for (const node of root.runtime.deliveries ?? []) node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeSchemaNode(root, 'new', 'callerReplace', SetValueOption.Overwrite);
    const event = root.pendingDelivery;
    expect(event?.payload?.[SchemaNodeEventType.UpdateValue])
      .toEqual({ previous: 'old', current: 'new' });
    expect(event?.options?.[SchemaNodeEventType.UpdateValue])
      .toEqual({ source: 'callerReplace' });
  });

  it('EVENT-023 carries both local and emit for a host value', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      value: { type: 'string' },
    } });
    writeSchemaNode(root, { value: 'old' }, 'callerReplace', SetValueOption.Overwrite);
    const previous = { local: root.local, emit: root.emit };
    for (const node of root.runtime.deliveries ?? []) node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeSchemaNode(root, { value: 'new' }, 'callerReplace', SetValueOption.Overwrite);
    expect(root.pendingDelivery?.payload?.[SchemaNodeEventType.UpdateValue])
      .toEqual({ previous, current: { local: root.local, emit: root.emit } });
  });

  it('EVENT-006 includes a pending signal and EVENT-007 bumps its bit once', () => {
    const { root } = createTestTree({ type: 'string' });
    writeSchemaNode(root, 'same', 'callerReplace', SetValueOption.Overwrite);
    for (const node of root.runtime.deliveries ?? []) node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    markSchemaNodeEvent(root, SchemaNodeEventType.RequestFocus);
    writeSchemaNode(root, 'same', 'callerReplace', SetValueOption.Overwrite);
    expect(root.pendingDelivery?.type).toBe(SchemaNodeEventType.RequestFocus);
    expect(root.revisionLedger[SchemaNodeEventType.RequestFocus]).toBe(1);
    writeSchemaNode(root, 'same', 'callerReplace', SetValueOption.Overwrite);
    expect(root.revisionLedger[SchemaNodeEventType.RequestFocus]).toBe(1);
  });

  it('EVENT-060 records an automatic derived write as its own source', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string' },
      target: { type: 'string', controls: { derived: '../source' } },
    } });
    writeSchemaNode(root, { source: 'A' }, 'callerReplace', SetValueOption.Overwrite);
    const target = root.structure!.target;
    expect(target.local).toBe('A');
    expect(target.pendingDelivery?.options?.[
      SchemaNodeEventType.UpdateValue]).toEqual({ source: 'automatic' });
  });

  it('EVENT-039 and EVENT-071 refresh every loaded node and only changed non-load descendants', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { a: 'one', b: 'same' }, SetValueOption.Overwrite);
    const a = root.structure!.a;
    const b = root.structure!.b;
    expect((root.pendingDelivery?.type ?? 0) & SchemaNodeEventType.RequestRefresh)
      .toBe(SchemaNodeEventType.RequestRefresh);
    expect((a.pendingDelivery?.type ?? 0) & SchemaNodeEventType.RequestRefresh)
      .toBe(SchemaNodeEventType.RequestRefresh);
    expect((b.pendingDelivery?.type ?? 0) & SchemaNodeEventType.RequestRefresh)
      .toBe(SchemaNodeEventType.RequestRefresh);
    for (const node of root.runtime.deliveries ?? []) node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeSchemaNode(root, { a: 'two', b: 'same' },
      'callerReplace', SetValueOption.Overwrite);
    expect((a.pendingDelivery?.type ?? 0) & SchemaNodeEventType.RequestRefresh)
      .toBe(SchemaNodeEventType.RequestRefresh);
    expect((b.pendingDelivery?.type ?? 0) & SchemaNodeEventType.RequestRefresh).toBe(0);
    expect((root.pendingDelivery?.type ?? 0) & SchemaNodeEventType.RequestRefresh).toBe(0);
  });

  it('EVENT-071 and SETTLE-049 refresh an injection target outside the loaded subtree', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      left: { type: 'object', properties: {
        source: { type: 'string', controls: {
          injectTo: (value: unknown) => ({ '../../leftTarget': `left:${value}` }),
        } },
      } },
      rightSource: { type: 'string', controls: {
        injectTo: (value: unknown) => ({ '../rightTarget': `right:${value}` }),
      } },
      leftTarget: { type: 'string' }, rightTarget: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { left: { source: 'A' }, rightSource: 'B' },
      SetValueOption.Overwrite);
    const left = root.structure!.left;
    const source = left.structure!.source;
    const leftTarget = root.structure!.leftTarget;
    const rightTarget = root.structure!.rightTarget;
    writeSchemaNode(leftTarget, 'manual-left', 'input', SetValueOption.Overwrite);
    writeSchemaNode(rightTarget, 'manual-right', 'input', SetValueOption.Overwrite);
    for (const node of root.runtime.deliveries ?? []) node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    const targetRevision = leftTarget.revisionLedger[SchemaNodeEventType.RequestRefresh] ?? 0;
    const sourceRevision = source.revisionLedger[SchemaNodeEventType.RequestRefresh] ?? 0;

    resetSchemaNodeSubtree(left, SetValueOption.Overwrite);

    expect(leftTarget.raw).toBe('left:A');
    expect((leftTarget.pendingDelivery?.type ?? 0) & SchemaNodeEventType.RequestRefresh)
      .toBe(SchemaNodeEventType.RequestRefresh);
    expect(leftTarget.revisionLedger[SchemaNodeEventType.RequestRefresh]).toBe(targetRevision + 1);
    expect(source.raw).toBe('A');
    expect(source.revisionLedger[SchemaNodeEventType.RequestRefresh]).toBe(sourceRevision + 1);
    expect(rightTarget.raw).toBe('manual-right');
    expect((rightTarget.pendingDelivery?.type ?? 0) & SchemaNodeEventType.RequestRefresh).toBe(0);
  });

  it('EVENT-071 and SETTLE-049 omit Refresh when an outside injection leaves raw unchanged', () => {
    const injectTo = vi.fn(() => ({ '../../target': 'injected' }));
    const { root } = createTestTree({ type: 'object', properties: {
      group: { type: 'object', properties: {
        source: { type: 'string', controls: { injectTo } },
      } }, target: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { group: { source: 'A' } }, SetValueOption.Overwrite);
    const target = root.structure!.target;
    const revision = target.revisionLedger[SchemaNodeEventType.RequestRefresh];
    for (const node of root.runtime.deliveries ?? []) node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();

    resetSchemaNodeSubtree(root.structure!.group, SetValueOption.Overwrite);

    expect(injectTo).toHaveBeenCalledTimes(2);
    expect(target.raw).toBe('injected');
    expect((target.pendingDelivery?.type ?? 0) & SchemaNodeEventType.RequestRefresh).toBe(0);
    expect(target.revisionLedger[SchemaNodeEventType.RequestRefresh]).toBe(revision);
  });

  it('EVENT-064 reports effective schema references separately from computed properties', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' }, value: { type: 'string' },
    }, if: { properties: { enabled: { const: true } },
      required: ['enabled'] }, then: { properties: { value: { minLength: 2 } } } });
    writeSchemaNode(root, { enabled: false, value: 'a' },
      'callerReplace', SetValueOption.Overwrite);
    const value = root.structure!.value;
    const previous = value.schema;
    for (const node of root.runtime.deliveries ?? []) node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    const payload = value.pendingDelivery?.payload?.[
      SchemaNodeEventType.UpdateJsonSchema];
    expect(payload).toEqual({ previous: previous.schema, current: value.schema.schema });
    expect(Object.isFrozen(payload)).toBe(process.env.NODE_ENV !== 'production');
    expect((value.pendingDelivery?.type ?? 0) &
      SchemaNodeEventType.UpdateComputedProperties).toBe(0);
  });

  it('EVENT-043 marks root diagnostics only when a commit changes them', () => {
    const { root } = createTestTree({ type: 'string' });
    writeSchemaNode(root, 'first', 'callerReplace', SetValueOption.Overwrite);
    expect((root.pendingDelivery?.type ?? 0) &
      SchemaNodeEventType.UpdateDiagnostics).toBe(0);
    for (const node of root.runtime.deliveries ?? []) node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeSchemaNode(root, 'second', 'callerReplace', SetValueOption.Overwrite);
    expect((root.pendingDelivery?.type ?? 0) &
      SchemaNodeEventType.UpdateDiagnostics).toBe(0);
    root.runtime.diagnostics = { status: 'degraded', cause: 'budget' };
    writeSchemaNode(root, 'third', 'callerReplace', SetValueOption.Overwrite);
    expect((root.pendingDelivery?.type ?? 0) &
      SchemaNodeEventType.UpdateDiagnostics).toBe(SchemaNodeEventType.UpdateDiagnostics);
  });

  it('EVENT-066 marks child shape changes even when a conditional value stays empty', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' },
    }, if: { properties: { enabled: { const: true } },
      required: ['enabled'] }, then: { properties: { extra: { type: 'string' } } } });
    writeSchemaNode(root, { enabled: false }, 'callerReplace', SetValueOption.Overwrite);
    for (const node of root.runtime.deliveries ?? []) node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    expect((root.pendingDelivery?.type ?? 0) &
      SchemaNodeEventType.UpdateChildren).toBe(SchemaNodeEventType.UpdateChildren);
  });

  it('EVENT-066 marks resetInteraction as UpdateState in the same commit', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      clear: { type: 'boolean' },
      target: { type: 'string', controls: { resetInteraction: '../clear' } },
    } });
    loadSchemaNodeAtMount(root, { clear: false, target: 'X' }, SetValueOption.Overwrite);
    const target = root.structure!.target;
    target.interactionState = { [SchemaNodeState.Dirty]: true, [SchemaNodeState.Touched]: true };
    for (const node of root.runtime.deliveries ?? []) node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeSchemaNode(root.structure!.clear, true, 'input', SetValueOption.Overwrite);
    expect((target.pendingDelivery?.type ?? 0) &
      SchemaNodeEventType.UpdateState).toBe(SchemaNodeEventType.UpdateState);
  });

  it('28C-07 marks computed properties when watched emitted values change', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string' }, watcher: { type: 'string',
        controls: { watch: ['../source'] } },
    } });
    writeSchemaNode(root, { source: 'old', watcher: 'fixed' },
      'callerReplace', SetValueOption.Overwrite);
    const watcher = root.structure!.watcher;
    for (const node of root.runtime.deliveries ?? []) node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeSchemaNode(root.structure!.source, 'new', 'input', SetValueOption.Overwrite);
    expect((watcher.pendingDelivery?.type ?? 0) &
      SchemaNodeEventType.UpdateComputedProperties)
      .toBe(SchemaNodeEventType.UpdateComputedProperties);
  });
});

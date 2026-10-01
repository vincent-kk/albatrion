import { describe, expect, it } from 'vitest';

import { EMPTY_REVISION_LEDGER, markSchemaNodeEvent,
  SchemaNodeEventType, SchemaNodeRequestType } from '../../record';
import { NodeState } from '../../types/state';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
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
    expect((root.runtime.deliveries?.get(a)?.type ?? 0) & SchemaNodeEventType.UpdateValue)
      .toBe(SchemaNodeEventType.UpdateValue);
    expect(a.revisionLedger[SchemaNodeEventType.UpdateValue]).toBe(previous + 1);
    expect(b.revisionLedger[SchemaNodeEventType.UpdateValue]).toBe(1);
  });

  it('WRITE-096 carries old and new value references and the caller replacement source', () => {
    const { root } = createTestTree({ type: 'string' });
    writeSchemaNode(root, 'old', 'callerReplace', SetValueOption.Overwrite);
    root.runtime.deliveries?.clear();
    writeSchemaNode(root, 'new', 'callerReplace', SetValueOption.Overwrite);
    const event = root.runtime.deliveries?.get(root);
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
    root.runtime.deliveries?.clear();
    writeSchemaNode(root, { value: 'new' }, 'callerReplace', SetValueOption.Overwrite);
    expect(root.runtime.deliveries?.get(root)?.payload?.[SchemaNodeEventType.UpdateValue])
      .toEqual({ previous, current: { local: root.local, emit: root.emit } });
  });

  it('EVENT-006 includes a pending signal and EVENT-007 bumps its bit once', () => {
    const { root } = createTestTree({ type: 'string' });
    writeSchemaNode(root, 'same', 'callerReplace', SetValueOption.Overwrite);
    root.runtime.deliveries?.clear();
    markSchemaNodeEvent(root, SchemaNodeEventType.RequestFocus);
    writeSchemaNode(root, 'same', 'callerReplace', SetValueOption.Overwrite);
    expect(root.runtime.deliveries?.get(root)?.type).toBe(SchemaNodeEventType.RequestFocus);
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
    expect(root.runtime.deliveries?.get(target)?.options?.[
      SchemaNodeEventType.UpdateValue]).toEqual({ source: 'automatic' });
  });

  it('EVENT-039 and EVENT-071 refresh every loaded node and only changed non-load descendants', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { a: 'one', b: 'same' }, SetValueOption.Overwrite);
    const a = root.structure!.a;
    const b = root.structure!.b;
    expect((root.runtime.deliveries?.get(root)?.type ?? 0) & SchemaNodeEventType.RequestRefresh)
      .toBe(SchemaNodeEventType.RequestRefresh);
    expect((root.runtime.deliveries?.get(a)?.type ?? 0) & SchemaNodeEventType.RequestRefresh)
      .toBe(SchemaNodeEventType.RequestRefresh);
    expect((root.runtime.deliveries?.get(b)?.type ?? 0) & SchemaNodeEventType.RequestRefresh)
      .toBe(SchemaNodeEventType.RequestRefresh);
    root.runtime.deliveries?.clear();
    writeSchemaNode(root, { a: 'two', b: 'same' },
      'callerReplace', SetValueOption.Overwrite);
    expect((root.runtime.deliveries?.get(a)?.type ?? 0) & SchemaNodeEventType.RequestRefresh)
      .toBe(SchemaNodeEventType.RequestRefresh);
    expect((root.runtime.deliveries?.get(b)?.type ?? 0) & SchemaNodeEventType.RequestRefresh).toBe(0);
    expect((root.runtime.deliveries?.get(root)?.type ?? 0) & SchemaNodeEventType.RequestRefresh).toBe(0);
  });

  it('EVENT-064 reports effective schema references separately from computed properties', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' }, value: { type: 'string' },
    }, if: {}, then: { properties: { value: { minLength: 2 } } } });
    writeSchemaNode(root, { enabled: false, value: 'a' },
      'callerReplace', SetValueOption.Overwrite);
    const value = root.structure!.value;
    const previous = value.schema;
    root.runtime.deliveries?.clear();
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    const payload = root.runtime.deliveries?.get(value)?.payload?.[
      SchemaNodeEventType.UpdateJsonSchema];
    expect(payload).toEqual({ previous: previous.schema, current: value.schema.schema });
    expect(Object.isFrozen(payload)).toBe(process.env.NODE_ENV !== 'production');
    expect((root.runtime.deliveries?.get(value)?.type ?? 0) &
      SchemaNodeEventType.UpdateComputedProperties).toBe(0);
  });

  it('EVENT-043 marks root diagnostics only when a commit changes them', () => {
    const { root } = createTestTree({ type: 'string' });
    writeSchemaNode(root, 'first', 'callerReplace', SetValueOption.Overwrite);
    expect((root.runtime.deliveries?.get(root)?.type ?? 0) &
      SchemaNodeEventType.UpdateDiagnostics).toBe(0);
    root.runtime.deliveries?.clear();
    writeSchemaNode(root, 'second', 'callerReplace', SetValueOption.Overwrite);
    expect((root.runtime.deliveries?.get(root)?.type ?? 0) &
      SchemaNodeEventType.UpdateDiagnostics).toBe(0);
    root.runtime.diagnostics = { status: 'degraded', cause: 'budget' };
    writeSchemaNode(root, 'third', 'callerReplace', SetValueOption.Overwrite);
    expect((root.runtime.deliveries?.get(root)?.type ?? 0) &
      SchemaNodeEventType.UpdateDiagnostics).toBe(SchemaNodeEventType.UpdateDiagnostics);
  });

  it('EVENT-066 marks child shape changes even when a conditional value stays empty', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      enabled: { type: 'boolean' },
    }, if: {}, then: { properties: { extra: { type: 'string' } } } });
    writeSchemaNode(root, { enabled: false }, 'callerReplace', SetValueOption.Overwrite);
    root.runtime.deliveries?.clear();
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    expect((root.runtime.deliveries?.get(root)?.type ?? 0) &
      SchemaNodeEventType.UpdateChildren).toBe(SchemaNodeEventType.UpdateChildren);
  });

  it('EVENT-066 marks resetInteraction as UpdateState in the same commit', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      clear: { type: 'boolean' },
      target: { type: 'string', controls: { resetInteraction: '../clear' } },
    } });
    loadSchemaNodeAtMount(root, { clear: false, target: 'X' }, SetValueOption.Overwrite);
    const target = root.structure!.target;
    target.state = { [NodeState.Dirty]: true, [NodeState.Touched]: true };
    root.runtime.deliveries?.clear();
    writeSchemaNode(root.structure!.clear, true, 'input', SetValueOption.Overwrite);
    expect((root.runtime.deliveries?.get(target)?.type ?? 0) &
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
    root.runtime.deliveries?.clear();
    writeSchemaNode(root.structure!.source, 'new', 'input', SetValueOption.Overwrite);
    expect((root.runtime.deliveries?.get(watcher)?.type ?? 0) &
      SchemaNodeEventType.UpdateComputedProperties)
      .toBe(SchemaNodeEventType.UpdateComputedProperties);
  });
});

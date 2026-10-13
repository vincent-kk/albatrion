import { describe, expect, it, vi } from 'vitest';

import {
  EMPTY_REVISION_LEDGER,
  FieldNodeEventType,
  FieldNodeRequestType,
  markFieldNodeEvent,
} from '../../record';
import { FieldNodeState } from '../../types/state';
import { WriteOption } from '../../types/value';
import {
  loadFieldNodeAtMount,
  resetFieldNodeSubtree,
  writeFieldNode,
} from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-delivery
describe('settlement delivery ledger', () => {
  it('LANDING-170 keeps request aliases and omits retired commands', () => {
    expect(FieldNodeRequestType.Refresh).toBe(
      FieldNodeEventType.RequestRefresh,
    );
    expect(FieldNodeRequestType.Remount).toBe(
      FieldNodeEventType.RequestRemount,
    );
    expect(Object.keys(FieldNodeEventType)).not.toContain('RequestEmitChange');
    expect(Object.keys(FieldNodeEventType)).not.toContain('RequestInjection');
  });

  it('EVENT-006 and EVENT-007 mark changed nodes and raise each delivered bit once per commit', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
      },
    });
    expect(root.revisionLedger).toBe(EMPTY_REVISION_LEDGER);
    expect(Object.isFrozen(root.revisionLedger)).toBe(true);
    writeFieldNode(
      root,
      { a: 'first', b: 'same' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.revisionLedger).not.toBe(EMPTY_REVISION_LEDGER);
    const a = root.structure!.a;
    const b = root.structure!.b;
    const previous = a.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0;
    writeFieldNode(
      root,
      { a: 'second', b: 'same' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(
      (a.pendingDelivery?.type ?? 0) & FieldNodeEventType.UpdateValue,
    ).toBe(FieldNodeEventType.UpdateValue);
    expect(a.revisionLedger[FieldNodeEventType.UpdateValue]).toBe(previous + 1);
    expect(b.revisionLedger[FieldNodeEventType.UpdateValue]).toBe(1);
  });

  it('WRITE-096 carries old and new value references and the caller replacement source', () => {
    const { root } = createTestTree({ type: 'string' });
    writeFieldNode(root, 'old', 'callerReplace', WriteOption.Overwrite);
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeFieldNode(root, 'new', 'callerReplace', WriteOption.Overwrite);
    const event = root.pendingDelivery;
    expect(event?.payload?.[FieldNodeEventType.UpdateValue]).toEqual({
      previous: 'old',
      current: 'new',
    });
    expect(event?.options?.[FieldNodeEventType.UpdateValue]).toEqual({
      source: 'callerReplace',
    });
  });

  it('EVENT-023 carries both local and emit for a host value', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        value: { type: 'string' },
      },
    });
    writeFieldNode(
      root,
      { value: 'old' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const previous = { local: root.local, emit: root.emit };
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeFieldNode(
      root,
      { value: 'new' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(
      root.pendingDelivery?.payload?.[FieldNodeEventType.UpdateValue],
    ).toEqual({ previous, current: { local: root.local, emit: root.emit } });
  });

  it('EVENT-006 includes a pending signal and EVENT-007 bumps its bit once', () => {
    const { root } = createTestTree({ type: 'string' });
    writeFieldNode(root, 'same', 'callerReplace', WriteOption.Overwrite);
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    markFieldNodeEvent(root, FieldNodeEventType.RequestFocus);
    writeFieldNode(root, 'same', 'callerReplace', WriteOption.Overwrite);
    expect(root.pendingDelivery?.type).toBe(FieldNodeEventType.RequestFocus);
    expect(root.revisionLedger[FieldNodeEventType.RequestFocus]).toBe(1);
    writeFieldNode(root, 'same', 'callerReplace', WriteOption.Overwrite);
    expect(root.revisionLedger[FieldNodeEventType.RequestFocus]).toBe(1);
  });

  it('EVENT-060 records an automatic derived write as its own source', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
        target: { type: 'string', controls: { derived: '../source' } },
      },
    });
    writeFieldNode(
      root,
      { source: 'A' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const target = root.structure!.target;
    expect(target.local).toBe('A');
    expect(
      target.pendingDelivery?.options?.[FieldNodeEventType.UpdateValue],
    ).toEqual({ source: 'automatic' });
  });

  it('EVENT-039 and EVENT-071 refresh every loaded node and only changed non-load descendants', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(root, { a: 'one', b: 'same' }, WriteOption.Overwrite);
    const a = root.structure!.a;
    const b = root.structure!.b;
    expect(
      (root.pendingDelivery?.type ?? 0) & FieldNodeEventType.RequestRefresh,
    ).toBe(FieldNodeEventType.RequestRefresh);
    expect(
      (a.pendingDelivery?.type ?? 0) & FieldNodeEventType.RequestRefresh,
    ).toBe(FieldNodeEventType.RequestRefresh);
    expect(
      (b.pendingDelivery?.type ?? 0) & FieldNodeEventType.RequestRefresh,
    ).toBe(FieldNodeEventType.RequestRefresh);
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeFieldNode(
      root,
      { a: 'two', b: 'same' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(
      (a.pendingDelivery?.type ?? 0) & FieldNodeEventType.RequestRefresh,
    ).toBe(FieldNodeEventType.RequestRefresh);
    expect(
      (b.pendingDelivery?.type ?? 0) & FieldNodeEventType.RequestRefresh,
    ).toBe(0);
    expect(
      (root.pendingDelivery?.type ?? 0) & FieldNodeEventType.RequestRefresh,
    ).toBe(0);
  });

  it('EVENT-071 and SETTLE-049 refresh an injection target outside the loaded subtree', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        left: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              controls: {
                injectTo: (value: unknown) => ({
                  '../../leftTarget': `left:${value}`,
                }),
              },
            },
          },
        },
        rightSource: {
          type: 'string',
          controls: {
            injectTo: (value: unknown) => ({
              '../rightTarget': `right:${value}`,
            }),
          },
        },
        leftTarget: { type: 'string' },
        rightTarget: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(
      root,
      { left: { source: 'A' }, rightSource: 'B' },
      WriteOption.Overwrite,
    );
    const left = root.structure!.left;
    const source = left.structure!.source;
    const leftTarget = root.structure!.leftTarget;
    const rightTarget = root.structure!.rightTarget;
    writeFieldNode(leftTarget, 'manual-left', 'input', WriteOption.Overwrite);
    writeFieldNode(rightTarget, 'manual-right', 'input', WriteOption.Overwrite);
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    const targetRevision =
      leftTarget.revisionLedger[FieldNodeEventType.RequestRefresh] ?? 0;
    const sourceRevision =
      source.revisionLedger[FieldNodeEventType.RequestRefresh] ?? 0;

    resetFieldNodeSubtree(left, WriteOption.Overwrite);

    expect(leftTarget.raw).toBe('left:A');
    expect(
      (leftTarget.pendingDelivery?.type ?? 0) &
        FieldNodeEventType.RequestRefresh,
    ).toBe(FieldNodeEventType.RequestRefresh);
    expect(leftTarget.revisionLedger[FieldNodeEventType.RequestRefresh]).toBe(
      targetRevision + 1,
    );
    expect(source.raw).toBe('A');
    expect(source.revisionLedger[FieldNodeEventType.RequestRefresh]).toBe(
      sourceRevision + 1,
    );
    expect(rightTarget.raw).toBe('manual-right');
    expect(
      (rightTarget.pendingDelivery?.type ?? 0) &
        FieldNodeEventType.RequestRefresh,
    ).toBe(0);
  });

  it('EVENT-071 and SETTLE-049 omit Refresh when an outside injection leaves raw unchanged', () => {
    const injectTo = vi.fn(() => ({ '../../target': 'injected' }));
    const { root } = createTestTree({
      type: 'object',
      properties: {
        group: {
          type: 'object',
          properties: {
            source: { type: 'string', controls: { injectTo } },
          },
        },
        target: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(
      root,
      { group: { source: 'A' } },
      WriteOption.Overwrite,
    );
    const target = root.structure!.target;
    const revision = target.revisionLedger[FieldNodeEventType.RequestRefresh];
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();

    resetFieldNodeSubtree(root.structure!.group, WriteOption.Overwrite);

    expect(injectTo).toHaveBeenCalledTimes(2);
    expect(target.raw).toBe('injected');
    expect(
      (target.pendingDelivery?.type ?? 0) & FieldNodeEventType.RequestRefresh,
    ).toBe(0);
    expect(target.revisionLedger[FieldNodeEventType.RequestRefresh]).toBe(
      revision,
    );
  });

  it('EVENT-064 reports effective schema references separately from computed properties', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        value: { type: 'string' },
      },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: { properties: { value: { minLength: 2 } } },
    });
    writeFieldNode(
      root,
      { enabled: false, value: 'a' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const value = root.structure!.value;
    const previous = value.schema;
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    const payload =
      value.pendingDelivery?.payload?.[FieldNodeEventType.UpdateJsonSchema];
    expect(payload).toEqual({
      previous: previous.schema,
      current: value.schema.schema,
    });
    expect(Object.isFrozen(payload)).toBe(
      process.env.NODE_ENV !== 'production',
    );
    expect(
      (value.pendingDelivery?.type ?? 0) &
        FieldNodeEventType.UpdateControlledProperties,
    ).toBe(0);
  });

  it('EVENT-043 marks root diagnostics only when a commit changes them', () => {
    const { root } = createTestTree({ type: 'string' });
    writeFieldNode(root, 'first', 'callerReplace', WriteOption.Overwrite);
    expect(
      (root.pendingDelivery?.type ?? 0) & FieldNodeEventType.UpdateDiagnostics,
    ).toBe(0);
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeFieldNode(root, 'second', 'callerReplace', WriteOption.Overwrite);
    expect(
      (root.pendingDelivery?.type ?? 0) & FieldNodeEventType.UpdateDiagnostics,
    ).toBe(0);
    root.runtime.diagnostics = { status: 'degraded', cause: 'budget' };
    writeFieldNode(root, 'third', 'callerReplace', WriteOption.Overwrite);
    expect(
      (root.pendingDelivery?.type ?? 0) & FieldNodeEventType.UpdateDiagnostics,
    ).toBe(FieldNodeEventType.UpdateDiagnostics);
  });

  it('EVENT-066 marks child shape changes even when a conditional value stays empty', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
      },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: { properties: { extra: { type: 'string' } } },
    });
    writeFieldNode(
      root,
      { enabled: false },
      'callerReplace',
      WriteOption.Overwrite,
    );
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeFieldNode(
      root.structure!.enabled,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(
      (root.pendingDelivery?.type ?? 0) & FieldNodeEventType.UpdateChildren,
    ).toBe(FieldNodeEventType.UpdateChildren);
  });

  it('EVENT-066 marks resetInteraction as UpdateState in the same commit', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        clear: { type: 'boolean' },
        target: { type: 'string', controls: { resetInteraction: '../clear' } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { clear: false, target: 'X' },
      WriteOption.Overwrite,
    );
    const target = root.structure!.target;
    target.interactionState = {
      [FieldNodeState.Dirty]: true,
      [FieldNodeState.Touched]: true,
    };
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeFieldNode(root.structure!.clear, true, 'input', WriteOption.Overwrite);
    expect(
      (target.pendingDelivery?.type ?? 0) & FieldNodeEventType.UpdateState,
    ).toBe(FieldNodeEventType.UpdateState);
  });

  it('28C-07 marks computed properties when watched emitted values change', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
        watcher: { type: 'string', controls: { watch: ['../source'] } },
      },
    });
    writeFieldNode(
      root,
      { source: 'old', watcher: 'fixed' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const watcher = root.structure!.watcher;
    for (const node of root.runtime.deliveries ?? [])
      node.pendingDelivery = undefined;
    root.runtime.deliveries?.clear();
    writeFieldNode(
      root.structure!.source,
      'new',
      'input',
      WriteOption.Overwrite,
    );
    expect(
      (watcher.pendingDelivery?.type ?? 0) &
        FieldNodeEventType.UpdateControlledProperties,
    ).toBe(FieldNodeEventType.UpdateControlledProperties);
  });
});

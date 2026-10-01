import { describe, expect, it, vi } from 'vitest';

import { SchemaNodeEventType } from '../../record';
import { NodeState, ValidationMode } from '../../types/state';
import { dispatchBatch, dispatchClearSubtreeState, dispatchSetState,
  dispatchSetSubtreeState, dispatchSetValue, readSchemaNodeRevision,
  subscribeSchemaNode } from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract dispatch-observers
describe('dispatcher state events', () => {
  it('EVENT-012 EVENT-067 43C-01 delivers state and aggregate bits synchronously', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const onChange = vi.fn();
    const onStateChange = vi.fn();
    runtime.onChange = onChange;
    runtime.onStateChange = onStateChange;
    runtime.validationMode = ValidationMode.OnChange;
    const before = runtime.commitNumber;
    const validationStamp = runtime.validationStamp;
    const seen: number[] = [];
    subscribeSchemaNode(root, (event) => seen.push(event.type));

    dispatchSetState(root, { [NodeState.Dirty]: true });

    expect(root.interactionState[NodeState.Dirty]).toBe(true);
    expect(root.raw).toBeUndefined();
    expect(root.emit).toBeUndefined();
    expect(runtime.commitNumber).toBe(before);
    expect(seen).toEqual([
      SchemaNodeEventType.UpdateState | SchemaNodeEventType.UpdateGlobalState,
    ]);
    expect(readSchemaNodeRevision(root, SchemaNodeEventType.UpdateState)).toBe(1);
    expect(readSchemaNodeRevision(root, SchemaNodeEventType.UpdateGlobalState)).toBe(1);
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    expect(runtime.validationStamp).toBe(validationStamp);
  });

  it('EVENT-045 EVENT-067 31C-01 flushes one state event after the settle wave', () => {
    const { root, runtime } = createDispatchTree({ type: 'object', properties: {
      child: { type: 'string' },
    } });
    dispatchSetValue(root, { child: 'old' });
    const child = getDispatchChild(root, 'child');
    const seen: string[] = [];
    const onStateChange = vi.fn();
    runtime.onStateChange = onStateChange;
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeEventType.UpdateValue) seen.push('settle');
    });
    subscribeSchemaNode(child, (event) => {
      if (event.type & SchemaNodeEventType.UpdateState) seen.push('state');
    });

    dispatchBatch(root, () => {
      dispatchSetState(child, { [NodeState.Dirty]: true });
      dispatchSetState(child, { [NodeState.Touched]: true });
      dispatchSetValue(root, { child: 'new' });
      expect(seen).toEqual([]);
    });

    expect(seen).toEqual(['settle', 'state']);
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(readSchemaNodeRevision(child, SchemaNodeEventType.UpdateState)).toBe(1);
  });

  it('SURFACE-053 patches and clears only a live subtree', () => {
    const { root } = createDispatchTree({ type: 'object', properties: {
      first: { type: 'string' }, second: { type: 'string' },
    } });
    dispatchSetValue(root, { first: 'a', second: 'b' });
    const first = getDispatchChild(root, 'first');
    const second = getDispatchChild(root, 'second');

    dispatchSetSubtreeState(first, { [NodeState.Dirty]: true });
    expect(first.interactionState[NodeState.Dirty]).toBe(true);
    expect(second.interactionState[NodeState.Dirty]).toBeUndefined();
    dispatchClearSubtreeState(first);
    expect(first.interactionState[NodeState.Dirty]).toBeUndefined();
  });

  it('NODE-044 ignores state writes on a detached occurrence', () => {
    const { root } = createDispatchTree({ type: 'string' });
    root.detached = true;
    const before = root.interactionState;
    dispatchSetState(root, { [NodeState.Dirty]: true });
    dispatchSetSubtreeState(root, { [NodeState.Touched]: true });
    dispatchClearSubtreeState(root);
    expect(root.interactionState).toBe(before);
    expect(readSchemaNodeRevision(root, SchemaNodeEventType.UpdateState)).toBe(0);
  });

  it('NODE-044 treats a detached target as a no-op during report delivery', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    root.detached = true;
    runtime.reportingErrors = true;
    expect(() => dispatchSetState(root, { [NodeState.Dirty]: true })).not.toThrow();
    expect(() => dispatchClearSubtreeState(root)).not.toThrow();
    expect(root.interactionState[NodeState.Dirty]).toBeUndefined();
  });

  it('ERROR-029 refuses state writes while the error observer is active', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    runtime.reportingErrors = true;
    expect(() => dispatchSetState(root, { [NodeState.Dirty]: true }))
      .toThrowError(expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' }));
    expect(root.interactionState[NodeState.Dirty]).toBeUndefined();
  });

  it('EVENT-067 surfaces an onStateChange failure after state delivery', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const failure = new Error('state observer');
    const seen = vi.fn();
    subscribeSchemaNode(root, seen);
    runtime.onStateChange = () => { throw failure; };
    expect(() => dispatchSetState(root, { [NodeState.Dirty]: true })).toThrow(failure);
    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('EVENT-067 lets an onStateChange write start its own synchronous delivery', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const seen: boolean[] = [];
    let callbacks = 0;
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeEventType.UpdateState)
        seen.push(root.interactionState[NodeState.Touched] === true);
    });
    runtime.onStateChange = () => {
      callbacks += 1;
      if (callbacks === 1)
        dispatchSetState(root, { [NodeState.Touched]: true });
    };
    dispatchBatch(root, () => dispatchSetState(root, { [NodeState.Dirty]: true }));
    expect(seen).toEqual([false, true]);
    expect(callbacks).toBe(2);
    expect(runtime.entryDepth).toBe(0);
  });

  it('EVENT-067 flushes a direct onStateChange write after its first callback', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const seen: boolean[] = [];
    let callbacks = 0;
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeEventType.UpdateState)
        seen.push(root.interactionState[NodeState.Touched] === true);
    });
    runtime.onStateChange = () => {
      callbacks += 1;
      if (callbacks === 1)
        dispatchSetState(root, { [NodeState.Touched]: true });
    };
    dispatchSetState(root, { [NodeState.Dirty]: true });
    expect(seen).toEqual([false, true]);
    expect(callbacks).toBe(2);
  });
});

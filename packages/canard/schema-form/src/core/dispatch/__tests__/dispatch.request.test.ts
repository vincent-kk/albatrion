import { describe, expect, it, vi } from 'vitest';

import { SchemaNodeEventType, SchemaNodeRequestType } from '../../record';
import { ValidationMode } from '../../types/state';
import { dispatchBatch, dispatchRequest, dispatchSetValue, readSchemaNodeRevision,
  subscribeSchemaNode } from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';

describe('dispatcher commands', () => {
  it('EVENT-037 EVENT-073 aliases all four request kinds to event bits', () => {
    expect(SchemaNodeRequestType.Focus).toBe(SchemaNodeEventType.RequestFocus);
    expect(SchemaNodeRequestType.Select).toBe(SchemaNodeEventType.RequestSelect);
    expect(SchemaNodeRequestType.Refresh).toBe(SchemaNodeEventType.RequestRefresh);
    expect(SchemaNodeRequestType.Remount).toBe(SchemaNodeEventType.RequestRemount);
  });

  it('EVENT-063 31C-01 delivers one command synchronously without a value entry', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const seen: number[] = [];
    const onChange = vi.fn();
    runtime.onChange = onChange;
    runtime.validationMode = ValidationMode.OnChange;
    subscribeSchemaNode(root, (event) => seen.push(event.type));
    const before = runtime.commitNumber;
    const validationStamp = runtime.validationStamp;

    dispatchRequest(root, SchemaNodeRequestType.Remount);

    expect(seen).toEqual([SchemaNodeEventType.RequestRemount]);
    expect(root.raw).toBeUndefined();
    expect(root.emit).toBeUndefined();
    expect(runtime.commitNumber).toBe(before);
    expect(runtime.entryDepth).toBe(0);
    expect(readSchemaNodeRevision(root, SchemaNodeEventType.RequestRemount)).toBe(1);
    expect(onChange).not.toHaveBeenCalled();
    expect(runtime.validationStamp).toBe(validationStamp);
  });

  it('EVENT-045 EVENT-073 merges commands once per node inside one entry', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const seen: number[] = [];
    subscribeSchemaNode(root, (event) => seen.push(event.type));
    dispatchBatch(root, () => {
      dispatchRequest(root, SchemaNodeRequestType.Focus);
      dispatchRequest(root, SchemaNodeRequestType.Select);
      dispatchRequest(root, SchemaNodeRequestType.Focus);
      expect(seen).toEqual([]);
    });
    expect(seen).toEqual([
      SchemaNodeEventType.RequestFocus | SchemaNodeEventType.RequestSelect,
    ]);
    expect(readSchemaNodeRevision(root, SchemaNodeEventType.RequestFocus)).toBe(1);
    expect(readSchemaNodeRevision(root, SchemaNodeEventType.RequestSelect)).toBe(1);
  });

  it('EVENT-073 ignores an OR-ed command input', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const seen = vi.fn();
    subscribeSchemaNode(root, seen);
    const combined = SchemaNodeRequestType.Focus | SchemaNodeRequestType.Select;
    dispatchRequest(root, combined);
    expect(seen).not.toHaveBeenCalled();
  });

  it('NODE-044 ignores commands to a detached occurrence', () => {
    const { root } = createDispatchTree({ type: 'string' });
    root.detached = true;
    const seen = vi.fn();
    subscribeSchemaNode(root, seen);
    dispatchRequest(root, SchemaNodeRequestType.Focus);
    expect(seen).not.toHaveBeenCalled();
  });

  it('ERROR-029 refuses commands while the error observer is active', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    runtime.reportingErrors = true;
    expect(() => dispatchRequest(root, SchemaNodeRequestType.Focus))
      .toThrowError(expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' }));
  });

  it('EVENT-010 keeps delivering a synchronous command before throwing a listener failure', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const failure = new Error('command listener');
    const seen = vi.fn();
    subscribeSchemaNode(root, () => { throw failure; });
    subscribeSchemaNode(root, seen);
    expect(() => dispatchRequest(root, SchemaNodeRequestType.Focus)).toThrow(failure);
    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('EVENT-008 delivers a value write caused by a queued command listener', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const seen: string[] = [];
    subscribeSchemaNode(root, (event) => {
      if (event.type & SchemaNodeEventType.RequestFocus) {
        seen.push('command');
        dispatchSetValue(root, 'feedback');
      }
      if (event.type & SchemaNodeEventType.UpdateValue) seen.push('value');
    });
    dispatchBatch(root, () => dispatchRequest(root, SchemaNodeRequestType.Focus));
    expect(seen).toEqual(['command', 'value']);
  });

  it('EVENT-008 puts a listener command in the next wave without reentry', () => {
    const { root } = createDispatchTree({ type: 'string' });
    let active = false;
    let calls = 0;
    let reentered = false;
    subscribeSchemaNode(root, (event) => {
      if (!(event.type & SchemaNodeEventType.RequestFocus)) return;
      if (active) reentered = true;
      active = true;
      calls += 1;
      if (calls === 1) dispatchRequest(root, SchemaNodeRequestType.Focus);
      active = false;
    });
    dispatchRequest(root, SchemaNodeRequestType.Focus);
    expect(calls).toBe(2);
    expect(reentered).toBe(false);
  });
});

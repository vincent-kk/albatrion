import { describe, expect, it, vi } from 'vitest';

import { FieldNodeEventType, FieldNodeRequestType } from '../../record';
import { ValidationMode } from '../../types/state';
import {
  dispatchBatch,
  dispatchRequest,
  dispatchSetValue,
  readFieldNodeRevision,
  subscribeFieldNode,
} from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';

describe('dispatcher commands', () => {
  it('EVENT-037 EVENT-073 aliases all four request kinds to event bits', () => {
    expect(FieldNodeRequestType.Focus).toBe(FieldNodeEventType.RequestFocus);
    expect(FieldNodeRequestType.Select).toBe(FieldNodeEventType.RequestSelect);
    expect(FieldNodeRequestType.Refresh).toBe(
      FieldNodeEventType.RequestRefresh,
    );
    expect(FieldNodeRequestType.Remount).toBe(
      FieldNodeEventType.RequestRemount,
    );
  });

  it('EVENT-063 31C-01 delivers one command synchronously without a value entry', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    const seen: number[] = [];
    const onChange = vi.fn();
    runtime.onChange = onChange;
    runtime.validationMode = ValidationMode.OnChange;
    subscribeFieldNode(root, (event) => seen.push(event.type));
    const before = runtime.commitNumber;
    const validationStamp = runtime.validationStamp;

    dispatchRequest(root, FieldNodeRequestType.Remount);

    expect(seen).toEqual([FieldNodeEventType.RequestRemount]);
    expect(root.raw).toBeUndefined();
    expect(root.emit).toBeUndefined();
    expect(runtime.commitNumber).toBe(before);
    expect(runtime.entryDepth).toBe(0);
    expect(readFieldNodeRevision(root, FieldNodeEventType.RequestRemount)).toBe(
      1,
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(runtime.validationStamp).toBe(validationStamp);
  });

  it('EVENT-045 EVENT-073 merges commands once per node inside one entry', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const seen: number[] = [];
    subscribeFieldNode(root, (event) => seen.push(event.type));
    dispatchBatch(root, () => {
      dispatchRequest(root, FieldNodeRequestType.Focus);
      dispatchRequest(root, FieldNodeRequestType.Select);
      dispatchRequest(root, FieldNodeRequestType.Focus);
      expect(seen).toEqual([]);
    });
    expect(seen).toEqual([
      FieldNodeEventType.RequestFocus | FieldNodeEventType.RequestSelect,
    ]);
    expect(readFieldNodeRevision(root, FieldNodeEventType.RequestFocus)).toBe(
      1,
    );
    expect(readFieldNodeRevision(root, FieldNodeEventType.RequestSelect)).toBe(
      1,
    );
  });

  it('EVENT-073 ignores an OR-ed command input', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const seen = vi.fn();
    subscribeFieldNode(root, seen);
    const combined = FieldNodeRequestType.Focus | FieldNodeRequestType.Select;
    dispatchRequest(root, combined);
    expect(seen).not.toHaveBeenCalled();
  });

  it('NODE-044 ignores commands to a detached occurrence', () => {
    const { root } = createDispatchTree({ type: 'string' });
    root.detached = true;
    const seen = vi.fn();
    subscribeFieldNode(root, seen);
    dispatchRequest(root, FieldNodeRequestType.Focus);
    expect(seen).not.toHaveBeenCalled();
  });

  it('ERROR-029 refuses commands while the error observer is active', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    runtime.reportingErrors = true;
    expect(() =>
      dispatchRequest(root, FieldNodeRequestType.Focus),
    ).toThrowError(
      expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER' }),
    );
  });

  it('EVENT-010 keeps delivering a synchronous command before throwing a listener failure', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const failure = new Error('command listener');
    const seen = vi.fn();
    subscribeFieldNode(root, () => {
      throw failure;
    });
    subscribeFieldNode(root, seen);
    expect(() => dispatchRequest(root, FieldNodeRequestType.Focus)).toThrow(
      failure,
    );
    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('EVENT-008 delivers a value write caused by a queued command listener', () => {
    const { root } = createDispatchTree({ type: 'string' });
    const seen: string[] = [];
    subscribeFieldNode(root, (event) => {
      if (event.type & FieldNodeEventType.RequestFocus) {
        seen.push('command');
        dispatchSetValue(root, 'feedback');
      }
      if (event.type & FieldNodeEventType.UpdateValue) seen.push('value');
    });
    dispatchBatch(root, () =>
      dispatchRequest(root, FieldNodeRequestType.Focus),
    );
    expect(seen).toEqual(['command', 'value']);
  });

  it('EVENT-008 puts a listener command in the next wave without reentry', () => {
    const { root } = createDispatchTree({ type: 'string' });
    let active = false;
    let calls = 0;
    let reentered = false;
    subscribeFieldNode(root, (event) => {
      if (!(event.type & FieldNodeEventType.RequestFocus)) return;
      if (active) reentered = true;
      active = true;
      calls += 1;
      if (calls === 1) dispatchRequest(root, FieldNodeRequestType.Focus);
      active = false;
    });
    dispatchRequest(root, FieldNodeRequestType.Focus);
    expect(calls).toBe(2);
    expect(reentered).toBe(false);
  });
});

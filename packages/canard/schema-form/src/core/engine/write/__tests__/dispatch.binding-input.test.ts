import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import {
  FieldNodeState,
  ValidationMode,
} from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchFinishInput } from '../utils/entry/dispatchFinishInput';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchSetExternalErrors } from '../utils/entry/dispatchSetExternalErrors';
import { dispatchSetState } from '../utils/entry/dispatchSetState';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { dispatchWriteInput } from '../utils/entry/dispatchWriteInput';
import { readFieldNodeRevision } from '../utils/read/readFieldNodeRevision';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';
import { getDispatchChild } from './fixtures/getDispatchChild';

describe('binding input entries', () => {
  it('REACT-009 later partial ancestor writes preserve untouched input provenance', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        input: { type: 'string' },
        other: { type: 'string' },
      },
    });
    dispatchMount(root, { input: 'old', other: 'old' });
    const input = getDispatchChild(root, 'input');
    const listener = vi.fn();
    subscribeFieldNode(input, listener);
    dispatchBatch(root, () => {
      dispatchWriteInput(input, 'typed');
      dispatchSetValue(root, { other: 'external' }, WriteOption.Merge);
    });
    expect(input.local).toBe('typed');
    expect(
      listener.mock.calls[0][0].options[FieldNodeEventType.UpdateValue],
    ).toEqual({ source: 'input' });
    expect(runtime.refreshTargets?.has(input.path)).toBe(false);
    expect(runtime.refreshTargets?.has('/other')).toBe(true);
  });

  it('REACT-009 mixed batch keeps each final write source and only excludes input targets', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        input: { type: 'string' },
        caller: { type: 'string' },
      },
    });
    dispatchMount(root, { input: 'old', caller: 'old' });
    const input = getDispatchChild(root, 'input');
    const caller = getDispatchChild(root, 'caller');
    const listener = vi.fn();
    subscribeFieldNode(input, listener);
    dispatchBatch(root, () => {
      dispatchWriteInput(input, 'typed');
      dispatchSetValue(caller, 'external');
    });
    expect(
      listener.mock.calls[0][0].options[FieldNodeEventType.UpdateValue],
    ).toEqual({ source: 'input' });
    expect(runtime.refreshTargets?.has(input.path)).toBe(false);
    expect(runtime.refreshTargets?.has(caller.path)).toBe(true);
    dispatchBatch(root, () => {
      dispatchWriteInput(input, 'typed again');
      dispatchSetValue(input, 'replaced');
    });
    expect(
      listener.mock.lastCall![0].options[FieldNodeEventType.UpdateValue],
    ).toEqual({ source: 'callerReplace' });
    expect(runtime.refreshTargets?.has(input.path)).toBe(true);
  });

  it('WRITE-083 finish in a batch trims the pending input and preserves automatic source', () => {
    const { root, runtime } = createDispatchTree({
      type: 'string',
      options: { trim: true },
    });
    dispatchMount(root, ' old ');
    const listener = vi.fn();
    subscribeFieldNode(root, listener);
    dispatchBatch(root, () => {
      dispatchWriteInput(root, ' new ');
      dispatchFinishInput(root);
    });
    expect(root.local).toBe('new');
    expect(
      listener.mock.calls[0][0].options[FieldNodeEventType.UpdateValue],
    ).toEqual({ source: 'automatic' });
    expect(runtime.refreshTargets?.has('')).toBe(true);
  });

  it('REACT-010 marked input groups value, external-error clearing and dirty in one commit', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'old');
    dispatchSetExternalErrors(root, [{ dataPath: '', message: 'external' }]);
    const before = runtime.commitNumber;
    dispatchWriteInput(root, 'new');
    expect(root.local).toBe('new');
    expect(runtime.nodeErrors?.has(root)).toBe(false);
    expect(root.interactionState[FieldNodeState.Dirty]).toBe(true);
    expect(runtime.commitNumber).toBe((before ?? 0) + 1);
  });

  it('REACT-009 input source excludes its target but refreshes derived peers', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        input: { type: 'string' },
        copy: { type: 'string', controls: { derived: '../input' } },
        kept: { type: 'string' },
      },
    });
    dispatchMount(root, { input: 'old', kept: 'same' });
    const input = getDispatchChild(root, 'input');
    const copy = getDispatchChild(root, 'copy');
    const listener = vi.fn();
    subscribeFieldNode(input, listener);
    const refresh = readFieldNodeRevision(
      input,
      FieldNodeEventType.RequestRefresh,
    );
    dispatchWriteInput(input, 'new');
    expect(
      listener.mock.calls[0][0].options[FieldNodeEventType.UpdateValue],
    ).toEqual({ source: 'input' });
    expect(
      readFieldNodeRevision(input, FieldNodeEventType.RequestRefresh),
    ).toBe(refresh);
    expect(runtime.refreshTargets?.has(input.path)).toBe(false);
    expect(runtime.refreshTargets?.has(copy.path)).toBe(true);
    expect(runtime.refreshTargets?.has('/kept')).toBe(false);
  });

  it('REACT-009 batch preserves input source and Refresh exclusion', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'old');
    const listener = vi.fn();
    subscribeFieldNode(root, listener);
    dispatchBatch(root, () => dispatchWriteInput(root, 'new'));
    expect(
      listener.mock.calls[0][0].options[FieldNodeEventType.UpdateValue],
    ).toEqual({ source: 'input' });
    expect(runtime.refreshTargets?.size).toBe(0);
  });

  it('WRITE-083 finish trims automatically without clearing errors or dirty and refreshes input', () => {
    const { root, runtime } = createDispatchTree({
      type: 'string',
      options: { trim: true },
    });
    dispatchMount(root, '  value  ');
    const errors = [{ dataPath: '', message: 'external' }];
    dispatchSetExternalErrors(root, errors);
    dispatchSetState(root, { [FieldNodeState.Dirty]: true });
    const state = root.interactionState;
    const listener = vi.fn();
    subscribeFieldNode(root, listener);
    const refresh = readFieldNodeRevision(
      root,
      FieldNodeEventType.RequestRefresh,
    );
    dispatchFinishInput(root);
    expect(root.local).toBe('value');
    expect(runtime.nodeErrors?.get(root)).toBe(errors);
    expect(root.interactionState).toBe(state);
    expect(readFieldNodeRevision(root, FieldNodeEventType.RequestRefresh)).toBe(
      refresh + 1,
    );
    expect(
      listener.mock.calls[0][0].options[FieldNodeEventType.UpdateValue],
    ).toEqual({ source: 'automatic' });
  });

  it('WRITE-083 unchanged finish makes no commit or delivery', () => {
    const { root, runtime } = createDispatchTree({
      type: 'string',
      options: { trim: true },
    });
    dispatchMount(root, 'value');
    const commit = runtime.commitNumber;
    const listener = vi.fn();
    subscribeFieldNode(root, listener);
    dispatchFinishInput(root);
    expect(runtime.commitNumber).toBe(commit);
    expect(listener).not.toHaveBeenCalled();
  });

  it('WRITE-083 form and call suppression prevent trim before the behavior runs', () => {
    const { root, runtime } = createDispatchTree({
      type: 'string',
      options: { trim: true },
    });
    dispatchMount(root, ' value ');
    runtime.disableAutomaticWrites = true;
    const commit = runtime.commitNumber;
    dispatchFinishInput(root);
    expect(root.local).toBe(' value ');
    runtime.disableAutomaticWrites = false;
    dispatchFinishInput(root, WriteOption.DisableAutomaticWrites);
    expect(root.local).toBe(' value ');
    expect(runtime.commitNumber).toBe(commit);
  });

  it('69C-05 deferred mount omits validation while default mount requests it once', () => {
    const validate = vi.fn(() => null);
    const validator = {
      compile: () => validate,
      compileGuard: () => () => true,
    };
    const deferred = createDispatchTree(
      { type: 'string' },
      undefined,
      validator,
    );
    deferred.runtime.validationMode = ValidationMode.OnChange;
    dispatchMount(deferred.root, 'first', undefined, {
      deferValidation: true,
    });
    expect(deferred.runtime.validationPendingTargets).toBeUndefined();
    const immediate = createDispatchTree(
      { type: 'string' },
      undefined,
      validator,
    );
    immediate.runtime.validationMode = ValidationMode.OnChange;
    dispatchMount(immediate.root, 'second');
    expect(
      immediate.runtime.validationStamp! -
        immediate.runtime.validationLoadStamp!,
    ).toBe(1);
    expect(
      immediate.runtime.validationPendingTargets?.has(immediate.root),
    ).toBe(true);
  });
});

describe('binding input of a virtual node (R2)', () => {
  it('rejects an invalid virtual shape at the value mark and leaves external errors, state and value untouched', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        startDate: { type: 'string' },
        endDate: { type: 'string' },
      },
      options: { virtual: { period: { fields: ['startDate', 'endDate'] } } },
    });
    dispatchMount(root, { startDate: 's0', endDate: 'e0' });
    const period = getDispatchChild(root, 'period');
    const issue = { dataPath: '/period', message: 'server' };
    dispatchSetExternalErrors(period, [issue]);
    expect(() => dispatchWriteInput(period, 'bad')).toThrow(
      'Invalid virtual node values at /period',
    );
    expect(runtime.nodeErrors?.get(period)).toEqual([issue]);
    expect(period.interactionState).toEqual({});
    expect(root.emit).toEqual({ startDate: 's0', endDate: 'e0' });
  });
});

import { describe, expect, it, vi } from 'vitest';
import { SchemaNodeState, ValidationMode } from '../../types/state';
import { SetValueOption } from '../../types/value';
import { SchemaNodeEventType } from '../../record';
import * as dispatch from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';
import { getDispatchChild } from './fixtures/getDispatchChild';

describe('binding input entries', () => {
  it('REACT-009 later partial ancestor writes preserve untouched input provenance', () => {
    const { root, runtime } = createDispatchTree({ type: 'object', properties: {
      input: { type: 'string' }, other: { type: 'string' },
    } });
    dispatch.dispatchMount(root, { input: 'old', other: 'old' });
    const input = getDispatchChild(root, 'input');
    const listener = vi.fn();
    dispatch.subscribeSchemaNode(input, listener);
    dispatch.dispatchBatch(root, () => {
      dispatch.dispatchWriteInput(input, 'typed');
      dispatch.dispatchSetValue(root, { other: 'external' }, SetValueOption.Merge);
    });
    expect(input.local).toBe('typed');
    expect(listener.mock.calls[0][0].options[SchemaNodeEventType.UpdateValue]).toEqual({ source: 'input' });
    expect(runtime.refreshTargets?.has(input.path)).toBe(false);
    expect(runtime.refreshTargets?.has('/other')).toBe(true);
  });

  it('REACT-009 mixed batch keeps each final write source and only excludes input targets', () => {
    const { root, runtime } = createDispatchTree({ type: 'object', properties: {
      input: { type: 'string' }, caller: { type: 'string' },
    } });
    dispatch.dispatchMount(root, { input: 'old', caller: 'old' });
    const input = getDispatchChild(root, 'input');
    const caller = getDispatchChild(root, 'caller');
    const listener = vi.fn();
    dispatch.subscribeSchemaNode(input, listener);
    dispatch.dispatchBatch(root, () => {
      dispatch.dispatchWriteInput(input, 'typed');
      dispatch.dispatchSetValue(caller, 'external');
    });
    expect(listener.mock.calls[0][0].options[SchemaNodeEventType.UpdateValue]).toEqual({ source: 'input' });
    expect(runtime.refreshTargets?.has(input.path)).toBe(false);
    expect(runtime.refreshTargets?.has(caller.path)).toBe(true);
    dispatch.dispatchBatch(root, () => {
      dispatch.dispatchWriteInput(input, 'typed again');
      dispatch.dispatchSetValue(input, 'replaced');
    });
    expect(listener.mock.lastCall![0].options[SchemaNodeEventType.UpdateValue]).toEqual({ source: 'callerReplace' });
    expect(runtime.refreshTargets?.has(input.path)).toBe(true);
  });

  it('WRITE-083 finish in a batch trims the pending input and preserves automatic source', () => {
    const { root, runtime } = createDispatchTree({ type: 'string', options: { trim: true } });
    dispatch.dispatchMount(root, ' old ');
    const listener = vi.fn();
    dispatch.subscribeSchemaNode(root, listener);
    dispatch.dispatchBatch(root, () => {
      dispatch.dispatchWriteInput(root, ' new ');
      dispatch.dispatchFinishInput(root);
    });
    expect(root.local).toBe('new');
    expect(listener.mock.calls[0][0].options[SchemaNodeEventType.UpdateValue]).toEqual({ source: 'automatic' });
    expect(runtime.refreshTargets?.has('')).toBe(true);
  });

  it('REACT-010 marked input groups value, external-error clearing and dirty in one commit', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatch.dispatchMount(root, 'old');
    dispatch.dispatchSetExternalErrors(root, [{ dataPath: '', message: 'external' }]);
    const before = runtime.commitNumber;
    dispatch.dispatchWriteInput(root, 'new');
    expect(root.local).toBe('new');
    expect(runtime.nodeErrors?.has(root)).toBe(false);
    expect(root.interactionState[SchemaNodeState.Dirty]).toBe(true);
    expect(runtime.commitNumber).toBe((before ?? 0) + 1);
  });

  it('REACT-009 input source excludes its target but refreshes derived peers', () => {
    const { root, runtime } = createDispatchTree({ type: 'object', properties: {
      input: { type: 'string' },
      copy: { type: 'string', controls: { derived: '../input' } },
      kept: { type: 'string' },
    } });
    dispatch.dispatchMount(root, { input: 'old', kept: 'same' });
    const input = getDispatchChild(root, 'input');
    const copy = getDispatchChild(root, 'copy');
    const listener = vi.fn();
    dispatch.subscribeSchemaNode(input, listener);
    const refresh = dispatch.readSchemaNodeRevision(input, SchemaNodeEventType.RequestRefresh);
    dispatch.dispatchWriteInput(input, 'new');
    expect(listener.mock.calls[0][0].options[SchemaNodeEventType.UpdateValue]).toEqual({ source: 'input' });
    expect(dispatch.readSchemaNodeRevision(input, SchemaNodeEventType.RequestRefresh)).toBe(refresh);
    expect(runtime.refreshTargets?.has(input.path)).toBe(false);
    expect(runtime.refreshTargets?.has(copy.path)).toBe(true);
    expect(runtime.refreshTargets?.has('/kept')).toBe(false);
  });

  it('REACT-009 batch preserves input source and Refresh exclusion', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatch.dispatchMount(root, 'old');
    const listener = vi.fn();
    dispatch.subscribeSchemaNode(root, listener);
    dispatch.dispatchBatch(root, () => dispatch.dispatchWriteInput(root, 'new'));
    expect(listener.mock.calls[0][0].options[SchemaNodeEventType.UpdateValue]).toEqual({ source: 'input' });
    expect(runtime.refreshTargets?.size).toBe(0);
  });

  it('WRITE-083 finish trims automatically without clearing errors or dirty and refreshes input', () => {
    const { root, runtime } = createDispatchTree({ type: 'string', options: { trim: true } });
    dispatch.dispatchMount(root, '  value  ');
    const errors = [{ dataPath: '', message: 'external' }];
    dispatch.dispatchSetExternalErrors(root, errors);
    dispatch.dispatchSetState(root, { [SchemaNodeState.Dirty]: true });
    const state = root.interactionState;
    const listener = vi.fn();
    dispatch.subscribeSchemaNode(root, listener);
    const refresh = dispatch.readSchemaNodeRevision(root, SchemaNodeEventType.RequestRefresh);
    dispatch.dispatchFinishInput(root);
    expect(root.local).toBe('value');
    expect(runtime.nodeErrors?.get(root)).toBe(errors);
    expect(root.interactionState).toBe(state);
    expect(dispatch.readSchemaNodeRevision(root, SchemaNodeEventType.RequestRefresh)).toBe(refresh + 1);
    expect(listener.mock.calls[0][0].options[SchemaNodeEventType.UpdateValue]).toEqual({ source: 'automatic' });
  });

  it('WRITE-083 unchanged finish makes no commit or delivery', () => {
    const { root, runtime } = createDispatchTree({ type: 'string', options: { trim: true } });
    dispatch.dispatchMount(root, 'value');
    const commit = runtime.commitNumber;
    const listener = vi.fn();
    dispatch.subscribeSchemaNode(root, listener);
    dispatch.dispatchFinishInput(root);
    expect(runtime.commitNumber).toBe(commit);
    expect(listener).not.toHaveBeenCalled();
  });

  it('WRITE-083 form and call suppression prevent trim before the behavior runs', () => {
    const { root, runtime } = createDispatchTree({ type: 'string', options: { trim: true } });
    dispatch.dispatchMount(root, ' value ');
    runtime.disableAutomaticWrites = true;
    const commit = runtime.commitNumber;
    dispatch.dispatchFinishInput(root);
    expect(root.local).toBe(' value ');
    runtime.disableAutomaticWrites = false;
    dispatch.dispatchFinishInput(root, SetValueOption.DisableAutomaticWrites);
    expect(root.local).toBe(' value ');
    expect(runtime.commitNumber).toBe(commit);
  });

  it('69C-05 deferred mount omits validation while default mount requests it once', () => {
    const validate = vi.fn(() => null);
    const validator = { compile: () => validate, compileGuard: () => () => true };
    const deferred = createDispatchTree({ type: 'string' }, undefined, validator);
    deferred.runtime.validationMode = ValidationMode.OnChange;
    dispatch.dispatchMount(deferred.root, 'first', undefined, { deferValidation: true });
    expect(deferred.runtime.validationPendingTargets).toBeUndefined();
    const immediate = createDispatchTree({ type: 'string' }, undefined, validator);
    immediate.runtime.validationMode = ValidationMode.OnChange;
    dispatch.dispatchMount(immediate.root, 'second');
    expect(immediate.runtime.validationStamp).toBe(1);
    expect(immediate.runtime.validationPendingTargets?.has(immediate.root)).toBe(true);
  });
});

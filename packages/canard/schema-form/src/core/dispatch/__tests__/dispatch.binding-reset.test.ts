import { describe, expect, it, vi } from 'vitest';
import { SchemaNodeState } from '../../types/state';
import { SchemaNodeEventType } from '../../record';
import * as dispatch from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';
import { getDispatchChild } from './fixtures/getDispatchChild';

const schema = { type: 'object', properties: { child: { type: 'string' } } };

describe('binding load lifetime', () => {
  it('REACT-010 WRITE-046 adoption inside an input updater drops the rest of the marked entry', () => {
    const previous = createDispatchTree({ type: 'string' }, 'old');
    dispatch.dispatchMount(previous.root);
    dispatch.dispatchSetExternalErrors(previous.root, [{ dataPath: '', message: 'kept' }]);
    const oldState = previous.root.interactionState;
    const next = createDispatchTree({ type: 'string' }, 'new');
    expect(() => dispatch.dispatchWriteInput(previous.root, () => {
      dispatch.adoptSchemaNodeChain(previous.root, next.root);
      dispatch.dispatchMount(next.root);
      return 'late';
    })).not.toThrow();
    expect(previous.root.local).toBe('old');
    expect(previous.root.interactionState).toBe(oldState);
    expect(previous.runtime.nodeErrors?.get(previous.root)).toEqual([{ dataPath: '', message: 'kept' }]);
    expect(next.root.local).toBe('new');
  });

  it('REACT-024 virtual aliases advance interaction reset once per occurrence', () => {
    const { root } = createDispatchTree({ type: 'object', properties: {
      child: { type: 'string' },
    }, options: { virtual: { alias: { fields: ['child'] } } } });
    dispatch.dispatchMount(root, { child: 'old' });
    const child = getDispatchChild(root, 'child');
    dispatch.dispatchClearSubtreeState(root);
    expect(child.interactionReset).toBe(1);
    dispatch.dispatchResetForm(root, { child: 'new' });
    expect(child.interactionReset).toBe(2);
  });

  it('WRITE-046 disposed validation cannot mutate the last committed errors', async () => {
    const validate = vi.fn(() => [{ dataPath: '', message: 'new error' }]);
    const validator = { compile: () => validate, compileGuard: () => () => true };
    const previous = createDispatchTree({ type: 'string' }, 'old', validator);
    dispatch.dispatchMount(previous.root);
    const next = createDispatchTree({ type: 'string' });
    dispatch.adoptSchemaNodeChain(previous.root, next.root);
    const revision = dispatch.readSchemaNodeRevision(previous.root);
    expect(await dispatch.dispatchValidate(previous.root)).toEqual([
      { dataPath: '', message: 'new error' },
    ]);
    expect(validate).toHaveBeenCalledWith('old');
    expect(previous.runtime.validationErrors?.size ?? 0).toBe(0);
    expect(dispatch.readSchemaNodeRevision(previous.root)).toBe(revision);
  });

  it('WRITE-045 form reset clears external and validation errors', () => {
    const { root, runtime } = createDispatchTree(schema, { child: 'base' });
    dispatch.dispatchMount(root);
    const child = getDispatchChild(root, 'child');
    dispatch.dispatchSetExternalErrors(child, [{ dataPath: '/child', message: 'external' }]);
    runtime.validationErrors = new Map([[child, [{ dataPath: '/child' }]]]);
    dispatch.dispatchResetForm(root, root.runtime.loadSnapshot);
    expect(runtime.nodeErrors?.size ?? 0).toBe(0);
    expect(runtime.validationErrors?.size ?? 0).toBe(0);
  });

  it('WRITE-045 adoption carries external errors to newly mounted occurrences by path', () => {
    const previous = createDispatchTree(schema);
    dispatch.dispatchMount(previous.root, { child: 'old' });
    const oldChild = getDispatchChild(previous.root, 'child');
    const errors = [{ dataPath: '/child', message: 'external' }];
    dispatch.dispatchSetExternalErrors(oldChild, errors);
    const next = createDispatchTree(schema);
    dispatch.adoptSchemaNodeChain(previous.root, next.root);
    dispatch.dispatchMount(next.root, { child: 'new' });
    expect(next.runtime.nodeErrors?.has(oldChild)).toBe(false);
    expect(next.runtime.nodeErrors?.get(getDispatchChild(next.root, 'child'))).toBe(errors);
  });

  it('WRITE-046 disposal advances both numbers without notification and preserves old reads and references', () => {
    const previous = createDispatchTree(schema);
    dispatch.dispatchMount(previous.root, { child: 'old' });
    const child = getDispatchChild(previous.root, 'child');
    const nodes = [previous.root, child];
    const values = nodes.map((node) => node.local);
    const children = previous.root.children;
    const listener = vi.fn();
    const counters = nodes.map((node) => {
      dispatch.subscribeSchemaNode(node, listener);
      return [dispatch.readSchemaNodeRevision(node, SchemaNodeEventType.RequestRefresh), node.interactionReset];
    });
    const next = createDispatchTree(schema);
    dispatch.adoptSchemaNodeChain(previous.root, next.root);
    for (const [index, node] of nodes.entries()) {
      expect(node.disposed).toBe(true);
      expect(node.local).toBe(values[index]);
      expect(dispatch.readSchemaNodeRevision(node, SchemaNodeEventType.RequestRefresh)).toBe(counters[index][0] + 1);
      expect(node.interactionReset).toBe(counters[index][1] + 1);
    }
    expect(previous.root.children).toBe(children);
    expect(child.parent).toBe(previous.root);
    expect(child.rootNode).toBe(previous.root);
    expect(previous.runtime.listeners?.size ?? 0).toBe(0);
    expect(listener).not.toHaveBeenCalled();
    dispatch.dispatchMount(next.root, { child: 'new' });
    expect(listener).not.toHaveBeenCalled();
    expect(child.local).toBe('old');
  });

  it('WRITE-046 marked late input is dropped and unmarked writes throw DISPOSED_NODE_WRITE', () => {
    const previous = createDispatchTree(schema);
    dispatch.dispatchMount(previous.root, { child: 'old' });
    const child = getDispatchChild(previous.root, 'child');
    dispatch.adoptSchemaNodeChain(previous.root, createDispatchTree(schema).root);
    expect(() => dispatch.dispatchWriteInput(child, 'late')).not.toThrow();
    expect(child.local).toBe('old');
    expect(() => dispatch.dispatchSetValue(child, 'late')).toThrowError(
      expect.objectContaining({ code: expect.stringContaining('DISPOSED_NODE_WRITE') }));
    expect(() => dispatch.dispatchSetState(child, { [SchemaNodeState.Dirty]: true })).toThrowError(
      expect.objectContaining({ code: expect.stringContaining('DISPOSED_NODE_WRITE') }));
  });

  it('REACT-024 only reset raisers advance interaction reset, including already empty flags', () => {
    const { root } = createDispatchTree({ type: 'object', properties: {
      clear: { type: 'boolean' },
      child: { type: 'string', controls: { resetInteraction: '../clear' } },
    } });
    dispatch.dispatchMount(root, { clear: false, child: 'old' });
    const child = getDispatchChild(root, 'child');
    expect(child.interactionReset).toBe(0);
    dispatch.dispatchSetValue(child, 'new');
    expect(child.interactionReset).toBe(0);
    dispatch.dispatchClearSubtreeState(child);
    expect(child.interactionReset).toBe(1);
    dispatch.dispatchSetState(child, { [SchemaNodeState.Touched]: true });
    dispatch.dispatchSetValue(getDispatchChild(root, 'clear'), true);
    expect(child.interactionReset).toBe(2);
    dispatch.dispatchResetForm(root, { clear: false, child: 'base' });
    expect(child.interactionReset).toBe(3);
  });
});

import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { FieldNodeState } from '@/schema-form/core/engine/types/state';

import { adoptFieldNodeChain } from '../utils/chain/adoptFieldNodeChain';
import { dispatchClearSubtreeState } from '../utils/entry/dispatchClearSubtreeState';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchResetForm } from '../utils/entry/dispatchResetForm';
import { dispatchSetExternalErrors } from '../utils/entry/dispatchSetExternalErrors';
import { dispatchSetState } from '../utils/entry/dispatchSetState';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { dispatchValidate } from '../utils/entry/dispatchValidate';
import { dispatchWriteInput } from '../utils/entry/dispatchWriteInput';
import { readFieldNodeRevision } from '../utils/read/readFieldNodeRevision';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';
import { getDispatchChild } from './fixtures/getDispatchChild';

const schema = { type: 'object', properties: { child: { type: 'string' } } };

// filid:contract settle-disposal settle-form-reset-errors
describe('binding load lifetime', () => {
  it('REACT-010 WRITE-046 adoption inside an input updater drops the rest of the marked entry', () => {
    const previous = createDispatchTree({ type: 'string' }, 'old');
    dispatchMount(previous.root);
    dispatchSetExternalErrors(previous.root, [
      { dataPath: '', message: 'kept' },
    ]);
    const oldState = previous.root.interactionState;
    const next = createDispatchTree({ type: 'string' }, 'new');
    expect(() =>
      dispatchWriteInput(previous.root, () => {
        adoptFieldNodeChain(previous.root, next.root);
        dispatchMount(next.root);
        return 'late';
      }),
    ).not.toThrow();
    expect(previous.root.local).toBe('old');
    expect(previous.root.interactionState).toBe(oldState);
    expect(previous.runtime.nodeErrors?.get(previous.root)).toEqual([
      { dataPath: '', message: 'kept' },
    ]);
    expect(next.root.local).toBe('new');
  });

  it('REACT-024 virtual aliases advance interaction reset once per occurrence', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        child: { type: 'string' },
      },
      options: { virtual: { alias: { fields: ['child'] } } },
    });
    dispatchMount(root, { child: 'old' });
    const child = getDispatchChild(root, 'child');
    dispatchClearSubtreeState(root);
    expect(child.interactionReset).toBe(1);
    dispatchResetForm(root, { child: 'new' });
    expect(child.interactionReset).toBe(2);
  });

  it('WRITE-046 disposed validation cannot mutate the last committed errors', async () => {
    const validate = vi.fn(() => [{ dataPath: '', message: 'new error' }]);
    const validator = {
      compile: () => validate,
      compileGuard: () => () => true,
    };
    const previous = createDispatchTree({ type: 'string' }, 'old', validator);
    dispatchMount(previous.root);
    const next = createDispatchTree({ type: 'string' });
    adoptFieldNodeChain(previous.root, next.root);
    const revision = readFieldNodeRevision(previous.root);
    expect(await dispatchValidate(previous.root)).toEqual([
      { dataPath: '', message: 'new error' },
    ]);
    expect(validate).toHaveBeenCalledWith('old');
    expect(previous.runtime.validationErrors?.size ?? 0).toBe(0);
    expect(readFieldNodeRevision(previous.root)).toBe(revision);
  });

  it('WRITE-045 form reset clears external and validation errors', () => {
    const { root, runtime } = createDispatchTree(schema, { child: 'base' });
    dispatchMount(root);
    const child = getDispatchChild(root, 'child');
    dispatchSetExternalErrors(child, [
      { dataPath: '/child', message: 'external' },
    ]);
    runtime.validationErrors = new Map([[child, [{ dataPath: '/child' }]]]);
    dispatchResetForm(root, root.runtime.loadSnapshot);
    expect(runtime.nodeErrors?.size ?? 0).toBe(0);
    expect(runtime.validationErrors?.size ?? 0).toBe(0);
  });

  it('WRITE-045 adoption carries external errors to newly mounted occurrences by path', () => {
    const previous = createDispatchTree(schema);
    dispatchMount(previous.root, { child: 'old' });
    const oldChild = getDispatchChild(previous.root, 'child');
    const errors = [{ dataPath: '/child', message: 'external' }];
    dispatchSetExternalErrors(oldChild, errors);
    const next = createDispatchTree(schema);
    adoptFieldNodeChain(previous.root, next.root);
    dispatchMount(next.root, { child: 'new' });
    expect(next.runtime.nodeErrors?.has(oldChild)).toBe(false);
    expect(
      next.runtime.nodeErrors?.get(getDispatchChild(next.root, 'child')),
    ).toBe(errors);
  });

  it('WRITE-046 disposal advances both numbers without notification and preserves old reads and references', () => {
    const previous = createDispatchTree(schema);
    dispatchMount(previous.root, { child: 'old' });
    const child = getDispatchChild(previous.root, 'child');
    const nodes = [previous.root, child];
    const values = nodes.map((node) => node.local);
    const children = previous.root.children;
    const listener = vi.fn();
    const counters = nodes.map((node) => {
      subscribeFieldNode(node, listener);
      return [
        readFieldNodeRevision(node, FieldNodeEventType.RequestRefresh),
        node.interactionReset,
      ];
    });
    const next = createDispatchTree(schema);
    adoptFieldNodeChain(previous.root, next.root);
    for (const [index, node] of nodes.entries()) {
      expect(node.disposed).toBe(true);
      expect(node.local).toBe(values[index]);
      expect(
        readFieldNodeRevision(node, FieldNodeEventType.RequestRefresh),
      ).toBe(counters[index][0] + 1);
      expect(node.interactionReset).toBe(counters[index][1] + 1);
    }
    expect(previous.root.children).toBe(children);
    expect(child.parent).toBe(previous.root);
    expect(child.rootNode).toBe(previous.root);
    expect(previous.runtime.listeners?.size ?? 0).toBe(0);
    expect(listener).not.toHaveBeenCalled();
    dispatchMount(next.root, { child: 'new' });
    expect(listener).not.toHaveBeenCalled();
    expect(child.local).toBe('old');
  });

  it('WRITE-046 marked late input is dropped and unmarked writes throw DISPOSED_NODE_WRITE', () => {
    const previous = createDispatchTree(schema);
    dispatchMount(previous.root, { child: 'old' });
    const child = getDispatchChild(previous.root, 'child');
    adoptFieldNodeChain(previous.root, createDispatchTree(schema).root);
    expect(() => dispatchWriteInput(child, 'late')).not.toThrow();
    expect(child.local).toBe('old');
    expect(() => dispatchSetValue(child, 'late')).toThrowError(
      expect.objectContaining({
        code: expect.stringContaining('DISPOSED_NODE_WRITE'),
      }),
    );
    expect(() =>
      dispatchSetState(child, { [FieldNodeState.Dirty]: true }),
    ).toThrowError(
      expect.objectContaining({
        code: expect.stringContaining('DISPOSED_NODE_WRITE'),
      }),
    );
  });

  it('REACT-024 only reset raisers advance interaction reset, including already empty flags', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        clear: { type: 'boolean' },
        child: { type: 'string', controls: { resetInteraction: '../clear' } },
      },
    });
    dispatchMount(root, { clear: false, child: 'old' });
    const child = getDispatchChild(root, 'child');
    expect(child.interactionReset).toBe(0);
    dispatchSetValue(child, 'new');
    expect(child.interactionReset).toBe(0);
    dispatchClearSubtreeState(child);
    expect(child.interactionReset).toBe(1);
    dispatchSetState(child, { [FieldNodeState.Touched]: true });
    dispatchSetValue(getDispatchChild(root, 'clear'), true);
    expect(child.interactionReset).toBe(2);
    dispatchResetForm(root, { clear: false, child: 'base' });
    expect(child.interactionReset).toBe(3);
  });
});

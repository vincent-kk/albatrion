import { describe, expect, it, vi } from 'vitest';

import { FieldNodeEventType } from '../record';
import { ValidationMode } from '../types/state';
import type { ValidationIssue } from '../validation';
import {
  adoptFieldNodeChain,
  dispatchMount,
  dispatchSetValue,
  dispatchValidate,
  subscribeFieldNode,
} from '../write';
import { createDispatchTree } from './fixtures/createDispatchTree';

/** Two sibling targets distinguish subtree routing from a whole-form verdict. */
const schema = {
  type: 'object',
  properties: { a: { type: 'string' }, b: { type: 'string' } },
} as const;

/**
 * Drain a Node validation slot and the promise continuations it creates.
 * @returns Completion after one check-phase callback.
 */
const settle = () => new Promise<void>((resolve) => setImmediate(resolve));

describe('validation after synchronous writes', () => {
  it('IR-6 (h) disposing a root drops its queued write validation', async () => {
    const validate = vi.fn(() => []);
    const report = vi.fn();
    const { root, runtime } = createDispatchTree(
      schema,
      undefined,
      {
        compile: () => validate,
        compileGuard: () => () => true,
      },
      { hasConsumer: () => true, report },
    );
    dispatchMount(root, { a: 'before', b: '' });
    runtime.validationMode = ValidationMode.OnChange;
    dispatchSetValue(root, { a: 'newest', b: '' });
    adoptFieldNodeChain(root, createDispatchTree(schema).root);
    await settle();
    expect(validate).not.toHaveBeenCalled();
    expect(report).not.toHaveBeenCalled();
  });
  it('IR-6 (a) defers execution and delivery beyond the write microtask', async () => {
    const validate = vi.fn(() => [{ dataPath: '', message: 'latest' }]);
    const { root, runtime } = createDispatchTree(schema, undefined, {
      compile: () => validate,
      compileGuard: () => () => true,
    });
    dispatchMount(root, { a: 'before', b: '' });
    runtime.validationMode = ValidationMode.OnChange;
    const delivered = vi.fn();
    subscribeFieldNode(root, (event) => {
      if (event.type & FieldNodeEventType.UpdateGlobalError) delivered();
    });
    dispatchSetValue(root, { a: 'newest', b: '' });
    expect(validate).not.toHaveBeenCalled();
    expect(delivered).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(validate).not.toHaveBeenCalled();
    expect(delivered).not.toHaveBeenCalled();
    await settle();
    expect(validate).toHaveBeenCalledExactlyOnceWith(root.emit);
    expect(delivered).toHaveBeenCalledTimes(1);
  });

  it('IR-6 (b) coalesces writes separated by microtasks before the slot', async () => {
    const validate = vi.fn(() => []);
    const { root, runtime } = createDispatchTree(schema, undefined, {
      compile: () => validate,
      compileGuard: () => () => true,
    });
    dispatchMount(root, { a: 'before', b: '' });
    runtime.validationMode = ValidationMode.OnChange;
    dispatchSetValue(root, { a: 'first', b: '' });
    await Promise.resolve();
    dispatchSetValue(root, { a: 'second', b: '' });
    await Promise.resolve();
    dispatchSetValue(root, { a: 'newest', b: '' });
    await settle();
    expect(validate).toHaveBeenCalledExactlyOnceWith(root.emit);
  });

  it('IR-6 (e) subtree validate preserves a queued whole-form request', async () => {
    const { root, runtime } = createDispatchTree(schema, undefined, {
      compile: () => (value: any) => [
        { dataPath: '/a', message: value.a },
        { dataPath: '/b', message: value.b },
      ],
      compileGuard: () => () => true,
    });
    dispatchMount(root, { a: 'old-a', b: 'old-b' });
    await dispatchValidate(root);
    runtime.validationMode = ValidationMode.OnChange;
    dispatchSetValue(root, { a: 'new-a', b: 'new-b' });
    await dispatchValidate(root.structure!.a);
    await settle();
    expect(runtime.validationErrors?.get(root.structure!.a)).toEqual([
      { dataPath: '/a', message: 'new-a' },
    ]);
    expect(runtime.validationErrors?.get(root.structure!.b)).toEqual([
      { dataPath: '/b', message: 'new-b' },
    ]);
  });

  it('IR-6 (e async) subtree validate preserves an in-flight whole-form verdict', async () => {
    const completions: ((issues: readonly ValidationIssue[]) => void)[] = [];
    const { root, runtime } = createDispatchTree(schema, undefined, {
      compile: () => () => new Promise((resolve) => completions.push(resolve)),
      compileGuard: () => () => true,
    });
    dispatchMount(root, { a: 'old-a', b: 'old-b' });
    runtime.validationMode = ValidationMode.OnChange;
    dispatchSetValue(root, { a: 'new-a', b: 'new-b' });
    await settle();
    expect(completions).toHaveLength(1);
    const subtree = dispatchValidate(root.structure!.a);
    const issues = [
      { dataPath: '/a', message: 'new-a' },
      { dataPath: '/b', message: 'new-b' },
    ];
    completions[1](issues);
    await subtree;
    completions[0](issues);
    await settle();
    expect(runtime.validationErrors?.get(root.structure!.b)).toEqual([
      { dataPath: '/b', message: 'new-b' },
    ]);
  });
});

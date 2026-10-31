import { afterEach, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';

import { ValidationMode } from '../types/state';
import { subscribeFieldNodeRevealReleased } from '../validation';
import {
  adoptFieldNodeChain,
  dispatchMount,
  dispatchResetForm,
  dispatchSetValue,
  dispatchValidate,
} from '../write';
import { createDispatchTree } from './fixtures/createDispatchTree';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('IR-6 H pending clears before one release per accepted explicit root verdict', async () => {
  const clock = createValidationFrameClock();
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => () => [],
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'old');
  runtime.validationMode = ValidationMode.OnChange;
  const settled = vi.fn(() =>
    expect(root.rootNode.runtime.validationPending ?? false).toBe(false),
  );
  const unsubscribe = subscribeFieldNodeRevealReleased(root, settled);
  dispatchSetValue(root, 'new');
  expect(root.rootNode.runtime.validationPending ?? false).toBe(true);
  clock.frame();
  await clock.task();
  expect(settled).toHaveBeenCalledTimes(1);
  dispatchSetValue(root, 'newer');
  await dispatchValidate(root);
  expect(root.rootNode.runtime.validationPending ?? false).toBe(false);
  expect(settled).toHaveBeenCalledTimes(2);
  clock.frame();
  await clock.task();
  expect(settled).toHaveBeenCalledTimes(2);
  unsubscribe();
});

it.each(['null', 'throw', 'compile'] as const)(
  'IR-6 pending settles for %s verdicts',
  async (mode) => {
    const clock = createValidationFrameClock();
    const { root, runtime } = createDispatchTree(
      { type: 'string' },
      undefined,
      mode === 'null'
        ? undefined
        : {
            compile: () => {
              if (mode === 'compile') throw new Error('compile');
              return () => {
                throw new Error('execute');
              };
            },
            compileGuard: () => () => true,
          },
    );
    dispatchMount(root, 'old', undefined, { deferValidation: true });
    runtime.validationMode = ValidationMode.OnChange;
    runtime.reportValidationFailure = vi.fn();
    const listener = vi.fn();
    subscribeFieldNodeRevealReleased(root, listener);
    dispatchSetValue(root, 'new');
    expect(root.rootNode.runtime.validationPending ?? false).toBe(true);
    clock.frame();
    await clock.task();
    expect(root.rootNode.runtime.validationPending ?? false).toBe(false);
    expect(listener).toHaveBeenCalledTimes(mode === 'compile' ? 2 : 1);
  },
);

it('IR-6 a commit-only discard keeps pending until the newest verdict', async () => {
  const clock = createValidationFrameClock();
  let finish!: (issues: readonly []) => void;
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => () =>
      new Promise<readonly []>((resolve) => {
        finish = resolve;
      }),
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'old', undefined, { deferValidation: true });
  runtime.validationMode = ValidationMode.OnChange;
  dispatchSetValue(root, 'new');
  clock.frame();
  await clock.task();
  runtime.commitNumber = (runtime.commitNumber ?? 0) + 1;
  finish([]);
  await clock.task();
  expect(root.rootNode.runtime.validationPending ?? false).toBe(true);
  clock.frame();
  await clock.task();
  clock.frame();
  await clock.task();
  finish([]);
  await clock.task();
  expect(root.rootNode.runtime.validationPending ?? false).toBe(false);
  expect(runtime.validationResult?.commit).toBe(runtime.commitNumber);
});

it('IR-6 an obsolete asynchronous run cannot release a newer write hold', async () => {
  const clock = createValidationFrameClock();
  const finishes: (() => void)[] = [];
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => () =>
      new Promise<readonly []>((resolve) => {
        finishes.push(() => resolve([]));
      }),
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'old', undefined, { deferValidation: true });
  runtime.validationMode = ValidationMode.OnChange;
  const listener = vi.fn();
  subscribeFieldNodeRevealReleased(root, listener);
  dispatchSetValue(root, 'first');
  clock.frame();
  await clock.task();
  dispatchSetValue(root, 'second');
  finishes[0]();
  await clock.task();
  expect(root.rootNode.runtime.validationPending ?? false).toBe(true);
  expect(listener).not.toHaveBeenCalled();
  clock.frame();
  await clock.task();
  clock.frame();
  await clock.task();
  finishes[1]();
  await clock.task();
  expect(root.rootNode.runtime.validationPending ?? false).toBe(false);
  expect(listener).toHaveBeenCalledTimes(1);
});

it('IR-6 subtree validate preserves a pending write verdict', async () => {
  const clock = createValidationFrameClock();
  const { root, runtime } = createDispatchTree(
    { type: 'object', properties: { name: { type: 'string' } } },
    undefined,
    {
      compile: () => () => [],
      compileGuard: () => () => true,
    },
  );
  dispatchMount(root, { name: 'old' });
  runtime.validationMode = ValidationMode.OnChange;
  dispatchSetValue(root, { name: 'new' });
  await dispatchValidate(root.children![0]);
  expect(root.rootNode.runtime.validationPending ?? false).toBe(true);
  clock.frame();
  await clock.task();
  expect(root.rootNode.runtime.validationPending ?? false).toBe(false);
});

it.each([ValidationMode.None, ValidationMode.OnRequest])(
  'IR-6 reset after switching to mode %s releases the invalidated hold',
  async (mode) => {
    const clock = createValidationFrameClock();
    const { root, runtime } = createDispatchTree(
      { type: 'string' },
      undefined,
      { compile: () => () => [], compileGuard: () => () => true },
    );
    dispatchMount(root, 'old');
    runtime.validationMode = ValidationMode.OnChange;
    dispatchSetValue(root, 'new');
    const listener = vi.fn();
    subscribeFieldNodeRevealReleased(root, listener);
    runtime.validationMode = mode;
    dispatchResetForm(root, 'reset');
    expect(root.rootNode.runtime.validationPending ?? false).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
    clock.frame();
    await clock.task();
    expect(listener).toHaveBeenCalledTimes(1);
  },
);

it('IR-6 H disposal clears release listeners without notification', () => {
  createValidationFrameClock();
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => () => [],
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'old');
  runtime.validationMode = ValidationMode.OnChange;
  dispatchSetValue(root, 'new');
  const listener = vi.fn(() =>
    expect(runtime.revealReleaseListeners?.size).toBe(1),
  );
  subscribeFieldNodeRevealReleased(root, listener);
  adoptFieldNodeChain(root, createDispatchTree({ type: 'string' }).root);
  expect(listener).not.toHaveBeenCalled();
  expect(runtime.revealReleaseListeners?.size).toBe(0);
});

it.each(['null', 'execute', 'compile', 'commit'] as const)(
  'IR-6 explicit root %s settles only after a current verdict',
  async (mode) => {
    const clock = createValidationFrameClock();
    let finish!: (issues: readonly []) => void;
    const { root, runtime } = createDispatchTree(
      { type: 'string' },
      undefined,
      mode === 'null'
        ? undefined
        : {
            compile: () => {
              if (mode === 'compile') throw new Error('compile');
              return () => {
                if (mode === 'execute') throw new Error('execute');
                return new Promise<readonly []>((resolve) => {
                  finish = resolve;
                });
              };
            },
            compileGuard: () => () => true,
          },
    );
    dispatchMount(root, 'old', undefined, { deferValidation: true });
    runtime.validationMode = ValidationMode.OnChange;
    dispatchSetValue(root, 'new');
    const listener = vi.fn();
    subscribeFieldNodeRevealReleased(root, listener);
    const verdict = dispatchValidate(root);
    if (mode === 'commit') {
      runtime.commitNumber = (runtime.commitNumber ?? 0) + 1;
      finish([]);
    }
    if (mode === 'execute' || mode === 'compile')
      await expect(verdict).rejects.toBeDefined();
    else await verdict;
    if (mode === 'commit') {
      expect(root.rootNode.runtime.validationPending ?? false).toBe(true);
      expect(listener).not.toHaveBeenCalled();
      clock.frame();
      await clock.task();
      clock.frame();
      await clock.task();
      finish([]);
      await clock.task();
    }
    expect(root.rootNode.runtime.validationPending ?? false).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
    clock.frame();
    await clock.task();
    expect(listener).toHaveBeenCalledTimes(1);
  },
);

it('IR-6 unsubscribed release listeners stay silent during explicit root validation', async () => {
  const { root } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => () => [],
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'old', undefined, { deferValidation: true });
  const listener = vi.fn();
  const unsubscribe = subscribeFieldNodeRevealReleased(root, listener);
  unsubscribe();
  const subscribed = vi.fn();
  const stop = subscribeFieldNodeRevealReleased(root, subscribed);
  await dispatchValidate(root);
  expect(subscribed).toHaveBeenCalledTimes(1);
  stop();
  expect(listener).not.toHaveBeenCalled();
  expect(root.rootNode.runtime.validationPending ?? false).toBe(false);
});

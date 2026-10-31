import { afterEach, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';

import { ValidationMode } from '../types/state';
import {
  isFieldNodeValidationPending,
  subscribeFieldNodeValidationSettled,
} from '../validation';
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

it('IR-6 write pending settles before delivery, once even for unchanged errors', async () => {
  const clock = createValidationFrameClock();
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => () => [],
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'old');
  runtime.validationMode = ValidationMode.OnChange;
  const settled = vi.fn(() =>
    expect(isFieldNodeValidationPending(root)).toBe(false),
  );
  const unsubscribe = subscribeFieldNodeValidationSettled(root, settled);
  dispatchSetValue(root, 'new');
  expect(isFieldNodeValidationPending(root)).toBe(true);
  clock.frame();
  await clock.task();
  expect(settled).toHaveBeenCalledTimes(1);
  dispatchSetValue(root, 'newer');
  await dispatchValidate(root);
  expect(isFieldNodeValidationPending(root)).toBe(false);
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
    subscribeFieldNodeValidationSettled(root, listener);
    dispatchSetValue(root, 'new');
    expect(isFieldNodeValidationPending(root)).toBe(true);
    clock.frame();
    await clock.task();
    expect(isFieldNodeValidationPending(root)).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
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
  expect(isFieldNodeValidationPending(root)).toBe(true);
  clock.frame();
  await clock.task();
  clock.frame();
  await clock.task();
  finish([]);
  await clock.task();
  expect(isFieldNodeValidationPending(root)).toBe(false);
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
  subscribeFieldNodeValidationSettled(root, listener);
  dispatchSetValue(root, 'first');
  clock.frame();
  await clock.task();
  dispatchSetValue(root, 'second');
  finishes[0]();
  await clock.task();
  expect(isFieldNodeValidationPending(root)).toBe(true);
  expect(listener).not.toHaveBeenCalled();
  clock.frame();
  await clock.task();
  clock.frame();
  await clock.task();
  finishes[1]();
  await clock.task();
  expect(isFieldNodeValidationPending(root)).toBe(false);
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
  expect(isFieldNodeValidationPending(root)).toBe(true);
  clock.frame();
  await clock.task();
  expect(isFieldNodeValidationPending(root)).toBe(false);
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
    subscribeFieldNodeValidationSettled(root, listener);
    runtime.validationMode = mode;
    dispatchResetForm(root, 'reset');
    expect(isFieldNodeValidationPending(root)).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
    clock.frame();
    await clock.task();
    expect(listener).toHaveBeenCalledTimes(1);
  },
);

it('IR-6 disposal notifies before clearing its settle listeners', () => {
  createValidationFrameClock();
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => () => [],
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'old');
  runtime.validationMode = ValidationMode.OnChange;
  dispatchSetValue(root, 'new');
  const listener = vi.fn(() =>
    expect(runtime.validationSettleListeners?.size).toBe(1),
  );
  subscribeFieldNodeValidationSettled(root, listener);
  adoptFieldNodeChain(root, createDispatchTree({ type: 'string' }).root);
  expect(listener).toHaveBeenCalledTimes(1);
  expect(runtime.validationSettleListeners?.size).toBe(0);
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
    subscribeFieldNodeValidationSettled(root, listener);
    const verdict = dispatchValidate(root);
    if (mode === 'commit') {
      runtime.commitNumber = (runtime.commitNumber ?? 0) + 1;
      finish([]);
    }
    if (mode === 'execute' || mode === 'compile')
      await expect(verdict).rejects.toBeDefined();
    else await verdict;
    if (mode === 'commit') {
      expect(isFieldNodeValidationPending(root)).toBe(true);
      expect(listener).not.toHaveBeenCalled();
      clock.frame();
      await clock.task();
      clock.frame();
      await clock.task();
      finish([]);
      await clock.task();
    }
    expect(isFieldNodeValidationPending(root)).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
    clock.frame();
    await clock.task();
    expect(listener).toHaveBeenCalledTimes(1);
  },
);

it('IR-6 unsubscribed listeners and explicit validation without writes do not emit settles', async () => {
  const { root } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => () => [],
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'old', undefined, { deferValidation: true });
  const listener = vi.fn();
  const unsubscribe = subscribeFieldNodeValidationSettled(root, listener);
  unsubscribe();
  await dispatchValidate(root);
  expect(listener).not.toHaveBeenCalled();
  expect(isFieldNodeValidationPending(root)).toBe(false);
});

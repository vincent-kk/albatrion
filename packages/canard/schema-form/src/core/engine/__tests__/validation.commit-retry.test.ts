import { afterEach, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';

import { ValidationMode } from '../types/state';
import { requestFieldNodeValidation } from '../validation';
import {
  dispatchContextChange,
  dispatchMount,
  dispatchSetValue,
  dispatchValidate,
} from '../write';
import { createDispatchTree } from './fixtures/createDispatchTree';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it('IR-6 R-a automatic commit-only discard keeps pending and delivers the newest context verdict', async () => {
  const clock = createValidationFrameClock();
  const finishes: ((
    issues: readonly { dataPath: string; message: string }[],
  ) => void)[] = [];
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => () =>
      new Promise<readonly { dataPath: string; message: string }[]>((resolve) =>
        finishes.push(resolve),
      ),
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'old', undefined, { deferValidation: true });
  runtime.validationMode = ValidationMode.OnChange;
  dispatchSetValue(root, 'new');
  clock.frame();
  await clock.task();
  const commit = runtime.commitNumber!;
  dispatchContextChange(root, { changed: true });
  expect(runtime.commitNumber).toBeGreaterThan(commit);
  finishes[0]([{ dataPath: '', message: 'discarded' }]);
  await clock.task();
  expect(root.rootNode.runtime.validationPending ?? false).toBe(true);
  clock.frame();
  await clock.task();
  clock.frame();
  await clock.task();
  expect(finishes).toHaveLength(2);
  finishes[1]([{ dataPath: '', message: 'newest' }]);
  await clock.task();
  expect(root.rootNode.runtime.validationPending ?? false).toBe(false);
  expect(runtime.validationResult?.issues[0]).toMatchObject({
    message: 'newest',
  });
  expect(runtime.validationResult?.commit).toBe(runtime.commitNumber);
});
it('IR-6 R-a an asynchronous initial explicit mount verdict requeues OnChange even without an earlier hold', async () => {
  const clock = createValidationFrameClock();
  const finishes: ((issues: readonly []) => void)[] = [];
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => () =>
      new Promise<readonly []>((resolve) => finishes.push(resolve)),
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'initial', undefined, { deferValidation: true });
  runtime.validationMode = ValidationMode.OnChange;
  const mount = dispatchValidate(root);
  expect(root.rootNode.runtime.validationPending ?? false).toBe(false);
  dispatchContextChange(root, { changed: true });
  finishes[0]([]);
  await mount;
  expect(root.rootNode.runtime.validationPending ?? false).toBe(true);
  clock.frame();
  await clock.task();
  expect(finishes).toHaveLength(2);
  finishes[1]([]);
  await clock.task();
  expect(runtime.validationResult?.commit).toBe(runtime.commitNumber);
  expect(root.rootNode.runtime.validationPending ?? false).toBe(false);
});
it('IR-6 R-a equal-content setValue preserves emit while a changed commit still owes a current verdict', async () => {
  const clock = createValidationFrameClock();
  const finishes: ((issues: readonly []) => void)[] = [];
  const { root, runtime } = createDispatchTree(
    { type: 'object', properties: { a: { type: 'string' } } },
    undefined,
    {
      compile: () => () =>
        new Promise<readonly []>((resolve) => finishes.push(resolve)),
      compileGuard: () => () => true,
    },
  );
  dispatchMount(root, { a: 'old' }, undefined, { deferValidation: true });
  runtime.validationMode = ValidationMode.OnChange;
  dispatchSetValue(root, { a: 'new' });
  clock.frame();
  await clock.task();
  const emit = root.emit;
  const commit = runtime.commitNumber!;
  dispatchSetValue(root, { a: 'new' });
  expect(root.emit).toBe(emit);
  expect(runtime.commitNumber).toBeGreaterThan(commit);
  finishes[0]([]);
  await clock.task();
  expect(root.rootNode.runtime.validationPending ?? false).toBe(true);
  clock.frame();
  await clock.task();
  clock.frame();
  await clock.task();
  expect(finishes).toHaveLength(2);
  finishes[1]([]);
  await clock.task();
  expect(root.rootNode.runtime.validationPending ?? false).toBe(false);
  expect(runtime.validationResult?.commit).toBe(runtime.commitNumber);
});

it('IR-6 H commit-only retry preserves both root and subtree request targets', async () => {
  const clock = createValidationFrameClock();
  const finishes: ((
    issues: readonly { dataPath: string; message: string }[],
  ) => void)[] = [];
  const { root, runtime } = createDispatchTree(
    { type: 'object', properties: { a: { type: 'string' } } },
    undefined,
    {
      compileGuard: () => () => true,
      compile: () => () =>
        new Promise<readonly { dataPath: string; message: string }[]>(
          (resolve) => finishes.push(resolve),
        ),
    },
  );
  dispatchMount(root, { a: 'old' }, undefined, { deferValidation: true });
  runtime.validationMode = ValidationMode.OnChange;
  const child = root.children![0];
  requestFieldNodeValidation(root, () => undefined);
  requestFieldNodeValidation(child, () => undefined);
  expect(runtime.validationPendingTargets?.size).toBe(2);
  clock.frame();
  await clock.task();
  const commit = runtime.commitNumber!;
  dispatchContextChange(root, { newContext: true });
  expect(runtime.commitNumber).toBeGreaterThan(commit);
  finishes[0]([]);
  await clock.task();
  expect(runtime.validationPendingTargets?.has(root)).toBe(true);
  expect(runtime.validationPendingTargets?.has(child)).toBe(true);
  clock.frame();
  await clock.task();
  clock.frame();
  await clock.task();
  expect(finishes).toHaveLength(2);
  finishes[1]([{ dataPath: '/a', message: 'latest' }]);
  await clock.task();
  expect(runtime.validationErrors?.get(child)).toEqual([
    expect.objectContaining({ message: 'latest' }),
  ]);
  expect(runtime.validationPending).toBe(false);
});

import { afterEach, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';

import { ValidationMode } from '../types/state';
import { isFieldNodeValidationPending } from '../validation';
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
  expect(isFieldNodeValidationPending(root)).toBe(true);
  clock.frame();
  await clock.task();
  clock.frame();
  await clock.task();
  expect(finishes).toHaveLength(2);
  finishes[1]([{ dataPath: '', message: 'newest' }]);
  await clock.task();
  expect(isFieldNodeValidationPending(root)).toBe(false);
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
  expect(isFieldNodeValidationPending(root)).toBe(false);
  dispatchContextChange(root, { changed: true });
  finishes[0]([]);
  await mount;
  expect(isFieldNodeValidationPending(root)).toBe(true);
  clock.frame();
  await clock.task();
  expect(finishes).toHaveLength(2);
  finishes[1]([]);
  await clock.task();
  expect(runtime.validationResult?.commit).toBe(runtime.commitNumber);
  expect(isFieldNodeValidationPending(root)).toBe(false);
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
  const advanced = runtime.commitNumber! > commit;
  console.info(
    'IR6_EQUAL_CONTENT_COMMIT',
    JSON.stringify({ advanced, emitPreserved: root.emit === emit }),
  );
  finishes[0]([]);
  await clock.task();
  if (advanced) {
    expect(isFieldNodeValidationPending(root)).toBe(true);
    clock.frame();
    await clock.task();
    clock.frame();
    await clock.task();
    expect(finishes).toHaveLength(2);
    finishes[1]([]);
    await clock.task();
  }
  expect(isFieldNodeValidationPending(root)).toBe(false);
  expect(runtime.validationResult?.commit).toBe(runtime.commitNumber);
});

import { afterEach, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';

import { ValidationMode } from '../types/state';
import { requestFieldNodeValidation } from '../validation';
import {
  adoptFieldNodeChain,
  dispatchMount,
  dispatchSetValue,
  dispatchValidate,
} from '../write';
import { createDispatchTree } from './fixtures/createDispatchTree';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('IR-6 disposal cancels the automatic cadence frame loop', async () => {
  const clock = createValidationFrameClock();
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const validate = vi.fn(() => []);
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => validate,
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'old');
  runtime.validationMode = ValidationMode.OnChange;
  dispatchSetValue(root, 'new');
  clock.frame();
  await clock.task();
  expect(validate).toHaveBeenCalledTimes(1);
  expect(clock.pending()).toBe(1);
  const replacement = createDispatchTree({ type: 'string' }).root;
  adoptFieldNodeChain(root, replacement);
  expect(clock.pending()).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
  clock.frame();
  vi.advanceTimersByTime(100);
  await clock.task();
  expect(validate).toHaveBeenCalledTimes(1);
});

it('IR-6 later requests retain their current delivery callback', async () => {
  const clock = createValidationFrameClock();
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => () => [],
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'value');
  runtime.validationMode = ValidationMode.OnChange;
  const first = vi.fn();
  const second = vi.fn();
  requestFieldNodeValidation(root, first);
  clock.frame();
  await clock.task();
  clock.frame();
  await clock.task();
  requestFieldNodeValidation(root, second);
  clock.frame();
  await clock.task();
  expect(first).toHaveBeenCalledTimes(1);
  expect(second).toHaveBeenCalledTimes(1);
  clock.frame();
  await clock.task();
  expect(clock.pending()).toBe(0);
});

it('IR-6 root validate during carry invalidates the next automatic run until another request', async () => {
  const clock = createValidationFrameClock();
  const validate = vi.fn(() => []);
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => validate,
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'old');
  runtime.validationMode = ValidationMode.OnChange;
  dispatchSetValue(root, 'leading');
  clock.frame();
  await clock.task();
  dispatchSetValue(root, 'carried');
  clock.frame();
  await clock.task();
  await dispatchValidate(root);
  expect(validate).toHaveBeenCalledTimes(2);
  clock.frame();
  await clock.task();
  clock.frame();
  await clock.task();
  expect(validate).toHaveBeenCalledTimes(2);
  expect(clock.pending()).toBe(0);
  dispatchSetValue(root, 'newest');
  clock.frame();
  await clock.task();
  expect(validate).toHaveBeenCalledTimes(3);
  clock.frame();
  await clock.task();
});

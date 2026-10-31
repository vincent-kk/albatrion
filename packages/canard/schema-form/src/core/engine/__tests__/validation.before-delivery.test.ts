import { afterEach, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';

import { type FieldNodeDelivery, FieldNodeEventType } from '../record';
import { ValidationMode } from '../types/state';
import { isFieldNodeValidationPending } from '../validation';
import { dispatchMount, dispatchSetValue } from '../write';
import { createDispatchTree } from './fixtures/createDispatchTree';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('IR-6 W3 pending precedes the first synchronous value subscriber', async () => {
  const clock = createValidationFrameClock();
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => () => [],
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'old');
  runtime.validationMode = ValidationMode.OnChange;
  const reads: boolean[] = [];
  (runtime.listeners ??= new Map()).set(
    root,
    new Set([
      (event: FieldNodeDelivery) => {
        if (event.type & FieldNodeEventType.UpdateValue)
          reads.push(isFieldNodeValidationPending(root));
      },
    ]),
  );
  dispatchSetValue(root, 'new');
  expect(reads).toEqual([true]);
  clock.frame();
  await clock.task();
  expect(isFieldNodeValidationPending(root)).toBe(false);
});

it('IR-6 W3 a delivery that cancels the automatic request releases its early hold', () => {
  createValidationFrameClock();
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compile: () => () => [],
    compileGuard: () => () => true,
  });
  dispatchMount(root, 'old');
  runtime.validationMode = ValidationMode.OnChange;
  const reads: boolean[] = [];
  (runtime.listeners ??= new Map()).set(
    root,
    new Set([
      (event: FieldNodeDelivery) => {
        if (event.type & FieldNodeEventType.UpdateValue) {
          reads.push(isFieldNodeValidationPending(root));
          runtime.validationMode = ValidationMode.None;
        }
      },
    ]),
  );
  dispatchSetValue(root, 'new');
  expect(reads).toEqual([true]);
  expect(isFieldNodeValidationPending(root)).toBe(false);
  expect(runtime.validationCadence).toBeUndefined();
});

import { expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';

import { ValidationMode } from '../engine';
import {
  buildFieldNodeTree,
  mountFieldNode,
  reloadFieldNodeForm,
} from '../surface';

it('T7 core-only default mount and reset retain their automatic OnChange verdict', async () => {
  const clock = createValidationFrameClock();
  const validate = vi.fn(() => []);
  const root = buildFieldNodeTree({
    jsonSchema: { type: 'string' },
    validationMode: ValidationMode.OnChange,
    validator: { compile: () => validate, compileGuard: () => () => true },
  });
  mountFieldNode(root, 'mount');
  clock.frame();
  await clock.task();
  expect(validate).toHaveBeenCalledExactlyOnceWith('mount');
  validate.mockClear();
  reloadFieldNodeForm(root, 'reset');
  clock.frame();
  await clock.task();
  clock.frame();
  await clock.task();
  expect(validate).toHaveBeenCalledExactlyOnceWith('reset');
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

import { afterEach, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';

import { ValidationMode } from '../engine';
import {
  buildFieldNodeTree,
  mountFieldNode,
  reloadFieldNodeForm,
  startFieldNodeLoadValidation,
} from '../surface';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('DR-13 a deferred mount widens an unchanged subtree request to the pending root', () => {
  createValidationFrameClock();
  const root = buildFieldNodeTree({
    jsonSchema: {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
    },
    validationMode: ValidationMode.OnChange,
    validator: { compile: () => () => [], compileGuard: () => () => true },
  });
  mountFieldNode(root, { a: 'a', b: 'b' }, undefined, {
    deferValidation: true,
  });
  root.find('/a')!.resetSubtree();
  expect(startFieldNodeLoadValidation(root)).toBe(false);
  const targets = Reflect.get(root, 'runtime').validationPendingTargets;
  expect(targets instanceof Set && targets.has(root)).toBe(true);
});

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

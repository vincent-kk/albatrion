import { afterEach, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';
import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { flushFieldNodeSettings } from '../utils/chain/flushFieldNodeSettings';
import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchFinishInput } from '../utils/entry/dispatchFinishInput';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { dispatchUpdateSettings } from '../utils/entry/dispatchUpdateSettings';
import { dispatchValidate } from '../utils/entry/dispatchValidate';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('keeps settings deferred after a nested onChange write returns', () => {
  const { root, runtime } = createDispatchTree({
    type: 'string',
    options: { trim: true },
  });
  runtime.validationMode = ValidationMode.None;
  let armed = true;
  let settingInside: boolean | undefined;
  runtime.onChange = () => {
    if (!armed) return;
    armed = false;
    dispatchSetValue(root, ' nested ');
    dispatchUpdateSettings(root, {
      validationMode: ValidationMode.None,
      disableAutomaticWrites: true,
    });
    settingInside = runtime.disableAutomaticWrites;
    dispatchFinishInput(root);
  };
  dispatchSetValue(root, ' outer ');
  expect(settingInside).not.toBe(true);
  expect(root.emit).toBe('nested');
  expect(runtime.disableAutomaticWrites).toBe(true);
});

it('flushes only the last deferred settings at the outermost chain exit', () => {
  const { root, runtime } = createDispatchTree({ type: 'string' });
  runtime.validationMode = ValidationMode.None;
  const applyFirst = vi.fn();
  const applyLast = vi.fn();
  let armed = true;
  let pendingInside: typeof runtime.pendingSettings;
  runtime.onChange = () => {
    if (!armed) return;
    armed = false;
    dispatchSetValue(root, 'nested');
    runtime.pendingSettings = applyFirst;
    flushFieldNodeSettings(runtime);
    runtime.pendingSettings = applyLast;
    flushFieldNodeSettings(runtime);
    pendingInside = runtime.pendingSettings;
  };
  dispatchSetValue(root, 'outer');
  expect(pendingInside).toBe(applyLast);
  expect(applyFirst).not.toHaveBeenCalled();
  expect(applyLast).toHaveBeenCalledOnce();
  expect(runtime.pendingSettings).toBeUndefined();
});

it('defers write defaults through reentrant writes until the outer batch ends', () => {
  const { root, runtime } = createDispatchTree({
    type: 'string',
    options: { trim: true },
  });
  runtime.validationMode = ValidationMode.None;
  dispatchBatch(root, () => {
    dispatchSetValue(root, ' a ');
    dispatchUpdateSettings(root, {
      validationMode: ValidationMode.None,
      disableAutomaticWrites: true,
    });
    expect(runtime.disableAutomaticWrites).not.toBe(true);
    dispatchFinishInput(root);
  });
  expect(runtime.disableAutomaticWrites).toBe(true);
  expect(root.emit).toBe('a');
  dispatchSetValue(root, ' b ');
  dispatchFinishInput(root);
  expect(root.emit).toBe(' b ');
  dispatchFinishInput(root, WriteOption.EnableAutomaticWrites);
  expect(root.emit).toBe('b');
});

it('late explicit failure cannot mark the new mode unavailable or report', async () => {
  const { root, runtime } = createDispatchTree({ type: 'string' });
  runtime.validationMode = ValidationMode.OnRequest;
  runtime.validator = {
    compile: () => () => Promise.reject(new Error('late')),
    compileGuard: () => () => true,
  };
  const report = vi.fn();
  runtime.errorReporter = { hasConsumer: () => true, report };
  const promise = dispatchValidate(root);
  dispatchUpdateSettings(root, { validationMode: ValidationMode.None });
  await expect(promise).rejects.toBeDefined();
  expect(runtime.validationUnavailable).not.toBe(true);
  expect(report).not.toHaveBeenCalled();
});

it('automatic completion rechecks the lifetime after synchronous reveal-release listeners', async () => {
  const clock = createValidationFrameClock();
  const { root, runtime } = createDispatchTree({ type: 'string' });
  runtime.validationMode = ValidationMode.OnChange;
  runtime.validator = {
    compile: () => () => [{ dataPath: '', message: 'old' }],
    compileGuard: () => () => true,
  };
  const events = vi.fn();
  runtime.listeners = new Map([[root, new Set([events])]]);
  runtime.revealReleaseListeners = new Set([
    () => dispatchUpdateSettings(root, { validationMode: ValidationMode.None }),
  ]);
  dispatchSetValue(root, 'current');
  events.mockClear();
  clock.frame();
  await clock.task();
  expect(runtime.validationErrors?.size ?? 0).toBe(0);
  expect(runtime.routedValidationErrors).toEqual([]);
  expect(runtime.validationResult).toBeUndefined();
  expect(
    events.mock.calls.map(
      ([event]) => event.payload?.[FieldNodeEventType.UpdateGlobalError],
    ),
  ).not.toContainEqual([{ dataPath: '', message: 'old' }]);
});

it('applies a mode committed by an explicit validation error handler before the next entry', async () => {
  const { root, runtime } = createDispatchTree({ type: 'string' });
  runtime.validationMode = ValidationMode.OnRequest;
  const validate = vi.fn(() => {
    throw new Error('validator failed');
  });
  runtime.validator = {
    compile: () => validate,
    compileGuard: () => () => true,
  };
  runtime.errorReporter = {
    hasConsumer: () => true,
    report: () =>
      dispatchUpdateSettings(root, { validationMode: ValidationMode.None }),
  };
  await expect(dispatchValidate(root)).rejects.toBeDefined();
  expect(runtime.pendingSettings).toBeUndefined();
  expect(runtime.validationMode).toBe(ValidationMode.None);
  await expect(dispatchValidate(root)).resolves.toEqual([]);
  expect(validate).toHaveBeenCalledOnce();
});

it('explicit completion rechecks its epoch after a release that keeps existing errors', async () => {
  const { root, runtime } = createDispatchTree({ type: 'string' });
  runtime.validationMode = ValidationMode.OnChange;
  const issues = [{ dataPath: '', message: 'before transition' }];
  runtime.validator = {
    compile: () => () => issues,
    compileGuard: () => () => true,
  };
  const events = vi.fn();
  runtime.listeners = new Map([[root, new Set([events])]]);
  runtime.revealReleaseListeners = new Set([
    () =>
      dispatchUpdateSettings(root, {
        validationMode: ValidationMode.OnRequest,
      }),
  ]);
  await expect(dispatchValidate(root)).resolves.toEqual(issues);
  expect(runtime.routedValidationErrors).toEqual(issues);
  expect(
    events.mock.calls.map(
      ([event]) => event.payload?.[FieldNodeEventType.UpdateGlobalError],
    ),
  ).not.toContainEqual(issues);
});

it('automatic completion rechecks its epoch after a release that keeps existing errors', async () => {
  const clock = createValidationFrameClock();
  const { root, runtime } = createDispatchTree({ type: 'string' });
  runtime.validationMode = ValidationMode.OnChange;
  const issues = [{ dataPath: '', message: 'before transition' }];
  runtime.validator = {
    compile: () => () => issues,
    compileGuard: () => () => true,
  };
  const events = vi.fn();
  runtime.listeners = new Map([[root, new Set([events])]]);
  runtime.revealReleaseListeners = new Set([
    () =>
      dispatchUpdateSettings(root, {
        validationMode: ValidationMode.OnRequest,
      }),
  ]);
  dispatchSetValue(root, 'current');
  events.mockClear();
  clock.frame();
  await clock.task();
  expect(runtime.routedValidationErrors).toEqual(issues);
  expect(
    events.mock.calls.map(
      ([event]) => event.payload?.[FieldNodeEventType.UpdateGlobalError],
    ),
  ).not.toContainEqual(issues);
});

it('keeps an accepted automatic failure report when release starts a same-epoch successor', async () => {
  const clock = createValidationFrameClock();
  const { root, runtime } = createDispatchTree({ type: 'string' });
  runtime.validationMode = ValidationMode.OnChange;
  runtime.validator = {
    compile: () => () => Promise.reject(new Error('automatic failure')),
    compileGuard: () => () => true,
  };
  const report = vi.fn();
  runtime.reportValidationFailure = report;
  const epoch = runtime.validationEpoch;
  let armed = true;
  runtime.revealReleaseListeners = new Set([
    () => {
      if (!armed) return;
      armed = false;
      dispatchSetValue(root, 'successor');
    },
  ]);
  dispatchSetValue(root, 'original');
  clock.frame();
  await clock.task();
  expect(armed).toBe(false);
  expect(runtime.validationEpoch).toBe(epoch);
  expect(report).toHaveBeenCalledOnce();
});

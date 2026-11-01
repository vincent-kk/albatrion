import { afterEach, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';

import { captureFieldNodeChange } from '../record';
import { disposeFieldNodeTree } from '../settle';
import { ValidationMode } from '../types/state';
import {
  dispatchClearSubtreeState,
  dispatchMount,
  dispatchSetState,
  dispatchSetSubtreeState,
  dispatchSetValue,
  dispatchValidate,
} from '../write';
import { createDispatchTree } from './fixtures/createDispatchTree';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const fixture = () => {
  const clock = createValidationFrameClock();
  const tree = createDispatchTree(
    {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
    },
    undefined,
    { compile: () => () => [], compileGuard: () => () => true },
  );
  dispatchMount(tree.root, { a: '', b: '' }, undefined, {
    deferValidation: true,
  });
  tree.runtime.validationMode = ValidationMode.OnChange;
  return {
    ...tree,
    clock,
    a: tree.root.children![0],
    b: tree.root.children![1],
  };
};
it('IR-6 H records each standalone write and drops its entries by captured generation', async () => {
  const { a, runtime, clock } = fixture();
  const before = a.interactionState;
  dispatchSetState(a, { 2: true });
  expect(a.revealBaseline).toMatchObject({
    entries: [{ state: before, enabled: true }],
  });
  expect(runtime.revealBaselineNodes?.has(a)).toBe(true);
  dispatchSetState(a, { 4: true });
  expect(a.revealBaseline?.entries[0].state).toBe(before);
  clock.frame();
  await clock.task();
  expect(a.revealBaseline).toMatchObject({ entries: [{ state: { 2: true } }] });
  clock.frame();
  await clock.task();
  expect(a.revealBaseline).toBeUndefined();
  expect(runtime.revealBaselineNodes?.size).toBe(0);
});
it('IR-6 Y2 ignores identical touched patches and never clears touched on a repeat blur', async () => {
  const { a, runtime, clock } = fixture();
  dispatchSetState(a, { 2: true });
  clock.frame();
  await clock.task();
  const state = a.interactionState;
  const generation = runtime.revealBaselineGeneration;
  dispatchSetState(a, { 2: true });
  expect(a.interactionState).toBe(state);
  expect(a.interactionState[2]).toBe(true);
  expect(a.revealBaseline).toBeUndefined();
  expect(runtime.revealBaselineGeneration).toBe(generation);
});
it.each([ValidationMode.None, ValidationMode.OnRequest])(
  'IR-6 Y2 mode %s records no reveal baseline',
  (mode) => {
    const { a, runtime } = fixture();
    runtime.validationMode = mode;
    dispatchSetState(a, { 4: true });
    expect(a.revealBaseline).toBeUndefined();
    expect(runtime.revealDropTask).toBeUndefined();
  },
);
it('IR-6 H a later record survives only its own generation cutoff', async () => {
  const { a, b, clock } = fixture();
  dispatchSetState(a, { 2: true });
  clock.frame();
  dispatchSetState(b, { 2: true });
  await clock.task();
  expect(a.revealBaseline).toBeUndefined();
  expect(b.revealBaseline).toBeDefined();
  clock.frame();
  await clock.task();
  expect(a.revealBaseline).toBeUndefined();
  expect(b.revealBaseline).toBeUndefined();
});
it('IR-6 Y2 clearing subtree state captures the prior flags before its direct empty write', async () => {
  const { root, a, clock } = fixture();
  dispatchSetSubtreeState(root, { 4: true });
  clock.frame();
  await clock.task();
  const state = a.interactionState;
  dispatchClearSubtreeState(root);
  expect(a.revealBaseline?.entries[0].state).toBe(state);
  expect(a.interactionState).toEqual({});
});
it('IR-6 Y2 capture records enabled before a controls change without scheduling in record', () => {
  const { a, runtime } = fixture();
  a.visible = captureFieldNodeChange(a, 'visible', false);
  expect(a.revealBaseline?.entries[0].enabled).toBe(true);
  expect(runtime.revealDropOwed).toBe(true);
  expect(runtime.revealDropTask).toBeUndefined();
});
it('IR-6 Y2 settle drops baselines before notifying its holding listeners', async () => {
  const { root, a, runtime, clock } = fixture();
  dispatchSetState(a, { 4: true });
  dispatchSetValue(a, 'new');
  const checked = vi.fn(() => {
    expect(a.revealBaseline).toBeUndefined();
    expect(runtime.revealBaselineNodes?.size).toBe(0);
    expect(runtime.revealDropTask).toBeUndefined();
  });
  (runtime.revealReleaseListeners ??= new Set()).add(checked);
  clock.frame();
  await clock.task();
  expect(checked).toHaveBeenCalledTimes(1);
  expect(root.disposed).toBe(false);
});
it('IR-6 Y2 disposal drops standalone baselines and invalidates an already queued drop', async () => {
  const { root, a, runtime, clock } = fixture();
  dispatchSetState(a, { 4: true });
  expect(a.revealBaseline).toBeDefined();
  disposeFieldNodeTree(root);
  expect(a.revealBaseline).toBeUndefined();
  expect(runtime.revealDropTask).toBeUndefined();
  expect(runtime.revealDropOwed).toBeFalsy();
  clock.frame();
  await clock.task();
  expect(a.revealBaseline).toBeUndefined();
});

it('IR-6 Y2 a pending drop clears its scheduling flag and a later standalone record schedules again', async () => {
  const clock = createValidationFrameClock();
  let finish!: () => void;
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compileGuard: () => () => true,
    compile: () => () =>
      new Promise<readonly []>((resolve) => {
        finish = () => resolve([]);
      }),
  });
  dispatchMount(root, 'old', undefined, { deferValidation: true });
  runtime.validationMode = ValidationMode.OnChange;
  dispatchSetState(root, { 2: true });
  dispatchSetValue(root, 'new');
  clock.frame();
  await clock.task();
  clock.frame();
  await clock.task();
  expect(runtime.validationPending).toBe(true);
  expect(runtime.revealDropTask).toBeUndefined();
  expect(runtime.revealDropOwed).toBeFalsy();
  finish();
  await clock.task();
  dispatchSetState(root, { 4: true });
  expect(root.revealBaseline).toBeDefined();
  expect(runtime.revealDropTask).toBeDefined();
  clock.frame();
  await clock.task();
  expect(root.revealBaseline).toBeUndefined();
});

it('IR-6 Y2 validation becoming unavailable drops standalone baselines without a pending transition', async () => {
  createValidationFrameClock();
  const { root, runtime } = createDispatchTree({ type: 'string' }, undefined, {
    compileGuard: () => () => true,
    compile: () => {
      throw new Error('compile');
    },
  });
  dispatchMount(root, 'old', undefined, { deferValidation: true });
  runtime.validationMode = ValidationMode.OnChange;
  dispatchSetState(root, { 4: true });
  expect(root.revealBaseline).toBeDefined();
  await expect(dispatchValidate(root)).rejects.toBeDefined();
  expect(runtime.validationUnavailable).toBe(true);
  expect(root.revealBaseline).toBeUndefined();
  expect(runtime.revealDropTask).toBeUndefined();
});

import { afterEach, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';

import { disposeFieldNodeTree } from '../settle';
import { ValidationMode } from '../types/state';
import {
  dispatchBatch,
  dispatchClearSubtreeState,
  dispatchMount,
  dispatchSetState,
  dispatchSetSubtreeState,
  dispatchValidate,
  dispatchVisitSubtree,
  subscribeFieldNode,
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
  dispatchMount(tree.root, { a: 'ab', b: 'ab' }, undefined, {
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
it('IR-6 H separate standalone writes retain every pre-change state in generation order', () => {
  const { a, runtime } = fixture();
  runtime.validationPending = true;
  const first = a.interactionState;
  dispatchSetState(a, { 4: false });
  const second = a.interactionState;
  dispatchSetState(a, { 4: true });
  expect(a.revealBaseline).toMatchObject({
    entries: [
      { state: first, enabled: true },
      { state: second, enabled: true },
    ],
  });
});
it('IR-6 H an intermediate hide within one batch coalesces to its painted entry', () => {
  const { root, a, clock } = fixture();
  dispatchSetState(a, { 4: true });
  clock.frame();
  return clock.task().then(() => {
    const before = a.interactionState;
    dispatchBatch(root, () => {
      dispatchSetState(a, { 4: false });
      dispatchSetState(a, { 4: true });
    });
    expect(a.revealBaseline).toMatchObject({
      entries: [{ state: before, enabled: true }],
    });
  });
});
it('IR-6 H a subtree walk shares one sequence across its standalone state writes', async () => {
  const { root, a, clock } = fixture();
  dispatchSetState(a, { 4: true });
  clock.frame();
  await clock.task();
  const before = a.interactionState;
  dispatchVisitSubtree(root, (node) => {
    if (node === a) {
      dispatchSetState(a, { 4: false });
      dispatchSetState(a, { 4: true });
    }
  });
  expect(a.revealBaseline).toMatchObject({
    entries: [{ state: before, enabled: true }],
  });
});
it('IR-6 H later nodes do not extend the first node past its captured release generation', async () => {
  const { root, a, b, clock } = fixture();
  dispatchSetState(a, { 2: true });
  clock.frame();
  dispatchSetState(b, { 2: true });
  await clock.task();
  expect(a.revealBaseline).toBeUndefined();
  expect(b.revealBaseline).toBeDefined();
  clock.frame();
  dispatchSetState(root, { 4: true });
  await clock.task();
  expect(b.revealBaseline).toBeUndefined();
  expect(root.revealBaseline).toBeDefined();
  clock.frame();
  await clock.task();
  expect(root.revealBaseline).toBeUndefined();
});
it.each(['setState', 'setSubtreeState', 'clearState'] as const)(
  'IR-6 H %s schedules a release even when its listener throws',
  async (api) => {
    const { root, a, clock } = fixture();
    dispatchSetState(a, { 4: true });
    clock.frame();
    await clock.task();
    const failure = new Error('state listener');
    const unsubscribe = subscribeFieldNode(a, () => {
      throw failure;
    });
    expect(() => {
      if (api === 'setState') dispatchSetState(a, { 4: false });
      else if (api === 'setSubtreeState')
        dispatchSetSubtreeState(root, { 4: false });
      else dispatchClearSubtreeState(root);
    }).toThrow(failure);
    unsubscribe();
    clock.frame();
    await clock.task();
    expect(a.revealBaseline).toBeUndefined();
  },
);
it('IR-6 D accepted root validation releases quiet history without a frame', async () => {
  const { root, a, runtime } = fixture();
  dispatchSetState(a, { 4: true });
  expect(runtime.validationPending).toBeFalsy();
  await dispatchValidate(root);
  expect(a.revealBaseline).toBeUndefined();
  expect(runtime.revealDropTask).toBeUndefined();
});
it('IR-6 H a release listener can record and schedule its own fresh drop', async () => {
  const { a, b, runtime, clock } = fixture();
  let once = false;
  const listener = vi.fn(() => {
    if (!once) {
      once = true;
      dispatchSetState(b, { 4: true });
    }
  });
  Object.assign(runtime, { revealReleaseListeners: new Set([listener]) });
  dispatchSetState(a, { 4: true });
  clock.frame();
  await clock.task();
  expect(listener).toHaveBeenCalledTimes(1);
  expect(a.revealBaseline).toBeUndefined();
  expect(b.revealBaseline).toBeDefined();
  expect(runtime.revealDropTask).toBeDefined();
  clock.frame();
  await clock.task();
  expect(b.revealBaseline).toBeUndefined();
  expect(listener).toHaveBeenCalledTimes(2);
});
it('IR-6 H disposal clears release listeners before settling and stays silent', () => {
  const { root, a, runtime } = fixture();
  const listener = vi.fn();
  const listeners = new Set([listener]);
  Object.assign(runtime, {
    revealReleaseListeners: listeners,
    revealPolicy: { value: false, entries: [] },
  });
  runtime.validationPending = true;
  dispatchSetState(a, { 4: true });
  disposeFieldNodeTree(root);
  expect(listeners.size).toBe(0);
  expect(listener).not.toHaveBeenCalled();
  expect(a.revealBaseline).toBeUndefined();
  expect(runtime.revealPolicy).toBeUndefined();
});

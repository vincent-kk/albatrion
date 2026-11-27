import { afterEach, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';

import { disposeFieldNodeTree } from '../settle';
import { FieldNodeState, ValidationMode } from '../types/state';
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
  runtime.isValidationPending = true;
  const first = a.__state__;
  dispatchSetState(a, { [FieldNodeState.ErrorVisibility]: false });
  const second = a.__state__;
  dispatchSetState(a, { [FieldNodeState.ErrorVisibility]: true });
  expect(a.__revealBaseline__).toMatchObject({
    entries: [
      { state: first, isPresent: true },
      { state: second, isPresent: true },
    ],
  });
});
it('IR-6 H an intermediate hide within one batch coalesces to its painted entry', () => {
  const { root, a, clock } = fixture();
  dispatchSetState(a, { [FieldNodeState.ErrorVisibility]: true });
  clock.frame();
  return clock.task().then(() => {
    const before = a.__state__;
    dispatchBatch(root, () => {
      dispatchSetState(a, { [FieldNodeState.ErrorVisibility]: false });
      dispatchSetState(a, { [FieldNodeState.ErrorVisibility]: true });
    });
    expect(a.__revealBaseline__).toMatchObject({
      entries: [{ state: before, isPresent: true }],
    });
  });
});
it('IR-6 H a subtree walk shares one sequence across its standalone state writes', async () => {
  const { root, a, clock } = fixture();
  dispatchSetState(a, { [FieldNodeState.ErrorVisibility]: true });
  clock.frame();
  await clock.task();
  const before = a.__state__;
  dispatchVisitSubtree(root, (node) => {
    if (node === a) {
      dispatchSetState(a, { [FieldNodeState.ErrorVisibility]: false });
      dispatchSetState(a, { [FieldNodeState.ErrorVisibility]: true });
    }
  });
  expect(a.__revealBaseline__).toMatchObject({
    entries: [{ state: before, isPresent: true }],
  });
});
it('IR-6 H later nodes do not extend the first node past its captured release generation', async () => {
  const { root, a, b, clock } = fixture();
  dispatchSetState(a, { [FieldNodeState.Touched]: true });
  clock.frame();
  dispatchSetState(b, { [FieldNodeState.Touched]: true });
  await clock.task();
  expect(a.__revealBaseline__).toBeUndefined();
  expect(b.__revealBaseline__).toBeDefined();
  clock.frame();
  dispatchSetState(root, { [FieldNodeState.ErrorVisibility]: true });
  await clock.task();
  expect(b.__revealBaseline__).toBeUndefined();
  expect(root.__revealBaseline__).toBeDefined();
  clock.frame();
  await clock.task();
  expect(root.__revealBaseline__).toBeUndefined();
});
it.each(['setState', 'setSubtreeState', 'clearState'] as const)(
  'IR-6 H %s schedules a release even when its listener throws',
  async (api) => {
    const { root, a, clock } = fixture();
    dispatchSetState(a, { [FieldNodeState.ErrorVisibility]: true });
    clock.frame();
    await clock.task();
    const failure = new Error('state listener');
    const unsubscribe = subscribeFieldNode(a, () => {
      throw failure;
    });
    expect(() => {
      if (api === 'setState')
        dispatchSetState(a, { [FieldNodeState.ErrorVisibility]: false });
      else if (api === 'setSubtreeState')
        dispatchSetSubtreeState(root, {
          [FieldNodeState.ErrorVisibility]: false,
        });
      else dispatchClearSubtreeState(root);
    }).toThrow(failure);
    unsubscribe();
    clock.frame();
    await clock.task();
    expect(a.__revealBaseline__).toBeUndefined();
  },
);
it('IR-6 D accepted root validation releases quiet history without a frame', async () => {
  const { root, a, runtime } = fixture();
  dispatchSetState(a, { [FieldNodeState.ErrorVisibility]: true });
  expect(runtime.isValidationPending).toBeFalsy();
  await dispatchValidate(root);
  expect(a.__revealBaseline__).toBeUndefined();
  expect(runtime.revealDropTask).toBeUndefined();
});
it('IR-6 H a release listener can record and schedule its own fresh drop', async () => {
  const { a, b, runtime, clock } = fixture();
  let once = false;
  const listener = vi.fn(() => {
    if (!once) {
      once = true;
      dispatchSetState(b, { [FieldNodeState.ErrorVisibility]: true });
    }
  });
  Object.assign(runtime, { revealReleaseListeners: new Set([listener]) });
  dispatchSetState(a, { [FieldNodeState.ErrorVisibility]: true });
  clock.frame();
  await clock.task();
  expect(listener).toHaveBeenCalledTimes(1);
  expect(a.__revealBaseline__).toBeUndefined();
  expect(b.__revealBaseline__).toBeDefined();
  expect(runtime.revealDropTask).toBeDefined();
  clock.frame();
  await clock.task();
  expect(b.__revealBaseline__).toBeUndefined();
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
  runtime.isValidationPending = true;
  dispatchSetState(a, { [FieldNodeState.ErrorVisibility]: true });
  disposeFieldNodeTree(root);
  expect(listeners.size).toBe(0);
  expect(listener).not.toHaveBeenCalled();
  expect(a.__revealBaseline__).toBeUndefined();
  expect(runtime.revealPolicy).toBeUndefined();
});

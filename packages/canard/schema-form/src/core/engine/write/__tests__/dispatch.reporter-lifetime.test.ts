import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { ValidationMode } from '@/schema-form/core/engine/types/state';

import { adoptFieldNodeChain } from '../utils/chain/adoptFieldNodeChain';
import { abortFieldNodeChain } from '../utils/chain/chainAbort';
import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchSetState } from '../utils/entry/dispatchSetState';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';

/** Verify recovery through the same reporter, with no runtime repair by the test. */
const expectRecovery = (
  tree: ReturnType<typeof createDispatchTree>,
  report: ReturnType<typeof vi.fn>,
) => {
  const event = vi.fn();
  const onChange = vi.fn();
  const onStateChange = vi.fn();
  tree.runtime.onChange = onChange;
  tree.runtime.onStateChange = onStateChange;
  subscribeFieldNode(tree.root, event);
  dispatchSetValue(tree.root, 'recovered');
  expect(event).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledExactlyOnceWith('recovered');
  expect(onStateChange).not.toHaveBeenCalled();
  const later = new Error('later ordinary failure');
  expect(() =>
    dispatchSetValue(tree.root, () => {
      throw later;
    }),
  ).toThrow(later);
  expect(report).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ error: later }),
  );
};

// filid:contract dispatch-report
it.each([
  'listener',
  'nested',
  'caught nested',
  'record delivery',
  'cleanup callbacks',
])(
  'restores a standalone collector after a %s collaborator failure',
  (channel) => {
    const tree = createDispatchTree({ type: 'string' });
    dispatchMount(tree.root, 'old');
    tree.runtime.validationMode = ValidationMode.OnChange;
    tree.runtime.validationCadence = { request() {}, cancel() {} };
    dispatchSetValue(tree.root, 'pending');
    expect(tree.runtime.validationPending).toBe(true);
    const released = vi.fn(() => {
      if (channel === 'cleanup callbacks') throw new Error('release callback');
    });
    tree.runtime.revealReleaseListeners = new Set([released]);
    const failure = new Error('standalone reporter');
    let armed = false;
    const report = vi.fn();
    tree.runtime.errorReporter = {
      hasConsumer() {
        if (armed) {
          armed = false;
          throw failure;
        }
        return true;
      },
      report,
    };
    const applied = vi.fn(() => {
      if (channel === 'cleanup callbacks') throw new Error('settings callback');
    });
    const unsubscribe = subscribeFieldNode(tree.root, () => {
      tree.runtime.pendingSettings = applied;
      if (channel === 'record delivery') throw new Error('recorded listener');
      armed = true;
      if (channel === 'listener') throw new Error('listener');
      const nested = () =>
        dispatchSetValue(tree.root, () => {
          throw new Error('nested');
        });
      if (channel === 'caught nested') expect(nested).toThrow(failure);
      else nested();
    });
    if (channel === 'record delivery')
      tree.runtime.onStateChange = () => {
        armed = true;
      };
    expect(() => dispatchSetState(tree.root, { touched: true })).toThrow(
      failure,
    );
    expect(report).not.toHaveBeenCalled();
    expect(tree.runtime.validationPending).toBe(false);
    expect(released).toHaveBeenCalledTimes(1);
    expect(applied).toHaveBeenCalledTimes(1);
    unsubscribe();
    tree.runtime.validationMode = ValidationMode.None;
    expectRecovery(tree, report);
  },
);

it.each(['listener', 'onStateChange', 'onChange'])(
  'keeps the outer abort when %s catches its nested failure',
  (channel) => {
    const tree = createDispatchTree({ type: 'string' });
    dispatchMount(tree.root, 'old');
    tree.runtime.validationMode = ValidationMode.None;
    const failure = new Error('caught collaborator');
    let armed = false;
    const report = vi.fn();
    tree.runtime.errorReporter = {
      hasConsumer() {
        if (armed) {
          armed = false;
          throw failure;
        }
        return true;
      },
      report,
    };
    const nested = () => {
      armed = true;
      expect(() =>
        dispatchSetValue(tree.root, () => {
          throw new Error('nested');
        }),
      ).toThrow(failure);
    };
    let unsubscribe = () => {};
    if (channel === 'listener')
      unsubscribe = subscribeFieldNode(tree.root, nested);
    if (channel === 'onChange') tree.runtime.onChange = nested;
    if (channel === 'onStateChange') {
      tree.runtime.onStateChange = nested;
      tree.runtime.stateChanged = true;
    }
    expect(() => dispatchSetValue(tree.root, 'next')).toThrow(failure);
    expect(report).not.toHaveBeenCalled();
    expect(tree.runtime.entryDepth).toBe(0);
    unsubscribe();
    tree.runtime.validationMode = ValidationMode.None;
    expectRecovery(tree, report);
  },
);

it.each([1, 2])(
  'restores a suppressed reporter through %s later adoptions',
  (count) => {
    const previous = createDispatchTree({ type: 'string' });
    dispatchMount(previous.root, 'old');
    const failure = new Error('before adoption');
    const report = vi.fn();
    previous.runtime.errorReporter = { hasConsumer: () => true, report };
    let active = previous;
    expect(() =>
      dispatchBatch(previous.root, () => {
        abortFieldNodeChain(previous.runtime, failure);
        for (let index = 0; index < count; index++) {
          const next = createDispatchTree({ type: 'string' });
          adoptFieldNodeChain(active.root, next.root);
          active = next;
        }
      }),
    ).toThrow(failure);
    expect(report).not.toHaveBeenCalled();
    expect(previous.root.disposed).toBe(true);
    expect(active.runtime.entryDepth).toBe(0);
    expectRecovery(active, report);
  },
);

it('restores the most recent suppressed reporter after successive replacements', () => {
  const previous = createDispatchTree({ type: 'string' });
  const middle = createDispatchTree({ type: 'string' });
  const next = createDispatchTree({ type: 'string' });
  dispatchMount(previous.root, 'old');
  const originalReport = vi.fn();
  const report = vi.fn();
  previous.runtime.errorReporter = {
    hasConsumer: () => true,
    report: originalReport,
  };
  middle.runtime.errorReporter = { hasConsumer: () => true, report };
  const failure = new Error('first collaborator');
  expect(() =>
    dispatchBatch(previous.root, () => {
      abortFieldNodeChain(previous.runtime, failure);
      adoptFieldNodeChain(previous.root, middle.root);
      abortFieldNodeChain(middle.runtime, new Error('second collaborator'));
      adoptFieldNodeChain(middle.root, next.root);
    }),
  ).toThrow(failure);
  expectRecovery(next, report);
  expect(originalReport).not.toHaveBeenCalled();
});

it('cleans up a standalone collector on an owner adopted during its wave', () => {
  const previous = createDispatchTree({ type: 'string' });
  const next = createDispatchTree({ type: 'string' });
  dispatchMount(previous.root, 'old');
  const failure = new Error('adopted standalone');
  let armed = false;
  const report = vi.fn();
  next.runtime.errorReporter = {
    hasConsumer() {
      if (armed) {
        armed = false;
        throw failure;
      }
      return true;
    },
    report,
  };
  subscribeFieldNode(previous.root, () => {
    adoptFieldNodeChain(previous.root, next.root);
    armed = true;
    dispatchSetValue(next.root, () => {
      throw new Error('nested');
    });
  });
  expect(() => dispatchSetState(previous.root, { touched: true })).toThrow(
    failure,
  );
  expect(previous.root.disposed).toBe(true);
  expectRecovery(next, report);
});

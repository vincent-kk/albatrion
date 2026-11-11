import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { adoptFieldNodeChain } from '../utils/chain/adoptFieldNodeChain';
import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { dispatchVisitSubtree } from '../utils/entry/dispatchVisitSubtree';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';

/** Each independent recovery must still deliver and throw subsequent ordinary failures. */
const recover = (tree: ReturnType<typeof createDispatchTree>) => {
  tree.runtime.errorReporter = undefined;
  tree.runtime.onChange = vi.fn();
  const event = vi.fn();
  subscribeFieldNode(tree.root, event);
  dispatchSetValue(tree.root, 'recovered');
  expect(event).toHaveBeenCalledTimes(1);
  expect(tree.runtime.onChange).toHaveBeenCalledExactlyOnceWith('recovered');
  const later = new Error('later operation');
  expect(() =>
    dispatchSetValue(tree.root, () => {
      throw later;
    }),
  ).toThrow(later);
};

// filid:contract dispatch-report
it.each(['write', 'batch', 'visit'])(
  'preserves the reporter failure over a %s callback failure',
  (entry) => {
    const tree = createDispatchTree({ type: 'string' });
    dispatchMount(tree.root, 'old');
    const failure = new Error('predicate');
    const operation = new Error('operation');
    const predicate = vi.fn(() => {
      throw failure;
    });
    const report = vi.fn();
    tree.runtime.errorReporter = { hasConsumer: predicate, report };
    const callback = () => {
      throw operation;
    };
    expect(() => {
      if (entry === 'write') dispatchSetValue(tree.root, callback);
      else if (entry === 'batch') dispatchBatch(tree.root, callback);
      else
        dispatchVisitSubtree(tree.root, () =>
          dispatchSetValue(tree.root, callback),
        );
    }).toThrow(failure);
    expect(predicate).toHaveBeenCalledTimes(1);
    expect(report).not.toHaveBeenCalled();
    recover(tree);
  },
);

it('does not revisit a failed reporter when earlier batch records precede a flush failure', () => {
  const tree = createDispatchTree({ type: 'object' });
  dispatchMount(tree.root, {});
  const failure = new Error('flush predicate');
  let calls = 0;
  const report = vi.fn();
  tree.runtime.errorReporter = {
    hasConsumer() {
      calls += 1;
      if (calls === 2) throw failure;
      return true;
    },
    report,
  };
  expect(() =>
    dispatchBatch(tree.root, () => {
      dispatchSetValue(
        tree.root,
        new Proxy(
          {},
          {
            ownKeys() {
              throw new Error('flush');
            },
          },
        ),
        WriteOption.Merge,
      );
      throw new Error('callback');
    }),
  ).toThrow(failure);
  expect(calls).toBe(2);
  expect(report).not.toHaveBeenCalled();
  tree.runtime.errorReporter = undefined;
  const event = vi.fn();
  const onChange = vi.fn();
  subscribeFieldNode(tree.root, event);
  tree.runtime.onChange = onChange;
  dispatchSetValue(tree.root, { recovered: true });
  expect(event).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledTimes(1);
});

it('never reports an adoption predicate failure through the same recovered reporter', () => {
  const previous = createDispatchTree({ type: 'string' });
  const next = createDispatchTree({ type: 'string' });
  dispatchMount(previous.root, 'old');
  const failure = new Error('adopt predicate');
  const report = vi.fn();
  let calls = 0;
  next.runtime.errorReporter = {
    hasConsumer() {
      calls += 1;
      if (calls === 1) throw failure;
      return true;
    },
    report,
  };
  expect(() =>
    dispatchBatch(previous.root, () =>
      adoptFieldNodeChain(previous.root, next.root),
    ),
  ).toThrow(failure);
  expect(calls).toBe(1);
  expect(report).not.toHaveBeenCalled();
  recover(next);
});

it.each(['listener', 'onChange', 'onStateChange'])(
  'does not recursively report a nested predicate failure through %s',
  (channel) => {
    const tree = createDispatchTree({ type: 'string' });
    dispatchMount(tree.root, 'old');
    const failure = new Error('nested predicate');
    const report = vi.fn();
    let armed = false;
    let calls = 0;
    tree.runtime.validationMode = ValidationMode.None;
    tree.runtime.errorReporter = {
      hasConsumer() {
        if (armed || calls) calls += 1;
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
      dispatchSetValue(tree.root, () => {
        throw new Error('nested operation');
      });
    };
    let unsubscribe: () => void = () => undefined;
    if (channel === 'listener')
      unsubscribe = subscribeFieldNode(tree.root, nested);
    if (channel === 'onChange') tree.runtime.onChange = nested;
    if (channel === 'onStateChange') {
      tree.runtime.onStateChange = nested;
      tree.runtime.stateChanged = true;
    }
    expect(() => dispatchSetValue(tree.root, 'next')).toThrow(failure);
    expect(calls).toBe(1);
    expect(report).not.toHaveBeenCalled();
    expect(tree.runtime.errorReporter).toBeDefined();
    unsubscribe();
    tree.runtime.onStateChange = undefined;
    recover(tree);
  },
);

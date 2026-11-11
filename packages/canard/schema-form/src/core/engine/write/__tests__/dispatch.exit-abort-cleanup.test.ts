import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import { FormErrorCode, FormWarningCode } from '@/schema-form/errors';

import { adoptFieldNodeChain } from '../utils/chain/adoptFieldNodeChain';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchSetExternalErrors } from '../utils/entry/dispatchSetExternalErrors';
import { dispatchSetState } from '../utils/entry/dispatchSetState';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { dispatchUpdateSettings } from '../utils/entry/dispatchUpdateSettings';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract dispatch-report
it('releases prepared validation and applies deferred settings after scheduling aborts', () => {
  const tree = createDispatchTree({ type: 'string' });
  dispatchMount(tree.root, 'old');
  tree.runtime.validationMode = ValidationMode.OnChange;
  const released = vi.fn();
  tree.runtime.revealReleaseListeners = new Set([released]);
  const failure = new Error('scheduler');
  tree.runtime.validationCadence = {
    request() {
      throw failure;
    },
    cancel() {},
  };
  const applied = vi.fn();
  const unsubscribe = subscribeFieldNode(tree.root, () =>
    dispatchUpdateSettings(
      tree.root,
      {
        validationMode: ValidationMode.OnRequest,
        unsetOnInactive: true,
        disableAutomaticWrites: false,
      },
      applied,
    ),
  );
  expect(() => dispatchSetValue(tree.root, 'next')).toThrow(failure);
  expect(tree.runtime.validationPending).toBe(false);
  expect(released).toHaveBeenCalled();
  expect(applied).toHaveBeenCalledTimes(1);
  unsubscribe();
  const event = vi.fn();
  const onChange = vi.fn();
  subscribeFieldNode(tree.root, event);
  tree.runtime.onChange = onChange;
  dispatchSetValue(tree.root, 'recovered');
  expect(event).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledExactlyOnceWith('recovered');
});

it('discards interrupted delivery and state queues before the next independent write', () => {
  const tree = createDispatchTree({
    type: 'object',
    properties: { a: { type: 'string' }, b: { type: 'string' } },
  });
  dispatchMount(tree.root, { a: 'old', b: 'old' });
  const a = getDispatchChild(tree.root, 'a');
  const b = getDispatchChild(tree.root, 'b');
  let armed = false;
  const failure = new Error('queued predicate');
  const report = vi.fn();
  tree.runtime.errorReporter = {
    hasConsumer() {
      if (armed) throw failure;
      return true;
    },
    report,
  };
  const unsubscribe = subscribeFieldNode(a, () => {
    dispatchSetValue(b, 'queued');
    dispatchSetState(b, { touched: true });
    dispatchSetExternalErrors(b, [{ dataPath: '/b', message: 'queued' }]);
    tree.runtime.pendingWarningRecords = new Map([
      [
        'pending-warning',
        {
          level: 'warning',
          code: FormWarningCode.ValidatorMissing,
          message: 'pending',
        },
      ],
    ]);
    tree.runtime.guardFailureRecords = new Map([
      [
        'pending-guard',
        {
          level: 'error',
          code: FormErrorCode.FeedbackLimitExceeded,
          message: 'pending',
        },
      ],
    ]);
    armed = true;
    throw new Error('listener');
  });
  expect(() => dispatchSetValue(a, 'first')).toThrow(failure);
  expect(b.pendingDelivery).toBeUndefined();
  expect(b.pendingNonSettleDelivery).toBeUndefined();
  expect(tree.runtime.deliveries).toBeUndefined();
  expect(tree.runtime.queuedNonSettleEvents).toBeUndefined();
  expect(tree.runtime.pendingExternalErrorNodes).toBeUndefined();
  expect(tree.runtime.pendingWarningRecords).toBeUndefined();
  expect(tree.runtime.guardFailureRecords).toBeUndefined();
  unsubscribe();
  armed = false;
  const event = vi.fn();
  const stale = vi.fn();
  const onChange = vi.fn();
  const onStateChange = vi.fn();
  subscribeFieldNode(tree.root, event);
  subscribeFieldNode(b, stale);
  tree.runtime.onChange = onChange;
  tree.runtime.onStateChange = onStateChange;
  dispatchSetValue(a, 'recovered');
  expect(stale).not.toHaveBeenCalled();
  expect(onStateChange).not.toHaveBeenCalled();
  expect(event).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(report).not.toHaveBeenCalled();
});

it('applies deferred settings even when record delivery loses its reporter', () => {
  const tree = createDispatchTree({ type: 'string' });
  dispatchMount(tree.root, 'old');
  tree.runtime.validationMode = ValidationMode.None;
  const failure = new Error('record predicate');
  let armed = false;
  const report = vi.fn();
  tree.runtime.errorReporter = {
    hasConsumer() {
      if (armed) throw failure;
      return true;
    },
    report,
  };
  const applied = vi.fn(() => {
    throw new Error('settings callback');
  });
  const unsubscribe = subscribeFieldNode(tree.root, () => {
    throw new Error('listener');
  });
  tree.runtime.onChange = () => {
    dispatchUpdateSettings(
      tree.root,
      {
        validationMode: ValidationMode.OnRequest,
        unsetOnInactive: true,
        disableAutomaticWrites: false,
      },
      applied,
    );
    armed = true;
  };
  expect(() => dispatchSetValue(tree.root, 'next')).toThrow(failure);
  expect(applied).toHaveBeenCalledTimes(1);
  expect(report).not.toHaveBeenCalled();
  unsubscribe();
  armed = false;
  const onChange = vi.fn();
  const event = vi.fn();
  tree.runtime.onChange = onChange;
  subscribeFieldNode(tree.root, event);
  dispatchSetValue(tree.root, 'recovered');
  expect(event).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledExactlyOnceWith('recovered');
});

it('resolves an owner adopted in the first delivery wave when the next wave aborts', () => {
  const previous = createDispatchTree({ type: 'string' });
  const next = createDispatchTree({ type: 'string' });
  dispatchMount(previous.root, 'old');
  const failure = new Error('adopted listener predicate');
  let armed = false;
  const report = vi.fn();
  next.runtime.errorReporter = {
    hasConsumer() {
      if (armed) throw failure;
      return true;
    },
    report,
  };
  subscribeFieldNode(previous.root, () => {
    adoptFieldNodeChain(previous.root, next.root);
    dispatchSetValue(next.root, 'adopted');
  });
  const unsubscribe = subscribeFieldNode(next.root, () => {
    armed = true;
    throw new Error('listener');
  });
  expect(() => dispatchSetValue(previous.root, 'next')).toThrow(failure);
  expect(previous.runtime.entryDepth).toBe(0);
  expect(next.runtime.entryDepth).toBe(0);
  unsubscribe();
  armed = false;
  const event = vi.fn();
  const onChange = vi.fn();
  subscribeFieldNode(next.root, event);
  next.runtime.onChange = onChange;
  dispatchSetValue(next.root, 'recovered');
  expect(event).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledExactlyOnceWith('recovered');
  const later = new Error('later');
  expect(() =>
    dispatchSetValue(next.root, () => {
      throw later;
    }),
  ).toThrow(later);
});

it('keeps a failed reporter out of deferred settings callbacks while preserving its original failure', () => {
  const tree = createDispatchTree({ type: 'string' });
  dispatchMount(tree.root, 'old');
  tree.runtime.validationMode = ValidationMode.None;
  const failure = new Error('predicate before settings');
  let armed = false;
  let calls = 0;
  const report = vi.fn();
  tree.runtime.errorReporter = {
    hasConsumer() {
      if (armed) {
        calls += 1;
        throw failure;
      }
      return true;
    },
    report,
  };
  const applied = vi.fn(() => dispatchSetValue(tree.root, 'settings'));
  const unsubscribe = subscribeFieldNode(tree.root, () => {
    if (tree.root.local === 'next') {
      dispatchUpdateSettings(
        tree.root,
        {
          validationMode: ValidationMode.OnRequest,
          unsetOnInactive: false,
          disableAutomaticWrites: false,
        },
        applied,
      );
      armed = true;
    }
    throw new Error('listener');
  });
  expect(() => dispatchSetValue(tree.root, 'next')).toThrow(failure);
  expect(applied).toHaveBeenCalledTimes(1);
  expect(calls).toBe(1);
  expect(report).not.toHaveBeenCalled();
  unsubscribe();
  armed = false;
  const event = vi.fn();
  const onChange = vi.fn();
  subscribeFieldNode(tree.root, event);
  tree.runtime.onChange = onChange;
  dispatchSetValue(tree.root, 'recovered');
  expect(event).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledExactlyOnceWith('recovered');
  expect(tree.runtime.errorReporter).toBeDefined();
});

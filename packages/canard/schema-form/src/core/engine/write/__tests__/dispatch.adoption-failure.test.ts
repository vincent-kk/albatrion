import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';

import { adoptFieldNodeChain } from '../utils/chain/adoptFieldNodeChain';
import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchSetExternalErrors } from '../utils/entry/dispatchSetExternalErrors';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';

// filid:contract EVENT-030
it('closes a replacement when retained external errors throw during adoption', () => {
  const previous = createDispatchTree({ type: 'string' });
  const next = createDispatchTree({ type: 'string' });
  dispatchMount(previous.root, 'old');
  const report = vi.fn();
  previous.runtime.errorReporter = { hasConsumer: () => true, report };
  let continued = false;
  let broken = false;
  const failure = new Error('adoption external array');
  const errors = new Proxy([], {
    get(target, property, receiver) {
      if (broken && property === 'length') throw failure;
      return Reflect.get(target, property, receiver);
    },
  });
  dispatchSetExternalErrors(previous.root, errors);
  expect(() =>
    dispatchBatch(previous.root, () => {
      broken = true;
      adoptFieldNodeChain(previous.root, next.root);
      continued = true;
    }),
  ).toThrow(failure);
  expect(continued).toBe(true);
  expect(report).toHaveBeenCalledTimes(1);
  expect(report.mock.calls[0][0].error).toBe(failure);
  expect(previous.runtime.entryDepth).toBe(0);
  expect(next.runtime.entryDepth).toBe(0);
  broken = false;
  const onChange = vi.fn();
  next.runtime.onChange = onChange;
  dispatchSetValue(next.root, 'recovered');
  expect(onChange).toHaveBeenCalledExactlyOnceWith('recovered');
});

it('finishes the owner link when the injected reporter throws during adoption', () => {
  const previous = createDispatchTree({ type: 'string' });
  const next = createDispatchTree({ type: 'string' });
  dispatchMount(previous.root, 'old');
  const failure = new Error('adoption consumer');
  next.runtime.errorReporter = {
    hasConsumer: () => {
      throw failure;
    },
    report: () => undefined,
  };
  expect(() =>
    dispatchBatch(previous.root, () => {
      adoptFieldNodeChain(previous.root, next.root);
    }),
  ).toThrow(failure);
  expect(previous.runtime.entryDepth).toBe(0);
  expect(next.runtime.entryDepth).toBe(0);
  expect(previous.runtime.adoptedRoot).toBe(next.root);
  expect(previous.root.disposed).toBe(true);
  next.runtime.errorReporter = undefined;
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

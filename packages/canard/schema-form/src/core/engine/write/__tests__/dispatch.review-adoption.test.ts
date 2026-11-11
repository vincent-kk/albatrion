import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import { updateFieldNodeGlobalErrors } from '@/schema-form/core/engine/validation';

import { adoptFieldNodeChain } from '../utils/chain/adoptFieldNodeChain';
import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchSetExternalErrors } from '../utils/entry/dispatchSetExternalErrors';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract EVENT-030
it('drops a failed root restore before mount and reports its failure only once', () => {
  const previous = createDispatchTree({ type: 'string' });
  const next = createDispatchTree({ type: 'string' });
  next.runtime.validationMode = ValidationMode.None;
  dispatchMount(previous.root, 'old');
  const failure = new Error('retained root list');
  let broken = false;
  const errors = new Proxy([], {
    get(target, key, receiver) {
      if (broken && key === 'length') throw failure;
      return Reflect.get(target, key, receiver);
    },
  });
  dispatchSetExternalErrors(previous.root, errors);
  const report = vi.fn();
  previous.runtime.errorReporter = { hasConsumer: () => true, report };
  expect(() =>
    dispatchBatch(previous.root, () => {
      broken = true;
      adoptFieldNodeChain(previous.root, next.root);
      dispatchMount(next.root, 'mounted');
    }),
  ).toThrow(failure);
  expect(report.mock.calls.map(([record]) => record.error)).toEqual([failure]);
  expect(() => updateFieldNodeGlobalErrors(next.root)).not.toThrow();
  // The bad list stays unreadable: a later global-error rebuild must not revisit it.
  expect(() => dispatchMount(next.root, 'again')).not.toThrow();
  const event = vi.fn();
  const onChange = vi.fn();
  subscribeFieldNode(next.root, event);
  next.runtime.onChange = onChange;
  dispatchSetValue(next.root, 'recovered');
  expect(event).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledExactlyOnceWith('recovered');
});

it('completes adoption and mount after previous-root external aggregation fails', () => {
  const schema = { type: 'object', properties: { a: { type: 'string' } } };
  const previous = createDispatchTree(schema);
  const next = createDispatchTree(schema);
  next.runtime.validationMode = ValidationMode.None;
  dispatchMount(previous.root, { a: 'old' });
  const failure = new Error('previous aggregate');
  dispatchSetExternalErrors(previous.root, [
    {
      get dataPath(): string {
        throw failure;
      },
      message: 'bad',
    },
  ]);
  const report = vi.fn();
  previous.runtime.errorReporter = { hasConsumer: () => true, report };
  let mounted = false;
  expect(() =>
    dispatchBatch(previous.root, () => {
      dispatchSetExternalErrors(getDispatchChild(previous.root, 'a'), [
        { dataPath: '/a', message: 'child' },
      ]);
      adoptFieldNodeChain(previous.root, next.root);
      dispatchMount(next.root, { a: 'new' });
      mounted = true;
    }),
  ).toThrow(failure);
  expect(mounted).toBe(true);
  expect(previous.root.disposed).toBe(true);
  expect(report.mock.calls.map(([record]) => record.error)).toEqual([failure]);
  const event = vi.fn();
  const onChange = vi.fn();
  subscribeFieldNode(next.root, event);
  next.runtime.onChange = onChange;
  dispatchSetValue(getDispatchChild(next.root, 'a'), 'recovered');
  expect(event).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledExactlyOnceWith({ a: 'recovered' });
});

it('settles the adopted owner when aggregation capture itself loses its reporter', () => {
  const schema = { type: 'object', properties: { a: { type: 'string' } } };
  const previous = createDispatchTree(schema);
  const next = createDispatchTree(schema);
  next.runtime.validationMode = ValidationMode.None;
  dispatchMount(previous.root, { a: 'old' });
  let armed = false;
  const failure = new Error('aggregate reporter');
  dispatchSetExternalErrors(previous.root, [
    {
      get dataPath(): string {
        armed = true;
        throw new Error('aggregate');
      },
      message: 'bad',
    },
  ]);
  const report = vi.fn();
  previous.runtime.errorReporter = {
    hasConsumer() {
      if (armed) throw failure;
      return true;
    },
    report,
  };
  expect(() =>
    dispatchBatch(previous.root, () => {
      dispatchSetExternalErrors(getDispatchChild(previous.root, 'a'), [
        { dataPath: '/a', message: 'child' },
      ]);
      adoptFieldNodeChain(previous.root, next.root);
    }),
  ).toThrow(failure);
  expect(previous.root.disposed).toBe(true);
  expect(report).not.toHaveBeenCalled();
  armed = false;
  const event = vi.fn();
  const onChange = vi.fn();
  subscribeFieldNode(next.root, event);
  next.runtime.onChange = onChange;
  dispatchSetValue(next.root, { a: 'recovered' });
  expect(event).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledExactlyOnceWith({ a: 'recovered' });
});

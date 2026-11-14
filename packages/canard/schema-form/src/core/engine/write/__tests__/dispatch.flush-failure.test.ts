import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import { adoptFieldNodeChain } from '../utils/chain/adoptFieldNodeChain';
import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchRelayInput } from '../utils/entry/dispatchRelayInput';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { dispatchVisitSubtree } from '../utils/entry/dispatchVisitSubtree';
import { dispatchWriteInput } from '../utils/entry/dispatchWriteInput';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';
import { getDispatchChild } from './fixtures/getDispatchChild';

/** A mounted tree whose root event and form callbacks observe only later writes. */
const setup = () => {
  const report = vi.fn();
  const tree = createDispatchTree(
    {
      type: 'object',
      properties: {
        a: { type: 'object', properties: { b: { type: 'string' } } },
        other: { type: 'string' },
      },
    },
    undefined,
    undefined,
    { hasConsumer: () => true, report },
  );
  dispatchMount(tree.root, { a: { b: 'old' }, other: 'old' });
  report.mockClear();
  const onChange = vi.fn();
  const event = vi.fn();
  tree.runtime.onChange = onChange;
  subscribeFieldNode(tree.root, event);
  return {
    ...tree,
    report,
    onChange,
    event,
    a: getDispatchChild(tree.root, 'a'),
    b: getDispatchChild(getDispatchChild(tree.root, 'a'), 'b'),
    other: getDispatchChild(tree.root, 'other'),
  };
};

/** Fail while origins enumerate a Merge value, before settlement starts. */
const ownKeysFailure = (error: Error) =>
  new Proxy(
    {},
    {
      ownKeys() {
        throw error;
      },
    },
  );

/** Shared postconditions distinguish a caught throw from a completed chain. */
const expectFailedFlush = (tree: ReturnType<typeof setup>, error: unknown) => {
  expect(tree.runtime.entryDepth).toBe(0);
  expect(tree.root.local).toEqual({ a: { b: 'old' }, other: 'old' });
  expect(tree.runtime.batchWrites).toBeUndefined();
  expect(tree.runtime.inputRelays).toBeUndefined();
  expect(tree.report).toHaveBeenCalledTimes(1);
  expect(tree.report.mock.calls[0][0].error).toBe(error);
  expect(tree.onChange).not.toHaveBeenCalled();
};

// filid:contract dispatch-report
describe('batch flush failures', () => {
  it('captures a revoked Proxy during Merge origin classification', () => {
    const tree = setup();
    const { proxy, revoke } = Proxy.revocable({}, {});
    revoke();
    let failure: unknown;
    try {
      dispatchBatch(tree.root, () =>
        dispatchSetValue(tree.a, proxy, WriteOption.Merge),
      );
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(TypeError);
    expectFailedFlush(tree, failure);
  });

  it('captures a getter failure while composing overlapping batch writes', () => {
    const tree = setup();
    const error = new Error('compose getter');
    expect(() =>
      dispatchBatch(tree.root, () => {
        dispatchSetValue(tree.a, {
          get b() {
            throw error;
          },
        });
        dispatchSetValue(tree.b, 'next');
      }),
    ).toThrow(error);
    expectFailedFlush(tree, error);
  });

  it('exits a visit-owned batch after overlapping writes fail to compose', () => {
    const tree = setup();
    const error = new Error('visit getter');
    expect(() =>
      dispatchVisitSubtree(tree.root, (node) => {
        if (node === tree.a)
          dispatchSetValue(tree.a, {
            get b() {
              throw error;
            },
          });
        if (node === tree.b) dispatchSetValue(tree.b, 'next');
      }),
    ).toThrow(error);
    expectFailedFlush(tree, error);
    expect(tree.runtime.visitDepth).toBe(0);
  });

  it('reports an input Merge ownKeys failure at chain end', () => {
    const tree = setup();
    const error = new Error('input ownKeys');
    expect(() =>
      dispatchWriteInput(tree.a, ownKeysFailure(error), WriteOption.Merge),
    ).toThrow(error);
    expectFailedFlush(tree, error);
  });

  it('clears relays and reports a relayed Merge ownKeys failure', () => {
    const tree = setup();
    const error = new Error('relay ownKeys');
    expect(() =>
      dispatchRelayInput(
        tree.a,
        ownKeysFailure(error),
        WriteOption.Merge,
        (value, option) => dispatchSetValue(tree.a, value, option),
      ),
    ).toThrow(error);
    expectFailedFlush(tree, error);
  });

  it('bundles the callback failure before the flush failure and reports each once', () => {
    const tree = setup();
    const callback = new Error('callback');
    const flush = new Error('flush');
    let failure: unknown;
    try {
      dispatchBatch(tree.root, () => {
        dispatchSetValue(tree.a, ownKeysFailure(flush), WriteOption.Merge);
        throw callback;
      });
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(SchemaFormError);
    if (!(failure instanceof SchemaFormError))
      throw new Error('Expected bundle');
    expect(failure.code).toBe(FormErrorCode.MultipleErrors);
    expect(failure.details.errors).toEqual([callback, flush]);
    expect(tree.report.mock.calls.map(([record]) => record.error)).toEqual([
      callback,
      flush,
    ]);
    expect(tree.runtime.entryDepth).toBe(0);
  });

  it('delivers one event and one onChange for the next independent write', () => {
    const tree = setup();
    const error = new Error('flush');
    expect(() =>
      dispatchBatch(tree.root, () =>
        dispatchSetValue(tree.a, ownKeysFailure(error), WriteOption.Merge),
      ),
    ).toThrow(error);
    tree.event.mockClear();
    tree.onChange.mockClear();
    dispatchSetValue(tree.other, 'recovered');
    expect(tree.event).toHaveBeenCalledTimes(1);
    expect(tree.onChange).toHaveBeenCalledExactlyOnceWith({
      a: { b: 'old' },
      other: 'recovered',
    });
  });

  it('does not transfer a stuck entry to a rebuilt tree', () => {
    const tree = setup();
    const error = new Error('flush');
    expect(() =>
      dispatchBatch(tree.root, () =>
        dispatchSetValue(tree.a, ownKeysFailure(error), WriteOption.Merge),
      ),
    ).toThrow(error);
    const next = setup();
    adoptFieldNodeChain(tree.root, next.root);
    dispatchMount(next.root, { a: { b: 'old' }, other: 'old' });
    next.event.mockClear();
    next.onChange.mockClear();
    dispatchSetValue(next.other, 'rebuilt');
    expect(next.runtime.entryDepth).toBe(0);
    expect(next.event).toHaveBeenCalledTimes(1);
    expect(next.onChange).toHaveBeenCalledTimes(1);
  });

  it('already captures the same ownKeys failure without a batch', () => {
    const tree = setup();
    const error = new Error('direct');
    expect(() =>
      dispatchSetValue(tree.a, ownKeysFailure(error), WriteOption.Merge),
    ).toThrow(error);
    expectFailedFlush(tree, error);
  });

  it('already captures an Overwrite getter failure inside settlement', () => {
    const tree = setup();
    const error = new Error('overwrite');
    expect(() =>
      dispatchBatch(tree.root, () =>
        dispatchSetValue(
          tree.a,
          {
            get b() {
              throw error;
            },
          },
          WriteOption.Overwrite,
        ),
      ),
    ).toThrow(error);
    expectFailedFlush(tree, error);
  });
});

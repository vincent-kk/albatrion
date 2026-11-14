import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { adoptFieldNodeChain } from '../utils/chain/adoptFieldNodeChain';
import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchRelayInput } from '../utils/entry/dispatchRelayInput';
import { dispatchResetSubtree } from '../utils/entry/dispatchResetSubtree';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { readFieldNodeRevision } from '../utils/read/readFieldNodeRevision';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract input-relay-cleanup
describe('relay cleanup across immediate commits and failed flushes', () => {
  it('consumes at an immediate reset before the same batch marks its later write', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'base');
    dispatchSetValue(root, 'edited');
    let afterReset = 0;
    dispatchRelayInput(root, 'x', WriteOption.Overwrite, (value) => {
      dispatchResetSubtree(root);
      afterReset = readFieldNodeRevision(
        root,
        FieldNodeEventType.RequestRefresh,
      );
      dispatchSetValue(root, value);
    });
    expect(root.local).toBe('x');
    expect(readFieldNodeRevision(root, FieldNodeEventType.RequestRefresh)).toBe(
      afterReset + 1,
    );
    expect(runtime.inputRelays).toBeUndefined();
  });

  it('clears an outer flush rejected before commit after the caller mutates a marked virtual tuple', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
      options: { virtual: { pair: { fields: ['a', 'b'] } } },
    });
    dispatchMount(root, { a: 'old', b: 'old' });
    const pair = getDispatchChild(root, 'pair');
    const emitted = ['x', 'y'];
    const before = runtime.commitNumber;
    expect(() =>
      dispatchBatch(root, () => {
        dispatchRelayInput(pair, emitted, WriteOption.Overwrite, (value) =>
          dispatchSetValue(pair, value),
        );
        emitted.pop();
      }),
    ).toThrow('Invalid virtual node values at /pair');
    expect(runtime.commitNumber).toBe(before);
    expect(runtime.inputRelays).toBeUndefined();
    expect(root.local).toEqual({ a: 'old', b: 'old' });
    const child = getDispatchChild(root, 'a');
    const refresh = readFieldNodeRevision(
      child,
      FieldNodeEventType.RequestRefresh,
    );
    dispatchSetValue(pair, ['x', 'y']);
    expect(
      readFieldNodeRevision(child, FieldNodeEventType.RequestRefresh),
    ).toBe(refresh + 1);
  });

  it('clears a pending relay when the only marked target disappears before flush', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        input: { type: 'string', controls: { active: '../show' } },
        other: { type: 'string' },
      },
    });
    dispatchMount(root, { show: false, other: 'old' });
    const show = getDispatchChild(root, 'show');
    dispatchSetValue(show, true);
    const input = getDispatchChild(root, 'input');
    const other = getDispatchChild(root, 'other');
    const before = readFieldNodeRevision(
      other,
      FieldNodeEventType.RequestRefresh,
    );
    dispatchBatch(root, () => {
      dispatchSetValue(input, 'marked');
      dispatchResetSubtree(show);
      expect(input.detached).toBe(true);
      expect(root.structure?.input).toBeUndefined();
      dispatchRelayInput(other, 'x', WriteOption.Overwrite, () => undefined);
      expect(runtime.inputRelays).toHaveLength(1);
      expect(runtime.batchWrites).toHaveLength(1);
    });
    const remainingRelays = runtime.inputRelays;
    dispatchSetValue(other, 'x');
    expect(other.local).toBe('x');
    expect(
      readFieldNodeRevision(other, FieldNodeEventType.RequestRefresh),
    ).toBe(before + 1);
    expect(remainingRelays).toBeUndefined();
  });

  it.each(['composition', 'origins'])(
    'clears relay records when %s construction throws before settlement',
    (phase) => {
      const { root, runtime } = createDispatchTree({
        type: 'object',
        properties: {
          a: { type: 'object', options: { terminal: true } },
          b: { type: 'string' },
        },
      });
      dispatchMount(root, { a: { x: 'old' }, b: 'old' });
      const a = getDispatchChild(root, 'a');
      const failure = new Error(phase);
      const value =
        phase === 'composition'
          ? {
              get x() {
                throw failure;
              },
            }
          : new Proxy(
              {},
              {
                ownKeys: () => {
                  throw failure;
                },
              },
            );
      expect(() =>
        dispatchBatch(root, () => {
          dispatchRelayInput(a, value, WriteOption.Merge, (input) =>
            dispatchSetValue(a, input, WriteOption.Merge),
          );
          if (phase === 'composition')
            dispatchSetValue(getDispatchChild(root, 'b'), 'next');
        }),
      ).toThrow(failure);
      expect(runtime.inputRelays === undefined).toBe(true);
    },
  );

  it('clears an earlier nested relay when the enclosing batch adopts a new root', () => {
    const previous = createDispatchTree({ type: 'string' });
    dispatchMount(previous.root, 'old');
    const next = createDispatchTree({ type: 'string' });
    dispatchBatch(previous.root, () => {
      dispatchRelayInput(
        previous.root,
        'x',
        WriteOption.Overwrite,
        () => undefined,
      );
      expect(previous.runtime.inputRelays).toHaveLength(1);
      adoptFieldNodeChain(previous.root, next.root);
    });
    expect(previous.root.disposed).toBe(true);
    expect(previous.runtime.inputRelays).toBeUndefined();
    expect(next.runtime.inputRelays).toBeUndefined();
  });

  it.each([false, true])(
    'clears a record created after updater adoption with outer batch=%s',
    (batched) => {
      const previous = createDispatchTree({ type: 'string' });
      const next = createDispatchTree({ type: 'string' });
      dispatchMount(previous.root, 'old');
      dispatchMount(next.root, 'next');
      const emit = () =>
        dispatchRelayInput(
          previous.root,
          () => {
            adoptFieldNodeChain(previous.root, next.root);
            expect(previous.runtime.inputRelays).toBeUndefined();
            return 'x';
          },
          WriteOption.Overwrite,
          (value) => {
            expect(previous.runtime.inputRelays).toHaveLength(1);
            expect(next.runtime.inputRelays).toBeUndefined();
            dispatchSetValue(next.root, value);
          },
        );
      if (batched) dispatchBatch(previous.root, emit);
      else emit();
      expect(previous.root.disposed).toBe(true);
      expect(previous.root.local).toBe('old');
      expect(next.root.local).toBe('x');
      expect(previous.runtime.inputRelays).toBeUndefined();
      expect(next.runtime.inputRelays).toBeUndefined();
    },
  );

  it('reports a throwing updater through the outer entry error path', () => {
    const report = vi.fn();
    const { root, runtime } = createDispatchTree(
      { type: 'string' },
      undefined,
      undefined,
      { hasConsumer: () => true, report },
    );
    dispatchMount(root, 'old');
    report.mockClear();
    const failure = new Error('updater');
    const relay = vi.fn();
    expect(() =>
      dispatchRelayInput(
        root,
        () => {
          throw failure;
        },
        WriteOption.Overwrite,
        relay,
      ),
    ).toThrow(failure);
    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({ error: failure, origin: 'write' }),
    );
    expect(relay).not.toHaveBeenCalled();
    expect(runtime.entryDepth).toBe(0);
    expect(runtime.inputRelays).toBeUndefined();
    expect(root.local).toBe('old');
  });

  it('does not evaluate or record a relay refused during an inactive-value resolver', () => {
    const updater = vi.fn(() => 'refused');
    const relay = vi.fn();
    const attempt = vi.fn(() => {
      dispatchRelayInput(
        getDispatchChild(root, 'other'),
        updater,
        WriteOption.Overwrite,
        relay,
      );
      expect(runtime.inputRelays).toBeUndefined();
    });
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        input: {
          type: 'string',
          controls: {
            active: '../show',
            inactiveValue: () => {
              attempt();
              return 'retained';
            },
          },
        },
        other: { type: 'string' },
      },
    });
    dispatchMount(root, { show: false, other: 'old' });
    const show = getDispatchChild(root, 'show');
    dispatchSetValue(show, true);
    dispatchBatch(root, () => dispatchResetSubtree(show));
    expect(attempt).toHaveBeenCalledOnce();
    expect(updater).not.toHaveBeenCalled();
    expect(relay).not.toHaveBeenCalled();
    expect(getDispatchChild(root, 'other').local).toBe('old');
  });

  it.each(['root', 'child'])(
    'ignores an already disposed %s without evaluating its updater',
    (target) => {
      const previous = createDispatchTree({
        type: 'object',
        properties: { child: { type: 'string' } },
      });
      dispatchMount(previous.root, { child: 'old' });
      const node =
        target === 'root'
          ? previous.root
          : getDispatchChild(previous.root, 'child');
      const next = createDispatchTree({ type: 'object' });
      adoptFieldNodeChain(previous.root, next.root);
      const updater = vi.fn(() => 'late');
      const relay = vi.fn();
      expect(() =>
        dispatchRelayInput(node, updater, WriteOption.Overwrite, relay),
      ).not.toThrow();
      expect(updater).not.toHaveBeenCalled();
      expect(relay).not.toHaveBeenCalled();
      expect(previous.runtime.inputRelays).toBeUndefined();
      expect(next.runtime.inputRelays).toBeUndefined();
    },
  );

  it('uses the committed virtual tuple identity when no batch was open at entry', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
      options: { virtual: { pair: { fields: ['a', 'b'] } } },
    });
    dispatchMount(root, { a: 'a', b: 'b' });
    const pair = getDispatchChild(root, 'pair');
    const committed = pair.local;
    const updater = vi.fn((previous: unknown) => {
      expect(previous).toBe(committed);
      return previous;
    });
    dispatchRelayInput(pair, updater, WriteOption.Overwrite, (value) =>
      dispatchSetValue(pair, value),
    );
    expect(updater).toHaveBeenCalledOnce();
  });
});

import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { writeFieldNode } from '@/schema-form/core/engine/settle';
import { arrangeFieldNodeItems } from '@/schema-form/core/engine/settle/arrangeFieldNodeItems';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { adoptFieldNodeChain } from '../utils/chain/adoptFieldNodeChain';
import { dispatchBatch } from '../utils/entry/dispatchBatch';
import { dispatchMount } from '../utils/entry/dispatchMount';
import { dispatchRelayInput } from '../utils/entry/dispatchRelayInput';
import { dispatchSetExternalErrors } from '../utils/entry/dispatchSetExternalErrors';
import { dispatchSetValue } from '../utils/entry/dispatchSetValue';
import { readFieldNodeRevision } from '../utils/read/readFieldNodeRevision';
import { subscribeFieldNode } from '../utils/read/subscribeFieldNode';
import { getDispatchChild } from './fixtures/getDispatchChild';

/** Default replacement flags for each relayed input. */
const OPTION = WriteOption.Overwrite;
/** Revision channel that controls input replacement. */
const REFRESH = FieldNodeEventType.RequestRefresh;

// filid:contract input-relay-lifetime
describe('binding input relay', () => {
  it('does not Refresh the relayed node when the parent commits its emitted value', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: { input: { type: 'string' }, other: { type: 'string' } },
    });
    dispatchMount(root, { input: 'old', other: 'old' });
    const input = getDispatchChild(root, 'input');
    const other = getDispatchChild(root, 'other');
    const before = readFieldNodeRevision(input, REFRESH);
    const siblingBefore = readFieldNodeRevision(other, REFRESH);
    dispatchRelayInput(input, 'x', OPTION, (value) =>
      dispatchSetValue(root, { input: value, other: 'computed' }),
    );
    expect(input.local).toBe('x');
    expect(readFieldNodeRevision(input, REFRESH)).toBe(before);
    expect(readFieldNodeRevision(other, REFRESH)).toBe(siblingBefore + 1);
    expect(runtime.inputRelays).toBeUndefined();
  });

  it('Refreshes the relayed node when the parent commits a different value', () => {
    const { root } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'old');
    const before = readFieldNodeRevision(root, REFRESH);
    dispatchRelayInput(root, 'x', OPTION, () => dispatchSetValue(root, 'X'));
    expect(root.local).toBe('X');
    expect(readFieldNodeRevision(root, REFRESH)).toBe(before + 1);
  });

  it('keeps only the last emission: emitting x then y and committing x refreshes it', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'old');
    const before = readFieldNodeRevision(root, REFRESH);
    dispatchBatch(root, () => {
      dispatchRelayInput(root, 'x', OPTION, () => dispatchSetValue(root, 'x'));
      dispatchRelayInput(root, 'y', OPTION, () => undefined);
      expect(runtime.inputRelays).toEqual([
        { node: root, path: '', value: 'y' },
      ]);
    });
    expect(root.local).toBe('x');
    expect(readFieldNodeRevision(root, REFRESH)).toBe(before + 1);
  });

  it('evaluates an updater once at entry and passes its value to the callback', () => {
    const { root } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'old');
    const updater = vi.fn((value: string) => value + 'x');
    const relay = vi.fn((value: unknown) => dispatchSetValue(root, value));
    dispatchRelayInput(root, updater, OPTION, relay);
    expect(updater).toHaveBeenCalledExactlyOnceWith('old');
    expect(relay).toHaveBeenCalledExactlyOnceWith('oldx', OPTION);
    expect(root.local).toBe('oldx');
  });

  it('evaluates an updater against earlier pending writes inside a user batch', () => {
    const { root } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'old');
    const updater = vi.fn((value: string) => value + 'x');
    dispatchBatch(root, () => {
      dispatchSetValue(root, 'pending');
      dispatchRelayInput(root, updater, OPTION, (value) =>
        dispatchSetValue(root, value),
      );
    });
    expect(updater).toHaveBeenCalledExactlyOnceWith('pending');
    expect(root.local).toBe('pendingx');
  });

  it('consumes relay records before a commit listener starts a reentrant write', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'old');
    let first = true;
    const before = readFieldNodeRevision(root, REFRESH);
    subscribeFieldNode(root, () => {
      if (!first) return;
      first = false;
      expect(runtime.inputRelays).toBeUndefined();
      dispatchSetValue(root, 'followup');
    });
    dispatchRelayInput(root, 'x', OPTION, (value) =>
      dispatchSetValue(root, value),
    );
    expect(first).toBe(false);
    expect(root.local).toBe('followup');
    expect(readFieldNodeRevision(root, REFRESH)).toBe(before + 1);
  });

  it('clears a relay without a commit before the next independent write', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'old');
    const before = readFieldNodeRevision(root, REFRESH);
    dispatchRelayInput(root, 'x', OPTION, () => undefined);
    expect(runtime.inputRelays).toBeUndefined();
    expect(root.local).toBe('old');
    dispatchSetValue(root, 'x');
    expect(readFieldNodeRevision(root, REFRESH)).toBe(before + 1);
  });

  it('retains a nested relay until the outer user batch commits and then clears it', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'old');
    const before = readFieldNodeRevision(root, REFRESH);
    dispatchBatch(root, () => {
      dispatchRelayInput(root, 'x', OPTION, (value) =>
        dispatchSetValue(root, value),
      );
      expect(runtime.inputRelays).toHaveLength(1);
      expect(root.local).toBe('old');
    });
    expect(root.local).toBe('x');
    expect(readFieldNodeRevision(root, REFRESH)).toBe(before);
    expect(runtime.inputRelays).toBeUndefined();
    dispatchSetValue(root, 'later');
    expect(readFieldNodeRevision(root, REFRESH)).toBe(before + 1);
  });

  it('clears nested relay records when the outer batch flushes without value writes', () => {
    const { root, runtime } = createDispatchTree({ type: 'string' });
    dispatchMount(root, 'old');
    dispatchBatch(root, () => {
      dispatchRelayInput(root, 'x', OPTION, () => undefined);
      expect(runtime.inputRelays).toHaveLength(1);
    });
    expect(runtime.inputRelays).toBeUndefined();
    const before = readFieldNodeRevision(root, REFRESH);
    dispatchSetValue(root, 'x');
    expect(readFieldNodeRevision(root, REFRESH)).toBe(before + 1);
  });

  it('Refreshes a moved input written after an engine insertion in the same batch', () => {
    const { root, runtime } = createDispatchTree({
      type: 'array',
      items: { type: 'string' },
    });
    dispatchMount(root, ['old']);
    const input = getDispatchChild(root, '0');
    const before = readFieldNodeRevision(input, REFRESH);
    dispatchBatch(root, () => {
      dispatchRelayInput(input, 'x', OPTION, (value) => {
        arrangeFieldNodeItems(root, {
          kind: 'insert',
          index: 0,
          value: 'inserted',
        });
        expect(input.path).toBe('/1');
        dispatchSetValue(input, value);
      });
    });
    expect(root.local).toEqual(['inserted', 'x']);
    expect(readFieldNodeRevision(input, REFRESH)).toBe(before + 1);
    expect(runtime.inputRelays).toBeUndefined();
  });

  it('does not carry a detached occurrence relay into the replacement at its path', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        input: { type: 'string', controls: { active: '../show' } },
      },
    });
    dispatchMount(root, { show: true, input: 'x' });
    const input = getDispatchChild(root, 'input');
    dispatchRelayInput(input, 'x', OPTION, () => {
      writeFieldNode(
        getDispatchChild(root, 'show'),
        false,
        'callerReplace',
        OPTION,
      );
      expect(input.detached).toBe(true);
      expect(runtime.inputRelays).toBeUndefined();
      dispatchSetValue(root, { show: true, input: 'replacement' });
    });
    const replacement = getDispatchChild(root, 'input');
    expect(replacement).not.toBe(input);
    expect(replacement.local).toBe('replacement');
    expect(readFieldNodeRevision(replacement, REFRESH)).toBeGreaterThan(0);
    expect(input.local).toBe('x');
  });

  it('does not apply a disposed occurrence relay to the new root commit', () => {
    const previous = createDispatchTree({ type: 'string' });
    dispatchMount(previous.root, 'x');
    const next = createDispatchTree({ type: 'string' });
    const before = readFieldNodeRevision(next.root, REFRESH);
    dispatchRelayInput(previous.root, 'x', OPTION, () => {
      adoptFieldNodeChain(previous.root, next.root);
      expect(previous.root.disposed).toBe(true);
      dispatchMount(next.root, 'x');
    });
    expect(next.root.local).toBe('x');
    expect(readFieldNodeRevision(next.root, REFRESH)).toBe(before + 1);
  });

  it('leaves no relay in either runtime when the callback replaces the root', () => {
    const previous = createDispatchTree({ type: 'string' });
    dispatchMount(previous.root, 'old');
    dispatchSetExternalErrors(previous.root, [
      { dataPath: '', message: 'kept' },
    ]);
    const state = previous.root.interactionState;
    const next = createDispatchTree({ type: 'string' });
    expect(() =>
      dispatchRelayInput(previous.root, 'x', OPTION, () => {
        adoptFieldNodeChain(previous.root, next.root);
        expect(next.runtime.inputRelays).toBeUndefined();
        dispatchMount(next.root, 'x');
      }),
    ).not.toThrow();
    expect(previous.runtime.inputRelays).toBeUndefined();
    expect(next.runtime.inputRelays).toBeUndefined();
    expect(previous.root.interactionState).toBe(state);
    expect(previous.runtime.nodeErrors?.get(previous.root)).toEqual([
      { dataPath: '', message: 'kept' },
    ]);
    expect(next.root.local).toBe('x');
  });

  it.each([
    { type: 'object', value: { x: 'new' }, copy: { x: 'new' } },
    { type: 'array', value: ['new'], copy: ['new'] },
  ])(
    'Refreshes a structurally equal new $type reference',
    ({ type, value, copy }) => {
      const { root } = createDispatchTree({
        type,
        options: { terminal: true },
      });
      dispatchMount(root);
      const before = readFieldNodeRevision(root, REFRESH);
      dispatchRelayInput(root, value, OPTION, () =>
        dispatchSetValue(root, copy),
      );
      expect(root.local).toEqual(value);
      expect(root.local).not.toBe(value);
      expect(readFieldNodeRevision(root, REFRESH)).toBe(before + 1);
    },
  );
});

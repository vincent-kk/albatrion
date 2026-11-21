import { describe, expect, it } from 'vitest';

import { equals } from '@winglet/common-utils/object';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import {
  FieldNodeWriteKind,
  WriteOption,
} from '@/schema-form/core/engine/types/value';
import {
  adoptFieldNodeChain,
  dispatchBatch,
  dispatchMount,
  dispatchRelayInput,
} from '@/schema-form/core/engine/write';

import { arrangeFieldNodeItems } from '../arrangeFieldNodeItems';
import { isRelayedInput } from '../utils/commit/utils/isRelayedInput';
import { writeFieldNode } from '../utils/write/writeFieldNode';

/** Default replacement flags for relay guard fixtures. */
const OPTION = WriteOption.Overwrite;

// filid:contract settle-relayed-input
describe('committed relay eligibility', () => {
  it('rejects both addresses after engine insertion moves the node; whole-array writes do not move nodes', () => {
    const { root, runtime } = createDispatchTree({
      type: 'array',
      items: { type: 'string' },
    });
    dispatchMount(root, ['x']);
    const input = root.children![0];
    dispatchBatch(root, () => {
      dispatchRelayInput(input, 'x', OPTION, () => {
        const relays = runtime.inputRelays!;
        expect(isRelayedInput(relays, '/0')).toBe(true);
        arrangeFieldNodeItems(root, { kind: 'insert', index: 0, value: 'x' });
        expect(input.path).toBe('/1');
        expect(input.storedValue).toBe('x');
        expect(isRelayedInput(relays, '/0')).toBe(false);
        expect(isRelayedInput(relays, '/1')).toBe(false);
      });
    });
  });

  it('keeps a virtual tuple relay only when the committed tuple has the same content', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: { a: { type: 'number' }, b: { type: 'string' } },
      options: { virtual: { group: { fields: ['a', 'b'] } } },
    });
    dispatchMount(root, { a: 1, b: 'b0' });
    const group = root.childrenByName!.group;
    const relayAndSettle = (input: unknown) => {
      let isRelayed: boolean | undefined;
      dispatchRelayInput(group, input, OPTION, (value) => {
        const relays = runtime.inputRelays!;
        writeFieldNode(group, value, FieldNodeWriteKind.CallerReplace, OPTION);
        isRelayed = isRelayedInput(relays, group.path, equals);
      });
      return isRelayed;
    };
    expect(relayAndSettle(['2', 'b1'])).toBe(false);
    expect(group.storedValue).toEqual([2, 'b1']);
    expect(relayAndSettle([3, 'b2'])).toBe(true);
  });

  it('rejects a detached occurrence with the same path and retained value', () => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        input: { type: 'string', controls: { active: '../show' } },
      },
    });
    dispatchMount(root, { show: true, input: 'x' });
    const input = root.childrenByName!.input;
    dispatchRelayInput(input, 'x', OPTION, () => {
      const relays = runtime.inputRelays!;
      writeFieldNode(
        root.childrenByName!.show,
        false,
        FieldNodeWriteKind.CallerReplace,
        OPTION,
      );
      expect(input.isDetached).toBe(true);
      expect(input.isDisposed).toBeFalsy();
      expect(input.storedValue).toBe('x');
      expect(isRelayedInput(relays, input.path)).toBe(false);
    });
  });

  it('rejects a disposed occurrence with the same path and retained value', () => {
    const previous = createDispatchTree({ type: 'string' });
    dispatchMount(previous.root, 'x');
    const next = createDispatchTree({ type: 'string' });
    dispatchRelayInput(previous.root, 'x', OPTION, () => {
      const relays = previous.runtime.inputRelays!;
      adoptFieldNodeChain(previous.root, next.root);
      expect(previous.root.isDisposed).toBe(true);
      expect(previous.root.isDetached).toBeFalsy();
      expect(isRelayedInput(relays, '')).toBe(false);
      dispatchMount(next.root, 'next');
    });
  });

  it.each([
    {
      name: 'same primitive',
      type: 'string',
      committed: 'x',
      emitted: 'x',
      matches: true,
    },
    {
      name: 'different primitive',
      type: 'string',
      committed: 'X',
      emitted: 'x',
      matches: false,
    },
    {
      name: 'NaN',
      type: 'number',
      committed: NaN,
      emitted: NaN,
      matches: true,
    },
    {
      name: 'new object reference',
      type: 'object',
      committed: { x: 'new' },
      emitted: { x: 'new' },
      matches: false,
    },
    {
      name: 'new array reference',
      type: 'array',
      committed: ['new'],
      emitted: ['new'],
      matches: false,
    },
  ])(
    'uses delivery-value identity for $name',
    ({ type, committed, emitted, matches }) => {
      const { root, runtime } = createDispatchTree({
        type,
        options: { terminal: true },
      });
      dispatchMount(root, committed);
      dispatchRelayInput(root, emitted, OPTION, () => {
        expect(isRelayedInput(runtime.inputRelays!, '')).toBe(matches);
      });
    },
  );
});

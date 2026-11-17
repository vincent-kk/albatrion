import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { FieldNodeEventType } from '../../record';
import { WriteOption } from '../../types/value';
import {
  dispatchBatch,
  dispatchInsert,
  dispatchMount,
  dispatchPop,
  dispatchPush,
  dispatchRemove,
  dispatchWriteInput,
  subscribeFieldNode,
} from '../../write';
import { readRetainedSlotSource } from './fixtures/readRetainedSlotSource';
import { referenceNextExtras } from './fixtures/referenceNextExtras';

describe('single extras comparison observations', () => {
  it.each([false, true])(
    'keeps same-value object references and deliveries with declared child=%s',
    (declared) => {
      const { root } = createDispatchTree({
        type: 'object',
        properties: declared ? { known: { type: 'number' } } : {},
      });
      const input = {
        known: 1,
        extra: { value: 2 },
        nan: NaN,
        missing: undefined,
      };
      dispatchMount(root, input);
      dispatchWriteInput(root, structuredClone(input));
      const changed = vi.fn();
      root.runtime.onChange = changed;
      const delivered: number[] = [];
      subscribeFieldNode(root, ({ type }) => delivered.push(type));
      const value = root.storedValue,
        outputValue = root.storedOutputValue,
        extras = root.extras;
      const revisions = root.revisionLedger;
      for (const option of [WriteOption.Overwrite, WriteOption.Merge]) {
        dispatchWriteInput(root, structuredClone(input), option);
        expect(root.storedValue).toBe(value);
        expect(root.storedOutputValue).toBe(outputValue);
        expect(root.extras).toBe(extras);
        expect(root.revisionLedger).toEqual(revisions);
        expect(
          delivered.some((type) => type & FieldNodeEventType.UpdateValue),
        ).toBe(false);
        expect(changed).not.toHaveBeenCalled();
      }
    },
  );

  it('matches the original Merge copy for equal, changed, new-key and empty writes', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: { known: { type: 'number' } },
    });
    dispatchMount(root, { known: 1, first: { value: 2 }, last: 3 });
    dispatchWriteInput(root, { known: 1, first: { value: 2 }, last: 3 });
    const changed = vi.fn();
    root.runtime.onChange = changed;
    const delivered: number[] = [];
    subscribeFieldNode(root, ({ type }) => delivered.push(type));
    for (const input of [
      { first: { value: 2 } },
      { first: { value: 4 } },
      { added: 5 },
      {},
    ]) {
      const previous = root.extras;
      const output = root.storedOutputValue;
      const revision = root.revisionLedger;
      const expected = referenceNextExtras(
        previous,
        input,
        new Set(['known']),
        true,
      );
      const equal = expected === previous;
      const before = structuredClone(input);
      delivered.length = 0;
      changed.mockClear();
      dispatchWriteInput(root, input, WriteOption.Merge);
      expect(input).toStrictEqual(before);
      expect(root.extras).toStrictEqual(expected);
      expect(Object.keys(Object(root.extras))).toEqual(
        Object.keys(Object(expected)),
      );
      expect(root.extras === previous).toBe(equal);
      expect(root.storedOutputValue === output).toBe(equal);
      expect(
        delivered.some((type) => type & FieldNodeEventType.UpdateValue),
      ).toBe(!equal);
      expect(changed).toHaveBeenCalledTimes(equal ? 0 : 1);
      if (equal) expect(root.revisionLedger).toEqual(revision);
    }
  });

  it.each([
    { type: 'array' },
    { type: 'array', prefixItems: [{ type: 'number' }] },
    { type: 'array', items: { type: 'number' } },
  ] satisfies BlueprintSchema[])(
    'keeps same-value array output, extras and revisions for %j',
    (schema) => {
      const { root } = createDispatchTree(schema);
      const input = [1, NaN, undefined];
      dispatchMount(root, input);
      dispatchWriteInput(root, [...input]);
      const value = root.storedValue,
        outputValue = root.storedOutputValue,
        extras = root.extras;
      const revisions = root.revisionLedger;
      const changed = vi.fn();
      root.runtime.onChange = changed;
      const delivered: number[] = [];
      subscribeFieldNode(root, ({ type }) => delivered.push(type));
      for (const option of [WriteOption.Overwrite, WriteOption.Merge]) {
        dispatchWriteInput(root, [...input], option);
        expect(root.storedValue).toBe(value);
        expect(root.storedOutputValue).toBe(outputValue);
        expect(root.extras).toBe(extras);
        expect(root.revisionLedger).toEqual(revisions);
        expect(
          delivered.some((type) => type & FieldNodeEventType.UpdateValue),
        ).toBe(false);
        expect(changed).not.toHaveBeenCalled();
      }
    },
  );

  it.each([
    { type: 'array' },
    { type: 'array', prefixItems: [{ type: 'number' }] },
  ] satisfies BlueprintSchema[])(
    'preserves new structural arrays and same-value batched output for %j',
    (schema) => {
      const { root } = createDispatchTree(schema);
      dispatchMount(root, [1, 2]);
      const children = root.children,
        value = root.storedValue,
        extras = root.extras;
      const revision =
        root.revisionLedger[FieldNodeEventType.UpdateChildren] ?? 0;
      const delivered: number[] = [];
      subscribeFieldNode(root, ({ type }) => delivered.push(type));
      dispatchPush(root, 3);
      expect(root.storedValue).not.toBe(value);
      expect(root.children).not.toBe(children);
      expect(root.extras).not.toBe(extras);
      expect(root.storedOutputValue).toEqual([1, 2, 3]);
      expect(
        root.revisionLedger[FieldNodeEventType.UpdateChildren],
      ).toBeGreaterThan(revision);
      expect(
        delivered.some((type) => type & FieldNodeEventType.UpdateValue),
      ).toBe(true);
      expect(dispatchPop(root)).toBe(3);
      const beforeBatch = root.storedOutputValue;
      const changed = vi.fn();
      root.runtime.onChange = changed;
      dispatchBatch(root, () => {
        expect(dispatchRemove(root, 1)).toBe(2);
        expect(dispatchInsert(root, 1, 2)).toBe(2);
      });
      expect(root.storedOutputValue).toBe(beforeBatch);
      expect(changed).not.toHaveBeenCalled();
    },
  );

  it('retains the latent host and extras on a same-value inactive Merge', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: { flag: { type: 'boolean' } },
      allOf: [
        {
          controls: { active: './flag' },
          properties: {
            h: { type: 'object', properties: { known: { type: 'number' } } },
          },
        },
      ],
    });
    dispatchMount(root, { flag: false, h: { known: 1, extra: { value: 2 } } });
    const previous = readRetainedSlotSource(root, '/h', 'object') as {
      extra: unknown;
    };
    dispatchWriteInput(root, { h: { extra: { value: 2 } } }, WriteOption.Merge);
    expect(
      (readRetainedSlotSource(root, '/h', 'object') as { extra: unknown })
        .extra,
    ).toBe(previous.extra);
    dispatchWriteInput(root, { flag: true }, WriteOption.Merge);
    expect(root.storedOutputValue).toEqual({
      flag: true,
      h: { known: 1, extra: { value: 2 } },
    });
  });
});

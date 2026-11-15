import { describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { FieldNodeEventType } from '../../record';
import { WriteOption } from '../../types/value';
import {
  dispatchBatch,
  dispatchMount,
  dispatchUpdate,
  dispatchWriteInput,
  subscribeFieldNode,
} from '../../write';

describe('static spec forwarding observations', () => {
  it('interprets admitted leaves and nested branches without replacing their nodes', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        before: { type: 'number', nullable: true },
        nested: { type: 'object', properties: { n: { type: 'integer' } } },
        after: { type: 'string' },
        list: { type: 'array', items: { type: 'number' } },
      },
    });
    dispatchMount(root, {
      before: 1,
      nested: { n: 2 },
      after: 'A',
      list: [3, 4],
    });
    const children = [...root.children!];
    const nested = root.childrenByName!.nested.childrenByName!.n;
    const items = [...root.childrenByName!.list.children!];
    const input = {
      before: '5',
      nested: { n: '6' },
      after: 'B',
      list: ['7', 8],
    };
    const saved = structuredClone(input);
    dispatchWriteInput(root, input);
    expect(input).toStrictEqual(saved);
    expect(root.storedOutputValue).toEqual({
      before: 5,
      nested: { n: 6 },
      after: 'B',
      list: [7, 8],
    });
    expect(
      root.children!.every((child, index) => child === children[index]),
    ).toBe(true);
    expect(root.childrenByName!.nested.childrenByName!.n).toBe(nested);
    expect(
      root.childrenByName!.list.children!.every(
        (child, index) => child === items[index],
      ),
    ).toBe(true);
    const output = root.storedOutputValue,
      revisions = root.revisionLedger;
    const changed = vi.fn();
    root.runtime.onChange = changed;
    const delivered: number[] = [];
    subscribeFieldNode(root, ({ type }) => delivered.push(type));
    dispatchWriteInput(root, structuredClone(input));
    expect(root.storedOutputValue).toBe(output);
    expect(root.revisionLedger).toEqual(revisions);
    expect(
      delivered.some((type) => type & FieldNodeEventType.UpdateValue),
    ).toBe(false);
    expect(changed).not.toHaveBeenCalled();
  });

  it('keeps default interpretation for gated and inactive descendants', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: { flag: { type: 'boolean' } },
      allOf: [
        {
          controls: { active: './flag' },
          properties: {
            n: { type: 'number', nullable: true },
            inner: { type: 'object', properties: { x: { type: 'number' } } },
          },
        },
      ],
    });
    dispatchMount(root, { flag: true, n: 1, inner: { x: 2 } });
    const child = root.childrenByName!.n;
    dispatchWriteInput(root, { flag: true, n: '3', inner: { x: '4' } });
    expect(root.storedOutputValue).toEqual({
      flag: true,
      n: 3,
      inner: { x: 4 },
    });
    expect(root.childrenByName!.n).toBe(child);
    dispatchWriteInput(root, { flag: false }, WriteOption.Merge);
    dispatchWriteInput(root, { n: '5', inner: { x: '6' } }, WriteOption.Merge);
    expect(root.storedOutputValue).toEqual({ flag: false });
    dispatchWriteInput(root, { flag: true }, WriteOption.Merge);
    expect(root.storedOutputValue).toEqual({
      flag: true,
      n: 5,
      inner: { x: 6 },
    });
  });

  it('preserves multi-origin batch interpretation and the interpreted array return slot', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        n: { type: 'number' },
        inner: { type: 'object', properties: { x: { type: 'integer' } } },
        list: { type: 'array', items: { type: 'number' } },
      },
    });
    dispatchMount(root, { n: 1, inner: { x: 2 }, list: [3, 4] });
    const n = root.childrenByName!.n,
      inner = root.childrenByName!.inner,
      list = root.childrenByName!.list;
    const changed = vi.fn();
    root.runtime.onChange = changed;
    dispatchBatch(root, () => {
      dispatchWriteInput(n, '5');
      dispatchWriteInput(inner, { x: '6' });
      expect(dispatchUpdate(list, 0, '7')).toBe(7);
    });
    expect(root.storedOutputValue).toEqual({
      n: 5,
      inner: { x: 6 },
      list: [7, 4],
    });
    expect(root.childrenByName!.n).toBe(n);
    expect(root.childrenByName!.inner).toBe(inner);
    expect(root.childrenByName!.list).toBe(list);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('retains union and nullable default specs outside the admitted static path', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        choice: { type: ['number', 'string'], nullable: true },
        leaf: { type: 'number', nullable: true },
      },
    });
    dispatchMount(root, { choice: 'A', leaf: 1 });
    const choice = root.childrenByName!.choice,
      leaf = root.childrenByName!.leaf;
    dispatchWriteInput(root, { choice: 3, leaf: null });
    expect(root.storedOutputValue).toEqual({ choice: 3, leaf: null });
    dispatchWriteInput(root, { choice: null, leaf: '4' });
    expect(root.storedOutputValue).toEqual({ choice: null, leaf: 4 });
    expect(root.childrenByName!.choice).toBe(choice);
    expect(root.childrenByName!.leaf).toBe(leaf);
  });
});

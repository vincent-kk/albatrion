import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchSetValue,
  dispatchWriteInput,
} from '@/schema-form/core/engine/write';

import type { DispatchTestNode } from '../../__tests__/fixtures/createDispatchTree';
import { compareSameValueWrite } from './fixtures/compareSameValueWrite';

afterEach(() => vi.restoreAllMocks());

/** Static host with every leaf kind, a defaulted leaf, a nullable leaf, a nested object and an array. */
const HOST: BlueprintSchema = {
  type: 'object',
  properties: {
    a: { type: 'number' },
    b: { type: 'string', default: 'bee' },
    c: { type: 'boolean' },
    d: { type: ['string', 'null'] },
    n: {
      type: 'object',
      properties: { x: { type: 'number' }, y: { type: 'string' } },
    },
    list: { type: 'array', items: { type: 'number' } },
  },
};

/** Root holding the host beside a sibling leaf. */
const SCHEMA: BlueprintSchema = {
  type: 'object',
  properties: { h: HOST, s: { type: 'string' } },
};

/** Mounted source with every host key present. */
const INPUT = {
  h: {
    a: 1,
    b: 'b',
    c: true,
    d: null,
    n: { x: 1, y: 'y' },
    list: [1, 2, 3],
  },
  s: 's',
};

/** Flat static object with a number, a number that may hold NaN and a nullable string. */
const FLAT: BlueprintSchema = {
  type: 'object',
  properties: {
    zero: { type: 'number' },
    nan: { type: 'number' },
    d: { type: ['string', 'null'] },
  },
};

/**
 * Read a live child by name.
 * @param node - Branch host
 * @param name - Declared child name
 * @returns The child record
 */
const at = (node: DispatchTestNode, name: string): DispatchTestNode =>
  node.structure![name];

/**
 * Read a host's current emission as a plain object.
 * @param node - Object host
 * @returns Its emitted value
 */
const emitOf = (node: DispatchTestNode): Record<string, unknown> =>
  Object(node.emit);

// filid:contract settle-static-same-value-write
describe('static whole writes skip same-value leaves and keep same-key hosts out of shape-dirty', () => {
  it('writes the same reference back to an object host, setValue(getValue())', async () => {
    const { candidate } = await compareSameValueWrite(SCHEMA, INPUT, [
      {
        apply: (root) => dispatchSetValue(at(root, 'h'), at(root, 'h').emit),
        skip: true,
      },
    ]);
    expect(candidate[0].written).toBe(3);
    expect(candidate[0].shapeDirty).toEqual([]);
  });

  it('changes one key of an object host with the nested object kept by reference', async () => {
    const { candidate } = await compareSameValueWrite(SCHEMA, INPUT, [
      {
        apply: (root) =>
          dispatchSetValue(at(root, 'h'), { ...emitOf(at(root, 'h')), a: 2 }),
        skip: true,
      },
    ]);
    expect(candidate[0].written).toBe(4);
  });

  it('changes every key of an object host, nested object and array included', async () => {
    await compareSameValueWrite(SCHEMA, INPUT, [
      {
        apply: (root) =>
          dispatchSetValue(at(root, 'h'), {
            a: 9,
            b: 'z',
            c: false,
            d: 'd',
            n: { x: 9, y: 'z' },
            list: [7, 8, 9],
          }),
        skip: true,
      },
    ]);
  });

  it('gives a nested object the same content in a new reference', async () => {
    await compareSameValueWrite(SCHEMA, INPUT, [
      {
        apply: (root) => {
          const value = emitOf(at(root, 'h'));
          dispatchSetValue(at(root, 'h'), {
            ...value,
            n: { ...Object(value.n) },
            list: [...Object(value.list)],
          });
        },
        skip: true,
      },
    ]);
  });

  it('falls back when keys are removed, then skips again on the reduced key set', async () => {
    await compareSameValueWrite(SCHEMA, INPUT, [
      {
        apply: (root) => dispatchSetValue(at(root, 'h'), { a: 1, b: 'b' }),
        skip: false,
      },
      {
        apply: (root) => dispatchSetValue(at(root, 'h'), at(root, 'h').emit),
        skip: true,
      },
      {
        apply: (root) =>
          dispatchSetValue(at(root, 'h'), { ...INPUT.h, n: { x: 1 } }),
        skip: false,
      },
    ]);
  });

  it('falls back on an explicit undefined and on an undeclared key', async () => {
    await compareSameValueWrite(FLAT, { zero: 0, nan: 1, d: null }, [
      {
        apply: (root) =>
          dispatchSetValue(root, { zero: 0, nan: undefined, d: null }),
        skip: false,
      },
      {
        apply: (root) => dispatchSetValue(root, { zero: 0, d: null, z: 1 }),
        skip: false,
      },
    ]);
  });

  it('writes -0 and a nullable null over equal raw values, then a NaN that leaves a misfit path', async () => {
    await compareSameValueWrite(FLAT, { zero: 0, nan: 1, d: null }, [
      {
        apply: (root) => dispatchSetValue(root, { zero: -0, nan: 1, d: null }),
        skip: true,
      },
      {
        apply: (root) => dispatchSetValue(root, { zero: 0, nan: 1, d: 'x' }),
        skip: true,
      },
      {
        apply: (root) =>
          dispatchSetValue(root, { zero: 0, nan: Number.NaN, d: 'x' }),
        skip: true,
      },
      {
        apply: (root) =>
          dispatchSetValue(root, { zero: 0, nan: Number.NaN, d: 'x' }),
        skip: false,
      },
    ]);
  });

  it('writes an array of the same length: same reference, one item, every item, then other lengths', async () => {
    await compareSameValueWrite(SCHEMA, INPUT, [
      {
        apply: (root) => {
          const list = at(at(root, 'h'), 'list');
          dispatchSetValue(list, list.emit);
        },
        skip: true,
      },
      {
        apply: (root) => dispatchSetValue(at(at(root, 'h'), 'list'), [1, 9, 3]),
        skip: true,
      },
      {
        apply: (root) => dispatchSetValue(at(at(root, 'h'), 'list'), [4, 5, 6]),
        skip: true,
      },
      {
        apply: (root) => dispatchSetValue(at(at(root, 'h'), 'list'), [4, 5]),
        skip: false,
      },
      {
        apply: (root) =>
          dispatchSetValue(at(at(root, 'h'), 'list'), [4, 5, 6, 7]),
        skip: false,
      },
    ]);
  });

  it('writes an array of objects of the same length with one nested change and a hole', async () => {
    const items = Array.from({ length: 4 }, (_, index) => ({
      v: index,
      w: String(index),
    }));
    const sparse: unknown[] = [...items];
    delete sparse[2];
    await compareSameValueWrite(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: { v: { type: 'number' }, w: { type: 'string' } },
        },
      },
      items,
      [
        {
          apply: (root) =>
            dispatchSetValue(
              root,
              items.map((item, index) =>
                index === 1 ? { ...item, v: 10 } : item,
              ),
            ),
          skip: true,
        },
        {
          apply: (root) => dispatchSetValue(root, root.emit),
          skip: true,
        },
        {
          apply: (root) => dispatchSetValue(root, sparse),
          skip: true,
        },
      ],
    );
  });

  it('merges one key, a nested key and the same value', async () => {
    await compareSameValueWrite(SCHEMA, INPUT, [
      {
        apply: (root) =>
          dispatchSetValue(at(root, 'h'), { a: 5 }, WriteOption.Merge),
        skip: true,
      },
      {
        apply: (root) =>
          dispatchSetValue(at(root, 'h'), { n: { x: 6 } }, WriteOption.Merge),
        skip: true,
      },
      {
        apply: (root) =>
          dispatchSetValue(at(root, 'h'), { a: 5, c: true }, WriteOption.Merge),
        skip: true,
      },
    ]);
  });

  it('falls back on a merge that adds or clears a key', async () => {
    await compareSameValueWrite(SCHEMA, INPUT, [
      {
        apply: (root) =>
          dispatchSetValue(at(root, 'h'), { a: undefined }, WriteOption.Merge),
        skip: false,
      },
      {
        apply: (root) =>
          dispatchSetValue(at(root, 'h'), { a: 3 }, WriteOption.Merge),
        skip: false,
      },
    ]);
  });

  it('writes the root whole with one key changed and then its own value back', async () => {
    const { candidate } = await compareSameValueWrite(SCHEMA, INPUT, [
      {
        apply: (root) => dispatchSetValue(root, { ...emitOf(root), s: 't' }),
        skip: true,
      },
      {
        apply: (root) => dispatchSetValue(root, root.emit),
        skip: true,
      },
    ]);
    expect(candidate[1].shapeDirty).toEqual([]);
  });

  it('overwrites an object host through the input binding', async () => {
    await compareSameValueWrite(SCHEMA, INPUT, [
      {
        apply: (root) =>
          dispatchWriteInput(
            at(root, 'h'),
            { ...emitOf(at(root, 'h')), a: 3 },
            WriteOption.Overwrite,
          ),
        skip: true,
      },
      {
        apply: (root) => dispatchWriteInput(at(root, 'h'), at(root, 'h').emit),
        skip: true,
      },
    ]);
  });

  it('keeps the defaulted leaf and its default source across same-value writes', async () => {
    await compareSameValueWrite(SCHEMA, { h: { a: 1 } }, [
      {
        apply: (root) => dispatchSetValue(at(root, 'h'), at(root, 'h').emit),
        skip: true,
      },
      {
        apply: (root) =>
          dispatchSetValue(at(root, 'h'), { ...emitOf(at(root, 'h')), a: 2 }),
        skip: true,
      },
    ]);
  });
});

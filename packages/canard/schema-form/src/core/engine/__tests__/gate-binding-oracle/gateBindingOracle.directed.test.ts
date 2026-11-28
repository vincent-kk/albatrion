import { describe, expect, it } from 'vitest';

import { runOracleCase } from './fixtures/runOracleCase';
import type { OracleStep } from './fixtures/types';

/*
 * Directed scenes for gate binding paths that generated forms reach rarely. Each is driven through
 * the public write surface and, after the load and every step, compared with a fresh load of the
 * live form's stored sources by the oracle runner. Whether a scene takes the internal path it targets
 * (the read plan suffix, the wheel plan's previous gates, the prepared static host) is not observable
 * from the public surface; the scenes pin the outcome.
 */

/** Run a scene and return what the oracle comparison saw: no mismatch and no thrown error means it holds. */
const compareWithFreshLoad = (
  schema: Record<string, unknown>,
  load: unknown,
  steps: readonly OracleStep[],
) => runOracleCase({ schema, load, steps });

/** A clean comparison: every step reads as a fresh load and nothing throws. */
const HOLDS = { mismatches: [], thrown: [] };

/** A tuple with one plain prefix position and an `items` template gated by `active`, which declares `minLength` on `v`. */
const tupleWithGatedItems = (
  active: string,
  extra: Record<string, unknown> = {},
) => ({
  type: 'object',
  properties: {
    ...extra,
    tup: {
      type: 'array',
      prefixItems: [{ type: 'object', properties: { v: { type: 'string' } } }],
      items: {
        type: 'object',
        properties: { v: { type: 'string' } },
        oneOf: [
          {
            controls: { active },
            properties: { v: { type: 'string', minLength: 3 } },
          },
          { controls: { active: `!(${active})` }, properties: {} },
        ],
      },
    },
  },
});

/** Items that take the `oneOf` branch of their own `kind`: `x` declares `minLength` 3, `y` declares `maxLength` 1. */
const kindItems = {
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: {
        type: 'object',
        properties: { kind: { type: 'string' }, v: { type: 'string' } },
        controls: { discriminator: 'kind' },
        oneOf: [
          {
            properties: {
              kind: { const: 'x' },
              v: { type: 'string', minLength: 3 },
            },
          },
          {
            properties: {
              kind: { const: 'y' },
              v: { type: 'string', maxLength: 1 },
            },
          },
        ],
      },
    },
  },
};

describe('item gates at or beyond prefixItems.length', () => {
  it('an item gate that reads an ancestor value', () => {
    const schema = tupleWithGatedItems("../../mode === 'a'", {
      mode: { type: 'string' },
    });
    const result = compareWithFreshLoad(
      schema,
      { mode: 'b', tup: [{ v: 'p' }, { v: 'q' }, { v: 'r' }] },
      [
        { kind: 'set', path: '/mode', value: 'a' },
        { kind: 'push', path: '/tup', value: { v: 's' } },
        { kind: 'set', path: '/mode', value: 'b' },
        { kind: 'remove', path: '/tup', index: 1 },
        { kind: 'set', path: '/mode', value: 'a' },
      ],
    );
    expect(result).toEqual(HOLDS);
  });

  it('an item gate that reads a sibling subtree written in the same settlement', () => {
    const schema = tupleWithGatedItems("../../src/k === '1'", {
      src: { type: 'object', properties: { k: { type: 'string' } } },
    });
    const result = compareWithFreshLoad(
      schema,
      { src: { k: '0' }, tup: [{ v: 'p' }, { v: 'q' }] },
      [
        {
          kind: 'batch',
          operations: [
            { kind: 'set', path: '/src/k', value: '1' },
            { kind: 'push', path: '/tup', value: { v: 'r' } },
          ],
        },
        {
          kind: 'batch',
          operations: [
            { kind: 'set', path: '/src', value: { k: '0' } },
            { kind: 'set', path: '/tup/2/v', value: 'rr' },
          ],
        },
        {
          kind: 'batch',
          operations: [
            {
              kind: 'set',
              path: '/tup',
              value: [{ v: 'p' }, { v: 'q' }, { v: 'r' }],
            },
            { kind: 'set', path: '/src/k', value: '1' },
          ],
        },
      ],
    );
    expect(result).toEqual(HOLDS);
  });

  it('an item gate with a computed read', () => {
    const schema = tupleWithGatedItems("(../../map)[(../../key)] === '1'", {
      map: {
        type: 'object',
        properties: { a: { type: 'string' }, b: { type: 'string' } },
      },
      key: { type: 'string' },
    });
    const result = compareWithFreshLoad(
      schema,
      { map: { a: '1', b: '0' }, key: 'b', tup: [{ v: 'p' }, { v: 'q' }] },
      [
        { kind: 'set', path: '/key', value: 'a' },
        { kind: 'push', path: '/tup', value: { v: 'r' } },
        { kind: 'set', path: '/map/a', value: '0' },
        {
          kind: 'batch',
          operations: [
            { kind: 'set', path: '/map/b', value: '1' },
            { kind: 'set', path: '/key', value: 'b' },
          ],
        },
      ],
    );
    expect(result).toEqual(HOLDS);
  });
});

describe('a discriminator changed by another rule or gate in the same round', () => {
  it('a discriminator derived from another field', () => {
    const schema = {
      type: 'object',
      properties: {
        src: { type: 'string' },
        kind: {
          type: 'string',
          controls: { derived: "../src === '1' ? 'x' : 'y'" },
        },
        v: { type: 'string' },
      },
      controls: { discriminator: 'kind' },
      oneOf: [
        {
          properties: {
            kind: { const: 'x' },
            v: { type: 'string', minLength: 3 },
          },
        },
        { properties: { kind: { const: 'y' }, v: { type: 'string' } } },
      ],
    };
    const result = compareWithFreshLoad(schema, { src: '0', v: 'ab' }, [
      { kind: 'set', path: '/src', value: '1' },
      { kind: 'set', path: '/src', value: '0' },
      {
        kind: 'batch',
        operations: [
          { kind: 'set', path: '/src', value: '1' },
          { kind: 'set', path: '/v', value: 'a' },
        ],
      },
    ]);
    expect(result).toEqual(HOLDS);
  });

  it('a discriminator field that a gate turns off and on', () => {
    const schema = {
      type: 'object',
      properties: {
        on: { type: 'string' },
        kind: { type: 'string', controls: { active: "../on === '1'" } },
        v: { type: 'string' },
      },
      controls: { discriminator: 'kind' },
      oneOf: [
        {
          properties: {
            kind: { const: 'x' },
            v: { type: 'string', minLength: 3 },
          },
        },
        { properties: { kind: { const: 'y' }, v: { type: 'string' } } },
      ],
    };
    const result = compareWithFreshLoad(
      schema,
      { on: '1', kind: 'x', v: 'ab' },
      [
        { kind: 'set', path: '/on', value: '0' },
        { kind: 'set', path: '/on', value: '1' },
        {
          kind: 'batch',
          operations: [
            { kind: 'set', path: '/kind', value: 'y' },
            { kind: 'set', path: '/on', value: '0' },
          ],
        },
      ],
    );
    expect(result).toEqual(HOLDS);
  });
});

describe('moves, replacements and revivals', () => {
  const load = {
    list: [
      { kind: 'x', v: 'abc' },
      { kind: 'y', v: 'b' },
    ],
  };

  it('remove, then a push that re-creates the address with the other kind', () => {
    const result = compareWithFreshLoad(kindItems, load, [
      { kind: 'remove', path: '/list', index: 1 },
      { kind: 'push', path: '/list', value: { kind: 'x', v: 'c' } },
      { kind: 'remove', path: '/list', index: 0 },
      { kind: 'push', path: '/list', value: { kind: 'y', v: 'd' } },
    ]);
    expect(result).toEqual(HOLDS);
  });

  it('an item moved to an address whose previous occupant had the opposite decision', () => {
    const result = compareWithFreshLoad(kindItems, load, [
      { kind: 'remove', path: '/list', index: 0 },
      { kind: 'push', path: '/list', value: { kind: 'x', v: 'abc' } },
      { kind: 'swap', path: '/list' },
    ]);
    expect(result).toEqual(HOLDS);
  });

  it('a node that exits and is revived inside one settlement', () => {
    const result = compareWithFreshLoad(kindItems, load, [
      {
        kind: 'batch',
        operations: [
          { kind: 'set', path: '/list/0/kind', value: 'y' },
          { kind: 'set', path: '/list/0/kind', value: 'x' },
        ],
      },
      {
        kind: 'batch',
        operations: [
          { kind: 'remove', path: '/list', index: 1 },
          { kind: 'push', path: '/list', value: { kind: 'y', v: 'b' } },
        ],
      },
    ]);
    expect(result).toEqual(HOLDS);
  });
});

describe('relocated gates that disappear between two wheels', () => {
  it('a root gate declaring on items turns off, then the items host settles again', () => {
    const schema = {
      type: 'object',
      properties: {
        k: { type: 'string' },
        list: {
          type: 'array',
          items: {
            type: 'object',
            properties: { v: { type: 'string' } },
            if: { properties: { v: { const: 'n' } }, required: ['v'] },
            then: { properties: { v: { type: 'string', minLength: 1 } } },
          },
        },
      },
      if: { properties: { k: { const: '1' } }, required: ['k'] },
      then: {
        properties: {
          list: {
            items: { properties: { v: { type: 'string', maxLength: 5 } } },
          },
        },
      },
    };
    const result = compareWithFreshLoad(
      schema,
      { k: '1', list: [{ v: 'n' }, { v: 'a' }] },
      [
        { kind: 'set', path: '/k', value: '0' },
        { kind: 'push', path: '/list', value: { v: 'n' } },
        {
          kind: 'batch',
          operations: [
            { kind: 'set', path: '/k', value: '1' },
            { kind: 'set', path: '/k', value: '0' },
            { kind: 'set', path: '/list/0/v', value: 'b' },
          ],
        },
        { kind: 'set', path: '/list/1/v', value: 'n' },
      ],
    );
    expect(result).toEqual(HOLDS);
  });
});

describe('a prepared static host whose child a later write replaces', () => {
  it('a gate reads inside a static object whose child objects are replaced', () => {
    const schema = {
      type: 'object',
      properties: {
        o: {
          type: 'object',
          properties: {
            a: { type: 'string' },
            b: { type: 'object', properties: { c: { type: 'string' } } },
          },
        },
        g: { type: 'string' },
      },
      if: {
        properties: {
          o: { properties: { b: { properties: { c: { const: '1' } } } } },
        },
      },
      then: { properties: { g: { type: 'string', minLength: 3 } } },
    };
    const result = compareWithFreshLoad(
      schema,
      { o: { a: 'x', b: { c: '0' } }, g: 'z' },
      [
        { kind: 'set', path: '/o/b', value: { c: '1' } },
        { kind: 'set', path: '/o', value: { a: 'y', b: { c: '0' } } },
        { kind: 'set', path: '/o/b', value: undefined },
        { kind: 'set', path: '/o', value: { b: { c: '1' } } },
      ],
    );
    expect(result).toEqual(HOLDS);
  });
});

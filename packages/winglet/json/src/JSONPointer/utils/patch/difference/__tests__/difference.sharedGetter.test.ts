import { expect, it } from 'vitest';

import type { JSONObject } from '@/json/type';

import { difference } from '../difference';

/**
 * Places a document at the requested comparison depth.
 * @param value Leaf document.
 * @param depth Number of containing objects.
 * @returns The root of the wrapped document.
 */
const nest = (value: JSONObject, depth: number): JSONObject => {
  for (let level = 0; level < depth; level++) value = { node: value };
  return value;
};

it.each([0, 300])(
  'reads a shared target getter once when a source member is removed at depth %i',
  (depth) => {
    let reads = 0;
    const source = { shared: 1, removed: true };
    const target = {
      get shared() {
        return ++reads === 1 ? 2 : 9;
      },
    };

    expect(difference(nest(source, depth), nest(target, depth))).toEqual(
      nest({ shared: 2, removed: null }, depth),
    );
    expect(reads).toBe(1);
  },
);

it.each([0, 300])(
  'reads a shared target getter once when another member is added at depth %i',
  (depth) => {
    let reads = 0;
    const source = { shared: 1 };
    const target = {
      get shared() {
        return ++reads === 1 ? 2 : 9;
      },
      added: true,
    };

    expect(difference(nest(source, depth), nest(target, depth))).toEqual(
      nest({ shared: 2, added: true }, depth),
    );
    expect(reads).toBe(1);
  },
);

it.each([0, 300])(
  'observes a getter update to a later source key at depth %i',
  (depth) => {
    const source = { first: 1, later: 0, removed: true };
    const target = {
      get first() {
        source.later = 3;
        return 2;
      },
      later: 3,
    };

    expect(difference(nest(source, depth), nest(target, depth))).toEqual(
      nest({ first: 2, removed: null }, depth),
    );
  },
);

it.each([0, 300])(
  'observes a new target getter before checking its source membership at depth %i',
  (depth) => {
    const source: JSONObject = { removed: true };
    let reads = 0;
    const target = {
      get added() {
        reads++;
        source.added = 2;
        return 2;
      },
    };

    expect(difference(nest(source, depth), nest(target, depth))).toEqual(
      nest({ removed: null }, depth),
    );
    expect(reads).toBe(1);
  },
);

it.each([0, 300])(
  'restores an already compared source key deleted by a later getter at depth %i',
  (depth) => {
    const source: JSONObject = { value: 1, trigger: 1, removed: 1 };
    const target = {
      value: 1,
      get trigger() {
        delete source.value;
        return 1;
      },
    };

    expect(difference(nest(source, depth), nest(target, depth))).toEqual(
      nest({ removed: null, value: 1 }, depth),
    );
  },
);

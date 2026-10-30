import { describe, expect, it, vi } from 'vitest';

import { referenceNextExtras } from '../../../__tests__/fixtures/referenceNextExtras';
import { nextExtras } from '../nextExtras';

describe('extras copy invariants', () => {
  it.each([false, true])(
    'keeps __proto__ as an own data property without changing prototypes (merge=%s)',
    (merge) => {
      const previous = JSON.parse('{"__proto__":{"old":true},"kept":1}');
      const input = Object.freeze(
        JSON.parse('{"__proto__":{"polluted":true},"declared":2,"next":3}'),
      );
      const result = nextExtras(previous, input, new Set(['declared']), merge);
      expect(result).toStrictEqual(
        referenceNextExtras(previous, input, new Set(['declared']), merge),
      );
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(Object.getOwnPropertyDescriptor(result, '__proto__')).toEqual({
        value: { polluted: true },
        enumerable: true,
        configurable: true,
        writable: true,
      });
      expect(Reflect.get({}, 'polluted')).toBeUndefined();
      expect(Object.keys(input)).toEqual(['__proto__', 'declared', 'next']);
    },
  );

  it('copies a previous __proto__ key during Merge and filters a declared input key', () => {
    const previous = JSON.parse('{"__proto__":{"old":true},"kept":1}');
    const input = JSON.parse('{"__proto__":{"polluted":true},"next":3}');
    const result = nextExtras(previous, input, new Set(['__proto__']), true);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.getOwnPropertyDescriptor(result, '__proto__')?.value).toEqual(
      {
        old: true,
      },
    );
    expect(Object.keys(Object(result))).toEqual(['__proto__', 'kept', 'next']);
    expect(Reflect.get({}, 'old')).toBeUndefined();
  });

  it.each([
    { merge: false, previous: undefined },
    { merge: true, previous: undefined },
    { merge: false, previous: null },
    { merge: true, previous: null },
    { merge: false, previous: { kept: 1, first: 2 } },
    { merge: true, previous: { kept: 1, first: 2 } },
  ])(
    'matches descriptor-copy values, order and input ownership for %j',
    ({ merge, previous }) => {
      const input: Record<string, unknown> = {
        5: 'integer',
        first: 4,
        declared: 9,
        last: undefined,
        constructor: 'own constructor',
      };
      const before = structuredClone(input);
      const declared = new Set(['declared']);
      const expected = referenceNextExtras(previous, input, declared, merge);
      const result = nextExtras(
        previous,
        Object.freeze(input),
        declared,
        merge,
      );
      expect(result).toStrictEqual(expected);
      expect(Object.keys(Object(result))).toEqual(
        Object.keys(Object(expected)),
      );
      expect(Object.getOwnPropertyDescriptors(result)).toEqual(
        Object.getOwnPropertyDescriptors(expected),
      );
      expect(input).toStrictEqual(before);
      expect(result).not.toBe(input);
    },
  );

  it('isolates the retained extras from later caller key mutations', () => {
    const input = { extra: 1 };
    const result = nextExtras(undefined, input, new Set(), false);
    input.extra = 2;
    expect(result).toEqual({ extra: 1 });
  });

  it('preserves empty normalization, own undefined and sameValue reference revival', () => {
    expect(nextExtras(undefined, {}, new Set(), false)).toBeUndefined();
    expect(
      nextExtras({ old: 1 }, { declared: 1 }, new Set(['declared']), false),
    ).toBeUndefined();
    const previous = { first: NaN, nested: { value: 1 }, absent: undefined };
    expect(
      nextExtras(
        previous,
        { first: NaN, nested: { value: 1 }, absent: undefined },
        new Set(),
        false,
      ),
    ).toBe(previous);
    expect(nextExtras(previous, {}, new Set(), true)).toBe(previous);
    expect(
      nextExtras(undefined, { absent: undefined }, new Set(), false),
    ).toEqual({ absent: undefined });
  });
});

describe('extras ordinary-key copying', () => {
  it('avoids descriptor definitions in both ordinary-key copy loops', () => {
    const define = vi.spyOn(Object, 'defineProperty');
    let calls: number;
    try {
      nextExtras({ kept: 1 }, { next: 2 }, new Set(), true);
      calls = define.mock.calls.filter(
        ([, name]) => name === 'kept' || name === 'next',
      ).length;
    } finally {
      define.mockRestore();
    }
    expect(calls).toBeLessThanOrEqual(0);
  });
});

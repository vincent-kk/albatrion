import { describe, expect, it, vi } from 'vitest';

import { enumeratingNextExtras } from '../../../__tests__/fixtures/enumeratingNextExtras';
import { nextExtras } from '../nextExtras';

describe('extras own-key differential normalization', () => {
  it('does not enumerate the newly copied result to detect own keys', () => {
    const input = Object.freeze({ extra: 1 });
    const keys = vi.spyOn(Object, 'keys');
    let enumerated: boolean;
    try {
      const result = nextExtras(undefined, input, new Set(), false);
      enumerated = keys.mock.calls.some(([target]) => target === result);
    } finally {
      keys.mockRestore();
    }
    expect(enumerated).toBe(false);
  });

  it.each([false, true])(
    'normalizes frozen data absorbed by an inherited setter (previous=%s)',
    (fromPrevious) => {
      const name = 'absorbedExtras431';
      const inherited = Object.getOwnPropertyDescriptor(Object.prototype, name);
      const input = Object.freeze({ [name]: 1 });
      let writes = 0;
      Object.defineProperty(Object.prototype, name, {
        configurable: true,
        set() {
          writes++;
        },
      });
      try {
        const previous = fromPrevious ? input : undefined;
        const incoming = fromPrevious ? {} : input;
        const expected = enumeratingNextExtras(
          previous,
          incoming,
          new Set(),
          fromPrevious,
        );
        const result = nextExtras(previous, incoming, new Set(), fromPrevious);
        expect(result).toBe(expected);
        expect(result).toBeUndefined();
        expect(writes).toBe(2);
        expect(Object.getOwnPropertyDescriptor(input, name)).toEqual({
          value: 1,
          enumerable: true,
          configurable: false,
          writable: false,
        });
      } finally {
        if (inherited) Object.defineProperty(Object.prototype, name, inherited);
        else Reflect.deleteProperty(Object.prototype, name);
      }
    },
  );

  it('retains an own undefined value as an object', () => {
    const input = Object.freeze({ absent: undefined });
    const result = nextExtras(undefined, input, new Set(), false);
    expect(result).toStrictEqual(
      enumeratingNextExtras(undefined, input, new Set(), false),
    );
    expect(Object.getOwnPropertyDescriptor(result, 'absent')).toEqual({
      value: undefined,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  });

  it('keeps __proto__ as own data without changing the prototype', () => {
    const input = Object.freeze(JSON.parse('{"__proto__":{"safe":true}}'));
    const result = nextExtras(undefined, input, new Set(), false);
    expect(result).toStrictEqual(
      enumeratingNextExtras(undefined, input, new Set(), false),
    );
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.getOwnPropertyDescriptor(result, '__proto__')).toEqual({
      value: { safe: true },
      enumerable: true,
      configurable: true,
      writable: true,
    });
  });

  it('merges previous keys before replacing and appending incoming keys', () => {
    const previous = Object.freeze({ kept: 1, replaced: 2 });
    const input = Object.freeze({ replaced: 3, appended: undefined });
    const result = nextExtras(previous, input, new Set(), true);
    expect(result).toStrictEqual(
      enumeratingNextExtras(previous, input, new Set(), true),
    );
    expect(result).toEqual({ kept: 1, replaced: 3, appended: undefined });
    expect(Object.keys(Object(result))).toEqual([
      'kept',
      'replaced',
      'appended',
    ]);
  });

  it('returns undefined when declared filtering leaves no writes', () => {
    const input = Object.freeze({ declared: undefined });
    const declared = new Set(['declared']);
    const result = nextExtras({ old: 1 }, input, declared, false);
    expect(result).toBe(
      enumeratingNextExtras({ old: 1 }, input, declared, false),
    );
    expect(result).toBeUndefined();
  });

  it('revives the same-value previous reference', () => {
    const previous = Object.freeze({ nested: { value: 1 }, absent: undefined });
    const input = Object.freeze({ nested: { value: 1 }, absent: undefined });
    const result = nextExtras(previous, input, new Set(), false);
    expect(result).toBe(
      enumeratingNextExtras(previous, input, new Set(), false),
    );
    expect(result).toBe(previous);
  });
});

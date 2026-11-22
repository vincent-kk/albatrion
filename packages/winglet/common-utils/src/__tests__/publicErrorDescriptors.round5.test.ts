import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

import { clone } from '../index';

describe.each([false, true])('Error descriptors, foreign=%s', (foreign) => {
  it.each([
    [false, false, false],
    [false, false, true],
    [false, true, false],
    [false, true, true],
    [true, false, false],
    [true, false, true],
    [true, true, false],
    [true, true, true],
  ])(
    'keeps enumerability with enumerable=%s writable=%s configurable=%s',
    (enumerable, writable, configurable) => {
      const error: Error = foreign
        ? runInNewContext('new Error("failed")')
        : new Error('failed');
      const symbol = Symbol('detail');
      for (const key of [
        symbol,
        'cause',
        'errors',
        'message',
        'stack',
        'name',
        'detail',
      ]) {
        Object.defineProperty(error, key, {
          value: key === 'name' ? 'Error' : { marker: key },
          enumerable,
          writable,
          configurable,
        });
      }
      const result = clone(error);
      expect(Object.keys(result).sort()).toEqual(Object.keys(error).sort());
      expect(Object.getOwnPropertyDescriptor(result, symbol)?.enumerable).toBe(
        enumerable ? true : undefined,
      );
      for (const key of Reflect.ownKeys(result)) {
        const before = Object.getOwnPropertyDescriptor(error, key);
        const after = Object.getOwnPropertyDescriptor(result, key);
        if (before)
          expect(after?.enumerable, String(key)).toBe(before.enumerable);
      }
      expect(Object.getOwnPropertyDescriptor(result, 'cause')?.enumerable).toBe(
        enumerable,
      );
      expect(
        Object.getOwnPropertyDescriptor(result, 'errors')?.enumerable,
      ).toBe(enumerable);
    },
  );
});

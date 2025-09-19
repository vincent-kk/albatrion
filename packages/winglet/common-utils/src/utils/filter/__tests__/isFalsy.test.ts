import { describe, expect, it } from 'vitest';

import { isFalsy } from '../isFalsy';

describe('isFalsy', () => {
  describe('falsy value detection', () => {
    it('should return true for boolean false', () => {
      expect(isFalsy(false)).toBe(true);
    });

    it('should return true for null', () => {
      expect(isFalsy(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isFalsy(undefined)).toBe(true);
      const undefinedVar = undefined;
      expect(isFalsy(undefinedVar)).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(isFalsy('')).toBe(true);
      const emptyStr: string = '';
      expect(isFalsy(emptyStr)).toBe(true);
    });

    it('should return true for number zero', () => {
      expect(isFalsy(0)).toBe(true);
      expect(isFalsy(-0)).toBe(true);
      expect(isFalsy(+0)).toBe(true);
      expect(isFalsy(0.0)).toBe(true);
    });

    it('should return true for NaN', () => {
      expect(isFalsy(NaN)).toBe(true);
      expect(isFalsy(Number.NaN)).toBe(true);
      expect(isFalsy(0 / 0)).toBe(true);
    });
  });

  describe('truthy value detection', () => {
    it('should return false for boolean true', () => {
      expect(isFalsy(true)).toBe(false);
    });

    it('should return false for non-empty strings', () => {
      expect(isFalsy('hello')).toBe(false);
      expect(isFalsy('0')).toBe(false);
      expect(isFalsy('false')).toBe(false);
      expect(isFalsy(' ')).toBe(false);
      expect(isFalsy('null')).toBe(false);
      expect(isFalsy('undefined')).toBe(false);
    });

    it('should return false for non-zero numbers', () => {
      expect(isFalsy(1)).toBe(false);
      expect(isFalsy(-1)).toBe(false);
      expect(isFalsy(0.1)).toBe(false);
      expect(isFalsy(-0.1)).toBe(false);
      expect(isFalsy(42)).toBe(false);
      expect(isFalsy(Infinity)).toBe(false);
      expect(isFalsy(-Infinity)).toBe(false);
    });

    it('should return false for objects', () => {
      expect(isFalsy({})).toBe(false);
      expect(isFalsy({ a: 1 })).toBe(false);
      expect(isFalsy(new Object())).toBe(false);
      expect(isFalsy(Object.create(null))).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isFalsy([])).toBe(false);
      expect(isFalsy([1, 2, 3])).toBe(false);
      expect(isFalsy([false])).toBe(false);
      expect(isFalsy([null])).toBe(false);
      expect(isFalsy([undefined])).toBe(false);
      expect(isFalsy([0])).toBe(false);
    });

    it('should return false for functions', () => {
      expect(isFalsy(() => {})).toBe(false);
      expect(isFalsy(function () {})).toBe(false);
      expect(isFalsy(async () => {})).toBe(false);
      expect(isFalsy(function* () {})).toBe(false);
      expect(isFalsy(Math.max)).toBe(false);
    });

    it('should return false for Date objects', () => {
      expect(isFalsy(new Date())).toBe(false);
      expect(isFalsy(new Date(0))).toBe(false);
      expect(isFalsy(new Date('2024-01-01'))).toBe(false);
    });

    it('should return false for RegExp objects', () => {
      expect(isFalsy(/test/)).toBe(false);
      expect(isFalsy(new RegExp('pattern'))).toBe(false);
    });

    it('should return false for symbols', () => {
      expect(isFalsy(Symbol())).toBe(false);
      expect(isFalsy(Symbol('test'))).toBe(false);
      expect(isFalsy(Symbol.for('global'))).toBe(false);
    });

    it('should return false for other built-in objects', () => {
      expect(isFalsy(new Map())).toBe(false);
      expect(isFalsy(new Set())).toBe(false);
      expect(isFalsy(new WeakMap())).toBe(false);
      expect(isFalsy(new WeakSet())).toBe(false);
      expect(isFalsy(new Promise(() => {}))).toBe(false);
    });

    it('should handle BigInt values correctly', () => {
      expect(isFalsy(BigInt(1))).toBe(false); // Non-zero BigInt is truthy
      expect(isFalsy(BigInt(0))).toBe(true); // BigInt(0) is falsy
      expect(isFalsy(1n)).toBe(false); // Non-zero BigInt is truthy
      expect(isFalsy(0n)).toBe(true); // 0n is falsy
      expect(isFalsy(BigInt(-1))).toBe(false); // Negative BigInt is truthy
    });
  });

  describe('type narrowing', () => {
    it('should narrow type to falsy values in conditional', () => {
      const values: (string | null | undefined | number | boolean)[] = [
        'hello',
        '',
        null,
        undefined,
        0,
        42,
        false,
        true,
      ];

      const falsyValues = values.filter(isFalsy);

      // TypeScript should understand these are falsy values
      falsyValues.forEach((value) => {
        // value should be typed as falsy
        expect(
          [false, null, undefined, '', 0, NaN].includes(value as any),
        ).toBe(true);
      });

      expect(falsyValues).toEqual(['', null, undefined, 0, false]);
    });

    it('should work with generic types', () => {
      function processFalsyValue<T>(value: T): string {
        if (isFalsy(value)) {
          return 'Value is falsy';
        }
        return 'Value is truthy';
      }

      expect(processFalsyValue(0)).toBe('Value is falsy');
      expect(processFalsyValue('')).toBe('Value is falsy');
      expect(processFalsyValue(null)).toBe('Value is falsy');
      expect(processFalsyValue(undefined)).toBe('Value is falsy');
      expect(processFalsyValue(false)).toBe('Value is falsy');
      expect(processFalsyValue(NaN)).toBe('Value is falsy');

      expect(processFalsyValue(1)).toBe('Value is truthy');
      expect(processFalsyValue('text')).toBe('Value is truthy');
      expect(processFalsyValue(true)).toBe('Value is truthy');
      expect(processFalsyValue([])).toBe('Value is truthy');
      expect(processFalsyValue({})).toBe('Value is truthy');
    });
  });

  describe('edge cases', () => {
    it('should handle document.all correctly', () => {
      // Note: document.all is a special case in browsers where it's an object
      // but behaves as falsy. This test runs in Node where document.all doesn't exist.
      // This is just to document the expected behavior.
      const mockDocumentAll = undefined as any;
      expect(isFalsy(mockDocumentAll)).toBe(true);
    });

    it('should handle wrapped primitive values', () => {
      // Boxed primitives are objects and thus truthy
      expect(isFalsy(new Boolean(false))).toBe(false); // Object wrapper is truthy!
      expect(isFalsy(new String(''))).toBe(false); // Object wrapper is truthy!
      expect(isFalsy(new Number(0))).toBe(false); // Object wrapper is truthy!
    });

    it('should handle valueOf and toString methods', () => {
      const objWithValueOf = {
        valueOf: () => 0,
      };
      expect(isFalsy(objWithValueOf)).toBe(false); // Objects are truthy

      const objWithToString = {
        toString: () => '',
      };
      expect(isFalsy(objWithToString)).toBe(false); // Objects are truthy
    });
  });

  describe('practical use cases', () => {
    it('should filter falsy values from array', () => {
      const mixed = [
        'hello',
        '',
        0,
        42,
        null,
        'world',
        undefined,
        false,
        true,
        NaN,
      ];
      const falsyOnly = mixed.filter(isFalsy);

      expect(falsyOnly).toEqual(['', 0, null, undefined, false, NaN]);
    });

    it('should identify missing form fields', () => {
      const formData = {
        username: 'john',
        password: '',
        email: null,
        age: 0,
        isActive: false,
        bio: undefined,
      };

      const missingFields = Object.entries(formData)
        .filter(([_, value]) => isFalsy(value))
        .map(([key]) => key);

      expect(missingFields).toEqual([
        'password',
        'email',
        'age',
        'isActive',
        'bio',
      ]);
    });

    it('should work with optional chaining', () => {
      interface User {
        name?: string | null;
        age?: number | null;
        active?: boolean | null;
      }

      const users: User[] = [
        { name: 'Alice', age: 25, active: true },
        { name: '', age: 0, active: false },
        { name: null, age: null, active: null },
        { name: undefined, age: undefined, active: undefined },
      ];

      const usersWithFalsyName = users.filter((u) => isFalsy(u.name));
      expect(usersWithFalsyName).toHaveLength(3);

      const usersWithFalsyAge = users.filter((u) => isFalsy(u.age));
      expect(usersWithFalsyAge).toHaveLength(3);

      const usersWithFalsyActive = users.filter((u) => isFalsy(u.active));
      expect(usersWithFalsyActive).toHaveLength(3);
    });

    it('should help with default value assignment', () => {
      function applyDefaults<T>(
        value: T | null | undefined,
        defaultValue: T,
      ): T {
        return isFalsy(value) ? defaultValue : value;
      }

      expect(applyDefaults(null, 'default')).toBe('default');
      expect(applyDefaults(undefined, 'default')).toBe('default');
      expect(applyDefaults('', 'default')).toBe('default');
      expect(applyDefaults(0, 10)).toBe(10);
      expect(applyDefaults(false, true)).toBe(true);
      expect(applyDefaults('value', 'default')).toBe('value');
      expect(applyDefaults(5, 10)).toBe(5);
      expect(applyDefaults(true, false)).toBe(true);
    });
  });
});

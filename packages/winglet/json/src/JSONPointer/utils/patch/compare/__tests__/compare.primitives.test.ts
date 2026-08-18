import { describe, expect, it } from 'vitest';

import { Operation } from '../../../patchModel';
import { compare } from '../compare';

describe('compare', () => {
  describe('Number Edge Cases', () => {
    it('should handle NaN values', () => {
      const source = { value: NaN };
      const target = { value: 42 };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/value',
          value: 42,
        },
      ]);
    });

    it('should handle Infinity values', () => {
      const source = { positive: Infinity, negative: -Infinity };
      const target = { positive: 100, negative: -100 };

      const result = compare(source, target);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            op: Operation.REPLACE,
            path: '/positive',
            value: 100,
          },
          {
            op: Operation.REPLACE,
            path: '/negative',
            value: -100,
          },
        ]),
      );
    });

    it('should handle zero variations', () => {
      const source = { zero: 0, negativeZero: -0 };
      const target = { zero: -0, negativeZero: 0 };

      const result = compare(source, target);
      // Since JavaScript treats 0 === -0 as true, no changes should be detected
      expect(result).toEqual([]);
    });
  });

  describe('Boolean and Primitive Comparison', () => {
    it('should handle boolean conversions', () => {
      const source = { active: true, visible: false };
      const target = { active: false, visible: true };

      const result = compare(source, target);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            op: Operation.REPLACE,
            path: '/active',
            value: false,
          },
          {
            op: Operation.REPLACE,
            path: '/visible',
            value: true,
          },
        ]),
      );
    });

    it('should handle truthy/falsy value changes', () => {
      const source = { value1: '', value2: 0, value3: false };
      const target = { value1: 'text', value2: 1, value3: true };

      const result = compare(source, target);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            op: Operation.REPLACE,
            path: '/value1',
            value: 'text',
          },
          {
            op: Operation.REPLACE,
            path: '/value2',
            value: 1,
          },
          {
            op: Operation.REPLACE,
            path: '/value3',
            value: true,
          },
        ]),
      );
    });
  });

  describe('Mixed Array Types', () => {
    it('should handle arrays with mixed primitive types', () => {
      const source = [1, 'text', true, null, undefined];
      const target = [2, 'updated', false, 'not null', 'defined'];

      const result = compare(source, target);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            op: Operation.REPLACE,
            path: '/0',
            value: 2,
          },
          {
            op: Operation.REPLACE,
            path: '/1',
            value: 'updated',
          },
          {
            op: Operation.REPLACE,
            path: '/2',
            value: false,
          },
          {
            op: Operation.REPLACE,
            path: '/3',
            value: 'not null',
          },
          {
            op: Operation.REPLACE,
            path: '/4',
            value: 'defined',
          },
        ]),
      );
    });

    it('should handle arrays with mixed object structures', () => {
      const source = [
        { type: 'user', id: 1, name: 'John' },
        { type: 'product', id: 2, title: 'Book', price: 10 },
      ];
      const target = [
        { type: 'user', id: 1, name: 'Jane', email: 'jane@example.com' },
        { type: 'product', id: 2, title: 'Updated Book' },
      ];

      const result = compare(source, target);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            op: Operation.REPLACE,
            path: '/0/name',
            value: 'Jane',
          },
          {
            op: Operation.ADD,
            path: '/0/email',
            value: 'jane@example.com',
          },
          {
            op: Operation.REPLACE,
            path: '/1/title',
            value: 'Updated Book',
          },
          {
            op: Operation.REMOVE,
            path: '/1/price',
          },
        ]),
      );
    });
  });

  describe('Function Comparison', () => {
    it('should detect function changes', () => {
      const func1 = () => 'hello';
      const func2 = () => 'world';
      const source = { callback: func1 };
      const target = { callback: func2 };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/callback',
          value: func2,
        },
      ]);
    });

    it('should handle same function reference', () => {
      const func = () => 'hello';
      const source = { callback: func };
      const target = { callback: func };

      const result = compare(source, target);
      expect(result).toEqual([]);
    });
  });

  describe('BigInt Support', () => {
    it('should handle BigInt values', () => {
      const source = { bigNumber: BigInt('9007199254740991') };
      const target = { bigNumber: BigInt('9007199254740992') };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/bigNumber',
          value: BigInt('9007199254740992'),
        },
      ]);
    });

    it('should handle same BigInt values', () => {
      const bigValue = BigInt('9007199254740991');
      const source = { bigNumber: bigValue };
      const target = { bigNumber: BigInt('9007199254740991') };

      const result = compare(source, target);
      expect(result).toEqual([]);
    });
  });

  describe('Symbol Comparison', () => {
    it('should handle Symbol values', () => {
      const symbol1 = Symbol('test');
      const symbol2 = Symbol('test');
      const source = { symbol: symbol1 };
      const target = { symbol: symbol2 };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/symbol',
          value: symbol2,
        },
      ]);
    });

    it('should handle same Symbol reference', () => {
      const symbol = Symbol('test');
      const source = { symbol };
      const target = { symbol };

      const result = compare(source, target);
      expect(result).toEqual([]);
    });
  });

  describe('Options Validation', () => {
    it('should work with explicit default options', () => {
      const source = { name: 'John', age: 30 };
      const target = { name: 'John', age: 31 };

      // Test with explicit defaults
      const result = compare(source, target, {
        strict: false,
        immutable: true,
      });
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/age',
          value: 31,
        },
      ]);
    });

    it('should work with partial options', () => {
      const source = { name: 'John', age: 30 };
      const target = { name: 'John', age: 31 };

      // Test with only strict option
      const result1 = compare(source, target, { strict: false });
      expect(result1).toEqual([
        {
          op: Operation.REPLACE,
          path: '/age',
          value: 31,
        },
      ]);

      // Test with only immutable option
      const result2 = compare(source, target, { immutable: true });
      expect(result2).toEqual([
        {
          op: Operation.REPLACE,
          path: '/age',
          value: 31,
        },
      ]);
    });
  });
});

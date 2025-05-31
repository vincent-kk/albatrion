import { describe, expect, it } from 'vitest';

import { Operation } from '../../type';
import { compare } from '../compare';

describe('compare', () => {
  describe('Basic Object Comparison', () => {
    it('should return empty array for identical objects', () => {
      const source = { name: 'John', age: 30 };
      const target = { name: 'John', age: 30 };

      const result = compare(source, target);
      expect(result).toEqual([]);
    });

    it('should detect REPLACE op for changed values', () => {
      const source = { name: 'John', age: 30 };
      const target = { name: 'John', age: 31 };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/age',
          value: 31,
        },
      ]);
    });

    it('should detect ADD op for new properties', () => {
      const source = { name: 'John' };
      const target = { name: 'John', age: 30 };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.ADD,
          path: '/age',
          value: 30,
        },
      ]);
    });

    it('should detect REMOVE op for deleted properties', () => {
      const source = { name: 'John', age: 30 };
      const target = { name: 'John' };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REMOVE,
          path: '/age',
        },
      ]);
    });

    it('should handle multiple operations in one comparison', () => {
      const source = { name: 'John', age: 30, city: 'NYC' };
      const target = { name: 'Jane', country: 'USA' };

      const result = compare(source, target);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            op: Operation.REPLACE,
            path: '/name',
            value: 'Jane',
          },
          {
            op: Operation.REMOVE,
            path: '/age',
          },
          {
            op: Operation.REMOVE,
            path: '/city',
          },
          {
            op: Operation.ADD,
            path: '/country',
            value: 'USA',
          },
        ]),
      );
    });
  });

  describe('Array Comparison', () => {
    it('should return empty array for identical arrays', () => {
      const source = [1, 2, 3];
      const target = [1, 2, 3];

      const result = compare(source, target);
      expect(result).toEqual([]);
    });

    it('should detect changes in array elements', () => {
      const source = [1, 2, 3];
      const target = [1, 5, 3];

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/1',
          value: 5,
        },
      ]);
    });

    it('should detect added array elements', () => {
      const source = [1, 2];
      const target = [1, 2, 3];

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.ADD,
          path: '/2',
          value: 3,
        },
      ]);
    });

    it('should detect removed array elements', () => {
      const source = [1, 2, 3];
      const target = [1, 2];

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REMOVE,
          path: '/2',
        },
      ]);
    });
  });

  describe('Nested Structure Comparison', () => {
    it('should handle nested objects', () => {
      const source = {
        user: {
          name: 'John',
          details: {
            age: 30,
            city: 'NYC',
          },
        },
      };
      const target = {
        user: {
          name: 'John',
          details: {
            age: 31,
            country: 'USA',
          },
        },
      };

      const result = compare(source, target);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            op: Operation.REPLACE,
            path: '/user/details/age',
            value: 31,
          },
          {
            op: Operation.REMOVE,
            path: '/user/details/city',
          },
          {
            op: Operation.ADD,
            path: '/user/details/country',
            value: 'USA',
          },
        ]),
      );
    });

    it('should handle nested arrays', () => {
      const source = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
      };
      const target = {
        items: [
          { id: 1, name: 'Updated Item 1' },
          { id: 3, name: 'Item 3' },
        ],
      };

      const result = compare(source, target);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            op: Operation.REPLACE,
            path: '/items/0/name',
            value: 'Updated Item 1',
          },
          {
            op: Operation.REPLACE,
            path: '/items/1/id',
            value: 3,
          },
          {
            op: Operation.REPLACE,
            path: '/items/1/name',
            value: 'Item 3',
          },
        ]),
      );
    });

    it('should handle arrays of arrays', () => {
      const source = [
        [1, 2],
        [3, 4],
      ];
      const target = [
        [1, 5],
        [3, 4, 6],
      ];

      const result = compare(source, target);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            op: Operation.REPLACE,
            path: '/0/1',
            value: 5,
          },
          {
            op: Operation.ADD,
            path: '/1/2',
            value: 6,
          },
        ]),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array for same reference objects', () => {
      const obj = { name: 'John', age: 30 };

      const result = compare(obj, obj);
      expect(result).toEqual([]);
    });

    it('should handle empty objects', () => {
      const source = {};
      const target = { name: 'John' };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.ADD,
          path: '/name',
          value: 'John',
        },
      ]);
    });

    it('should handle empty arrays', () => {
      const source: number[] = [];
      const target = [1, 2, 3];

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.ADD,
          path: '/0',
          value: 1,
        },
        {
          op: Operation.ADD,
          path: '/1',
          value: 2,
        },
        {
          op: Operation.ADD,
          path: '/2',
          value: 3,
        },
      ]);
    });

    it('should handle null values', () => {
      const source = { value: null };
      const target = { value: 'not null' };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/value',
          value: 'not null',
        },
      ]);
    });

    it('should handle undefined values', () => {
      const source = { value: undefined };
      const target = { value: 'defined' };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/value',
          value: 'defined',
        },
      ]);
    });

    it('should handle undefined in arrays differently', () => {
      const source = [1, undefined, 3];
      const target = [1, 2, 3];

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/1',
          value: 2,
        },
      ]);
    });

    it('should skip undefined values in target for objects', () => {
      const source = { a: 1, b: 2 };
      const target = { a: 1, b: 2, c: undefined };

      const result = compare(source, target);
      expect(result).toEqual([]);
    });
  });

  describe('Type Mismatch Cases', () => {
    it('should replace entire value when types mismatch (object to array)', () => {
      const source = { name: 'John' };
      const target = ['John'];

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '',
          value: ['John'],
        },
      ]);
    });

    it('should replace entire value when types mismatch (array to object)', () => {
      const source = ['John'];
      const target = { name: 'John' };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '',
          value: { name: 'John' },
        },
      ]);
    });

    it('should replace when nested structure type changes', () => {
      const source = { data: { items: [1, 2, 3] } };
      const target = { data: 'simple string' };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/data',
          value: 'simple string',
        },
      ]);
    });
  });

  describe('toJson() Method Handling', () => {
    it('should handle objects with toJson method', () => {
      const source = {
        toJson() {
          return { name: 'John', age: 30 };
        },
      };
      const target = { name: 'John', age: 31 };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/age',
          value: 31,
        },
      ]);
    });

    it('should handle both objects having toJson method', () => {
      const source = {
        toJson() {
          return { name: 'John', age: 30 };
        },
      };
      const target = {
        toJson() {
          return { name: 'Jane', age: 30 };
        },
      };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/name',
          value: 'Jane',
        },
      ]);
    });
  });

  describe('Special Characters in Keys', () => {
    it('should properly escape special characters in JSON Pointer paths', () => {
      const source = { 'key/with/slash': 'value1', 'key~with~tilde': 'value2' };
      const target = {
        'key/with/slash': 'newValue1',
        'key~with~tilde': 'newValue2',
      };

      const result = compare(source, target);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            op: Operation.REPLACE,
            path: '/key~1with~1slash',
            value: 'newValue1',
          },
          {
            op: Operation.REPLACE,
            path: '/key~0with~0tilde',
            value: 'newValue2',
          },
        ]),
      );
    });
  });

  describe('Performance Cases', () => {
    it('should handle large objects efficiently', () => {
      const source: Record<string, number> = {};
      const target: Record<string, number> = {};

      // Create large objects
      for (let i = 0; i < 1000; i++) {
        source[`key${i}`] = i;
        target[`key${i}`] = i;
      }

      // Change one value
      target.key500 = 9999;

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/key500',
          value: 9999,
        },
      ]);
    });

    it('should handle deeply nested structures', () => {
      let source: any = {};
      let target: any = {};
      let currentSource = source;
      let currentTarget = target;

      // Create 10 levels deep
      for (let i = 0; i < 10; i++) {
        currentSource.nested = { value: i };
        currentTarget.nested = { value: i };
        currentSource = currentSource.nested;
        currentTarget = currentTarget.nested;
      }

      // Change the deepest value
      currentTarget.value = 999;

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/nested/nested/nested/nested/nested/nested/nested/nested/nested/nested/value',
          value: 999,
        },
      ]);
    });
  });

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

  describe('Complex Nested Scenarios', () => {
    it('should handle deeply nested mixed data types', () => {
      const source = {
        user: {
          profile: {
            personal: {
              name: 'John',
              age: 30,
              hobbies: ['reading', 'gaming'],
              settings: {
                theme: 'dark',
                notifications: true,
              },
            },
          },
        },
      };

      const target = {
        user: {
          profile: {
            personal: {
              name: 'John',
              age: 31,
              hobbies: ['reading', 'coding', 'gaming'],
              settings: {
                theme: 'light',
                notifications: true,
                language: 'en',
              },
              social: {
                twitter: '@john',
              },
            },
          },
        },
      };

      const result = compare(source, target);
      expect(result).toEqual([
        {
          op: 'replace',
          path: '/user/profile/personal/age',
          value: 31,
        },
        {
          op: 'replace',
          path: '/user/profile/personal/hobbies/1',
          value: 'coding',
        },
        {
          op: 'add',
          path: '/user/profile/personal/hobbies/2',
          value: 'gaming',
        },
        {
          op: 'replace',
          path: '/user/profile/personal/settings/theme',
          value: 'light',
        },
        {
          op: 'add',
          path: '/user/profile/personal/settings/language',
          value: 'en',
        },
        {
          op: 'add',
          path: '/user/profile/personal/social',
          value: {
            twitter: '@john',
          },
        },
      ]);
    });

    it('should handle array of objects with different schemas', () => {
      const source = {
        items: [
          { id: 1, type: 'text', content: 'Hello' },
          { id: 2, type: 'image', url: 'image.jpg', alt: 'Picture' },
          { id: 3, type: 'link', href: 'https://example.com' },
        ],
      };

      const target = {
        items: [
          {
            id: 1,
            type: 'text',
            content: 'Hello World',
            timestamp: Date.now(),
          },
          { id: 2, type: 'video', url: 'video.mp4', duration: 120 },
          {
            id: 4,
            type: 'link',
            href: 'https://newsite.com',
            title: 'New Site',
          },
        ],
      };

      const result = compare(source, target);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            op: Operation.REPLACE,
            path: '/items/0/content',
            value: 'Hello World',
          },
          {
            op: Operation.ADD,
            path: '/items/0/timestamp',
            value: expect.any(Number),
          },
          {
            op: Operation.REPLACE,
            path: '/items/1/type',
            value: 'video',
          },
          {
            op: Operation.REPLACE,
            path: '/items/1/url',
            value: 'video.mp4',
          },
          {
            op: Operation.REMOVE,
            path: '/items/1/alt',
          },
          {
            op: Operation.ADD,
            path: '/items/1/duration',
            value: 120,
          },
          {
            op: Operation.REPLACE,
            path: '/items/2/id',
            value: 4,
          },
          {
            op: Operation.REPLACE,
            path: '/items/2/href',
            value: 'https://newsite.com',
          },
          {
            op: Operation.ADD,
            path: '/items/2/title',
            value: 'New Site',
          },
        ]),
      );
    });
  });

  describe('Real-world API Response Scenarios', () => {
    it('should handle typical REST API response changes', () => {
      const source = {
        status: 'success',
        data: {
          users: [
            { id: 1, name: 'John', email: 'john@example.com', active: true },
            { id: 2, name: 'Jane', email: 'jane@example.com', active: false },
          ],
          pagination: {
            page: 1,
            total: 2,
            hasNext: false,
          },
        },
        timestamp: '2023-01-01T00:00:00Z',
      };

      const target = {
        status: 'success',
        data: {
          users: [
            {
              id: 1,
              name: 'John Doe',
              email: 'john.doe@example.com',
              active: true,
            },
            { id: 2, name: 'Jane', email: 'jane@example.com', active: true },
            { id: 3, name: 'Bob', email: 'bob@example.com', active: true },
          ],
          pagination: {
            page: 1,
            total: 3,
            hasNext: true,
          },
        },
        timestamp: '2023-01-01T00:05:00Z',
      };

      const result = compare(source, target);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            op: Operation.REPLACE,
            path: '/data/users/0/name',
            value: 'John Doe',
          },
          {
            op: Operation.REPLACE,
            path: '/data/users/0/email',
            value: 'john.doe@example.com',
          },
          {
            op: Operation.REPLACE,
            path: '/data/users/1/active',
            value: true,
          },
          {
            op: Operation.ADD,
            path: '/data/users/2',
            value: {
              id: 3,
              name: 'Bob',
              email: 'bob@example.com',
              active: true,
            },
          },
          {
            op: Operation.REPLACE,
            path: '/data/pagination/total',
            value: 3,
          },
          {
            op: Operation.REPLACE,
            path: '/data/pagination/hasNext',
            value: true,
          },
          {
            op: Operation.REPLACE,
            path: '/timestamp',
            value: '2023-01-01T00:05:00Z',
          },
        ]),
      );
    });

    it('should handle form state changes', () => {
      const source = {
        formData: {
          name: '',
          email: '',
          preferences: {
            newsletter: false,
            theme: 'system',
          },
          errors: {},
        },
        isValid: false,
        isDirty: false,
      };

      const target = {
        formData: {
          name: 'John Doe',
          email: 'john@example.com',
          preferences: {
            newsletter: true,
            theme: 'dark',
            language: 'en',
          },
          errors: {
            email: 'Invalid email format',
          },
        },
        isValid: false,
        isDirty: true,
      };

      const result = compare(source, target);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            op: Operation.REPLACE,
            path: '/formData/name',
            value: 'John Doe',
          },
          {
            op: Operation.REPLACE,
            path: '/formData/email',
            value: 'john@example.com',
          },
          {
            op: Operation.REPLACE,
            path: '/formData/preferences/newsletter',
            value: true,
          },
          {
            op: Operation.REPLACE,
            path: '/formData/preferences/theme',
            value: 'dark',
          },
          {
            op: Operation.ADD,
            path: '/formData/preferences/language',
            value: 'en',
          },
          {
            op: Operation.ADD,
            path: '/formData/errors/email',
            value: 'Invalid email format',
          },
          {
            op: Operation.REPLACE,
            path: '/isDirty',
            value: true,
          },
        ]),
      );
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

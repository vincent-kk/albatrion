import { describe, expect, test } from 'vitest';

import type { NumberSchema } from '@/schema-form/types';

import { intersectNumberSchema } from '../intersectNumberSchema';

describe('intersectNumberSchema', () => {
  describe('Min/Max range merging (most restrictive value)', () => {
    test('selects larger minimum and smaller maximum', () => {
      const base: NumberSchema = { type: 'number', minimum: 0, maximum: 100 };
      const source: Partial<NumberSchema> = { minimum: 10, maximum: 50 };

      const result = intersectNumberSchema(base, source);

      expect(result.minimum).toBe(10); // Math.max(0, 10)
      expect(result.maximum).toBe(50); // Math.min(100, 50)
    });

    test('handles exclusiveMinimum/exclusiveMaximum', () => {
      const base: NumberSchema = {
        type: 'number',
        exclusiveMinimum: 0,
        exclusiveMaximum: 100,
      };
      const source: Partial<NumberSchema> = {
        exclusiveMinimum: 10,
        exclusiveMaximum: 50,
      };

      const result = intersectNumberSchema(base, source);

      expect(result.exclusiveMinimum).toBe(10); // Math.max(0, 10)
      expect(result.exclusiveMaximum).toBe(50); // Math.min(100, 50)
    });

    test('throws error on range conflict', () => {
      const base: NumberSchema = { type: 'number', minimum: 100 };
      const source: Partial<NumberSchema> = { maximum: 50 };

      expect(() => intersectNumberSchema(base, source)).toThrow(
        'Invalid number constraints: minimum (100 > 50)',
      );
    });

    test('mixes exclusive and inclusive ranges', () => {
      const base: NumberSchema = {
        type: 'number',
        minimum: 0,
        exclusiveMaximum: 100,
      };
      const source: Partial<NumberSchema> = {
        exclusiveMinimum: 10,
        maximum: 50,
      };

      const result = intersectNumberSchema(base, source);

      expect(result.minimum).toBe(0);
      expect(result.exclusiveMinimum).toBe(10);
      expect(result.maximum).toBe(50);
      expect(result.exclusiveMaximum).toBe(100);
    });
  });

  describe('MultipleOf merging (LCM)', () => {
    test('calculates LCM of two multiples', () => {
      const base: NumberSchema = { type: 'number', multipleOf: 2 };
      const source: Partial<NumberSchema> = { multipleOf: 3 };

      const result = intersectNumberSchema(base, source);

      expect(result.multipleOf).toBe(6); // lcm(2, 3)
    });

    test('when multiples are the same', () => {
      const base: NumberSchema = { type: 'number', multipleOf: 5 };
      const source: Partial<NumberSchema> = { multipleOf: 5 };

      const result = intersectNumberSchema(base, source);

      expect(result.multipleOf).toBe(5);
    });

    test('handles decimal multiples', () => {
      const base: NumberSchema = { type: 'number', multipleOf: 0.1 };
      const source: Partial<NumberSchema> = { multipleOf: 0.2 };

      const result = intersectNumberSchema(base, source);

      expect(result.multipleOf).toBe(0.2); // lcm(0.1, 0.2)
    });
  });

  describe('Common field handling', () => {
    describe('type handling', () => {
      test('handles integer and number types', () => {
        const base: NumberSchema = { type: 'number' };
        const source: Partial<NumberSchema> = { type: 'integer' };

        const result = intersectNumberSchema(base, source);

        expect(result.type).toBe('integer');
      });

      test('handles number and integer types', () => {
        const base: NumberSchema = { type: 'integer' };
        const source: Partial<NumberSchema> = { type: 'number' };

        const result = intersectNumberSchema(base, source);

        expect(result.type).toBe('integer');
      });

      test('retains base type when type is not provided', () => {
        const base: NumberSchema = { type: 'number' };
        const source: Partial<NumberSchema> = {};

        const result = intersectNumberSchema(base, source);

        expect(result.type).toBe('number');
      });
    });

    describe('First-Win fields', () => {
      const firstWinFields = [
        'title',
        'description',
        '$comment',
        'examples',
        'default',
        'readOnly',
        'writeOnly',
        'format',
      ] as const;

      test.each(firstWinFields)('%s field prioritizes base value', (field) => {
        const baseValue = field === 'default' ? 42 : `base-${field}`;
        const sourceValue = field === 'default' ? 84 : `source-${field}`;

        const base: NumberSchema = {
          type: 'number',
          [field]: baseValue,
        } as any;
        const source: Partial<NumberSchema> = { [field]: sourceValue } as any;

        const result = intersectNumberSchema(base, source);

        expect(result[field]).toBe(baseValue);
      });
    });

    describe('Enum intersection', () => {
      test('keeps only common values', () => {
        const base: NumberSchema = { type: 'number', enum: [1, 2, 3] };
        const source: Partial<NumberSchema> = { enum: [2, 3, 4] };

        const result = intersectNumberSchema(base, source);

        expect(result.enum).toEqual([2, 3]);
      });

      test('throws error when intersection is empty', () => {
        const base: NumberSchema = { type: 'number', enum: [1, 2] };
        const source: Partial<NumberSchema> = { enum: [3, 4] };

        expect(() => intersectNumberSchema(base, source)).toThrow(
          'Enum values must have at least one common value',
        );
      });
    });

    describe('Const handling', () => {
      test('retains same const value', () => {
        const base: NumberSchema = { type: 'number', const: 42 };
        const source: Partial<NumberSchema> = { const: 42 };

        const result = intersectNumberSchema(base, source);

        expect(result.const).toBe(42);
      });

      test('throws error for different const values', () => {
        const base: NumberSchema = { type: 'number', const: 42 };
        const source: Partial<NumberSchema> = { const: 84 };

        expect(() => intersectNumberSchema(base, source)).toThrow(
          'Conflicting const values: 42 vs 84',
        );
      });
    });
  });

  describe('Complex scenarios', () => {
    test('applies all constraints together', () => {
      const base: NumberSchema = {
        type: 'number',
        title: 'Base Title',
        minimum: 0,
        maximum: 100,
        multipleOf: 2,
        enum: [2, 4, 6, 8, 10],
      };

      const source: Partial<NumberSchema> = {
        title: 'Source Title', // 무시됨 (First-Win)
        minimum: 5,
        maximum: 50,
        multipleOf: 3,
        enum: [6, 8, 10, 12],
      };

      const result = intersectNumberSchema(base, source);

      expect(result).toEqual({
        type: 'number',
        title: 'Base Title',
        minimum: 5,
        maximum: 50,
        multipleOf: 6, // lcm(2, 3)
        enum: [6, 8, 10], // 교집합
      });
    });
  });
});

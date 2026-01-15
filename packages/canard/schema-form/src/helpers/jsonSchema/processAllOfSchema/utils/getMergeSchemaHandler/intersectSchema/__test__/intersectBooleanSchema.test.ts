import { describe, expect, test } from 'vitest';

import type { BooleanSchema } from '@/schema-form/types';

import { intersectBooleanSchema } from '../intersectBooleanSchema';

describe('intersectBooleanSchema', () => {
  describe('Common field handling', () => {
    describe('First-Win fields', () => {
      const firstWinFields = [
        'title',
        'description',
        '$comment',
        'examples',
        'default',
        'readOnly',
        'writeOnly',
      ] as const;

      test.each(firstWinFields)('%s field prioritizes base value', (field) => {
        const baseValue = field === 'default' ? true : `base-${field}`;
        const sourceValue = field === 'default' ? false : `source-${field}`;

        const base: BooleanSchema = {
          type: 'boolean',
          [field]: baseValue,
        } as any;
        const source: Partial<BooleanSchema> = { [field]: sourceValue } as any;

        const result = intersectBooleanSchema(base, source);

        expect(result[field]).toBe(baseValue);
      });

      test.each(firstWinFields)(
        '%s field uses source value when base has no value',
        (field) => {
          const sourceValue = field === 'default' ? false : `source-${field}`;

          const base: BooleanSchema = { type: 'boolean' };
          const source: Partial<BooleanSchema> = {
            [field]: sourceValue,
          } as any;

          const result = intersectBooleanSchema(base, source);

          expect(result[field]).toBe(sourceValue);
        },
      );
    });

    describe('Overwrite fields', () => {
      test('custom fields are overwritten with source value', () => {
        const base: BooleanSchema = {
          type: 'boolean',
          customField1: 'base-value1',
          customField2: 'base-value2',
        } as any;
        const source: Partial<BooleanSchema> = {
          customField1: 'source-value1',
          customField3: 'source-value3',
        } as any;

        const result = intersectBooleanSchema(base, source);

        expect((result as any).customField1).toBe('source-value1'); // Overwritten
        expect((result as any).customField2).toBe('base-value2'); // Retained
        expect((result as any).customField3).toBe('source-value3'); // Added
      });
    });

    describe('Enum intersection', () => {
      test('keeps only common values', () => {
        const base: BooleanSchema = { type: 'boolean', enum: [true, false] };
        const source: Partial<BooleanSchema> = { enum: [false] };

        const result = intersectBooleanSchema(base, source);

        expect(result.enum).toEqual([false]);
      });

      test('throws error when intersection is empty', () => {
        const base: BooleanSchema = { type: 'boolean', enum: [true] };
        const source: Partial<BooleanSchema> = { enum: [false] };

        expect(() => intersectBooleanSchema(base, source)).toThrow(
          'Empty enum intersection in schema merge',
        );
      });
    });

    describe('Const handling', () => {
      test('retains same const value', () => {
        const base: BooleanSchema = { type: 'boolean', const: true };
        const source: Partial<BooleanSchema> = { const: true };

        const result = intersectBooleanSchema(base, source);

        expect(result.const).toBe(true);
      });

      test('throws error for different const values', () => {
        const base: BooleanSchema = { type: 'boolean', const: true };
        const source: Partial<BooleanSchema> = { const: false };

        expect(() => intersectBooleanSchema(base, source)).toThrow(
          'Conflicting const values in schema intersection',
        );
      });
    });

    describe('Required union', () => {
      test('merges all required arrays and removes duplicates', () => {
        const base: BooleanSchema = { type: 'boolean', required: ['a', 'b'] };
        const source: Partial<BooleanSchema> = { required: ['b', 'c'] };

        const result = intersectBooleanSchema(base, source);

        expect(result.required).toEqual(['a', 'b', 'c']);
      });
    });
  });

  describe('Simple merge scenarios', () => {
    test('Boolean type has no additional constraints so simple merge', () => {
      const base: BooleanSchema = {
        type: 'boolean',
        title: 'Base Title',
        default: true,
      };

      const source: Partial<BooleanSchema> = {
        title: 'Source Title', // Ignored (First-Win)
        description: 'Source Description',
      };

      const result = intersectBooleanSchema(base, source);

      expect(result).toEqual({
        type: 'boolean',
        title: 'Base Title',
        default: true,
        description: 'Source Description',
      });
    });
  });
});

import { describe, expect, test } from 'vitest';

import type { NullSchema } from '@/schema-form/types';

import { intersectNullSchema } from '../intersectNullSchema';

describe('intersectNullSchema', () => {
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
        const baseValue = field === 'default' ? null : `base-${field}`;
        const sourceValue = field === 'default' ? null : `source-${field}`;

        const base: NullSchema = { type: 'null', [field]: baseValue } as any;
        const source: Partial<NullSchema> = { [field]: sourceValue } as any;

        const result = intersectNullSchema(base, source);

        expect(result[field]).toBe(baseValue);
      });

      test.each(firstWinFields)(
        '%s field uses source value when base has no value',
        (field) => {
          const sourceValue = field === 'default' ? null : `source-${field}`;

          const base: NullSchema = { type: 'null' };
          const source: Partial<NullSchema> = { [field]: sourceValue } as any;

          const result = intersectNullSchema(base, source);

          expect(result[field]).toBe(sourceValue);
        },
      );
    });

    describe('Overwrite fields', () => {
      test('custom fields are overwritten with source value', () => {
        const base: NullSchema = {
          type: 'null',
          customField1: 'base-value1',
          customField2: 'base-value2',
        } as any;
        const source: Partial<NullSchema> = {
          customField1: 'source-value1',
          customField3: 'source-value3',
        } as any;

        const result = intersectNullSchema(base, source);

        expect((result as any).customField1).toBe('source-value1'); // Overwritten
        expect((result as any).customField2).toBe('base-value2'); // Retained
        expect((result as any).customField3).toBe('source-value3'); // Added
      });
    });

    describe('Enum intersection', () => {
      test('null type enum is always [null]', () => {
        const base: NullSchema = { type: 'null', enum: [null] };
        const source: Partial<NullSchema> = { enum: [null] };

        const result = intersectNullSchema(base, source);

        expect(result.enum).toEqual([null]);
      });

      test('throws error for non-null enum values', () => {
        const base: NullSchema = { type: 'null', enum: [null] };
        const source: Partial<NullSchema> = { enum: [] }; // Empty intersection

        expect(() => intersectNullSchema(base, source)).toThrow(
          'Empty enum intersection in schema merge',
        );
      });
    });

    describe('Const handling', () => {
      test('retains null const value', () => {
        const base: NullSchema = { type: 'null', const: null };
        const source: Partial<NullSchema> = { const: null };

        const result = intersectNullSchema(base, source);

        expect(result.const).toBe(null);
      });

      test('throws error for non-null const value', () => {
        const base: NullSchema = { type: 'null', const: null };
        const source: Partial<NullSchema> = { const: 'not-null' as any };

        expect(() => intersectNullSchema(base, source)).toThrow(
          'Conflicting const values in schema intersection',
        );
      });
    });

    describe('Required union', () => {
      test('merges all required arrays and removes duplicates', () => {
        const base: NullSchema = { type: 'null', required: ['a', 'b'] };
        const source: Partial<NullSchema> = { required: ['b', 'c'] };

        const result = intersectNullSchema(base, source);

        expect(result.required).toEqual(['a', 'b', 'c']);
      });
    });
  });

  describe('Simple merge scenarios', () => {
    test('Null type has no additional constraints so simple merge', () => {
      const base: NullSchema = {
        type: 'null',
        title: 'Base Title',
        default: null,
      };

      const source: Partial<NullSchema> = {
        title: 'Source Title', // 무시됨 (First-Win)
        description: 'Source Description',
      };

      const result = intersectNullSchema(base, source);

      expect(result).toEqual({
        type: 'null',
        title: 'Base Title',
        default: null,
        description: 'Source Description',
      });
    });
  });
});

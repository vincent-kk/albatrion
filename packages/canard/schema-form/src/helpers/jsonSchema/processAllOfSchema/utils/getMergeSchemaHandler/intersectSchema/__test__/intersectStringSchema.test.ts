import { describe, expect, test } from 'vitest';

import type { StringSchema } from '@/schema-form/types';

import { intersectStringSchema } from '../intersectStringSchema';

describe('intersectStringSchema', () => {
  describe('Pattern merging (AND combination)', () => {
    test('combines two patterns with AND', () => {
      const base: StringSchema = { type: 'string', pattern: '^[a-z]+$' };
      const source: Partial<StringSchema> = { pattern: '^.{5,}$' };

      const result = intersectStringSchema(base, source);

      expect(result.pattern).toBe('(?=^[a-z]+$)(?=^.{5,}$)');
    });

    test('combines three or more patterns', () => {
      const base: StringSchema = { type: 'string', pattern: '^[a-z]+$' };
      const source: Partial<StringSchema> = { pattern: '^.{5,}$' };

      const result1 = intersectStringSchema(base, source);
      const result2 = intersectStringSchema(result1, { pattern: '^.{0,10}$' });

      expect(result2.pattern).toBe('(?=(?=^[a-z]+$)(?=^.{5,}$))(?=^.{0,10}$)');
    });

    test('when only base has pattern', () => {
      const base: StringSchema = { type: 'string', pattern: '^[a-z]+$' };
      const source: Partial<StringSchema> = {};

      const result = intersectStringSchema(base, source);

      expect(result.pattern).toBe('^[a-z]+$');
    });

    test('when only source has pattern', () => {
      const base: StringSchema = { type: 'string' };
      const source: Partial<StringSchema> = { pattern: '^.{5,}$' };

      const result = intersectStringSchema(base, source);

      expect(result.pattern).toBe('^.{5,}$');
    });
  });

  describe('MinLength/MaxLength merging (most restrictive value)', () => {
    test('selects larger minLength and smaller maxLength', () => {
      const base: StringSchema = {
        type: 'string',
        minLength: 3,
        maxLength: 10,
      };
      const source: Partial<StringSchema> = { minLength: 5, maxLength: 8 };

      const result = intersectStringSchema(base, source);

      expect(result.minLength).toBe(5); // Math.max(3, 5)
      expect(result.maxLength).toBe(8); // Math.min(10, 8)
    });

    test('when only base has constraint', () => {
      const base: StringSchema = { type: 'string', minLength: 3 };
      const source: Partial<StringSchema> = {};

      const result = intersectStringSchema(base, source);

      expect(result.minLength).toBe(3);
    });

    test('when only source has constraint', () => {
      const base: StringSchema = { type: 'string' };
      const source: Partial<StringSchema> = { maxLength: 10 };

      const result = intersectStringSchema(base, source);

      expect(result.maxLength).toBe(10);
    });

    test('throws error on range conflict', () => {
      const base: StringSchema = { type: 'string', minLength: 10 };
      const source: Partial<StringSchema> = { maxLength: 5 };

      expect(() => intersectStringSchema(base, source)).toThrow(
        'Invalid range constraint in schema intersection',
      );
    });
  });

  describe('Format field (First-Win)', () => {
    test('retains base value when base has format', () => {
      const base: StringSchema = { type: 'string', format: 'email' };
      const source: Partial<StringSchema> = { format: 'uri' };

      const result = intersectStringSchema(base, source);

      expect(result.format).toBe('email');
    });

    test('uses source value when base has no format', () => {
      const base: StringSchema = { type: 'string' };
      const source: Partial<StringSchema> = { format: 'uri' };

      const result = intersectStringSchema(base, source);

      expect(result.format).toBe('uri');
    });
  });

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
        const baseValue = `base-${field}`;
        const sourceValue = `source-${field}`;

        const base: StringSchema = {
          type: 'string',
          [field]: baseValue,
        } as any;
        const source: Partial<StringSchema> = { [field]: sourceValue } as any;

        const result = intersectStringSchema(base, source);

        expect(result[field]).toBe(baseValue);
      });

      test.each(firstWinFields)(
        '%s field uses source value when base has no value',
        (field) => {
          const sourceValue = `source-${field}`;

          const base: StringSchema = { type: 'string' };
          const source: Partial<StringSchema> = { [field]: sourceValue } as any;

          const result = intersectStringSchema(base, source);

          expect(result[field]).toBe(sourceValue);
        },
      );
    });

    describe('Overwrite fields', () => {
      test('custom fields are overwritten with source value', () => {
        const base: StringSchema = {
          type: 'string',
          customField1: 'base-value1',
          customField2: 'base-value2',
        } as any;
        const source: Partial<StringSchema> = {
          customField1: 'source-value1',
          customField3: 'source-value3',
        } as any;

        const result = intersectStringSchema(base, source);

        expect((result as any).customField1).toBe('source-value1'); // Overwritten
        expect((result as any).customField2).toBe('base-value2'); // Retained
        expect((result as any).customField3).toBe('source-value3'); // Added
      });
    });

    describe('Enum intersection', () => {
      test('keeps only common values', () => {
        const base: StringSchema = { type: 'string', enum: ['a', 'b', 'c'] };
        const source: Partial<StringSchema> = { enum: ['b', 'c', 'd'] };

        const result = intersectStringSchema(base, source);

        expect(result.enum).toEqual(['b', 'c']);
      });

      test('throws error when intersection is empty', () => {
        const base: StringSchema = { type: 'string', enum: ['a', 'b'] };
        const source: Partial<StringSchema> = { enum: ['c', 'd'] };

        expect(() => intersectStringSchema(base, source)).toThrow(
          'Empty enum intersection in schema merge',
        );
      });

      test('when only base has enum', () => {
        const base: StringSchema = { type: 'string', enum: ['a', 'b'] };
        const source: Partial<StringSchema> = {};

        const result = intersectStringSchema(base, source);

        expect(result.enum).toEqual(['a', 'b']);
      });
    });

    describe('Const handling', () => {
      test('retains same const value', () => {
        const base: StringSchema = { type: 'string', const: 'value' };
        const source: Partial<StringSchema> = { const: 'value' };

        const result = intersectStringSchema(base, source);

        expect(result.const).toBe('value');
      });

      test('throws error for different const values', () => {
        const base: StringSchema = { type: 'string', const: 'value1' };
        const source: Partial<StringSchema> = { const: 'value2' };

        expect(() => intersectStringSchema(base, source)).toThrow(
          'Conflicting const values in schema intersection',
        );
      });
    });

    describe('Required union', () => {
      test('merges all required arrays and removes duplicates', () => {
        const base: StringSchema = { type: 'string', required: ['a', 'b'] };
        const source: Partial<StringSchema> = { required: ['b', 'c'] };

        const result = intersectStringSchema(base, source);

        expect(result.required).toEqual(['a', 'b', 'c']);
      });
    });
  });

  describe('Complex scenarios', () => {
    test('applies all constraints together', () => {
      const base: StringSchema = {
        type: 'string',
        title: 'Base Title',
        pattern: '^[a-z]+$',
        minLength: 3,
        maxLength: 10,
        format: 'email',
        enum: ['abc', 'def', 'ghi'],
      };

      const source: Partial<StringSchema> = {
        title: 'Source Title', // 무시됨 (First-Win)
        pattern: '^.{5,}$',
        minLength: 5,
        maxLength: 8,
        format: 'uri', // 무시됨 (First-Win)
        enum: ['def', 'ghi', 'jkl'],
      };

      const result = intersectStringSchema(base, source);

      expect(result).toEqual({
        type: 'string',
        title: 'Base Title',
        pattern: '(?=^[a-z]+$)(?=^.{5,}$)',
        minLength: 5,
        maxLength: 8,
        format: 'email',
        enum: ['def', 'ghi'],
      });
    });
  });
});

import { describe, expect, test } from 'vitest';

import type { ArraySchema } from '@/schema-form/types';

import { intersectArraySchema } from '../intersectArraySchema';

describe('intersectArraySchema', () => {
  describe('Items constraint merging (most restrictive value)', () => {
    test('selects larger minItems and smaller maxItems', () => {
      const base = { type: 'array', minItems: 1, maxItems: 10 } as ArraySchema;
      const source: Partial<ArraySchema> = { minItems: 3, maxItems: 5 };

      const result = intersectArraySchema(base, source);

      expect(result.minItems).toBe(3); // Math.max(1, 3)
      expect(result.maxItems).toBe(5); // Math.min(10, 5)
    });

    test('handles minContains/maxContains', () => {
      const base = {
        type: 'array',
        minContains: 1,
        maxContains: 5,
      } as ArraySchema;
      const source: Partial<ArraySchema> = { minContains: 2, maxContains: 3 };

      const result = intersectArraySchema(base, source);

      expect(result.minContains).toBe(2); // Math.max(1, 2)
      expect(result.maxContains).toBe(3); // Math.min(5, 3)
    });

    test('throws error on range conflict', () => {
      const base = { type: 'array', minItems: 10 } as ArraySchema;
      const source: Partial<ArraySchema> = { maxItems: 5 };

      expect(() => intersectArraySchema(base, source)).toThrow(
        'Invalid range constraint in schema intersection',
      );
    });
  });

  describe('UniqueItems merging (OR combination)', () => {
    test('returns true if any is true', () => {
      const base = { type: 'array', uniqueItems: false } as ArraySchema;
      const source: Partial<ArraySchema> = { uniqueItems: true };

      const result = intersectArraySchema(base, source);

      expect(result.uniqueItems).toBe(true);
    });

    test('returns false if both are false', () => {
      const base = { type: 'array', uniqueItems: false } as ArraySchema;
      const source: Partial<ArraySchema> = { uniqueItems: false };

      const result = intersectArraySchema(base, source);

      expect(result.uniqueItems).toBe(false);
    });

    test('returns true if both are true', () => {
      const base = { type: 'array', uniqueItems: true } as ArraySchema;
      const source: Partial<ArraySchema> = { uniqueItems: true };

      const result = intersectArraySchema(base, source);

      expect(result.uniqueItems).toBe(true);
    });

    test('uses base value when only base has value', () => {
      const base = { type: 'array', uniqueItems: true } as ArraySchema;
      const source: Partial<ArraySchema> = {};

      const result = intersectArraySchema(base, source);

      expect(result.uniqueItems).toBe(true);
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
        'additionalProperties',
      ] as const;

      test.each(firstWinFields)('%s field prioritizes base value', (field) => {
        const baseValue = field === 'default' ? ['base'] : `base-${field}`;
        const sourceValue =
          field === 'default' ? ['source'] : `source-${field}`;

        const base = { type: 'array', [field]: baseValue } as ArraySchema;
        const source: Partial<ArraySchema> = { [field]: sourceValue } as any;

        const result = intersectArraySchema(base, source);

        expect(result[field]).toBe(baseValue);
      });
    });

    describe('Enum intersection', () => {
      test('keeps only common values', () => {
        const base = {
          type: 'array',
          enum: [['a'], ['b'], ['c']],
        } as ArraySchema;
        const source: Partial<ArraySchema> = { enum: [['b'], ['c'], ['d']] };

        const result = intersectArraySchema(base, source);

        expect(result.enum).toEqual([['b'], ['c']]);
      });
    });

    describe('Required union', () => {
      test('merges all required arrays and removes duplicates', () => {
        const base = {
          type: 'array',
          required: ['a', 'b'],
        } as unknown as ArraySchema;
        const source: Partial<ArraySchema> = { required: ['b', 'c'] };

        const result = intersectArraySchema(base, source);

        expect(result.required).toEqual(['a', 'b', 'c']);
      });
    });
  });

  describe('Items merging (handling items in allOf)', () => {
    test('when base has no items and only source has items', () => {
      const base = {
        type: 'array',
        title: 'Base Array',
      } as unknown as ArraySchema;
      const source: Partial<ArraySchema> = {
        items: { type: 'string' as const },
      };

      const result = intersectArraySchema(base, source);

      expect(result.items).toEqual({
        type: 'string',
      });
    });

    test('when both base and source have items - merges with distributeSchema', () => {
      const base = {
        type: 'array',
        items: {
          type: 'string' as const,
          minLength: 1,
        },
      } as ArraySchema;
      const source: Partial<ArraySchema> = {
        items: {
          type: 'string' as const,
          maxLength: 50,
          pattern: '^[a-zA-Z]+$',
        },
      };

      const result = intersectArraySchema(base, source);

      expect(result.items).toEqual({
        type: 'string',
        minLength: 1,
        allOf: [
          {
            type: 'string' as const,
            maxLength: 50,
            pattern: '^[a-zA-Z]+$',
          },
        ],
      });
    });

    test('merges complex object items', () => {
      const base = {
        type: 'array',
        items: {
          type: 'object' as const,
          properties: {
            name: { type: 'string' as const },
            age: { type: 'number' as const, minimum: 0 },
          },
          required: ['name'],
        },
      } as ArraySchema;
      const source: Partial<ArraySchema> = {
        items: {
          type: 'object' as const,
          properties: {
            email: { type: 'string' as const, format: 'email' },
            age: { type: 'number' as const, maximum: 150 },
          },
          required: ['email'],
        },
      };

      const result = intersectArraySchema(base, source);

      expect(result.items).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number', minimum: 0 },
        },
        required: ['name'],
        allOf: [
          {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              age: { type: 'number', maximum: 150 },
            },
            required: ['email'],
          },
        ],
      });
    });

    test('merges nested array items', () => {
      const base = {
        type: 'array',
        items: {
          type: 'array' as const,
          items: {
            type: 'string' as const,
            minLength: 1,
          },
          minItems: 1,
        },
      } as ArraySchema;
      const source: Partial<ArraySchema> = {
        items: {
          type: 'array' as const,
          items: {
            type: 'string' as const,
            maxLength: 20,
          },
          maxItems: 10,
        },
      };

      const result = intersectArraySchema(base, source);

      expect(result.items).toEqual({
        type: 'array',
        items: {
          type: 'string',
          minLength: 1,
        },
        minItems: 1,
        allOf: [
          {
            type: 'array',
            items: {
              type: 'string',
              maxLength: 20,
            },
            maxItems: 10,
          },
        ],
      });
    });

    test('merges various items schema constraints', () => {
      const base = {
        type: 'array',
        items: {
          type: 'number' as const,
          minimum: 0,
          multipleOf: 2,
        },
      } as ArraySchema;
      const source: Partial<ArraySchema> = {
        items: {
          type: 'number' as const,
          maximum: 100,
          multipleOf: 3,
        },
      };

      const result = intersectArraySchema(base, source);

      expect(result.items).toEqual({
        type: 'number',
        minimum: 0,
        multipleOf: 2,
        allOf: [
          {
            type: 'number',
            maximum: 100,
            multipleOf: 3,
          },
        ],
      });
    });
  });

  describe('Complex scenarios', () => {
    test('applies all constraints together', () => {
      const base = {
        type: 'array',
        title: 'Base Title',
        minItems: 1,
        maxItems: 10,
        uniqueItems: false,
        minContains: 0,
        maxContains: 5,
      } as unknown as ArraySchema;

      const source: Partial<ArraySchema> = {
        title: 'Source Title', // 무시됨 (First-Win)
        minItems: 3,
        maxItems: 8,
        uniqueItems: true,
        minContains: 1,
        maxContains: 3,
      };

      const result = intersectArraySchema(base, source);

      expect(result).toEqual({
        type: 'array',
        title: 'Base Title',
        minItems: 3,
        maxItems: 8,
        uniqueItems: true, // OR 결합
        minContains: 1,
        maxContains: 3,
      });
    });

    test('complex scenario with all features including items', () => {
      const base = {
        type: 'array',
        title: 'User List',
        minItems: 1,
        maxItems: 100,
        uniqueItems: true,
        items: {
          type: 'object' as const,
          properties: {
            id: { type: 'number' as const, minimum: 1 },
            name: { type: 'string' as const, minLength: 1 },
          },
          required: ['id', 'name'],
        },
      } as ArraySchema;

      const source: Partial<ArraySchema> = {
        title: 'Extended User List', // 무시됨 (First-Win)
        minItems: 5,
        maxItems: 50,
        uniqueItems: false, // true OR false = true
        items: {
          type: 'object' as const,
          properties: {
            email: { type: 'string' as const, format: 'email' },
            name: { type: 'string' as const, maxLength: 100 },
          },
          required: ['email'],
        },
      };

      const result = intersectArraySchema(base, source);

      expect(result).toEqual({
        type: 'array',
        title: 'User List',
        minItems: 5,
        maxItems: 50,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            id: { type: 'number', minimum: 1 },
            name: { type: 'string', minLength: 1 },
          },
          required: ['id', 'name'],
          allOf: [
            {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                name: { type: 'string', maxLength: 100 },
              },
              required: ['email'],
            },
          ],
        },
      });
    });

    test('real allOf use case - extending array item schema', () => {
      // Basic user array
      const base = {
        type: 'array',
        description: 'Basic user array',
        minItems: 0,
        items: {
          type: 'object' as const,
          properties: {
            username: { type: 'string' as const, pattern: '^[a-zA-Z0-9_]+$' },
          },
          required: ['username'],
        },
      } as ArraySchema;

      // Additional validation rules
      const source: Partial<ArraySchema> = {
        minItems: 1, // At least 1 user required
        maxItems: 1000, // Maximum 1000 users
        uniqueItems: true, // No duplicate users
        items: {
          type: 'object' as const,
          properties: {
            username: { type: 'string' as const, minLength: 3, maxLength: 20 },
            role: { type: 'string' as const, enum: ['admin', 'user', 'guest'] },
            active: { type: 'boolean' as const, default: true },
          },
          required: ['role'],
        },
      };

      const result = intersectArraySchema(base, source);

      expect(result).toEqual({
        type: 'array',
        description: 'Basic user array',
        minItems: 1,
        maxItems: 1000,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              pattern: '^[a-zA-Z0-9_]+$',
            },
          },
          required: ['username'],
          allOf: [
            {
              type: 'object',
              properties: {
                username: { type: 'string', minLength: 3, maxLength: 20 },
                role: { type: 'string', enum: ['admin', 'user', 'guest'] },
                active: { type: 'boolean', default: true },
              },
              required: ['role'],
            },
          ],
        },
      });
    });
  });

  describe('prefixItems merging (First-Win strategy)', () => {
    test('base prefixItems is preserved when both have prefixItems', () => {
      const base = {
        type: 'array',
        prefixItems: [
          { type: 'string' as const, minLength: 1 },
          { type: 'number' as const, minimum: 0 },
        ],
      } as ArraySchema;
      const source: Partial<ArraySchema> = {
        prefixItems: [
          { type: 'string' as const, maxLength: 100 },
          { type: 'number' as const, maximum: 100 },
        ],
      };

      const result = intersectArraySchema(base, source);

      // First-Win: base prefixItems preserved
      expect(result.prefixItems).toEqual([
        { type: 'string', minLength: 1 },
        { type: 'number', minimum: 0 },
      ]);
    });

    test('source prefixItems is used when base has no prefixItems', () => {
      const base = { type: 'array' } as ArraySchema;
      const source: Partial<ArraySchema> = {
        prefixItems: [{ type: 'string' as const }, { type: 'number' as const }],
      };

      const result = intersectArraySchema(base, source);

      expect(result.prefixItems).toEqual([
        { type: 'string' },
        { type: 'number' },
      ]);
    });

    test('prefixItems remains undefined when neither has it', () => {
      const base = { type: 'array' } as ArraySchema;
      const source: Partial<ArraySchema> = {};

      const result = intersectArraySchema(base, source);

      expect(result.prefixItems).toBeUndefined();
    });

    test('prefixItems works together with items', () => {
      const base = {
        type: 'array',
        prefixItems: [{ type: 'string' as const }],
        items: { type: 'number' as const, minimum: 0 },
      } as ArraySchema;
      const source: Partial<ArraySchema> = {
        prefixItems: [{ type: 'boolean' as const }], // Should be ignored (First-Win)
        items: { type: 'number' as const, maximum: 100 },
      };

      const result = intersectArraySchema(base, source);

      // prefixItems: First-Win (base preserved)
      expect(result.prefixItems).toEqual([{ type: 'string' }]);
      // items: merged via allOf
      expect(result.items).toEqual({
        type: 'number',
        minimum: 0,
        allOf: [{ type: 'number', maximum: 100 }],
      });
    });
  });
});

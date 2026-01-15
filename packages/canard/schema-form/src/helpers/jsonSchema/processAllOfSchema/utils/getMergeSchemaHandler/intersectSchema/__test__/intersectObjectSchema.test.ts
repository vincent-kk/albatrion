import { describe, expect, test } from 'vitest';

import type { ObjectSchema } from '@/schema-form/types';

import { intersectObjectSchema } from '../intersectObjectSchema';

describe('intersectObjectSchema', () => {
  describe('Properties constraint merging (most restrictive value)', () => {
    test('selects larger minProperties and smaller maxProperties', () => {
      const base: ObjectSchema = {
        type: 'object',
        minProperties: 1,
        maxProperties: 10,
      };
      const source: Partial<ObjectSchema> = {
        minProperties: 3,
        maxProperties: 5,
      };

      const result = intersectObjectSchema(base, source);

      expect(result.minProperties).toBe(3); // Math.max(1, 3)
      expect(result.maxProperties).toBe(5); // Math.min(10, 5)
    });

    test('throws error on range conflict', () => {
      const base: ObjectSchema = { type: 'object', minProperties: 10 };
      const source: Partial<ObjectSchema> = { maxProperties: 5 };

      expect(() => intersectObjectSchema(base, source)).toThrow(
        'Invalid range constraint in schema intersection',
      );
    });
  });

  describe('AdditionalProperties/PatternProperties (First-Win)', () => {
    test('additionalProperties prioritizes base value', () => {
      const base: ObjectSchema = {
        type: 'object',
        additionalProperties: false,
      };
      const source: Partial<ObjectSchema> = {
        additionalProperties: true,
      };

      const result = intersectObjectSchema(base, source);

      expect(result.additionalProperties).toBe(false);
    });

    test('patternProperties prioritizes base value', () => {
      const basePattern = { '^[a-z]+$': { type: 'string' as const } };
      const sourcePattern = { '^[0-9]+$': { type: 'number' as const } };

      const base: ObjectSchema = {
        type: 'object',
        patternProperties: basePattern,
      };
      const source: Partial<ObjectSchema> = {
        patternProperties: sourcePattern,
      };

      const result = intersectObjectSchema(base, source);

      expect(result.patternProperties).toBe(basePattern);
    });

    test('uses source value when base has no value', () => {
      const base: ObjectSchema = { type: 'object' };
      const source: Partial<ObjectSchema> = {
        additionalProperties: { type: 'string' as const },
      };

      const result = intersectObjectSchema(base, source);

      expect(result.additionalProperties).toEqual({ type: 'string' });
    });
  });

  describe('PropertyNames merging (using intersectStringSchema)', () => {
    test('when only base has propertyNames', () => {
      const base: ObjectSchema = {
        type: 'object',
        propertyNames: {
          type: 'string',
          pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$',
        },
      };
      const source: Partial<ObjectSchema> = {};

      const result = intersectObjectSchema(base, source);

      expect(result.propertyNames).toEqual({
        type: 'string',
        pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$',
      });
    });

    test('when only source has propertyNames', () => {
      const base: ObjectSchema = { type: 'object' };
      const source: Partial<ObjectSchema> = {
        propertyNames: {
          type: 'string',
          minLength: 1,
          maxLength: 50,
        },
      };

      const result = intersectObjectSchema(base, source);

      expect(result.propertyNames).toEqual({
        type: 'string',
        minLength: 1,
        maxLength: 50,
      });
    });

    test('when both have propertyNames - merge with intersectStringSchema', () => {
      const base: ObjectSchema = {
        type: 'object',
        propertyNames: {
          type: 'string',
          minLength: 1,
          pattern: '^[a-zA-Z]',
        },
      };
      const source: Partial<ObjectSchema> = {
        propertyNames: {
          type: 'string',
          maxLength: 20,
          pattern: '[a-zA-Z0-9_]+$',
        },
      };

      const result = intersectObjectSchema(base, source);

      // intersectStringSchema result: patterns combined with lookahead assertion, constraints merged to most restrictive values
      expect(result.propertyNames).toEqual({
        type: 'string',
        minLength: 1,
        maxLength: 20,
        pattern: '(?=^[a-zA-Z])(?=[a-zA-Z0-9_]+$)',
      });
    });

    test('string constraint conflict when merging propertyNames', () => {
      const base: ObjectSchema = {
        type: 'object',
        propertyNames: {
          type: 'string',
          minLength: 10,
        },
      };
      const source: Partial<ObjectSchema> = {
        propertyNames: {
          type: 'string',
          maxLength: 5,
        },
      };

      expect(() => intersectObjectSchema(base, source)).toThrow(
        'Invalid range constraint in schema intersection',
      );
    });

    test('complex scenario with propertyNames and properties together', () => {
      const base: ObjectSchema = {
        type: 'object',
        propertyNames: {
          type: 'string',
          pattern: '^[a-z]+$',
        },
        properties: {
          name: { type: 'string' as const },
        },
      };
      const source: Partial<ObjectSchema> = {
        propertyNames: {
          type: 'string',
          minLength: 2,
          maxLength: 10,
        },
        properties: {
          age: { type: 'number' as const },
        },
      };

      const result = intersectObjectSchema(base, source);

      expect(result.propertyNames).toEqual({
        type: 'string',
        pattern: '^[a-z]+$',
        minLength: 2,
        maxLength: 10,
      });
      expect(result.properties).toEqual({
        name: { type: 'string' },
        age: { type: 'number' },
      });
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
        const baseValue =
          field === 'default' ? { base: true } : `base-${field}`;
        const sourceValue =
          field === 'default' ? { source: true } : `source-${field}`;

        const base: ObjectSchema = {
          type: 'object',
          [field]: baseValue,
        } as any;
        const source: Partial<ObjectSchema> = { [field]: sourceValue } as any;

        const result = intersectObjectSchema(base, source);

        expect(result[field]).toBe(baseValue);
      });
    });

    describe('Required union', () => {
      test('merges all required arrays and removes duplicates', () => {
        const base: ObjectSchema = { type: 'object', required: ['a', 'b'] };
        const source: Partial<ObjectSchema> = { required: ['b', 'c'] };

        const result = intersectObjectSchema(base, source);

        expect(result.required).toEqual(['a', 'b', 'c']);
      });
    });

    describe('Enum intersection', () => {
      test('keeps only common values', () => {
        const base: ObjectSchema = {
          type: 'object',
          enum: [{ a: 1 }, { b: 2 }, { c: 3 }],
        };
        const source: Partial<ObjectSchema> = {
          enum: [{ b: 2 }, { c: 3 }, { d: 4 }],
        };

        const result = intersectObjectSchema(base, source);

        expect(result.enum).toEqual([{ b: 2 }, { c: 3 }]);
      });
    });

    describe('Const handling', () => {
      test('retains same const value', () => {
        const constValue = { test: 'value' };
        const base: ObjectSchema = { type: 'object', const: constValue };
        const source: Partial<ObjectSchema> = { const: constValue };

        const result = intersectObjectSchema(base, source);

        expect(result.const).toBe(constValue);
      });

      test('throws error for different const values', () => {
        const base: ObjectSchema = { type: 'object', const: { a: 1 } };
        const source: Partial<ObjectSchema> = { const: { b: 2 } };

        expect(() => intersectObjectSchema(base, source)).toThrow(
          'Conflicting const values',
        );
      });
    });
  });

  describe('Properties merging (handling properties in allOf)', () => {
    test('when base has no properties and only source has properties', () => {
      const base: ObjectSchema = {
        type: 'object',
        title: 'Base Object',
      };
      const source: Partial<ObjectSchema> = {
        properties: {
          name: { type: 'string' as const },
          age: { type: 'number' as const },
        },
      };

      const result = intersectObjectSchema(base, source);

      expect(result.properties).toEqual({
        name: {
          type: 'string',
        },
        age: { type: 'number' },
      });
    });

    test('when both base and source have properties - add new properties', () => {
      const base: ObjectSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' as const },
          age: { type: 'number' as const },
        },
      };
      const source: Partial<ObjectSchema> = {
        properties: {
          email: { type: 'string' as const, format: 'email' },
          active: { type: 'boolean' as const },
        },
      };

      const result = intersectObjectSchema(base, source);

      expect(result.properties).toEqual({
        name: { type: 'string' },
        age: { type: 'number' },
        email: {
          type: 'string',
          format: 'email',
        },
        active: { type: 'boolean' },
      });
    });

    test('when same property keys exist - merge with distributeSchema', () => {
      const base: ObjectSchema = {
        type: 'object',
        properties: {
          name: {
            type: 'string' as const,
            minLength: 1,
          },
          count: { type: 'number' as const },
        },
      };
      const source: Partial<ObjectSchema> = {
        properties: {
          name: {
            type: 'string' as const,
            maxLength: 50,
            pattern: '^[a-zA-Z]+$',
          },
          email: { type: 'string' as const, format: 'email' },
        },
      };

      const result = intersectObjectSchema(base, source);

      expect(result.properties?.name).toEqual({
        type: 'string',
        minLength: 1,
        allOf: [
          {
            type: 'string',
            maxLength: 50,
            pattern: '^[a-zA-Z]+$',
          },
        ],
      });
      expect(result.properties?.count).toEqual({ type: 'number' });
      expect(result.properties?.email).toEqual({
        type: 'string',
        format: 'email',
      });
    });

    test('complex nested object property merging', () => {
      const base: ObjectSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object' as const,
            properties: {
              name: { type: 'string' as const },
              profile: {
                type: 'object' as const,
                properties: {
                  avatar: { type: 'string' as const },
                },
              },
            },
          },
        },
      };
      const source: Partial<ObjectSchema> = {
        properties: {
          user: {
            type: 'object' as const,
            properties: {
              age: { type: 'number' as const },
              profile: {
                type: 'object' as const,
                properties: {
                  bio: { type: 'string' as const },
                },
              },
            },
          },
        },
      };

      const result = intersectObjectSchema(base, source);

      expect(result.properties?.user).toEqual({
        type: 'object' as const,
        properties: {
          name: { type: 'string' as const },
          profile: {
            type: 'object' as const,
            properties: {
              avatar: { type: 'string' as const },
            },
          },
        },
        allOf: [
          {
            type: 'object' as const,
            properties: {
              age: { type: 'number' as const },
              profile: {
                type: 'object' as const,
                properties: {
                  bio: { type: 'string' as const },
                },
              },
            },
          },
        ],
      });
    });

    test('empty properties object handling', () => {
      const base: ObjectSchema = {
        type: 'object',
        properties: {},
      };
      const source: Partial<ObjectSchema> = {
        properties: {
          field: { type: 'string' as const },
        },
      };

      const result = intersectObjectSchema(base, source);

      expect(result).toEqual({
        type: 'object',
        properties: { field: { type: 'string' as const } },
      });
    });
  });

  describe('Complex scenarios', () => {
    test('applies all constraints together', () => {
      const base: ObjectSchema = {
        type: 'object',
        title: 'Base Title',
        minProperties: 1,
        maxProperties: 10,
        additionalProperties: false,
        required: ['a', 'b'],
      };

      const source: Partial<ObjectSchema> = {
        title: 'Source Title', // Ignored (First-Win)
        minProperties: 3,
        maxProperties: 8,
        additionalProperties: true, // Ignored (First-Win)
        required: ['b', 'c'],
      };

      const result = intersectObjectSchema(base, source);

      expect(result).toEqual({
        type: 'object',
        title: 'Base Title',
        minProperties: 3,
        maxProperties: 8,
        additionalProperties: false,
        required: ['a', 'b', 'c'],
      });
    });

    test('complex scenario with all features including properties', () => {
      const base: ObjectSchema = {
        type: 'object',
        title: 'User Schema',
        minProperties: 2,
        maxProperties: 10,
        required: ['name', 'email'],
        properties: {
          name: {
            type: 'string' as const,
            minLength: 1,
            pattern: '^[A-Za-z]+$',
          },
          settings: {
            type: 'object' as const,
            properties: {
              theme: { type: 'string' as const },
            },
          },
        },
      };

      const source: Partial<ObjectSchema> = {
        title: 'Extended User Schema', // Ignored (First-Win)
        minProperties: 3,
        maxProperties: 8,
        required: ['email', 'active'],
        properties: {
          name: {
            type: 'string' as const,
            maxLength: 50,
          },
          email: {
            type: 'string' as const,
            format: 'email',
          },
          settings: {
            type: 'object' as const,
            properties: {
              notifications: { type: 'boolean' as const },
            },
          },
        },
      };

      const result = intersectObjectSchema(base, source);

      expect(result).toEqual({
        type: 'object',
        title: 'User Schema',
        minProperties: 3,
        maxProperties: 8,
        required: ['name', 'email', 'active'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            pattern: '^[A-Za-z]+$',
            allOf: [
              {
                type: 'string',
                maxLength: 50,
              },
            ],
          },
          email: {
            type: 'string',
            format: 'email',
          },
          settings: {
            type: 'object',
            properties: {
              theme: { type: 'string' },
            },
            allOf: [
              {
                type: 'object',
                properties: {
                  notifications: { type: 'boolean' },
                },
              },
            ],
          },
        },
      });
    });
  });
});

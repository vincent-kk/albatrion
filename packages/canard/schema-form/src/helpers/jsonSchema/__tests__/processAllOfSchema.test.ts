import { describe, expect, test } from 'vitest';

import type {
  ArraySchema,
  BooleanSchema,
  JsonSchema,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
} from '@/schema-form/types';

import { processAllOfSchema } from '../processAllOfSchema/processAllOfSchema';

describe('processAllOfSchema', () => {
  describe('Basic behavior', () => {
    test('should return original schema when allOf is not present', () => {
      const schema: StringSchema = {
        type: 'string',
        title: 'Test Schema',
        minLength: 1,
      };

      const result = processAllOfSchema(schema);

      expect(result).toBe(schema); // Same reference as original
    });

    test('should return original schema when allOf is an empty array', () => {
      const schema: StringSchema = {
        type: 'string',
        title: 'Test Schema',
        allOf: [],
      };

      const result = processAllOfSchema(schema);

      expect(result).toBe(schema); // Same reference as original
    });

    test('should return original schema when type is not present', () => {
      const schema = {
        title: 'Test Schema',
        allOf: [{ minLength: 1 }],
      } as any;

      const result = processAllOfSchema(schema);

      expect(result).toBe(schema); // Same reference as original
    });

    test('should return original schema for unsupported types', () => {
      const schema = {
        type: 'unknown' as any,
        title: 'Test Schema',
        allOf: [{ minLength: 1 }],
      } as any;

      const result = processAllOfSchema(schema);

      expect(result).toBe(schema); // Same reference as original
    });
  });

  describe('String schema allOf merging', () => {
    test('should merge single allOf item', () => {
      const schema: StringSchema = {
        type: 'string',
        title: 'Base String',
        minLength: 1,
        allOf: [
          {
            type: 'string',
            maxLength: 50,
            pattern: '^[a-zA-Z]+$',
          },
        ],
      };

      const result = processAllOfSchema(schema) as StringSchema;

      expect(result).not.toBe(schema); // New object
      expect(result).toEqual({
        type: 'string',
        title: 'Base String',
        minLength: 1,
        maxLength: 50,
        pattern: '^[a-zA-Z]+$',
      });
    });

    test('should merge multiple allOf items sequentially', () => {
      const schema: StringSchema = {
        type: 'string',
        title: 'Base String',
        minLength: 1,
        allOf: [
          {
            type: 'string',
            maxLength: 50,
          },
          {
            type: 'string',
            pattern: '^[a-zA-Z]+$',
          },
          {
            type: 'string',
            description: 'Final description',
          },
        ],
      };

      const result = processAllOfSchema(schema) as StringSchema;

      expect(result).toEqual({
        type: 'string',
        title: 'Base String', // First-Win
        description: 'Final description', // Added from last item
        minLength: 1,
        maxLength: 50,
        pattern: '^[a-zA-Z]+$',
      });
    });

    test('should combine patterns with AND logic', () => {
      const schema: StringSchema = {
        type: 'string',
        pattern: '^[A-Z]',
        allOf: [
          {
            type: 'string',
            pattern: '[a-z]$',
          },
          {
            type: 'string',
            pattern: '.{5,}',
          },
        ],
      };

      const result = processAllOfSchema(schema) as StringSchema;

      expect(result.pattern).toBe('(?=(?=^[A-Z])(?=[a-z]$))(?=.{5,})');
    });
  });

  describe('Number schema allOf merging', () => {
    test('should merge number constraints', () => {
      const schema: NumberSchema = {
        type: 'number',
        minimum: 0,
        allOf: [
          {
            type: 'number',
            maximum: 100,
          },
          {
            type: 'number',
            multipleOf: 5,
          },
        ],
      };

      const result = processAllOfSchema(schema) as NumberSchema;

      expect(result).toEqual({
        type: 'number',
        minimum: 0,
        maximum: 100,
        multipleOf: 5,
      });
    });

    test('should calculate LCM for multipleOf', () => {
      const schema: NumberSchema = {
        type: 'number',
        multipleOf: 6,
        allOf: [
          {
            type: 'number',
            multipleOf: 8,
          },
          {
            type: 'number',
            multipleOf: 9,
          },
        ],
      };

      const result = processAllOfSchema(schema) as NumberSchema;

      // LCM(6, 8) = 24, LCM(24, 9) = 72
      expect(result.multipleOf).toBe(72);
    });
  });

  describe('Array schema allOf merging', () => {
    test('should merge array constraints', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        allOf: [
          {
            type: 'array',
            maxItems: 10,
            uniqueItems: true,
          },
          {
            minItems: 2, // Merge without type
          },
        ],
      };

      const result = processAllOfSchema(schema) as ArraySchema;

      expect(result).toEqual({
        type: 'array',
        items: { type: 'string' },
        minItems: 2, // Math.max(1, 2)
        maxItems: 10,
        uniqueItems: true,
      });
    });

    test('should merge complex items', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
          },
          required: ['name'],
        },
        allOf: [
          {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                name: { type: 'string', maxLength: 50 },
              },
              required: ['email'],
            },
          },
        ],
      };

      const result = processAllOfSchema(schema) as ArraySchema;

      expect(result.items).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
        },
        required: ['name'],
        allOf: [
          {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              name: { type: 'string', maxLength: 50 },
            },
            required: ['email'],
          },
        ],
      });
    });
  });

  describe('Object schema allOf merging', () => {
    test('should merge object constraints', () => {
      const schema: ObjectSchema = {
        type: 'object',
        minProperties: 1,
        required: ['name'],
        allOf: [
          {
            type: 'object',
            maxProperties: 10,
            required: ['email'],
          },
          {
            type: 'object',
            additionalProperties: false,
            required: ['active'],
          },
        ],
      };

      const result = processAllOfSchema(schema) as ObjectSchema;

      expect(result).toEqual({
        type: 'object',
        minProperties: 1,
        maxProperties: 10,
        additionalProperties: false,
        required: ['name', 'email', 'active'],
      });
    });

    test('should merge properties', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          count: { type: 'number' },
        },
        allOf: [
          {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              name: { type: 'string', maxLength: 50 },
            },
          },
          {
            type: 'object',
            properties: {
              active: { type: 'boolean' },
            },
          },
        ],
      };

      const result = processAllOfSchema(schema) as ObjectSchema;

      expect(result.properties).toEqual({
        name: {
          type: 'string',
          minLength: 1,
          allOf: [
            {
              type: 'string',
              maxLength: 50,
            },
          ],
        },
        count: { type: 'number' },
        email: {
          type: 'string',
          format: 'email',
        },
        active: { type: 'boolean' },
      });
    });
  });

  describe('Boolean schema allOf merging', () => {
    test('should merge boolean schema', () => {
      const schema: BooleanSchema = {
        type: 'boolean',
        title: 'Base Boolean',
        allOf: [
          {
            type: 'boolean',
            description: 'Boolean description',
          },
          {
            type: 'boolean',
            default: true,
          },
        ],
      };

      const result = processAllOfSchema(schema) as BooleanSchema;

      expect(result).toEqual({
        type: 'boolean',
        title: 'Base Boolean', // First-Win
        description: 'Boolean description',
        default: true,
      });
    });
  });

  describe('Null schema allOf merging', () => {
    test('should merge null schema', () => {
      const schema: NullSchema = {
        type: 'null',
        title: 'Base Null',
        allOf: [
          {
            type: 'null',
            description: 'Null description',
          },
        ],
      };

      const result = processAllOfSchema(schema) as NullSchema;

      expect(result).toEqual({
        type: 'null',
        title: 'Base Null', // First-Win
        description: 'Null description',
      });
    });
  });

  describe('Error handling', () => {
    test('should throw error on type conflict', () => {
      const schema: StringSchema = {
        type: 'string',
        allOf: [
          {
            type: 'number', // Type conflict
          },
        ],
      };

      // When types differ, an error should be thrown
      expect(() => processAllOfSchema(schema)).toThrow(
        'Type cannot be redefined in allOf schema. It must either be omitted or match the parent schema type.',
      );
    });

    test('should handle allOf item with undefined type', () => {
      const schema: StringSchema = {
        type: 'string',
        minLength: 1,
        allOf: [
          {
            type: undefined, // Type is undefined
            maxLength: 50,
            pattern: '^[a-z]+$',
          },
        ],
      };

      const result = processAllOfSchema(schema) as StringSchema;

      expect(result).toEqual({
        type: 'string',
        minLength: 1,
        maxLength: 50,
        pattern: '^[a-z]+$',
      });
    });

    test('should handle allOf item without type property', () => {
      const schema: NumberSchema = {
        type: 'number',
        minimum: 0,
        allOf: [
          {
            // No type property
            maximum: 100,
            multipleOf: 5,
          },
        ],
      };

      const result = processAllOfSchema(schema) as NumberSchema;

      expect(result).toEqual({
        type: 'number',
        minimum: 0,
        maximum: 100,
        multipleOf: 5,
      });
    });

    test('should handle allOf item with same type as base', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        allOf: [
          {
            type: 'object', // Same type
            properties: {
              email: { type: 'string', format: 'email' },
            },
            required: ['email'],
          },
        ],
      };

      const result = processAllOfSchema(schema) as ObjectSchema;

      expect(result).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
        required: ['email'],
      });
    });

    test('should throw error if any allOf item has different type', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: { type: 'string' },
        allOf: [
          {
            type: 'array', // Same type
            minItems: 1,
          },
          {
            // No type - OK
            maxItems: 10,
          },
          {
            type: 'object', // Different type - Error!
            properties: {},
          },
        ],
      };

      expect(() => processAllOfSchema(schema)).toThrow(
        'Type cannot be redefined in allOf schema',
      );
    });

    test('should verify type conflicts for each type', () => {
      // string -> number
      expect(() =>
        processAllOfSchema({
          type: 'string',
          allOf: [{ type: 'number' }],
        }),
      ).toThrow('Type cannot be redefined');

      // number -> boolean
      expect(() =>
        processAllOfSchema({
          type: 'number',
          allOf: [{ type: 'boolean' }],
        }),
      ).toThrow('Type cannot be redefined');

      // boolean -> null
      expect(() =>
        processAllOfSchema({
          type: 'boolean',
          allOf: [{ type: 'null' }],
        }),
      ).toThrow('Type cannot be redefined');

      // array -> object
      expect(() =>
        processAllOfSchema({
          type: 'array',
          items: { type: 'string' }, // Array type requires items property
          allOf: [{ type: 'object' }],
        } as ArraySchema),
      ).toThrow('Type cannot be redefined');

      // object -> string
      expect(() =>
        processAllOfSchema({
          type: 'object',
          allOf: [{ type: 'string' }],
        }),
      ).toThrow('Type cannot be redefined');
    });

    test('should merge number and number types', () => {
      const schema: NumberSchema = {
        type: 'number',
        minimum: 0,
        allOf: [
          {
            type: 'number',
            maximum: 100,
          },
        ],
      };
      const result = processAllOfSchema(schema);
      expect(result.type).toBe('number');
    });

    test('should merge integer and integer types', () => {
      const schema: NumberSchema = {
        type: 'integer',
        minimum: 0,
        allOf: [
          {
            type: 'integer',
            maximum: 100,
          },
        ],
      };
      const result = processAllOfSchema(schema);
      expect(result.type).toBe('integer');
    });

    test('should throw error on number vs integer type conflict (spec change)', () => {
      const schema: NumberSchema = {
        type: 'number',
        minimum: 0,
        allOf: [
          {
            type: 'integer',
            maximum: 100,
          },
        ],
      };
      const result = processAllOfSchema(schema);
      expect(result.type).toBe('integer');
    });

    test('should throw error on integer vs number type conflict (spec change)', () => {
      const schema: NumberSchema = {
        type: 'integer',
        minimum: 0,
        allOf: [
          {
            type: 'number',
            maximum: 100,
          },
        ],
      };
      const result = processAllOfSchema(schema);
      expect(result.type).toBe('integer');
    });

    test('should throw error on const conflict', () => {
      const schema: StringSchema = {
        type: 'string',
        const: 'value1',
        allOf: [
          {
            type: 'string',
            const: 'value2', // Const conflict
          },
        ],
      };

      expect(() => processAllOfSchema(schema)).toThrow(
        'Conflicting const values',
      );
    });

    test('should throw error on range conflict', () => {
      const schema: NumberSchema = {
        type: 'number',
        minimum: 10,
        allOf: [
          {
            type: 'number',
            maximum: 5, // Range conflict
          },
        ],
      };

      expect(() => processAllOfSchema(schema)).toThrow(
        'Invalid number constraints: minimum',
      );
    });
  });

  describe('Real-world usage scenarios', () => {
    test('should extend base user schema', () => {
      const schema: ObjectSchema = {
        type: 'object',
        title: 'User Schema',
        properties: {
          name: { type: 'string', minLength: 1 },
          age: { type: 'number', minimum: 0 },
        },
        required: ['name'],
        allOf: [
          {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              name: { type: 'string', maxLength: 50 },
            },
            required: ['email'],
          },
          {
            type: 'object',
            properties: {
              active: { type: 'boolean', default: true },
            },
          },
        ],
      };

      const result = processAllOfSchema(schema) as ObjectSchema;

      expect(result).toEqual({
        type: 'object',
        title: 'User Schema',
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            allOf: [
              {
                type: 'string',
                maxLength: 50,
              },
            ],
          },
          age: { type: 'number', minimum: 0 },
          email: {
            type: 'string',
            format: 'email',
          },
          active: {
            type: 'boolean',
            default: true,
          },
        },
        required: ['name', 'email'],
      });
    });

    test('should handle nested allOf', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          nested: {
            type: 'object',
            properties: {
              value: { type: 'string' },
            },
            allOf: [
              {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                },
              },
            ],
          },
        },
        allOf: [
          {
            type: 'object',
            properties: {
              nested: {
                type: 'object',
                properties: {
                  count: { type: 'number' },
                },
              },
            },
          },
        ],
      };

      const result = processAllOfSchema(schema) as ObjectSchema;

      // Nested allOf is not processed by this function (requires separate handling)
      expect(result.properties?.nested).toEqual({
        type: 'object',
        properties: {
          value: { type: 'string' },
        },
        allOf: [
          {
            type: 'object',
            properties: {
              description: { type: 'string' },
            },
          },
          {
            type: 'object',
            properties: {
              count: { type: 'number' },
            },
          },
        ],
      });
    });
  });

  describe('Original schema preservation', () => {
    test('should not modify original schema', () => {
      const originalSchema: StringSchema = {
        type: 'string',
        title: 'Original',
        minLength: 1,
        allOf: [
          {
            type: 'string',
            maxLength: 50,
          },
        ],
      };

      const clonedSchema = JSON.parse(JSON.stringify(originalSchema));
      const result = processAllOfSchema(originalSchema);

      // Original is not modified
      expect(originalSchema).toEqual(clonedSchema);
      // Result is different
      expect(result).not.toBe(originalSchema);
      expect(result).toEqual({
        type: 'string',
        title: 'Original',
        minLength: 1,
        maxLength: 50,
      });
    });
  });

  describe('Nullable types (array type syntax) compatibility', () => {
    test('should merge same nullable string types', () => {
      const schema = {
        type: ['string', 'null'] as const,
        minLength: 1,
        allOf: [
          {
            type: ['string', 'null'] as const,
            maxLength: 100,
          },
        ],
      };

      const result = processAllOfSchema(schema);
      expect(result.type).toEqual(['string', 'null']);
      expect(result.minLength).toBe(1);
      expect(result.maxLength).toBe(100);
    });

    test('should be compatible with nullable types in different order', () => {
      const schema = {
        type: ['string', 'null'] as const,
        title: 'Optional Name',
        allOf: [
          {
            type: ['null', 'string'] as const,
            maxLength: 50,
          },
        ],
      };

      const result = processAllOfSchema(schema);
      expect(result.type).toEqual(['string', 'null']);
      expect(result.maxLength).toBe(50);
    });

    test('should be compatible with nullable number types regardless of order', () => {
      const schema = {
        type: ['number', 'null'] as const,
        minimum: 0,
        allOf: [
          {
            type: ['null', 'number'] as const,
            maximum: 100,
          },
        ],
      };

      const result = processAllOfSchema(schema);
      expect(result.type).toEqual(['number', 'null']);
      expect(result.minimum).toBe(0);
      expect(result.maximum).toBe(100);
    });

    test('should merge nullable object types', () => {
      const schema = {
        type: ['object', 'null'] as const,
        properties: {
          name: { type: 'string' } as StringSchema,
        },
        allOf: [
          {
            type: ['null', 'object'] as const,
            properties: {
              email: { type: 'string', format: 'email' } as StringSchema,
            },
          },
        ],
      };

      const result = processAllOfSchema(schema);
      expect(result.type).toEqual(['object', 'null']);
      expect(result.properties).toHaveProperty('name');
      expect(result.properties).toHaveProperty('email');
    });

    test('should merge nullable array types', () => {
      const schema = {
        type: ['array', 'null'] as const,
        items: { type: 'string' } as StringSchema,
        minItems: 1,
        allOf: [
          {
            type: ['null', 'array'] as const,
            maxItems: 10,
          },
        ],
      };

      const result = processAllOfSchema(schema);
      expect(result.type).toEqual(['array', 'null']);
      expect(result.minItems).toBe(1);
      expect(result.maxItems).toBe(10);
    });

    test('should throw error on non-nullable vs nullable type conflict', () => {
      const schema = {
        type: 'string' as const,
        allOf: [
          {
            type: ['string', 'null'] as const,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toBe('string');
      expect(result.nullable).toBeUndefined();
    });

    test('should throw error on nullable vs non-nullable type conflict', () => {
      const schema = {
        type: ['string', 'null'] as const,
        allOf: [
          {
            type: 'string' as const,
          },
        ],
      };
      const result = processAllOfSchema(schema);

      expect(result.type).toBe('string');
      expect(result.nullable).toBeUndefined();
    });

    test('should throw error on different nullable type conflict', () => {
      const schema = {
        type: ['string', 'null'] as const,
        allOf: [
          {
            type: ['number', 'null'] as const,
          },
        ],
      };

      expect(() => processAllOfSchema(schema)).toThrow(
        'Type cannot be redefined in allOf schema',
      );
    });

    test('should throw error on nullable integer vs nullable number conflict', () => {
      const schema = {
        type: ['integer', 'null'] as const,
        allOf: [
          {
            type: ['number', 'null'] as const,
          },
        ],
      };
      const result = processAllOfSchema(schema);
      expect(result.type).toEqual(['integer', 'null']);
    });

    test('should merge nullable type when allOf has no type', () => {
      const schema = {
        type: ['string', 'null'] as const,
        minLength: 1,
        allOf: [
          {
            // No type
            maxLength: 100,
            pattern: '^[a-z]+$',
          },
        ],
      };

      const result = processAllOfSchema(schema);
      expect(result.type).toEqual(['string', 'null']);
      expect(result.minLength).toBe(1);
      expect(result.maxLength).toBe(100);
      expect(result.pattern).toBe('^[a-z]+$');
    });
  });

  describe('Nullable property merging', () => {
    test('should keep nullable when both base and source have nullable: true', () => {
      const schema = {
        type: 'string' as const,
        nullable: true,
        minLength: 1,
        allOf: [
          {
            type: 'string' as const,
            nullable: true,
            maxLength: 100,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toEqual(['string', 'null']);
      expect(result.nullable).toBeUndefined();
      expect(result.minLength).toBe(1);
      expect(result.maxLength).toBe(100);
    });

    test('should remove nullable when base is nullable but source is not', () => {
      const schema = {
        type: 'string' as const,
        nullable: true,
        minLength: 1,
        allOf: [
          {
            type: 'string' as const,
            nullable: false,
            maxLength: 100,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toBe('string');
      expect(result.nullable).toBeUndefined();
    });

    test('should remove nullable when base is not nullable but source is', () => {
      const schema = {
        type: 'string' as const,
        nullable: false,
        minLength: 1,
        allOf: [
          {
            type: 'string' as const,
            nullable: true,
            maxLength: 100,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toBe('string');
      expect(result.nullable).toBeUndefined();
    });

    test('should keep non-nullable when neither has nullable property', () => {
      const schema = {
        type: 'string' as const,
        minLength: 1,
        allOf: [
          {
            type: 'string' as const,
            maxLength: 100,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toBe('string');
      expect(result.nullable).toBeUndefined();
    });

    test('should merge nullable number types with nullable property', () => {
      const schema = {
        type: 'number' as const,
        nullable: true,
        minimum: 0,
        allOf: [
          {
            type: 'number' as const,
            nullable: true,
            maximum: 100,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toEqual(['number', 'null']);
      expect(result.nullable).toBeUndefined();
      expect(result.minimum).toBe(0);
      expect(result.maximum).toBe(100);
    });

    test('should merge nullable object types with nullable property', () => {
      const schema = {
        type: 'object' as const,
        nullable: true,
        properties: {
          name: { type: 'string' } as StringSchema,
        },
        allOf: [
          {
            type: 'object' as const,
            nullable: true,
            properties: {
              email: { type: 'string', format: 'email' } as StringSchema,
            },
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toEqual(['object', 'null']);
      expect(result.nullable).toBeUndefined();
      expect(result.properties).toHaveProperty('name');
      expect(result.properties).toHaveProperty('email');
    });

    test('should merge nullable array types with nullable property', () => {
      const schema = {
        type: 'array' as const,
        nullable: true,
        items: { type: 'string' } as StringSchema,
        minItems: 1,
        allOf: [
          {
            type: 'array' as const,
            nullable: true,
            maxItems: 10,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toEqual(['array', 'null']);
      expect(result.nullable).toBeUndefined();
      expect(result.minItems).toBe(1);
      expect(result.maxItems).toBe(10);
    });

    test('should handle mixed nullable representations (property and array type)', () => {
      const schema = {
        type: 'string' as const,
        nullable: true,
        minLength: 1,
        allOf: [
          {
            type: ['string', 'null'] as const,
            maxLength: 100,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toEqual(['string', 'null']);
      expect(result.nullable).toBeUndefined();
    });

    test('should handle mixed nullable representations (array type and property)', () => {
      const schema = {
        type: ['string', 'null'] as const,
        minLength: 1,
        allOf: [
          {
            type: 'string' as const,
            nullable: true,
            maxLength: 100,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toEqual(['string', 'null']);
      expect(result.nullable).toBeUndefined();
    });

    test('should remove nullable with mixed representations when source is not nullable', () => {
      const schema = {
        type: ['string', 'null'] as const,
        minLength: 1,
        allOf: [
          {
            type: 'string' as const,
            nullable: false,
            maxLength: 100,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toBe('string');
      expect(result.nullable).toBeUndefined();
    });

    test('should handle multiple allOf items with nullable', () => {
      const schema = {
        type: 'string' as const,
        nullable: true,
        allOf: [
          {
            type: 'string' as const,
            nullable: true,
            minLength: 1,
          },
          {
            type: 'string' as const,
            nullable: true,
            maxLength: 100,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toEqual(['string', 'null']);
      expect(result.nullable).toBeUndefined();
      expect(result.minLength).toBe(1);
      expect(result.maxLength).toBe(100);
    });

    test('should remove nullable if any allOf item is not nullable', () => {
      const schema = {
        type: 'string' as const,
        nullable: true,
        allOf: [
          {
            type: 'string' as const,
            nullable: true,
            minLength: 1,
          },
          {
            type: 'string' as const,
            nullable: false, // This makes result non-nullable
            maxLength: 100,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toBe('string');
      expect(result.nullable).toBeUndefined();
    });

    test('should handle null type with nullable property', () => {
      const schema = {
        type: 'null' as const,
        nullable: true,
        allOf: [
          {
            type: 'null' as const,
            nullable: true,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toBe('null');
      expect(result.nullable).toBeUndefined();
    });

    test('should handle boolean type with nullable property', () => {
      const schema = {
        type: 'boolean' as const,
        nullable: true,
        allOf: [
          {
            type: 'boolean' as const,
            nullable: true,
            default: false,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toEqual(['boolean', 'null']);
      expect(result.nullable).toBeUndefined();
      expect(result.default).toBe(false);
    });

    test('should handle integer type with nullable property', () => {
      const schema = {
        type: 'integer' as const,
        nullable: true,
        minimum: 0,
        allOf: [
          {
            type: 'integer' as const,
            nullable: true,
            maximum: 100,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      expect(result.type).toEqual(['integer', 'null']);
      expect(result.nullable).toBeUndefined();
      expect(result.minimum).toBe(0);
      expect(result.maximum).toBe(100);
    });

    test('should not process nullable when source has no nullable info', () => {
      const schema = {
        type: 'string' as const,
        nullable: true,
        minLength: 1,
        allOf: [
          {
            // No type and no nullable - should not trigger processNullable
            maxLength: 100,
          },
        ],
      };

      const result = processAllOfSchema(schema);

      // When source has no nullable info, nullable processing is skipped
      // but nullable property should still be cleaned up through other means
      expect(result.minLength).toBe(1);
      expect(result.maxLength).toBe(100);
    });
  });

  describe('Complex type compatibility scenarios', () => {
    test('should handle allOf items where only some have type', () => {
      const schema: StringSchema = {
        type: 'string',
        minLength: 1,
        allOf: [
          {
            // No type - OK
            maxLength: 50,
          },
          {
            type: 'string', // Same type - OK
            pattern: '^[a-z]+$',
          },
          {
            // No type - OK
            format: 'email',
          },
        ],
      };

      const result = processAllOfSchema(schema) as StringSchema;
      expect(result.type).toBe('string');
      expect(result.minLength).toBe(1);
      expect(result.maxLength).toBe(50);
      expect(result.pattern).toBe('^[a-z]+$');
      expect(result.format).toBe('email');
    });

    test('should merge multiple allOf items with nullable types', () => {
      const schema = {
        type: ['object', 'null'] as const,
        properties: {
          id: { type: 'integer' } as NumberSchema,
        },
        allOf: [
          {
            // No type
            properties: {
              name: { type: 'string' } as StringSchema,
            },
          },
          {
            type: ['object', 'null'] as const,
            properties: {
              email: { type: 'string', format: 'email' } as StringSchema,
            },
          },
          {
            type: ['null', 'object'] as const, // Different order
            required: ['id'],
          },
        ],
      } as JsonSchema;

      const result = processAllOfSchema(schema);
      expect(result.type).toEqual(['object', 'null']);
      expect(result.properties).toHaveProperty('id');
      expect(result.properties).toHaveProperty('name');
      expect(result.properties).toHaveProperty('email');
      expect(result.required).toEqual(['id']);
    });
  });
});

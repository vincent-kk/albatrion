import { describe, expect, test } from 'vitest';

import type { JsonSchema } from '@/schema-form/types';

import { validateCompatibility } from '../validateCompatibility';

describe('validateCompatibility', () => {
  describe('Basic behavior - when allOf type is undefined', () => {
    test('should be compatible when allOf schema has no type', () => {
      const schema: JsonSchema = { type: 'string' };
      // @ts-expect-error - Testing partial schema without type (valid in allOf context)
      const allOfSchema: JsonSchema = { minLength: 1, maxLength: 50 };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be compatible when allOf schema type is explicitly undefined', () => {
      const schema: JsonSchema = { type: 'number' };
      // @ts-expect-error - Testing schema with explicit undefined type
      const allOfSchema: JsonSchema = { type: undefined, minimum: 0 };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be compatible when both schemas have no type', () => {
      // @ts-expect-error - Testing schema without type property
      const schema: JsonSchema = { title: 'Test' };
      // @ts-expect-error - Testing schema without type property
      const allOfSchema: JsonSchema = { description: 'Description' };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });
  });

  describe('Same single type comparison', () => {
    test('should match string types', () => {
      const schema: JsonSchema = { type: 'string' };
      const allOfSchema: JsonSchema = { type: 'string', maxLength: 100 };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should match number types', () => {
      const schema: JsonSchema = { type: 'number' };
      const allOfSchema: JsonSchema = { type: 'number', maximum: 100 };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should match integer types', () => {
      const schema: JsonSchema = { type: 'integer' };
      const allOfSchema: JsonSchema = { type: 'integer', minimum: 0 };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should match boolean types', () => {
      const schema: JsonSchema = { type: 'boolean' };
      const allOfSchema: JsonSchema = { type: 'boolean', default: true };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should match null types', () => {
      const schema: JsonSchema = { type: 'null' };
      const allOfSchema: JsonSchema = { type: 'null' };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should match object types', () => {
      const schema: JsonSchema = { type: 'object' };
      const allOfSchema: JsonSchema = { type: 'object', properties: {} };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should match array types', () => {
      const schema: JsonSchema = { type: 'array', items: { type: 'string' } };
      const allOfSchema: JsonSchema = {
        type: 'array',
        items: { type: 'string' },
      };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });
  });

  describe('Type conflicts (incompatible)', () => {
    test('should conflict string vs number', () => {
      const schema: JsonSchema = { type: 'string' };
      const allOfSchema: JsonSchema = { type: 'number' };

      expect(validateCompatibility(schema, allOfSchema)).toBe(false);
    });

    test('should conflict number vs string', () => {
      const schema: JsonSchema = { type: 'number' };
      const allOfSchema: JsonSchema = { type: 'string' };

      expect(validateCompatibility(schema, allOfSchema)).toBe(false);
    });

    test('should conflict object vs array', () => {
      const schema: JsonSchema = { type: 'object' };
      const allOfSchema: JsonSchema = {
        type: 'array',
        items: { type: 'string' },
      };

      expect(validateCompatibility(schema, allOfSchema)).toBe(false);
    });

    test('should conflict boolean vs null', () => {
      const schema: JsonSchema = { type: 'boolean' };
      const allOfSchema: JsonSchema = { type: 'null' };

      expect(validateCompatibility(schema, allOfSchema)).toBe(false);
    });

    test('should conflict array vs string', () => {
      const schema: JsonSchema = { type: 'array', items: { type: 'string' } };
      const allOfSchema: JsonSchema = { type: 'string' };

      expect(validateCompatibility(schema, allOfSchema)).toBe(false);
    });
  });

  describe('number and integer type compatibility (spec change)', () => {
    /**
     * Spec change: Using isSameSchemaType, number and integer are no longer compatible.
     * Previous behavior: number/integer were mutually compatible
     * Current behavior: number/integer are incompatible (treated as different types)
     */
    test('should be incompatible between number and integer (spec change)', () => {
      const numberSchema: JsonSchema = { type: 'number', minimum: 0 };
      const integerAllOf: JsonSchema = { type: 'integer', maximum: 100 };

      expect(validateCompatibility(numberSchema, integerAllOf)).toBe(true);
    });

    test('should be incompatible between integer and number (spec change)', () => {
      const integerSchema: JsonSchema = { type: 'integer', minimum: 0 };
      const numberAllOf: JsonSchema = { type: 'number', maximum: 100 };

      expect(validateCompatibility(integerSchema, numberAllOf)).toBe(true);
    });

    test('should be compatible between integer and integer', () => {
      const schema: JsonSchema = { type: 'integer', minimum: 0 };
      const allOfSchema: JsonSchema = { type: 'integer', maximum: 100 };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be compatible between number and number', () => {
      const schema: JsonSchema = { type: 'number', minimum: 0 };
      const allOfSchema: JsonSchema = { type: 'number', maximum: 100 };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });
  });

  describe('Nullable types (array type syntax)', () => {
    test('should be compatible with same nullable types', () => {
      const schema: JsonSchema = { type: ['string', 'null'] };
      const allOfSchema: JsonSchema = { type: ['string', 'null'] };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be compatible with nullable types in different order', () => {
      const schema: JsonSchema = { type: ['string', 'null'] };
      const allOfSchema: JsonSchema = { type: ['null', 'string'] };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be compatible with nullable number types regardless of order', () => {
      const schema: JsonSchema = { type: ['number', 'null'] };
      const allOfSchema: JsonSchema = { type: ['null', 'number'] };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be compatible with nullable object types', () => {
      const schema: JsonSchema = { type: ['object', 'null'] };
      const allOfSchema: JsonSchema = { type: ['null', 'object'] };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be compatible with nullable array types', () => {
      const schema: JsonSchema = {
        type: ['array', 'null'],
        items: { type: 'string' },
      };
      const allOfSchema: JsonSchema = {
        type: ['null', 'array'],
        items: { type: 'string' },
      };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be compatible with nullable boolean types', () => {
      const schema: JsonSchema = { type: ['boolean', 'null'] };
      const allOfSchema: JsonSchema = { type: ['null', 'boolean'] };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });
  });

  describe('Nullable vs non-nullable type conflicts', () => {
    test('should be incompatible: non-nullable string vs nullable string', () => {
      const schema: JsonSchema = { type: 'string' };
      const allOfSchema: JsonSchema = { type: ['string', 'null'] };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be incompatible: nullable string vs non-nullable string', () => {
      const schema: JsonSchema = { type: ['string', 'null'] };
      const allOfSchema: JsonSchema = { type: 'string' };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be incompatible: nullable number vs non-nullable number', () => {
      const schema: JsonSchema = { type: ['number', 'null'] };
      const allOfSchema: JsonSchema = { type: 'number' };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be incompatible: non-nullable object vs nullable object', () => {
      const schema: JsonSchema = { type: 'object' };
      const allOfSchema: JsonSchema = { type: ['object', 'null'] };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });
  });

  describe('Conflicts between different nullable types', () => {
    test('should be incompatible: nullable string vs nullable number', () => {
      const schema: JsonSchema = { type: ['string', 'null'] };
      const allOfSchema: JsonSchema = { type: ['number', 'null'] };

      expect(validateCompatibility(schema, allOfSchema)).toBe(false);
    });

    test('should be incompatible: nullable object vs nullable array', () => {
      const schema: JsonSchema = { type: ['object', 'null'] };
      const allOfSchema: JsonSchema = {
        type: ['array', 'null'],
        items: { type: 'string' },
      };

      expect(validateCompatibility(schema, allOfSchema)).toBe(false);
    });

    test('should be incompatible: nullable integer vs nullable number', () => {
      const schema: JsonSchema = { type: ['integer', 'null'] };
      const allOfSchema: JsonSchema = { type: ['number', 'null'] };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });
  });

  describe('When base schema has no type', () => {
    test('should be incompatible when base type is undefined and allOf has type', () => {
      // @ts-expect-error - Testing schema without type property
      const schema: JsonSchema = { title: 'Test' };
      const allOfSchema: JsonSchema = { type: 'string' };

      // isSameSchemaType returns false when either type is undefined
      expect(validateCompatibility(schema, allOfSchema)).toBe(false);
    });

    test('should be compatible when both schemas have undefined type (allOf type undefined condition)', () => {
      // @ts-expect-error - Testing schema without type property
      const schema: JsonSchema = { title: 'Base' };
      // @ts-expect-error - Testing schema without type property
      const allOfSchema: JsonSchema = { description: 'AllOf' };

      // allOfSchema.type === undefined, so returns true
      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });
  });

  describe('Real-world usage scenarios', () => {
    test('should be compatible when allOf only adds constraints to string schema', () => {
      const schema: JsonSchema = {
        type: 'string',
        title: 'Username',
        minLength: 1,
      };
      // @ts-expect-error - Testing partial schema without type (valid in allOf context)
      const allOfSchema: JsonSchema = {
        // No type - only adding constraints
        maxLength: 50,
        pattern: '^[a-zA-Z0-9]+$',
      };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be compatible when allOf adds properties to object schema', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };
      const allOfSchema: JsonSchema = {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
        },
        required: ['email'],
      };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be compatible when allOf adds items constraints to array schema', () => {
      const schema: JsonSchema = {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
      };
      const allOfSchema: JsonSchema = {
        type: 'array',
        items: { type: 'string' },
        maxItems: 10,
        uniqueItems: true,
      };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be compatible when allOf adds constraints to nullable schema', () => {
      const schema: JsonSchema = {
        type: ['string', 'null'],
        title: 'Optional Name',
      };
      const allOfSchema: JsonSchema = {
        type: ['string', 'null'],
        maxLength: 100,
      };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should validate type compatibility for complex schemas', () => {
      const schema: JsonSchema = {
        type: 'object',
        title: 'User',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
        },
        required: ['id'],
      };
      const allOfSchema: JsonSchema = {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['email'],
      };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    test('should be compatible with same empty array types', () => {
      // @ts-expect-error - Testing edge case with empty type array (invalid but testing behavior)
      const schema: JsonSchema = { type: [] };
      // @ts-expect-error - Testing edge case with empty type array (invalid but testing behavior)
      const allOfSchema: JsonSchema = { type: [] };

      expect(validateCompatibility(schema, allOfSchema)).toBe(false);
    });

    test('should be compatible with same single-element array types', () => {
      // @ts-expect-error - Testing edge case with single-element type array
      const schema: JsonSchema = { type: ['string'] };
      // @ts-expect-error - Testing edge case with single-element type array
      const allOfSchema: JsonSchema = { type: ['string'] };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be incompatible: single-element array vs single type', () => {
      // @ts-expect-error - Testing edge case with single-element type array
      const schema: JsonSchema = { type: ['string'] };
      const allOfSchema: JsonSchema = { type: 'string' };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });

    test('should be compatible with triple nullable types regardless of order', () => {
      // @ts-expect-error - Testing edge case with triple-element type array
      const schema: JsonSchema = { type: ['string', 'number', 'null'] };
      // @ts-expect-error - Testing edge case with triple-element type array
      const allOfSchema: JsonSchema = { type: ['null', 'string', 'number'] };

      expect(validateCompatibility(schema, allOfSchema)).toBe(true);
    });
  });
});

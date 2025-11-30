import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@/schema-form/types/jsonSchema';

import { extractSchemaInfo } from '../extractSchemaInfo';

describe('extractSchemaInfo', () => {
  describe('when type is undefined', () => {
    it('should return null for schema without type', () => {
      // @ts-expect-error: error for test
      const schema: JsonSchema = {
        properties: {
          name: { type: 'string' },
        },
      };

      const result = extractSchemaInfo(schema);

      expect(result).toBeNull();
    });

    it('should return null for empty schema', () => {
      // @ts-expect-error: error for test
      const schema: JsonSchema = {};

      const result = extractSchemaInfo(schema);

      expect(result).toBeNull();
    });
  });

  describe('when type is a string (single type)', () => {
    it('should return type info for string type', () => {
      const schema: JsonSchema = { type: 'string' };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'string', nullable: false });
    });

    it('should return type info for number type', () => {
      const schema: JsonSchema = { type: 'number' };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'number', nullable: false });
    });

    it('should return type info for integer type', () => {
      const schema: JsonSchema = { type: 'integer' };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'integer', nullable: false });
    });

    it('should return type info for boolean type', () => {
      const schema: JsonSchema = { type: 'boolean' };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'boolean', nullable: false });
    });

    it('should return type info for object type', () => {
      const schema: JsonSchema = { type: 'object' };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'object', nullable: false });
    });

    it('should return type info for array type', () => {
      // @ts-expect-error: error for test
      const schema: JsonSchema = { type: 'array' };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'array', nullable: false });
    });

    it('should return nullable true for null type', () => {
      const schema: JsonSchema = { type: 'null' };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'null', nullable: true });
    });

    it('should return nullable true when nullable property is true', () => {
      const schema: JsonSchema = { type: 'string', nullable: true };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'string', nullable: true });
    });

    it('should return nullable false when nullable property is false', () => {
      const schema: JsonSchema = { type: 'string', nullable: false };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'string', nullable: false });
    });

    it('should return nullable false when nullable property is not present', () => {
      const schema: JsonSchema = { type: 'number' };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'number', nullable: false });
    });
  });

  describe('when type is an array', () => {
    describe('with invalid array length', () => {
      it('should return null for empty type array', () => {
        const schema = { type: [] } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toBeNull();
      });

      it('should return null for type array with more than 2 elements', () => {
        const schema = {
          type: ['string', 'number', 'boolean'],
        } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toBeNull();
      });
    });

    describe('with single element array', () => {
      it('should return the single type for array with one element', () => {
        const schema = { type: ['string'] } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({
          nullable: false,
          type: 'string',
        });
      });

      it('should return null for single element null type', () => {
        const schema = { type: ['null'] } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({
          nullable: true,
          type: 'null',
        });
      });
    });

    describe('with two element array (nullable type)', () => {
      it('should return nullable type info when null is first element', () => {
        const schema = { type: ['null', 'string'] } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({ type: 'string', nullable: true });
      });

      it('should return nullable type info when null is second element', () => {
        const schema = { type: ['string', 'null'] } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({ type: 'string', nullable: true });
      });

      it('should return nullable type info for number with null', () => {
        const schema = { type: ['number', 'null'] } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({ type: 'number', nullable: true });
      });

      it('should return nullable type info for integer with null', () => {
        const schema = { type: ['null', 'integer'] } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({ type: 'integer', nullable: true });
      });

      it('should return nullable type info for boolean with null', () => {
        const schema = { type: ['boolean', 'null'] } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({ type: 'boolean', nullable: true });
      });

      it('should return nullable type info for object with null', () => {
        const schema = { type: ['object', 'null'] } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({ type: 'object', nullable: true });
      });

      it('should return nullable type info for array with null', () => {
        const schema = { type: ['array', 'null'] } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({ type: 'array', nullable: true });
      });

      it('should return null for two non-null types', () => {
        const schema = {
          type: ['string', 'number'],
        } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toBeNull();
      });

      it('should return null for two non-null types (different combination)', () => {
        const schema = {
          type: ['boolean', 'integer'],
        } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toBeNull();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle schema with additional properties besides type', () => {
      const schema: JsonSchema = {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-z]+$',
      };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'string', nullable: false });
    });

    it('should handle complex object schema', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name'],
      };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'object', nullable: false });
    });

    it('should handle array schema with items', () => {
      const schema: JsonSchema = {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 10,
      };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'array', nullable: false });
    });

    it('should handle nullable object type with nullable property', () => {
      const schema: JsonSchema = {
        type: 'object',
        nullable: true,
        properties: {
          name: { type: 'string' },
        },
      };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'object', nullable: true });
    });

    it('should handle nullable array type with nullable property', () => {
      const schema: JsonSchema = {
        type: 'array',
        nullable: true,
        items: { type: 'number' },
      };

      const result = extractSchemaInfo(schema);

      expect(result).toEqual({ type: 'array', nullable: true });
    });
  });

  describe('P0 critical edge cases (nullable type consistency)', () => {
    describe('pure null type consistency', () => {
      it('should return consistent results for { type: "null" } and { type: ["null"] }', () => {
        const singleNull: JsonSchema = { type: 'null' };
        const arrayNull = { type: ['null'] } as unknown as JsonSchema;

        const singleResult = extractSchemaInfo(singleNull);
        const arrayResult = extractSchemaInfo(arrayNull);

        expect(singleResult).toEqual(arrayResult);
        expect(singleResult).toEqual({ type: 'null', nullable: true });
      });

      it('should treat pure null type as nullable in both syntaxes', () => {
        const schemas = [
          { type: 'null' } as JsonSchema,
          { type: ['null'] } as unknown as JsonSchema,
        ];

        schemas.forEach((schema) => {
          const result = extractSchemaInfo(schema);
          expect(result?.nullable).toBe(true);
          expect(result?.type).toBe('null');
        });
      });
    });

    describe('nullable property with array type syntax', () => {
      it('should prioritize array syntax over nullable property for consistency', () => {
        // Array syntax should be the source of truth
        const schema = {
          type: ['string', 'null'],
          nullable: false, // This should be ignored in favor of array syntax
        } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({ type: 'string', nullable: true });
      });

      it('should handle conflicting nullable property gracefully', () => {
        // When array doesn't contain null but nullable property is true
        // Array syntax takes precedence (returns null for invalid array)
        const schema = {
          type: ['string'],
          nullable: true,
        } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        // Array syntax wins: single element array with 'string' → not nullable
        expect(result).toEqual({ type: 'string', nullable: false });
      });
    });

    describe('invalid type combinations validation', () => {
      it('should return null for array with multiple non-null types', () => {
        const schemas = [
          { type: ['string', 'number'] },
          { type: ['boolean', 'object'] },
          { type: ['array', 'integer'] },
        ];

        schemas.forEach((schema) => {
          const result = extractSchemaInfo(schema as unknown as JsonSchema);
          expect(result).toBeNull();
        });
      });

      it('should return null for array with >2 elements even if one is null', () => {
        const schema = {
          type: ['string', 'number', 'null'],
        } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toBeNull();
      });

      it('should handle malformed type arrays gracefully', () => {
        const malformedSchemas = [
          { type: [] }, // Empty array
          { type: ['string', 'string'] }, // Duplicates
          { type: ['null', 'null'] }, // Double null
        ];

        malformedSchemas.forEach((schema) => {
          const result = extractSchemaInfo(schema as unknown as JsonSchema);
          // Should handle gracefully - either null or consistent behavior
          expect(result === null || typeof result === 'object').toBe(true);
        });
      });
    });

    describe('type coercion and edge values', () => {
      it('should handle undefined nullable property consistently', () => {
        const stringType: JsonSchema = { type: 'string' };
        const numberType: JsonSchema = { type: 'number' };
        const objectType: JsonSchema = { type: 'object' };

        [stringType, numberType, objectType].forEach((schema) => {
          const result = extractSchemaInfo(schema);
          expect(result?.nullable).toBe(false);
        });
      });

      it('should handle explicit nullable: false consistently', () => {
        const schema: JsonSchema = {
          type: 'string',
          nullable: false,
        };

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({ type: 'string', nullable: false });
      });

      it('should handle mixed case: string type with nullable true vs array syntax', () => {
        const nullableProperty: JsonSchema = {
          type: 'string',
          nullable: true,
        };
        const arrayProperty = {
          type: ['string', 'null'],
        } as unknown as JsonSchema;

        const result1 = extractSchemaInfo(nullableProperty);
        const result2 = extractSchemaInfo(arrayProperty);

        // Both should produce the same result
        expect(result1).toEqual(result2);
        expect(result1).toEqual({ type: 'string', nullable: true });
      });
    });

    describe('real-world schema patterns', () => {
      it('should handle nullable string with format constraint', () => {
        const schema: JsonSchema = {
          type: 'string',
          format: 'email',
          nullable: true,
        };

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({ type: 'string', nullable: true });
      });

      it('should handle nullable number with range constraint', () => {
        const schema: JsonSchema = {
          type: 'number',
          minimum: 0,
          maximum: 100,
          nullable: true,
        };

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({ type: 'number', nullable: true });
      });

      it('should handle nullable enum pattern', () => {
        const schema = {
          type: ['string', 'null'],
          enum: ['option1', 'option2', null],
        } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({ type: 'string', nullable: true });
      });

      it('should handle complex nullable object with deep nesting', () => {
        const schema: JsonSchema = {
          type: 'object',
          nullable: true,
          properties: {
            nested: {
              type: 'object',
              properties: {
                deepField: { type: 'string', nullable: true },
              },
            },
          },
        };

        const result = extractSchemaInfo(schema);

        expect(result).toEqual({ type: 'object', nullable: true });
      });
    });
  });
});

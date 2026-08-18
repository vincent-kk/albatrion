import { describe, expect, test } from 'vitest';

import type { UnknownSchema } from '../../types/jsonSchema';
import {
  isNonNullableNumberSchema,
  isNullableNumberSchema,
  isNumberSchema,
} from '../isNumberSchema';
import {
  isNonNullableStringSchema,
  isNullableStringSchema,
  isStringSchema,
} from '../isStringSchema';
import { hasNullInType } from '../utils/hasNullInType';

describe('Schema Type Filters', () => {
  describe('hasNullInType', () => {
    test('should return true for nullable array syntax', () => {
      const schema: UnknownSchema = { type: ['string', 'null'] };
      expect(hasNullInType(schema)).toBe(true);
    });

    test('should return false for non-nullable array syntax', () => {
      const schema: UnknownSchema = { type: ['string'] };
      expect(hasNullInType(schema)).toBe(false);
    });

    test('should return false for single type', () => {
      const schema: UnknownSchema = { type: 'string' };
      expect(hasNullInType(schema)).toBe(false);
    });

    test('should return false for single null type (not nullable array)', () => {
      const schema: UnknownSchema = { type: 'null' };
      expect(hasNullInType(schema)).toBe(false);
    });

    test('should return true for null at different positions', () => {
      const schemas = [
        { type: ['null', 'string'] },
        { type: ['string', 'null'] },
        { type: ['number', 'null', 'string'] },
      ];

      schemas.forEach((schema) => {
        expect(hasNullInType(schema as UnknownSchema)).toBe(true);
      });
    });
  });

  describe('isStringSchema', () => {
    describe('non-nullable string schemas', () => {
      test('should return true for { type: "string" }', () => {
        const schema: UnknownSchema = { type: 'string' };
        expect(isNonNullableStringSchema(schema)).toBe(true);
        expect(isNullableStringSchema(schema)).toBe(false);
        expect(isStringSchema(schema)).toBe(true);
      });

      test('should handle string schema with constraints', () => {
        const schema: UnknownSchema = {
          type: 'string',
          minLength: 1,
          maxLength: 100,
          pattern: '^[a-z]+$',
        };

        expect(isNonNullableStringSchema(schema)).toBe(true);
        expect(isStringSchema(schema)).toBe(true);
      });

      test('should return false for other single types', () => {
        const schemas: UnknownSchema[] = [
          { type: 'number' },
          { type: 'boolean' },
          { type: 'object' },
          { type: 'array' },
          { type: 'null' },
        ];

        schemas.forEach((schema) => {
          expect(isNonNullableStringSchema(schema)).toBe(false);
          expect(isStringSchema(schema)).toBe(false);
        });
      });
    });

    describe('nullable string schemas', () => {
      test('should return true for { type: ["string", "null"] }', () => {
        const schema: UnknownSchema = { type: ['string', 'null'] };
        expect(isNullableStringSchema(schema)).toBe(true);
        expect(isNonNullableStringSchema(schema)).toBe(false);
        expect(isStringSchema(schema)).toBe(true);
      });

      test('should return true regardless of null position', () => {
        const schemas = [
          { type: ['string', 'null'] },
          { type: ['null', 'string'] },
        ];

        schemas.forEach((schema) => {
          expect(isNullableStringSchema(schema as UnknownSchema)).toBe(true);
          expect(isStringSchema(schema as UnknownSchema)).toBe(true);
        });
      });

      test('should handle nullable string with format constraint', () => {
        const schema: UnknownSchema = {
          type: ['string', 'null'],
          format: 'email',
        };

        expect(isNullableStringSchema(schema)).toBe(true);
        expect(isStringSchema(schema)).toBe(true);
      });

      test('should return false for other nullable types', () => {
        const schemas = [
          { type: ['number', 'null'] },
          { type: ['boolean', 'null'] },
          { type: ['object', 'null'] },
          { type: ['array', 'null'] },
        ];

        schemas.forEach((schema) => {
          expect(isNullableStringSchema(schema as UnknownSchema)).toBe(false);
          expect(isStringSchema(schema as UnknownSchema)).toBe(false);
        });
      });
    });

    describe('edge cases', () => {
      test('should return false for invalid array with multiple types', () => {
        const schema = {
          type: ['string', 'number', 'null'],
        } as unknown as UnknownSchema;

        expect(isNullableStringSchema(schema)).toBe(true); // Has string + null
        expect(isStringSchema(schema)).toBe(true);
      });

      test('should return false for non-nullable array syntax', () => {
        const schema = { type: ['string'] } as unknown as UnknownSchema;

        expect(isNullableStringSchema(schema)).toBe(false);
        expect(isNonNullableStringSchema(schema)).toBe(false);
        expect(isStringSchema(schema)).toBe(false);
      });

      test('should return false for pure null type', () => {
        const schemas = [{ type: 'null' }, { type: ['null'] }];

        schemas.forEach((schema) => {
          expect(isStringSchema(schema as UnknownSchema)).toBe(false);
        });
      });
    });
  });

  describe('isNumberSchema', () => {
    describe('non-nullable number schemas', () => {
      test('should return true for { type: "number" }', () => {
        const schema: UnknownSchema = { type: 'number' };
        expect(isNonNullableNumberSchema(schema)).toBe(true);
        expect(isNullableNumberSchema(schema)).toBe(false);
        expect(isNumberSchema(schema)).toBe(true);
      });

      test('should return true for { type: "integer" }', () => {
        const schema: UnknownSchema = { type: 'integer' };
        expect(isNonNullableNumberSchema(schema)).toBe(true);
        expect(isNullableNumberSchema(schema)).toBe(false);
        expect(isNumberSchema(schema)).toBe(true);
      });

      test('should handle number schema with constraints', () => {
        const schema: UnknownSchema = {
          type: 'number',
          minimum: 0,
          maximum: 100,
          multipleOf: 5,
        };

        expect(isNonNullableNumberSchema(schema)).toBe(true);
        expect(isNumberSchema(schema)).toBe(true);
      });

      test('should return false for other single types', () => {
        const schemas: UnknownSchema[] = [
          { type: 'string' },
          { type: 'boolean' },
          { type: 'object' },
          { type: 'array' },
          { type: 'null' },
        ];

        schemas.forEach((schema) => {
          expect(isNonNullableNumberSchema(schema)).toBe(false);
          expect(isNumberSchema(schema)).toBe(false);
        });
      });
    });

    describe('nullable number schemas', () => {
      test('should return true for { type: ["number", "null"] }', () => {
        const schema: UnknownSchema = { type: ['number', 'null'] };
        expect(isNullableNumberSchema(schema)).toBe(true);
        expect(isNonNullableNumberSchema(schema)).toBe(false);
        expect(isNumberSchema(schema)).toBe(true);
      });

      test('should return true for { type: ["integer", "null"] }', () => {
        const schema: UnknownSchema = { type: ['integer', 'null'] };
        expect(isNullableNumberSchema(schema)).toBe(true);
        expect(isNonNullableNumberSchema(schema)).toBe(false);
        expect(isNumberSchema(schema)).toBe(true);
      });

      test('should return true regardless of null position', () => {
        const schemas = [
          { type: ['number', 'null'] },
          { type: ['null', 'number'] },
          { type: ['integer', 'null'] },
          { type: ['null', 'integer'] },
        ];

        schemas.forEach((schema) => {
          expect(isNullableNumberSchema(schema as UnknownSchema)).toBe(true);
          expect(isNumberSchema(schema as UnknownSchema)).toBe(true);
        });
      });

      test('should handle nullable number with range constraints', () => {
        const schema: UnknownSchema = {
          type: ['number', 'null'],
          minimum: 0,
          maximum: 100,
        };

        expect(isNullableNumberSchema(schema)).toBe(true);
        expect(isNumberSchema(schema)).toBe(true);
      });

      test('should return false for other nullable types', () => {
        const schemas = [
          { type: ['string', 'null'] },
          { type: ['boolean', 'null'] },
          { type: ['object', 'null'] },
          { type: ['array', 'null'] },
        ];

        schemas.forEach((schema) => {
          expect(isNullableNumberSchema(schema as UnknownSchema)).toBe(false);
          expect(isNumberSchema(schema as UnknownSchema)).toBe(false);
        });
      });
    });

    describe('integer vs number edge cases', () => {
      test('should distinguish between integer and number in nullable contexts', () => {
        const integerSchema: UnknownSchema = { type: ['integer', 'null'] };
        const numberSchema: UnknownSchema = { type: ['number', 'null'] };

        // Both should be recognized as number schemas
        expect(isNullableNumberSchema(integerSchema)).toBe(true);
        expect(isNullableNumberSchema(numberSchema)).toBe(true);
        expect(isNumberSchema(integerSchema)).toBe(true);
        expect(isNumberSchema(numberSchema)).toBe(true);
      });

      test('should handle non-nullable integer vs number', () => {
        const integerSchema: UnknownSchema = { type: 'integer' };
        const numberSchema: UnknownSchema = { type: 'number' };

        expect(isNonNullableNumberSchema(integerSchema)).toBe(true);
        expect(isNonNullableNumberSchema(numberSchema)).toBe(true);
        expect(isNumberSchema(integerSchema)).toBe(true);
        expect(isNumberSchema(numberSchema)).toBe(true);
      });
    });

    describe('edge cases', () => {
      test('should return false for non-nullable array syntax', () => {
        const schemas = [{ type: ['number'] }, { type: ['integer'] }];

        schemas.forEach((schema) => {
          expect(isNullableNumberSchema(schema as UnknownSchema)).toBe(false);
          expect(isNonNullableNumberSchema(schema as UnknownSchema)).toBe(
            false,
          );
          expect(isNumberSchema(schema as UnknownSchema)).toBe(false);
        });
      });

      test('should return false for pure null type', () => {
        const schemas = [{ type: 'null' }, { type: ['null'] }];

        schemas.forEach((schema) => {
          expect(isNumberSchema(schema as UnknownSchema)).toBe(false);
        });
      });
    });
  });
});

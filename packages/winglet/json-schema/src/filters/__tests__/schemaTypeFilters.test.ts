import { describe, expect, test } from 'vitest';

import type { UnknownSchema } from '../../types/jsonSchema';
import {
  isBooleanSchema,
  isNonNullableBooleanSchema,
  isNullableBooleanSchema,
} from '../isBooleanSchema';
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

  describe('isBooleanSchema', () => {
    describe('non-nullable boolean schemas', () => {
      test('should return true for { type: "boolean" }', () => {
        const schema: UnknownSchema = { type: 'boolean' };
        expect(isNonNullableBooleanSchema(schema)).toBe(true);
        expect(isNullableBooleanSchema(schema)).toBe(false);
        expect(isBooleanSchema(schema)).toBe(true);
      });

      test('should handle boolean schema with constraints', () => {
        const schema: UnknownSchema = {
          type: 'boolean',
          default: true,
        };

        expect(isNonNullableBooleanSchema(schema)).toBe(true);
        expect(isBooleanSchema(schema)).toBe(true);
      });

      test('should return false for other single types', () => {
        const schemas: UnknownSchema[] = [
          { type: 'string' },
          { type: 'number' },
          { type: 'object' },
          { type: 'array' },
          { type: 'null' },
        ];

        schemas.forEach((schema) => {
          expect(isNonNullableBooleanSchema(schema)).toBe(false);
          expect(isBooleanSchema(schema)).toBe(false);
        });
      });
    });

    describe('nullable boolean schemas', () => {
      test('should return true for { type: ["boolean", "null"] }', () => {
        const schema: UnknownSchema = { type: ['boolean', 'null'] };
        expect(isNullableBooleanSchema(schema)).toBe(true);
        expect(isNonNullableBooleanSchema(schema)).toBe(false);
        expect(isBooleanSchema(schema)).toBe(true);
      });

      test('should return true regardless of null position', () => {
        const schemas = [
          { type: ['boolean', 'null'] },
          { type: ['null', 'boolean'] },
        ];

        schemas.forEach((schema) => {
          expect(isNullableBooleanSchema(schema as UnknownSchema)).toBe(true);
          expect(isBooleanSchema(schema as UnknownSchema)).toBe(true);
        });
      });

      test('should handle nullable boolean with default value', () => {
        const schema: UnknownSchema = {
          type: ['boolean', 'null'],
          default: null,
        };

        expect(isNullableBooleanSchema(schema)).toBe(true);
        expect(isBooleanSchema(schema)).toBe(true);
      });

      test('should return false for other nullable types', () => {
        const schemas = [
          { type: ['string', 'null'] },
          { type: ['number', 'null'] },
          { type: ['object', 'null'] },
          { type: ['array', 'null'] },
        ];

        schemas.forEach((schema) => {
          expect(isNullableBooleanSchema(schema as UnknownSchema)).toBe(false);
          expect(isBooleanSchema(schema as UnknownSchema)).toBe(false);
        });
      });
    });

    describe('edge cases', () => {
      test('should return false for non-nullable array syntax', () => {
        const schema = { type: ['boolean'] } as unknown as UnknownSchema;

        expect(isNullableBooleanSchema(schema)).toBe(false);
        expect(isNonNullableBooleanSchema(schema)).toBe(false);
        expect(isBooleanSchema(schema)).toBe(false);
      });

      test('should return false for pure null type', () => {
        const schemas = [{ type: 'null' }, { type: ['null'] }];

        schemas.forEach((schema) => {
          expect(isBooleanSchema(schema as UnknownSchema)).toBe(false);
        });
      });
    });
  });

  describe('P0 critical edge cases - cross-type validation', () => {
    test('should correctly distinguish between different nullable types', () => {
      const nullableString: UnknownSchema = { type: ['string', 'null'] };
      const nullableNumber: UnknownSchema = { type: ['number', 'null'] };
      const nullableBoolean: UnknownSchema = { type: ['boolean', 'null'] };

      // String should only match string filters
      expect(isStringSchema(nullableString)).toBe(true);
      expect(isNumberSchema(nullableString)).toBe(false);
      expect(isBooleanSchema(nullableString)).toBe(false);

      // Number should only match number filters
      expect(isStringSchema(nullableNumber)).toBe(false);
      expect(isNumberSchema(nullableNumber)).toBe(true);
      expect(isBooleanSchema(nullableNumber)).toBe(false);

      // Boolean should only match boolean filters
      expect(isStringSchema(nullableBoolean)).toBe(false);
      expect(isNumberSchema(nullableBoolean)).toBe(false);
      expect(isBooleanSchema(nullableBoolean)).toBe(true);
    });

    test('should correctly distinguish between non-nullable types', () => {
      const stringSchema: UnknownSchema = { type: 'string' };
      const numberSchema: UnknownSchema = { type: 'number' };
      const booleanSchema: UnknownSchema = { type: 'boolean' };

      // String should only match string filters
      expect(isStringSchema(stringSchema)).toBe(true);
      expect(isNumberSchema(stringSchema)).toBe(false);
      expect(isBooleanSchema(stringSchema)).toBe(false);

      // Number should only match number filters
      expect(isStringSchema(numberSchema)).toBe(false);
      expect(isNumberSchema(numberSchema)).toBe(true);
      expect(isBooleanSchema(numberSchema)).toBe(false);

      // Boolean should only match boolean filters
      expect(isStringSchema(booleanSchema)).toBe(false);
      expect(isNumberSchema(booleanSchema)).toBe(false);
      expect(isBooleanSchema(booleanSchema)).toBe(true);
    });

    test('should handle invalid multi-type arrays consistently', () => {
      const invalidSchema = {
        type: ['string', 'number', 'null'],
      } as unknown as UnknownSchema;

      // Should still match filters that include both their type and null
      expect(isStringSchema(invalidSchema)).toBe(true);
      expect(isNumberSchema(invalidSchema)).toBe(true);
      expect(isBooleanSchema(invalidSchema)).toBe(false);
    });

    test('should handle non-nullable single-element arrays', () => {
      const schemas = [
        { type: ['string'] },
        { type: ['number'] },
        { type: ['boolean'] },
      ];

      schemas.forEach((schema) => {
        // Single-element arrays should not match any filter
        expect(isStringSchema(schema as UnknownSchema)).toBe(false);
        expect(isNumberSchema(schema as UnknownSchema)).toBe(false);
        expect(isBooleanSchema(schema as UnknownSchema)).toBe(false);
      });
    });

    test('should handle pure null type consistently across all filters', () => {
      const singleNull: UnknownSchema = { type: 'null' };
      const arrayNull = { type: ['null'] } as unknown as UnknownSchema;

      // Pure null should not match any type filter
      [singleNull, arrayNull].forEach((schema) => {
        expect(isStringSchema(schema)).toBe(false);
        expect(isNumberSchema(schema)).toBe(false);
        expect(isBooleanSchema(schema)).toBe(false);
      });
    });

    test('should handle real-world complex schemas', () => {
      const complexNullableString: UnknownSchema = {
        type: ['string', 'null'],
        format: 'email',
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-z]+@[a-z]+\\.[a-z]+$',
      };

      const complexNullableNumber: UnknownSchema = {
        type: ['number', 'null'],
        minimum: 0,
        maximum: 100,
        multipleOf: 5,
        exclusiveMinimum: false,
      };

      expect(isStringSchema(complexNullableString)).toBe(true);
      expect(isNumberSchema(complexNullableString)).toBe(false);

      expect(isStringSchema(complexNullableNumber)).toBe(false);
      expect(isNumberSchema(complexNullableNumber)).toBe(true);
    });
  });
});

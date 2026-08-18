import { describe, expect, test } from 'vitest';

import type { UnknownSchema } from '../../types/jsonSchema';
import { isBooleanSchema } from '../isBooleanSchema';
import { isNumberSchema } from '../isNumberSchema';
import { isStringSchema } from '../isStringSchema';

describe('Schema Type Filters', () => {
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

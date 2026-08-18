import { describe, expect, test } from 'vitest';

import type { UnknownSchema } from '../../types/jsonSchema';
import {
  isBooleanSchema,
  isNonNullableBooleanSchema,
  isNullableBooleanSchema,
} from '../isBooleanSchema';

describe('Schema Type Filters', () => {
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
});

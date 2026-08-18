import { describe, expect, test } from 'vitest';

import type { UnknownSchema } from '../../types/jsonSchema';
import { isIdenticalSchemaType } from '../isIdenticalSchemaType';

describe('isIdenticalSchemaType', () => {
  describe('array type with null vs nullable property comparison', () => {
    test('should compare type array with null vs nullable:true for string', () => {
      const arrayWithNull: UnknownSchema = { type: ['string', 'null'] };
      const nullableProperty: UnknownSchema = {
        type: 'string',
        nullable: true,
      };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(true);
    });

    test('should compare type array with null vs nullable:true for number', () => {
      const arrayWithNull: UnknownSchema = { type: ['number', 'null'] };
      const nullableProperty: UnknownSchema = {
        type: 'number',
        nullable: true,
      };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(true);
    });

    test('should compare type array with null vs nullable:true for object', () => {
      const arrayWithNull: UnknownSchema = { type: ['object', 'null'] };
      const nullableProperty: UnknownSchema = {
        type: 'object',
        nullable: true,
      };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(true);
    });

    test('should compare type array with null vs nullable:true for array', () => {
      const arrayWithNull: UnknownSchema = { type: ['array', 'null'] };
      const nullableProperty: UnknownSchema = { type: 'array', nullable: true };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(true);
    });

    test('should compare type array with null vs nullable:true for boolean', () => {
      const arrayWithNull: UnknownSchema = { type: ['boolean', 'null'] };
      const nullableProperty: UnknownSchema = {
        type: 'boolean',
        nullable: true,
      };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(true);
    });

    test('should compare type array with null vs nullable:true for integer', () => {
      const arrayWithNull: UnknownSchema = { type: ['integer', 'null'] };
      const nullableProperty: UnknownSchema = {
        type: 'integer',
        nullable: true,
      };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(true);
    });

    test('should compare reversed order: nullable:true vs type array with null', () => {
      const nullableProperty: UnknownSchema = {
        type: 'string',
        nullable: true,
      };
      const arrayWithNull: UnknownSchema = { type: ['string', 'null'] };
      expect(isIdenticalSchemaType(nullableProperty, arrayWithNull)).toBe(true);
    });

    test('should compare nullable:true with type array where null is first', () => {
      const nullableProperty: UnknownSchema = {
        type: 'string',
        nullable: true,
      };
      const arrayWithNull: UnknownSchema = { type: ['null', 'string'] };
      expect(isIdenticalSchemaType(nullableProperty, arrayWithNull)).toBe(true);
    });

    test('should return false when type array has null but types differ', () => {
      const arrayWithNull: UnknownSchema = { type: ['string', 'null'] };
      const nullableProperty: UnknownSchema = {
        type: 'number',
        nullable: true,
      };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(
        false,
      );
    });

    test('should return false when one is nullable and other is not', () => {
      const arrayWithNull: UnknownSchema = { type: ['string', 'null'] };
      const nonNullable: UnknownSchema = { type: 'string', nullable: false };
      expect(isIdenticalSchemaType(arrayWithNull, nonNullable)).toBe(false);
    });

    test('should return false when type array has null but nullable:false explicitly', () => {
      const arrayWithNull: UnknownSchema = { type: ['string', 'null'] };
      const nullableFalse: UnknownSchema = { type: 'string' }; // nullable not specified = not nullable
      expect(isIdenticalSchemaType(arrayWithNull, nullableFalse)).toBe(false);
    });

    test('should handle nullable:true with complex schema properties', () => {
      const arrayWithNull: UnknownSchema = {
        type: ['string', 'null'],
        minLength: 1,
        maxLength: 100,
      };
      const nullableProperty: UnknownSchema = {
        type: 'string',
        nullable: true,
        format: 'email',
      };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(true);
    });
  });
});

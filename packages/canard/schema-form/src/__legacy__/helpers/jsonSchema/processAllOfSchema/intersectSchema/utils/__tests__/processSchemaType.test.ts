import { describe, expect, test } from 'vitest';

import type {
  NullSchema,
  NumberSchema,
  StringSchema,
} from '@/schema-form/types';

import { processSchemaType } from '../processSchemaType';

describe('processSchemaType', () => {
  describe('early return cases', () => {
    test('returns early when base has no type', () => {
      const base = {} as StringSchema;
      const source: Partial<StringSchema> = { nullable: true };

      processSchemaType(base, source);

      expect(base.type).toBeUndefined();
    });

    test('returns early when base type is an empty array', () => {
      const base = { type: [] as unknown } as StringSchema;
      const source: Partial<StringSchema> = { nullable: true };

      processSchemaType(base, source);

      expect(base.type).toEqual([]);
    });

    test('returns early when base type array has more than 2 elements', () => {
      const base = {
        type: ['string', 'number', 'null'] as unknown,
      } as StringSchema;
      const source: Partial<StringSchema> = { nullable: true };

      processSchemaType(base, source);

      expect(base.type).toEqual(['string', 'number', 'null']);
    });
  });

  describe('base.nullable cleanup', () => {
    test('removes nullable property from base when it exists', () => {
      const base: StringSchema = { type: 'string', nullable: true };
      const source: Partial<StringSchema> = {};

      processSchemaType(base, source);

      expect(base.nullable).toBeUndefined();
      expect(base.type).toEqual(['string', 'null']);
    });

    test('does not add nullable property when base does not have it', () => {
      const base: StringSchema = { type: 'string' };
      const source: Partial<StringSchema> = {};

      processSchemaType(base, source);

      expect('nullable' in base && base.nullable !== undefined).toBe(false);
    });
  });

  describe('both base and source are nullable', () => {
    test('sets type to array [type, null] when both are nullable via nullable property', () => {
      const base: StringSchema = { type: 'string', nullable: true };
      const source: Partial<StringSchema> = { nullable: true };

      processSchemaType(base, source);

      expect(base.type).toEqual(['string', 'null']);
      expect(base.nullable).toBeUndefined();
    });

    test('sets type to array [type, null] when base is nullable via type array', () => {
      const base = { type: ['string', 'null'] as const } as StringSchema;
      const source: Partial<StringSchema> = { nullable: true };

      processSchemaType(base, source);

      expect(base.type).toEqual(['string', 'null']);
    });

    test('sets type to array [type, null] when source is nullable via type array', () => {
      const base = {
        type: 'string',
        nullable: true,
      } as StringSchema;
      const source = { type: ['string', 'null'] as const };

      processSchemaType(base, source);

      expect(base.type).toEqual(['string', 'null']);
    });

    test('sets type to array [type, null] when both are nullable via type array', () => {
      const base = { type: ['number', 'null'] as const } as NumberSchema;
      const source = { type: ['number', 'null'] as const };

      processSchemaType(base, source);

      expect(base.type).toEqual(['number', 'null']);
    });

    test('keeps type as null when base type is null', () => {
      const base = { type: 'null' as const } as NullSchema;
      const source = { nullable: true };

      processSchemaType(base, source);

      expect(base.type).toBe('null');
    });

    test('handles number type correctly', () => {
      const base: NumberSchema = { type: 'number', nullable: true };
      const source: Partial<NumberSchema> = { nullable: true };

      processSchemaType(base, source);

      expect(base.type).toEqual(['number', 'null']);
    });
  });

  describe('only base is nullable', () => {
    test('sets type to non-nullable when source is not nullable', () => {
      const base: StringSchema = { type: 'string', nullable: true };
      const source: Partial<StringSchema> = { nullable: false };

      processSchemaType(base, source);

      expect(base.type).toBe('string');
      expect(base.nullable).toBeUndefined();
    });

    test('sets type to non-nullable when source has no nullable property', () => {
      const base: StringSchema = { type: 'string', nullable: true };
      const source: Partial<StringSchema> = {};

      processSchemaType(base, source);

      expect(base.type).toEqual(['string', 'null']);
      expect(base.nullable).toBeUndefined();
    });

    test('sets type to non-nullable when base type is array [type, null]', () => {
      const base = { type: ['string', 'null'] as const } as StringSchema;
      const source: Partial<StringSchema> = {};

      processSchemaType(base, source);

      expect(base.type).toEqual(['string', 'null']);
    });
  });

  describe('only source is nullable', () => {
    test('sets type to non-nullable when base is not nullable', () => {
      const base: StringSchema = { type: 'string' };
      const source: Partial<StringSchema> = { nullable: true };

      processSchemaType(base, source);

      expect(base.type).toBe('string');
    });

    test('sets type to non-nullable when base has nullable: false', () => {
      const base: StringSchema = { type: 'string', nullable: false };
      const source: Partial<StringSchema> = { nullable: true };

      processSchemaType(base, source);

      expect(base.type).toBe('string');
      expect(base.nullable).toBeUndefined();
    });
  });

  describe('neither base nor source is nullable', () => {
    test('keeps type as is when both are not nullable', () => {
      const base: StringSchema = { type: 'string' };
      const source: Partial<StringSchema> = {};

      processSchemaType(base, source);

      expect(base.type).toBe('string');
    });

    test('keeps type as is when both have nullable: false', () => {
      const base: StringSchema = { type: 'string', nullable: false };
      const source: Partial<StringSchema> = { nullable: false };

      processSchemaType(base, source);

      expect(base.type).toBe('string');
      expect(base.nullable).toBeUndefined();
    });
  });

  describe('type array edge cases', () => {
    test('handles base with single element type array', () => {
      const base = { type: ['string'] as unknown as 'string' } as StringSchema;
      const source: Partial<StringSchema> = { nullable: true };

      processSchemaType(base, source);

      // Single element array is not nullable, so type should be 'string'
      expect(base.type).toBe('string');
    });

    test('handles base with type array where null is first', () => {
      const base = { type: ['null', 'string'] as const } as StringSchema;
      const source: Partial<StringSchema> = { nullable: true };

      processSchemaType(base, source);

      expect(base.type).toEqual(['string', 'null']);
    });

    test('handles source with extractSchemaInfo not returning nullable but source.nullable is true', () => {
      const base: StringSchema = { type: 'string', nullable: true };
      const source = {
        type: 'string',
        nullable: true,
      } as Partial<StringSchema>;

      processSchemaType(base, source);

      expect(base.type).toEqual(['string', 'null']);
    });
  });

  describe('numeric type intersection', () => {
    test('intersects number and integer to integer', () => {
      const base: NumberSchema = { type: 'number' };
      const source: Partial<NumberSchema> = { type: 'integer' };

      processSchemaType(base, source);

      expect(base.type).toBe('integer');
    });

    test('keeps number when source has no type', () => {
      const base: NumberSchema = { type: 'number' };
      const source: Partial<NumberSchema> = {};

      processSchemaType(base, source);

      expect(base.type).toBe('number');
    });

    test('keeps number when source is also number', () => {
      const base: NumberSchema = { type: 'number' };
      const source: Partial<NumberSchema> = { type: 'number' };

      processSchemaType(base, source);

      expect(base.type).toBe('number');
    });

    test('keeps integer when base is integer and source is number', () => {
      const base = { type: 'integer' } as NumberSchema;
      const source: Partial<NumberSchema> = { type: 'number' };

      processSchemaType(base, source);

      expect(base.type).toBe('integer');
    });

    test('keeps integer when both are integer', () => {
      const base = { type: 'integer' } as NumberSchema;
      const source: Partial<NumberSchema> = { type: 'integer' };

      processSchemaType(base, source);

      expect(base.type).toBe('integer');
    });

    test('keeps string type unchanged when source has different type', () => {
      const base: StringSchema = { type: 'string' };
      const source = { type: 'number' } as Partial<NumberSchema>;

      processSchemaType(base, source as Partial<StringSchema>);

      expect(base.type).toBe('string');
    });
  });

  describe('numeric type intersection with nullable', () => {
    test('intersects number and integer to integer while preserving nullable', () => {
      const base = { type: 'number', nullable: true } as NumberSchema;
      const source = {
        type: 'integer',
        nullable: true,
      } as Partial<NumberSchema>;

      processSchemaType(base, source);

      expect(base.type).toEqual(['integer', 'null']);
      expect(base.nullable).toBeUndefined();
    });

    test('intersects nullable number array and non-nullable integer to non-nullable integer', () => {
      // source type: 'integer' (without 'null') means source is non-nullable
      // intersection of nullable and non-nullable = non-nullable
      const base = { type: ['number', 'null'] as const } as NumberSchema;
      const source = { type: 'integer' } as Partial<NumberSchema>;

      processSchemaType(base, source);

      expect(base.type).toBe('integer');
    });

    test('intersects nullable number array and nullable integer to nullable integer array', () => {
      const base = { type: ['number', 'null'] as const } as NumberSchema;
      const source = {
        type: ['integer', 'null'] as const,
      } as Partial<NumberSchema>;

      processSchemaType(base, source);

      expect(base.type).toEqual(['integer', 'null']);
    });

    test('intersects number and nullable integer array to nullable integer array', () => {
      const base = { type: 'number', nullable: true } as NumberSchema;
      const source = {
        type: ['integer', 'null'] as const,
      } as Partial<NumberSchema>;

      processSchemaType(base, source);

      expect(base.type).toEqual(['integer', 'null']);
    });

    test('intersects to non-nullable integer when source is not nullable', () => {
      const base = { type: 'number', nullable: true } as NumberSchema;
      const source = {
        type: 'integer',
        nullable: false,
      } as Partial<NumberSchema>;

      processSchemaType(base, source);

      expect(base.type).toBe('integer');
      expect(base.nullable).toBeUndefined();
    });

    test('intersects to non-nullable integer when base is not nullable', () => {
      const base = { type: 'number' } as NumberSchema;
      const source = {
        type: 'integer',
        nullable: true,
      } as Partial<NumberSchema>;

      processSchemaType(base, source);

      expect(base.type).toBe('integer');
    });
  });
});

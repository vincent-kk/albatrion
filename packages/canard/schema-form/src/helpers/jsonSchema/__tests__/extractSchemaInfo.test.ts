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

        expect(result).toBe('string');
      });

      it('should return null for single element null type', () => {
        const schema = { type: ['null'] } as unknown as JsonSchema;

        const result = extractSchemaInfo(schema);

        expect(result).toBe('null');
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
});

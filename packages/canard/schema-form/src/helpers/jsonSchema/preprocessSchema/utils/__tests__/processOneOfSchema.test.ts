import { describe, expect, it } from 'vitest';

import {
  END_OF_TEXT,
  START_OF_TEXT,
  UNIT_SEPARATOR,
} from '@/schema-form/app/constants/control';
import type { JsonSchema } from '@/schema-form/types';

import { processOneOfSchema } from '../processOneOfSchema';

const ENHANCED_KEY = START_OF_TEXT + UNIT_SEPARATOR + END_OF_TEXT;

describe('processOneOfSchema', () => {
  describe('basic functionality', () => {
    it('should add ENHANCED_KEY property with variant value', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };

      const result = processOneOfSchema(schema, 0);

      expect(result).toBeDefined();
      expect(result.properties).toBeDefined();
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 0 });
    });

    it('should handle different variant values', () => {
      const schema1: Partial<JsonSchema> = { type: 'string' };
      const schema2: Partial<JsonSchema> = { type: 'string' };
      const schema3: Partial<JsonSchema> = { type: 'string' };

      const result1 = processOneOfSchema(schema1, 0);
      const result2 = processOneOfSchema(schema2, 1);
      const result3 = processOneOfSchema(schema3, 42);

      expect(result1.properties![ENHANCED_KEY]).toEqual({ const: 0 });
      expect(result2.properties![ENHANCED_KEY]).toEqual({ const: 1 });
      expect(result3.properties![ENHANCED_KEY]).toEqual({ const: 42 });
    });

    it('should handle negative variant values', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
      };

      const result = processOneOfSchema(schema, -1);

      expect(result.properties![ENHANCED_KEY]).toEqual({ const: -1 });
    });
  });

  describe('schema merging', () => {
    it('should preserve existing properties', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['firstName', 'lastName'],
      };

      const result = processOneOfSchema(schema, 1);

      expect(result.type).toBe('object');
      expect(result.required).toEqual(['firstName', 'lastName']);
      expect(result.properties!.firstName).toEqual({ type: 'string' });
      expect(result.properties!.lastName).toEqual({ type: 'string' });
      expect(result.properties!.age).toEqual({ type: 'number' });
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 1 });
    });

    it('should override existing ENHANCED_KEY if present', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          [ENHANCED_KEY]: { const: 999 },
        },
      } as Partial<JsonSchema>;

      const result = processOneOfSchema(schema, 5);

      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 5 });
      expect(result.properties!.name).toEqual({ type: 'string' });
    });

    it('should create properties object if not present', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
      };

      const result = processOneOfSchema(schema, 3);

      expect(result.properties).toBeDefined();
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 3 });
    });

    it('should handle schema with no type', () => {
      const schema: Partial<JsonSchema> = {};

      const result = processOneOfSchema(schema, 7);

      expect(result.properties).toBeDefined();
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 7 });
    });
  });

  describe('complex schemas', () => {
    it('should handle schema with nested properties', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          settings: {
            type: 'object',
            properties: {
              theme: { type: 'string' },
              notifications: { type: 'boolean' },
            },
          },
        },
      };

      const result = processOneOfSchema(schema, 2);

      expect(result.properties!.user).toEqual(schema.properties!.user);
      expect(result.properties!.settings).toEqual(schema.properties!.settings);
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 2 });
    });

    it('should handle schema with arrays', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      };

      const result = processOneOfSchema(schema, 4);

      expect(result.properties!.items).toEqual(schema.properties!.items);
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 4 });
    });

    it('should handle schema with conditions', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
        properties: {
          type: { type: 'string' },
          data: { type: 'string' },
        },
        if: {
          properties: {
            type: { const: 'special' },
          },
        },
        then: {
          required: ['data'],
        },
      };

      const result = processOneOfSchema(schema, 6);

      expect(result.if).toEqual(schema.if);
      expect(result.then).toEqual(schema.then);
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 6 });
    });

    it('should handle schema with allOf', () => {
      const schema: Partial<JsonSchema> = {
        allOf: [
          {
            type: 'object',
            properties: {
              id: { type: 'string' },
            },
          },
          {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        ],
      };

      const result = processOneOfSchema(schema, 8);

      expect(result.allOf).toEqual(schema.allOf);
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 8 });
    });

    it('should handle schema with oneOf', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
        properties: {
          field: { type: 'string' },
        },
        oneOf: [
          {
            properties: {
              field: { enum: ['a', 'b'] },
            },
          },
          {
            properties: {
              field: { enum: ['c', 'd'] },
            },
          },
        ],
      };

      const result = processOneOfSchema(schema, 9);

      expect(result.oneOf).toEqual(schema.oneOf);
      expect(result.properties!.field).toEqual(schema.properties!.field);
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 9 });
    });

    it('should handle schema with anyOf', () => {
      const schema: Partial<JsonSchema> = {
        anyOf: [{ type: 'string' }, { type: 'number' }],
      };

      const result = processOneOfSchema(schema, 10);

      expect(result.anyOf).toEqual(schema.anyOf);
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 10 });
    });
  });

  describe('schema attributes preservation', () => {
    it('should preserve all schema attributes', () => {
      const schema: Partial<JsonSchema> = {
        $id: 'test-schema',
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'Test Schema',
        description: 'A test schema for validation',
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
        additionalProperties: false,
        examples: [{ name: 'John' }],
        default: { name: 'Default' },
        minProperties: 1,
        maxProperties: 10,
      };

      const result = processOneOfSchema(schema, 11);

      expect(result.$id).toBe('test-schema');
      expect(result.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(result.title).toBe('Test Schema');
      expect(result.description).toBe('A test schema for validation');
      expect(result.type).toBe('object');
      expect(result.required).toEqual(['name']);
      expect(result.additionalProperties).toBe(false);
      expect(result.examples).toEqual([{ name: 'John' }]);
      expect(result.default).toEqual({ name: 'Default' });
      expect(result.minProperties).toBe(1);
      expect(result.maxProperties).toBe(10);
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 11 });
    });

    it('should preserve custom properties', () => {
      const schema: Partial<JsonSchema> & { customProp?: string } = {
        type: 'object',
        properties: {
          field: { type: 'string' },
        },
        customProp: 'customValue',
      };

      const result = processOneOfSchema(schema, 12);

      expect(result.customProp).toBe('customValue');
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 12 });
    });
  });

  describe('edge cases', () => {
    it('should handle variant value of 0', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
      };

      const result = processOneOfSchema(schema, 0);

      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 0 });
    });

    it('should handle very large variant values', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
      };

      const result = processOneOfSchema(schema, Number.MAX_SAFE_INTEGER);

      expect(result.properties![ENHANCED_KEY]).toEqual({
        const: Number.MAX_SAFE_INTEGER,
      });
    });

    it('should handle empty schema', () => {
      const schema: Partial<JsonSchema> = {};

      const result = processOneOfSchema(schema, 15);

      expect(result.properties).toBeDefined();
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 15 });
      expect(Object.keys(result.properties!)).toHaveLength(1);
    });

    it('should handle schema with null properties', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
        properties: null as any,
      };

      const result = processOneOfSchema(schema, 16);

      expect(result.properties).toBeDefined();
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 16 });
    });

    it('should handle schema with undefined properties merging correctly', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
        properties: undefined,
      };

      const result = processOneOfSchema(schema, 17);

      expect(result.properties).toBeDefined();
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 17 });
    });
  });

  describe('mutation behavior', () => {
    it('should mutate the original schema (current behavior)', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };

      const result = processOneOfSchema(schema, 20);

      // The merge function mutates the target, so result === schema
      expect(result).toBe(schema);
      expect(schema.properties![ENHANCED_KEY]).toEqual({ const: 20 });
      expect(result.properties![ENHANCED_KEY]).toEqual({ const: 20 });
    });

    it('should mutate nested properties object', () => {
      const schema: Partial<JsonSchema> = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };
      const originalProperties = schema.properties;

      const result = processOneOfSchema(schema, 21);

      // Properties object is mutated in place
      expect(result.properties).toBe(originalProperties);
      expect(originalProperties![ENHANCED_KEY]).toEqual({ const: 21 });
    });
  });

  describe('integration scenarios', () => {
    it('should work with oneOf discrimination', () => {
      const baseSchema: Partial<JsonSchema> = {
        type: 'object',
        properties: {
          type: { type: 'string' },
        },
      };

      const personSchema: Partial<JsonSchema> = {
        ...baseSchema,
        properties: {
          ...baseSchema.properties,
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name'],
      };

      const companySchema: Partial<JsonSchema> = {
        ...baseSchema,
        properties: {
          ...baseSchema.properties,
          companyName: { type: 'string' },
          employees: { type: 'number' },
        },
        required: ['companyName'],
      };

      const processedPerson = processOneOfSchema(personSchema, 0);
      const processedCompany = processOneOfSchema(companySchema, 1);

      expect(processedPerson.properties![ENHANCED_KEY]).toEqual({ const: 0 });
      expect(processedCompany.properties![ENHANCED_KEY]).toEqual({ const: 1 });

      expect(processedPerson.properties!.name).toBeDefined();
      expect(processedCompany.properties!.companyName).toBeDefined();
    });

    it('should handle multiple calls with same schema (mutates)', () => {
      // Create separate schema copies for each call since merge mutates
      const results = [];
      for (let i = 0; i < 5; i++) {
        const schemaCopy: Partial<JsonSchema> = {
          type: 'object',
          properties: {
            value: { type: 'string' },
          },
        };
        results.push(processOneOfSchema(schemaCopy, i));
      }

      results.forEach((result, index) => {
        expect(result.properties![ENHANCED_KEY]).toEqual({ const: index });
        expect(result.properties!.value).toEqual({ type: 'string' });
      });
    });
  });
});

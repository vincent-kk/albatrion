import { describe, expect, it } from 'vitest';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { getNodeType } from '../getNodeType';

describe('getNodeType', () => {
  it('should return string for string type', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'string',
    };

    const result = getNodeType(schema);
    expect(result).toBe('string');
  });

  it('should return number for number type', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'number',
    };

    const result = getNodeType(schema);
    expect(result).toBe('number');
  });

  it('should convert integer to number', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'integer',
    };

    const result = getNodeType(schema);
    expect(result).toBe('number');
  });

  it('should return boolean for boolean type', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'boolean',
    };

    const result = getNodeType(schema);
    expect(result).toBe('boolean');
  });

  it('should return array for array type', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'array',
      items: { type: 'string' },
    };

    const result = getNodeType(schema);
    expect(result).toBe('array');
  });

  it('should return object for object type', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      properties: {},
    };

    const result = getNodeType(schema);
    expect(result).toBe('object');
  });

  it('should return null for null type', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'null',
    };

    const result = getNodeType(schema);
    expect(result).toBe('null');
  });

  it('should return virtual for virtual type', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'virtual',
      default: ['computed', 'value'],
    };

    const result = getNodeType(schema);
    expect(result).toBe('virtual');
  });

  it('should handle schema with integer and additional properties', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'integer',
      minimum: 0,
      maximum: 100,
      multipleOf: 5,
    };

    const result = getNodeType(schema);
    expect(result).toBe('number');
  });

  it('should handle schema with number and additional properties', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'number',
      minimum: 0.0,
      maximum: 1.0,
      exclusiveMinimum: 0,
    };

    const result = getNodeType(schema);
    expect(result).toBe('number');
  });

  it('should preserve type for complex schemas', () => {
    const arraySchema: JsonSchemaWithVirtual = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
        },
      },
      minItems: 1,
      maxItems: 10,
    };

    const result = getNodeType(arraySchema);
    expect(result).toBe('array');
  });

  it('should handle schema with computed properties', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'string',
      computed: {
        visible: true,
      },
    };

    const result = getNodeType(schema);
    expect(result).toBe('string');
  });

  it('should handle schema with format property', () => {
    const emailSchema: JsonSchemaWithVirtual = {
      type: 'string',
      format: 'email',
    };

    const dateSchema: JsonSchemaWithVirtual = {
      type: 'string',
      format: 'date-time',
    };

    expect(getNodeType(emailSchema)).toBe('string');
    expect(getNodeType(dateSchema)).toBe('string');
  });

  it('should handle schema with enum', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'string',
      enum: ['option1', 'option2', 'option3'],
    };

    const result = getNodeType(schema);
    expect(result).toBe('string');
  });

  it('should handle schema with oneOf', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      oneOf: [
        {
          properties: {
            type: { const: 'A' },
            valueA: { type: 'string' },
          },
        },
        {
          properties: {
            type: { const: 'B' },
            valueB: { type: 'number' },
          },
        },
      ],
    };

    const result = getNodeType(schema);
    expect(result).toBe('object');
  });

  it('should handle schema with const value', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'string',
      const: 'fixed-value',
    };

    const result = getNodeType(schema);
    expect(result).toBe('string');
  });

  it('should handle schema with pattern', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'string',
      pattern: '^[A-Z][a-z]+$',
    };

    const result = getNodeType(schema);
    expect(result).toBe('string');
  });

  it('should handle schema with default value', () => {
    const stringSchema: JsonSchemaWithVirtual = {
      type: 'string',
      default: 'default text',
    };

    const integerSchema: JsonSchemaWithVirtual = {
      type: 'integer',
      default: 42,
    };

    expect(getNodeType(stringSchema)).toBe('string');
    expect(getNodeType(integerSchema)).toBe('number');
  });
});

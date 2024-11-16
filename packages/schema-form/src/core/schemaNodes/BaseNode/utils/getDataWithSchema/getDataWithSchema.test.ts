import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@lumy/schema-form/types';

import { getDataWithSchema } from './getDataWithSchema';

describe('getDataWithSchema', () => {
  it('should return transformed data for object type schema', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    };
    const data = { name: 'John', age: 30 };

    const result = getDataWithSchema(data, schema);
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('should handle array type schema correctly', () => {
    const schema: JsonSchema = {
      type: 'array',
      items: { type: 'string' },
    };
    const data = ['apple', 'banana'];

    const result = getDataWithSchema(data, schema);
    expect(result).toEqual(['apple', 'banana']);
  });

  it('should ignore anyOf fields if ignoreAnyOf option is true', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'inactive'] },
        age: { type: 'number' },
      },
      anyOf: [
        { properties: { status: { enum: ['active'] } }, required: ['age'] },
      ],
    };
    const data = { status: 'active' };

    const result = getDataWithSchema(data, schema, { ignoreAnyOf: true });
    expect(result).toEqual({ status: 'active' });
  });

  it('should include required fields from anyOf if condition matches', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'inactive'] },
        age: { type: 'number' },
      },
      anyOf: [
        { properties: { status: { enum: ['active'] } }, required: ['age'] },
      ],
    };
    const data = { status: 'active', age: 30 };

    const result = getDataWithSchema(data, schema);
    expect(result).toEqual({ status: 'active', age: 30 });
  });

  it('should handle nested object schemas', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        person: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
        },
      },
    };
    const data = { person: { name: 'Alice', age: 25 } };

    const result = getDataWithSchema(data, schema);
    expect(result).toEqual({ person: { name: 'Alice', age: 25 } });
  });

  it('should return input data if schema does not match object or array types', () => {
    const schema: JsonSchema = { type: 'string' };
    const data = 'just a string';

    const result = getDataWithSchema(data, schema);
    expect(result).toBe('just a string');
  });
});

import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@/schema-form/types';

import { getDataWithSchema } from '../getDataWithSchema';

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

  it('should include required fields from oneOf if condition matches', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'inactive'] },
        age: { type: 'number' },
      },
      oneOf: [
        { properties: { status: { enum: ['active'] } }, required: ['age'] },
        { properties: { status: { enum: ['inactive'] } } },
      ],
    };
    const data = { status: 'inactive', age: 30 };

    const result = getDataWithSchema(data, schema);
    expect(result).toEqual({ status: 'inactive' });
  });

  it('additionalProperties exist', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'inactive'] },
        age: { type: 'number' },
      },
      oneOf: [
        { properties: { status: { enum: ['active'] } }, required: ['age'] },
        { properties: { status: { enum: ['inactive'] } } },
      ],
      additionalProperties: true,
    };
    const data = {
      status: 'inactive',
      age: 30,
      name: 'John',
      job: 'developer',
    };

    const result = getDataWithSchema(data, schema);
    expect(result).toEqual({
      status: 'inactive',
      name: 'John',
      job: 'developer',
    });
  });

  it('additionalProperties exist with additionalProperties: false', () => {
    const schema: JsonSchema = {
      type: 'object',
      oneOf: [
        { properties: { status: { enum: ['active'] } }, required: ['age'] },
        { properties: { status: { enum: ['inactive'] } } },
      ],
    };
    const data = {
      status: 'inactive',
      age: 30,
      name: 'John',
      job: 'developer',
    };

    const result = getDataWithSchema(data, schema);
    expect(result).toEqual({
      age: 30,
      name: 'John',
      job: 'developer',
      status: 'inactive',
    });
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

  it('should pass additionalProperties', () => {
    const schema: JsonSchema = { type: 'object' };
    const data = { name: 'John', age: 30 };

    const result = getDataWithSchema(data, schema);
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('allow additionalProperties', () => {
    const schema: JsonSchema = {
      type: 'object',
    };
    const data = { name: 'John', age: 30 };
    const result = getDataWithSchema(data, schema);
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('should handle array schemas', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    };
    const data = { tags: ['tag1', 'tag2', 'tag3'] };

    const result = getDataWithSchema(data, schema);
    expect(result).toEqual({ tags: ['tag1', 'tag2', 'tag3'] });
  });

  it('should handle nested array schemas', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        matrix: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number' },
          },
        },
      },
    };
    const data = { matrix: [[1, 2], [3, 4], [5]] };

    const result = getDataWithSchema(data, schema);
    expect(result).toEqual({ matrix: [[1, 2], [3, 4], [5]] });
  });

  it('should handle complex oneOf conditions', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['user', 'admin', 'guest'] },
        name: { type: 'string' },
        age: { type: 'number' },
        role: { type: 'string' },
        permissions: { type: 'array', items: { type: 'string' } },
      },
      oneOf: [
        {
          properties: { type: { enum: ['admin'] } },
          required: ['permissions'],
        },
        { properties: { type: { enum: ['user'] } }, required: ['role'] },
      ],
    };

    const adminData = {
      type: 'admin',
      name: 'Admin',
      age: 40,
      permissions: ['read', 'write'],
    };
    const adminResult = getDataWithSchema(adminData, schema);
    expect(adminResult).toEqual({
      type: 'admin',
      permissions: ['read', 'write'],
    });

    const userData = { type: 'user', name: 'User', age: 30, role: 'editor' };
    const userResult = getDataWithSchema(userData, schema);
    expect(userResult).toEqual({
      type: 'user',
      role: 'editor',
    });

    const guestData = { type: 'guest', name: 'Guest', age: 20 };
    const guestResult = getDataWithSchema(guestData, schema);
    expect(guestResult).toEqual({});
  });

  it('should handle null and undefined values', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    };

    const nullResult = getDataWithSchema(null, schema);
    expect(nullResult).toBeNull();

    const undefinedResult = getDataWithSchema(undefined, schema);
    expect(undefinedResult).toBeUndefined();

    const dataWithNull = { name: null, age: 30 };
    const resultWithNull = getDataWithSchema(dataWithNull, schema);
    expect(resultWithNull).toEqual({ name: null, age: 30 });
  });

  it('should handle deeply nested structures', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            profile: {
              type: 'object',
              properties: {
                personal: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    age: { type: 'number' },
                    address: {
                      type: 'object',
                      properties: {
                        street: { type: 'string' },
                        city: { type: 'string' },
                        country: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const data = {
      user: {
        profile: {
          personal: {
            name: 'John Doe',
            age: 30,
            address: {
              street: '123 Main St',
              city: 'Seoul',
              country: 'Korea',
            },
          },
        },
      },
    };

    const result = getDataWithSchema(data, schema);
    expect(result).toEqual(data);
  });

  it('should handle arrays with object items', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
      },
    };

    const data = {
      users: [
        { id: 1, name: 'User 1', email: 'user1@example.com', extra: 'extra1' },
        { id: 2, name: 'User 2', email: 'user2@example.com', extra: 'extra2' },
        { id: 3, name: 'User 3', email: 'user3@example.com', extra: 'extra3' },
      ],
    };

    const result = getDataWithSchema(data, schema);
    expect(result).toEqual(data);
  });

  it('should handle oneOf with multiple conditions', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['A', 'B', 'C'] },
        value: { type: 'string' },
        extraA: { type: 'string' },
        extraB: { type: 'number' },
        extraC: { type: 'boolean' },
      },
      oneOf: [
        { properties: { type: { enum: ['A'] } }, required: ['extraA'] },
        { properties: { type: { enum: ['B'] } }, required: ['extraB'] },
        { properties: { type: { enum: ['C'] } }, required: ['extraC'] },
      ],
    };

    const dataA = { type: 'A', value: 'test', extraA: 'valueA' };
    const resultA = getDataWithSchema(dataA, schema);
    expect(resultA).toEqual({ type: 'A', extraA: 'valueA' });

    const dataB = { type: 'B', value: 'test', extraB: 42 };
    const resultB = getDataWithSchema(dataB, schema);
    expect(resultB).toEqual({ type: 'B', extraB: 42 });

    const dataC = { type: 'C', value: 'test', extraC: true };
    const resultC = getDataWithSchema(dataC, schema);
    expect(resultC).toEqual({ type: 'C', extraC: true });

    const dataAMixed = {
      type: 'A',
      value: 'test',
      extraA: 'valueA',
      extraB: 42,
    };
    const resultAMixed = getDataWithSchema(dataAMixed, schema);
    expect(resultAMixed).toEqual({
      type: 'A',
      extraA: 'valueA',
    });
  });

  it('should cache omit results for the same schema and value', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['A', 'B'] },
        value: { type: 'string' },
        extraA: { type: 'string' },
        extraB: { type: 'number' },
      },
      oneOf: [
        {
          properties: { type: { enum: ['A'] } },
          required: ['extraA', 'value'],
        },
        { properties: { type: { enum: ['B'] } }, required: ['extraB'] },
      ],
    };

    const data = { type: 'A', value: 'test', extraA: 'valueA', extraB: 42 };

    const result1 = getDataWithSchema(data, schema);
    expect(result1).toEqual({ type: 'A', value: 'test', extraA: 'valueA' });

    const result2 = getDataWithSchema(data, schema);
    expect(result2).toEqual({ type: 'A', value: 'test', extraA: 'valueA' });

    const result3 = getDataWithSchema(data, schema);
    expect(result3).toEqual({ type: 'A', value: 'test', extraA: 'valueA' });

    const differentData = {
      type: 'B',
      value: 'test',
      extraA: 'valueA',
      extraB: 42,
    };
    const result4 = getDataWithSchema(differentData, schema);
    expect(result4).toEqual({ type: 'B', extraB: 42 });
  });

  it('should handle multiple oneOf conditions with the same property', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['A', 'B', 'C'] },
        value: { type: 'string' },
        extraA: { type: 'string' },
        extraB: { type: 'number' },
        extraC: { type: 'boolean' },
      },
      oneOf: [
        { properties: { type: { enum: ['A'] } }, required: ['extraA'] },
        { properties: { type: { enum: ['B'] } }, required: ['extraB'] },
        { properties: { type: { enum: ['C'] } }, required: ['extraC'] },
        { properties: { type: { enum: ['A', 'B'] } }, required: ['value'] },
      ],
    };

    const dataA = { type: 'A', value: 'test', extraA: 'valueA' };
    const resultA = getDataWithSchema(dataA, schema);
    expect(resultA).toEqual({ type: 'A', value: 'test', extraA: 'valueA' });

    const dataB = { type: 'B', value: 'test', extraB: 42 };
    const resultB = getDataWithSchema(dataB, schema);
    expect(resultB).toEqual({ type: 'B', value: 'test', extraB: 42 });

    const dataC = { type: 'C', value: 'test', extraC: true };
    const resultC = getDataWithSchema(dataC, schema);
    expect(resultC).toEqual({ type: 'C', extraC: true });
  });

  it('should handle non-properties schema', () => {
    // properties is empty object
    const schema1: JsonSchema = {
      type: 'object',
      properties: {},
      oneOf: [
        { properties: { type: { enum: ['A'] } }, required: ['extraA'] },
        { properties: { type: { enum: ['B'] } }, required: ['extraB'] },
        { properties: { type: { enum: ['C'] } }, required: ['extraC'] },
      ],
    };

    const data = { type: 'A', value: 'test', extraA: 'valueA' };
    const result = getDataWithSchema(data, schema1);
    expect(result).toBe(data);

    // properties is undefined
    const schema2: JsonSchema = {
      type: 'object',
      oneOf: [
        { properties: { type: { enum: ['A'] } }, required: ['extraA'] },
        { properties: { type: { enum: ['B'] } }, required: ['extraB'] },
        { properties: { type: { enum: ['C'] } }, required: ['extraC'] },
      ],
    };
    const dataB = { type: 'B', value: 'test', extraB: 42 };
    const resultB = getDataWithSchema(dataB, schema2);
    expect(resultB).toBe(dataB);
  });

  it('should handle arrays with mixed types', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        mixedArray: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    };

    const data = {
      mixedArray: ['string', '42', 'true', 'another string', '100'],
    };
    const result = getDataWithSchema(data, schema);
    expect(result).toBe(data);
  });

  it('should handle arrays with nested oneOf conditions', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['A', 'B'] },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['A', 'B'] },
              value: { type: 'string' },
              extraA: { type: 'string' },
              extraB: { type: 'number' },
            },
            oneOf: [
              { properties: { type: { enum: ['A'] } }, required: ['extraA'] },
              { properties: { type: { enum: ['B'] } }, required: ['extraB'] },
            ],
          },
        },
      },
      oneOf: [
        {
          properties: { type: { const: 'A' } },
          required: ['items'],
        },
      ],
    };

    const data = {
      type: 'A',
      items: [
        { type: 'A', value: 'test1', extraA: 'valueA1', extraB: 42 },
        { type: 'B', value: 'test2', extraA: 'valueA2', extraB: 100 },
        { type: 'A', value: 'test3', extraA: 'valueA3' },
      ],
    };

    const result = getDataWithSchema(data, schema);
    expect(result).toEqual({
      type: 'A',
      items: [
        { type: 'A', extraA: 'valueA1' },
        { type: 'B', extraB: 100 },
        { type: 'A', extraA: 'valueA3' },
      ],
    });
  });

  it('should handle objects with patternProperties', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        tag_important: { type: 'string' },
        tag_category: { type: 'string' },
        meta_priority: { type: 'number' },
        meta_count: { type: 'number' },
      },
    };

    const data = {
      name: 'Item',
      tag_important: 'yes',
      tag_category: 'electronics',
      meta_priority: 5,
      meta_count: 10,
      extra: 'value',
    };

    const result = getDataWithSchema(data, schema);
    expect(result).toBe(data);
  });
});

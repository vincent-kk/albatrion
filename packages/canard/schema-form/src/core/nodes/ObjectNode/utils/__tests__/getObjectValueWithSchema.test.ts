import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@/schema-form/types';

import { flattenConditions } from '../flattenConditions';
import { getObjectValueWithSchema } from '../getObjectValueWithSchema';

describe('getObjectValueWithSchema', () => {
  it('should return transformed data for object type schema', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    };
    const data = { name: 'John', age: 30 };

    const result = getObjectValueWithSchema(data, schema, undefined, undefined);
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('should include required fields from if-then-else if condition matches', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'inactive'] },
        age: { type: 'number' },
      },
      if: {
        properties: {
          status: { enum: ['active'] },
        },
      },
      then: {
        required: ['age'],
      },
      else: {
        required: [],
      },
    };
    const data = { status: 'inactive', age: 30 };

    const flattenedConditions = flattenConditions(schema);

    const result = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(result).toEqual({ status: 'inactive' });
  });

  it('additionalProperties exist', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'inactive'] },
        age: { type: 'number' },
      },
      if: {
        properties: {
          status: { enum: ['active'] },
        },
      },
      then: {
        required: ['age'],
      },
      else: {
        // 'inactive' 상태일 때는 추가 필수 필드 없음
      },
      additionalProperties: true,
    };
    const data = {
      status: 'inactive',
      age: 30,
      name: 'John',
      job: 'developer',
    };

    const flattenedConditions = flattenConditions(schema);

    const result = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(result).toEqual({
      status: 'inactive',
      name: 'John',
      job: 'developer',
    });
  });

  it('additionalProperties exist with additionalProperties: false', () => {
    const schema: JsonSchema = {
      type: 'object',
      if: {
        properties: {
          status: { enum: ['active'] },
        },
      },
      then: {
        required: ['age'],
      },
      else: {
        // 'inactive' 상태일 때는 추가 필수 필드 없음
      },
    };
    const data = {
      status: 'inactive',
      age: 30,
      name: 'John',
      job: 'developer',
    };

    const flattenedConditions = flattenConditions(schema);

    const result = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
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

    const flattenedConditions = flattenConditions(schema);

    const result = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(result).toEqual({ person: { name: 'Alice', age: 25 } });
  });

  it('should pass additionalProperties', () => {
    const schema: JsonSchema = { type: 'object' };
    const data = { name: 'John', age: 30 };

    const flattenedConditions = flattenConditions(schema);

    const result = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('allow additionalProperties', () => {
    const schema: JsonSchema = {
      type: 'object',
    };
    const data = { name: 'John', age: 30 };

    const flattenedConditions = flattenConditions(schema);

    const result = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
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

    const flattenedConditions = flattenConditions(schema);

    const result = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
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

    const flattenedConditions = flattenConditions(schema);

    const result = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(result).toEqual({ matrix: [[1, 2], [3, 4], [5]] });
  });

  it('should handle complex if-then-else conditions', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['user', 'admin', 'guest'] },
        name: { type: 'string' },
        age: { type: 'number' },
        role: { type: 'string' },
        permissions: { type: 'array', items: { type: 'string' } },
      },
      if: {
        properties: {
          type: { enum: ['admin'] },
        },
      },
      then: {
        required: ['permissions'],
      },
      else: {
        if: {
          properties: {
            type: { enum: ['user'] },
          },
        },
        then: {
          required: ['role'],
        },
      },
    };

    const adminData = {
      type: 'admin',
      name: 'Admin',
      age: 40,
      permissions: ['read', 'write'],
    };
    const flattenedConditions = flattenConditions(schema);

    const adminResult = getObjectValueWithSchema(
      adminData,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(adminResult).toEqual({
      type: 'admin',
      permissions: ['read', 'write'],
    });

    const userData = { type: 'user', name: 'User', age: 30, role: 'editor' };
    const userResult = getObjectValueWithSchema(
      userData,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(userResult).toEqual({
      type: 'user',
      role: 'editor',
    });

    const guestData = { type: 'guest', name: 'Guest', age: 20 };
    const guestResult = getObjectValueWithSchema(
      guestData,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(guestResult).toEqual({ type: 'guest' });
  });

  it('should handle null and undefined values', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    };

    const flattenedConditions = flattenConditions(schema);

    const nullResult = getObjectValueWithSchema(
      // @ts-ignore
      null,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(nullResult).toBeNull();

    const undefinedResult = getObjectValueWithSchema(
      undefined,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(undefinedResult).toBeUndefined();

    const dataWithNull = { name: null, age: 30 };
    const resultWithNull = getObjectValueWithSchema(
      dataWithNull,
      schema,
      undefined,
      flattenedConditions,
    );
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

    const flattenedConditions = flattenConditions(schema);

    const result = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
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

    const flattenedConditions = flattenConditions(schema);

    const result = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(result).toEqual(data);
  });

  it('should handle if-then-else with multiple conditions', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['A', 'B', 'C'] },
        value: { type: 'string' },
        extraA: { type: 'string' },
        extraB: { type: 'number' },
        extraC: { type: 'boolean' },
      },
      if: {
        properties: {
          type: { enum: ['A'] },
        },
      },
      then: {
        required: ['extraA'],
      },
      else: {
        if: {
          properties: {
            type: { enum: ['B'] },
          },
        },
        then: {
          required: ['extraB'],
        },
        else: {
          required: ['extraC'],
        },
      },
    };

    const dataA = { type: 'A', value: 'test', extraA: 'valueA' };
    const flattenedConditions = flattenConditions(schema);

    const resultA = getObjectValueWithSchema(
      dataA,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(resultA).toEqual({ type: 'A', extraA: 'valueA' });

    const dataB = { type: 'B', value: 'test', extraB: 42 };
    const resultB = getObjectValueWithSchema(
      dataB,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(resultB).toEqual({ type: 'B', extraB: 42 });

    const dataC = { type: 'C', value: 'test', extraC: true };
    const resultC = getObjectValueWithSchema(
      dataC,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(resultC).toEqual({ type: 'C', extraC: true });

    const dataAMixed = {
      type: 'A',
      value: 'test',
      extraA: 'valueA',
      extraB: 42,
    };
    const resultAMixed = getObjectValueWithSchema(
      dataAMixed,
      schema,
      undefined,
      flattenedConditions,
    );
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
      if: {
        properties: {
          type: { enum: ['A'] },
        },
      },
      then: {
        required: ['extraA', 'value'],
      },
      else: {
        required: ['extraB'],
      },
    };

    const data = { type: 'A', value: 'test', extraA: 'valueA', extraB: 42 };

    const flattenedConditions = flattenConditions(schema);

    const result1 = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(result1).toEqual({ type: 'A', value: 'test', extraA: 'valueA' });

    const result2 = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(result2).toEqual({ type: 'A', value: 'test', extraA: 'valueA' });

    const result3 = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(result3).toEqual({ type: 'A', value: 'test', extraA: 'valueA' });

    const differentData = {
      type: 'B',
      value: 'test',
      extraA: 'valueA',
      extraB: 42,
    };
    const result4 = getObjectValueWithSchema(
      differentData,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(result4).toEqual({ type: 'B', extraB: 42 });
  });

  it('should handle multiple if-then-else conditions with the same property', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['A', 'B', 'C'] },
        value: { type: 'string' },
        extraA: { type: 'string' },
        extraB: { type: 'number' },
        extraC: { type: 'boolean' },
      },
      if: {
        properties: {
          type: { enum: ['A'] },
        },
      },
      then: {
        required: ['extraA'],
      },
      else: {
        if: {
          properties: {
            type: { enum: ['B'] },
          },
        },
        then: {
          required: ['extraB'],
        },
        else: {
          if: {
            properties: {
              type: { enum: ['C'] },
            },
          },
          then: {
            required: ['extraC'],
          },
          else: {
            if: {
              properties: {
                type: { enum: ['A', 'B'] },
              },
            },
            then: {
              required: ['value'],
            },
          },
        },
      },
    };

    const dataA = { type: 'A', value: 'test', extraA: 'valueA' };
    const flattenedConditions = flattenConditions(schema);

    const resultA = getObjectValueWithSchema(
      dataA,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(resultA).toEqual({ type: 'A', value: 'test', extraA: 'valueA' });

    const dataB = { type: 'B', value: 'test', extraB: 42 };
    const resultB = getObjectValueWithSchema(
      dataB,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(resultB).toEqual({ type: 'B', value: 'test', extraB: 42 });

    const dataC = { type: 'C', value: 'test', extraC: true };
    const resultC = getObjectValueWithSchema(
      dataC,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(resultC).toEqual({ type: 'C', extraC: true });
  });

  it('should handle non-properties schema', () => {
    // properties is empty object
    const schema1: JsonSchema = {
      type: 'object',
      properties: {},
      if: {
        properties: {
          type: { enum: ['A'] },
        },
      },
      then: {
        required: ['extraA'],
      },
      else: {
        if: {
          properties: {
            type: { enum: ['B'] },
          },
        },
        then: {
          required: ['extraB'],
        },
        else: {
          required: ['extraC'],
        },
      },
    };

    const data = { type: 'A', value: 'test', extraA: 'valueA' };
    const flattenedConditions1 = flattenConditions(schema1);

    const result = getObjectValueWithSchema(
      data,
      schema1,
      undefined,
      flattenedConditions1,
    );
    expect(result).toBe(data);

    // properties is undefined
    const schema2: JsonSchema = {
      type: 'object',
      if: {
        properties: {
          type: { enum: ['A'] },
        },
      },
      then: {
        required: ['extraA'],
      },
      else: {
        if: {
          properties: {
            type: { enum: ['B'] },
          },
        },
        then: {
          required: ['extraB'],
        },
        else: {
          required: ['extraC'],
        },
      },
    };
    const dataB = { type: 'B', value: 'test', extraB: 42 };
    const flattenedConditions2 = flattenConditions(schema2);

    const resultB = getObjectValueWithSchema(
      dataB,
      schema2,
      undefined,
      flattenedConditions2,
    );
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
    const flattenedConditions = flattenConditions(schema);

    const result = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(result).toBe(data);
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

    const flattenedConditions = flattenConditions(schema);

    const result = getObjectValueWithSchema(
      data,
      schema,
      undefined,
      flattenedConditions,
    );
    expect(result).toBe(data);
  });
});

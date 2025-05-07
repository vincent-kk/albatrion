import { describe, expect, it } from 'vitest';

import type { ObjectSchema } from '@/schema-form/types';

import { flattenConditions } from '../flattenConditions';
import { getFieldConditionMap } from '../getFieldConditionMap/getFieldConditionMap';
import { getValueWithCondition } from '../getValueWithCondition';

describe('getValueWithCondition', () => {
  it('should return all properties if no conditions', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    };
    const value = { name: 'John', age: 30 };
    const result = getValueWithCondition(value, schema, undefined);
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('should filter properties based on required conditions', () => {
    const schema: ObjectSchema = {
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
    const value = { status: 'inactive', age: 30 };
    const conditions = flattenConditions(schema);
    const fieldConditionMap = getFieldConditionMap(conditions);
    const result = getValueWithCondition(value, schema, fieldConditionMap);
    expect(result).toEqual({ status: 'inactive' });
  });

  it('should include additional properties not in schema', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };
    const value = { name: 'John', age: 30, extra: 'data' };
    const result = getValueWithCondition(value, schema, undefined);
    expect(result).toEqual({ name: 'John', age: 30, extra: 'data' });
  });

  it('should return empty object for empty input', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };
    const value = {};
    const result = getValueWithCondition(value, schema, undefined);
    expect(result).toEqual({});
  });

  it('should handle undefined value', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };
    const result = getValueWithCondition(undefined, schema, undefined);
    expect(result).toBeUndefined();
  });

  it('should handle complex if-then-else conditions', () => {
    const schema: ObjectSchema = {
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
    const userData = { type: 'user', name: 'User', age: 30, role: 'editor' };
    const guestData = { type: 'guest', name: 'Guest', age: 20 };
    const conditions = flattenConditions(schema);
    const fieldConditionMap = getFieldConditionMap(conditions);
    expect(getValueWithCondition(adminData, schema, fieldConditionMap)).toEqual(
      {
        type: 'admin',
        permissions: ['read', 'write'],
      },
    );
    expect(getValueWithCondition(userData, schema, fieldConditionMap)).toEqual({
      type: 'user',
      role: 'editor',
    });
    expect(getValueWithCondition(guestData, schema, fieldConditionMap)).toEqual(
      {
        type: 'guest',
      },
    );
  });

  it('should handle null and undefined values', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    };
    const conditions = flattenConditions(schema);
    const fieldConditionMap = getFieldConditionMap(conditions);
    // @ts-ignore
    expect(getValueWithCondition(null, schema, fieldConditionMap)).toBeNull();
    expect(
      getValueWithCondition(undefined, schema, fieldConditionMap),
    ).toBeUndefined();
    const dataWithNull = { name: null, age: 30 };
    expect(
      getValueWithCondition(dataWithNull, schema, fieldConditionMap),
    ).toEqual({ name: null, age: 30 });
  });

  it('should handle deeply nested structures', () => {
    const schema: ObjectSchema = {
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
    const conditions = flattenConditions(schema);
    const fieldConditionMap = getFieldConditionMap(conditions);
    expect(getValueWithCondition(data, schema, fieldConditionMap)).toEqual(
      data,
    );
  });
});

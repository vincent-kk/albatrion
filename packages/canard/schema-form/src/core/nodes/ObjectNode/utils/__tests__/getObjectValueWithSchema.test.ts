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
      properties: {
        status: { type: 'string', enum: ['active', 'inactive'] },
        age: { type: 'number' },
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
      status: 'inactive',
      name: 'John',
      job: 'developer',
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
    expect(result).toEqual(data);

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
    expect(resultB).toEqual(dataB);
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

describe('getObjectValueWithSchema with oneOf', () => {
  it('should extract properties based on oneOf schema when oneOfIndex is specified', () => {
    // 테스트를 위한 oneOf가 포함된 스키마
    const schema = {
      type: 'object',
      oneOf: [
        {
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
        },
        {
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
          },
        },
      ],
      properties: {
        extra: { type: 'string' },
      },
    } satisfies JsonSchema;

    // 첫 번째 oneOf 스키마 테스트 (인덱스 0)
    const value1 = {
      name: 'bin',
      age: 30,
      id: 'user123',
      email: 'test@example.com',
      extra: '추가 정보',
    };

    const result1 = getObjectValueWithSchema(value1, schema, 0, []);

    // oneOf[0]의 속성인 name과 age만 포함되어야 함
    expect(result1).toEqual({
      name: 'bin',
      age: 30,
      extra: '추가 정보',
    });

    // 두 번째 oneOf 스키마 테스트 (인덱스 1)
    const value2 = {
      name: '김철수',
      age: 25,
      id: 'user456',
      email: 'kim@example.com',
      extra: '다른 정보',
    };

    const result2 = getObjectValueWithSchema(
      value2,
      schema,
      1,
      [], // 빈 조건 배열
    );

    // oneOf[1]의 속성인 id와 email만 포함되어야 함
    expect(result2).toEqual({
      id: 'user456',
      email: 'kim@example.com',
      extra: '다른 정보',
    });
  });

  it('should handle undefined oneOfIndex correctly', () => {
    const schema = {
      type: 'object',
      oneOf: [
        {
          properties: {
            name: { type: 'string' },
          },
        },
      ],
      properties: {
        age: { type: 'number' },
      },
    } satisfies JsonSchema;

    const value = {
      name: 'bin',
      age: 28,
    };

    // oneOfIndex가 undefined인 경우 모든 속성이 유지되어야 함
    const result = getObjectValueWithSchema(
      value,
      schema,
      undefined,
      [], // 빈 조건 배열
    );

    expect(result).toEqual({
      age: 28,
    });
  });

  it('should handle complex cases with both oneOf and conditions', () => {
    const schema = {
      type: 'object',
      oneOf: [
        {
          properties: {
            type: { type: 'string', enum: ['person'] },
            name: { type: 'string' },
            age: { type: 'number' },
          },
        },
        {
          properties: {
            type: { type: 'string', enum: ['company'] },
            companyName: { type: 'string' },
            employees: { type: 'number' },
          },
        },
      ],
      properties: {
        address: { type: 'string' },
      },
    } satisfies JsonSchema;

    const conditions = [
      {
        condition: { type: 'person' },
        required: ['address'],
        inverse: false,
      },
    ];

    const value = {
      type: 'person',
      name: 'bin',
      age: 32,
      companyName: '테스트',
      employees: 50,
      address: '서울시 강남구',
    };

    // oneOf[0]과 조건에 의한 address 포함
    const result = getObjectValueWithSchema(value, schema, 0, conditions);

    expect(result).toEqual({
      type: 'person',
      address: '서울시 강남구',
    });
  });
});

describe('getObjectValueWithSchema', () => {
  // 1. 기본 값 반환 테스트
  it('should return undefined when value is null or undefined', () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string' } },
    } satisfies JsonSchema;
    expect(getObjectValueWithSchema(undefined, schema, 0, [])).toBeUndefined();
    // @ts-expect-error
    expect(getObjectValueWithSchema(null, schema, 0, [])).toBeNull();
  });

  it('should return original value when no conditions and no oneOf', () => {
    const schema = {
      type: 'object',
      properties: { name: { type: 'string' } },
    } satisfies JsonSchema;
    const value = { name: 'John', age: 30 };
    expect(getObjectValueWithSchema(value, schema, undefined, [])).toEqual(
      value,
    );
  });

  // 2. oneOf 테스트
  it('should filter fields based on oneOf when oneOfIndex is valid', () => {
    const schema = {
      type: 'object',
      oneOf: [
        {
          properties: {
            type: { type: 'string', const: 'person' },
            name: { type: 'string' },
            age: { type: 'number' },
          },
          required: ['type', 'name'],
        },
        {
          properties: {
            type: { type: 'string', const: 'company' },
            companyName: { type: 'string' },
            employees: { type: 'number' },
          },
          required: ['type', 'companyName'],
        },
      ],
    } satisfies JsonSchema;

    const personValue = {
      type: 'person',
      name: 'John',
      age: 30,
      companyName: 'ABC Corp', // 이 필드는 oneOf[0]에 없으므로 제거되어야 함
    };

    const result1 = getObjectValueWithSchema(personValue, schema, 0, []);
    expect(result1).toEqual({
      type: 'person',
      name: 'John',
      age: 30,
    });

    const companyValue = {
      type: 'company',
      companyName: 'ABC Corp',
      employees: 100,
      name: 'John', // 이 필드는 oneOf[1]에 없으므로 제거되어야 함
    };

    const result2 = getObjectValueWithSchema(companyValue, schema, 1, []);
    expect(result2).toEqual({
      type: 'company',
      companyName: 'ABC Corp',
      employees: 100,
    });
  });

  it('should remove all oneOf fields when oneOfIndex is invalid', () => {
    const schema = {
      type: 'object',
      oneOf: [
        {
          properties: {
            type: { type: 'string', const: 'person' },
            name: { type: 'string' },
          },
        },
        {
          properties: {
            type: { type: 'string', const: 'company' },
            companyName: { type: 'string' },
          },
        },
      ],
    } satisfies JsonSchema;

    const value = {
      type: 'person',
      name: 'John',
      companyName: 'ABC Corp',
      extraField: 'extra',
    };

    // oneOfIndex가 undefined이면 oneOf에 정의된 모든 필드가 제거되어야 함
    const result1 = getObjectValueWithSchema(value, schema, undefined, []);
    expect(result1).toEqual({
      extraField: 'extra',
    });

    // oneOfIndex가 -1이면 oneOf에 정의된 모든 필드가 제거되어야 함
    const result2 = getObjectValueWithSchema(value, schema, -1, []);
    expect(result2).toEqual({
      extraField: 'extra',
    });
  });

  it('should not filter properties fields by oneOf', () => {
    const schema = {
      type: 'object',
      oneOf: [
        {
          properties: {
            type: { type: 'string', const: 'person' },
            name: { type: 'string' },
          },
        },
      ],
      properties: {
        address: { type: 'string' },
        age: { type: 'number' },
      },
    } satisfies JsonSchema;

    const value = {
      type: 'person',
      name: 'John',
      address: 'Seoul',
      age: 30,
      extraField: 'extra',
    };

    // oneOfIndex=0이면 oneOf[0]에 정의된 필드와 properties에 정의된 필드가 유지되어야 함
    const result = getObjectValueWithSchema(value, schema, 0, []);
    expect(result).toEqual({
      type: 'person',
      name: 'John',
      address: 'Seoul',
      age: 30,
      extraField: 'extra', // 스키마에 정의되지 않은 필드도 유지됨
    });
  });

  // 3. conditions 테스트
  it('should filter fields based on conditions', () => {
    const schema = {
      type: 'object',
      properties: {
        type: { type: 'string' },
        name: { type: 'string' },
        age: { type: 'number' },
        address: { type: 'string' },
      },
    } satisfies JsonSchema;

    const value = {
      type: 'person',
      name: 'John',
      age: 30,
      address: 'Seoul',
    };

    const conditions = [
      {
        condition: { type: 'person' },
        required: ['name', 'age'],
        inverse: false,
      },
    ];

    // conditions에 의해 name과 age만 필수로 지정됨
    const result = getObjectValueWithSchema(
      value,
      schema,
      undefined,
      conditions,
    );
    expect(result).toEqual({ type: 'person', name: 'John', age: 30 });
  });

  it('should not filter when conditions is empty', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    } satisfies JsonSchema;

    const value = { name: 'John', age: 30 };
    expect(getObjectValueWithSchema(value, schema, undefined, [])).toEqual(
      value,
    );
  });

  // 4. oneOf와 conditions 조합 테스트
  it('should combine oneOf and conditions with AND logic', () => {
    const schema = {
      type: 'object',
      oneOf: [
        {
          properties: {
            type: { type: 'string', const: 'person' },
            name: { type: 'string' },
            age: { type: 'number' },
          },
        },
        {
          properties: {
            type: { type: 'string', const: 'company' },
            companyName: { type: 'string' },
            employees: { type: 'number' },
          },
        },
      ],
      properties: {
        address: { type: 'string' },
        country: { type: 'string' },
      },
    } satisfies JsonSchema;

    const value = {
      type: 'person',
      name: 'John',
      age: 30,
      companyName: 'ABC Corp',
      address: 'Seoul',
      country: 'Korea',
    };

    const conditions = [
      {
        condition: { type: 'person' },
        required: ['name', 'address'],
        inverse: false,
      },
    ];

    // oneOf[0]와 conditions 모두 만족하는 필드만 유지
    // - oneOf[0]에 있는 필드: type, name, age
    // - conditions에 의해 필수로 지정된 필드: name, address
    // - properties에 있는 필드: address, country (conditions만 만족하면 됨)
    // 결과: name(oneOf+conditions), address(properties+conditions)
    const result = getObjectValueWithSchema(value, schema, 0, conditions);
    expect(result).toEqual({
      type: 'person',
      name: 'John',
      address: 'Seoul',
    });
  });

  it('should handle complex conditions with inverse logic', () => {
    const schema = {
      type: 'object',
      properties: {
        type: { type: 'string' },
        name: { type: 'string' },
        age: { type: 'number' },
        address: { type: 'string' },
        country: { type: 'string' },
      },
    } satisfies JsonSchema;

    const value = {
      type: 'person',
      name: 'John',
      age: 30,
      address: 'Seoul',
      country: 'Korea',
    };

    const conditions = [
      {
        condition: { type: 'person' },
        required: ['name', 'age'],
      },
      {
        condition: { age: 30 },
        required: 'address',
      },
      {
        condition: { country: 'Japan' },
        required: 'name',
        inverse: true, // 반전 조건: country가 Japan이 아닐 때 name이 필수
      },
    ] as any;

    // 복합 조건 결과: name, age, address
    const result = getObjectValueWithSchema(
      value,
      schema,
      undefined,
      conditions,
    );
    expect(result).toEqual({
      age: 30,
      country: 'Korea',
      name: 'John',
      type: 'person',
    });
  });

  // 5. 특별 케이스
  it('should preserve non-schema fields', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    } satisfies JsonSchema;

    const value = {
      name: 'John',
      age: 30, // 스키마에 정의되지 않은 필드
      extra: 'data', // 스키마에 정의되지 않은 필드
    };

    expect(getObjectValueWithSchema(value, schema, undefined, [])).toEqual(
      value,
    );
  });

  it('should handle schema without properties', () => {
    const schema = {
      type: 'object',
      oneOf: [
        {
          properties: {
            type: { type: 'string' },
            name: { type: 'string' },
          },
        },
      ],
    } satisfies JsonSchema;

    const value = {
      type: 'person',
      name: 'John',
      extra: 'data',
    };

    const result = getObjectValueWithSchema(value, schema, 0, []);
    expect(result).toEqual({
      type: 'person',
      name: 'John',
      extra: 'data',
    });
  });

  it('should handle empty schema', () => {
    const schema = { type: 'object' } satisfies JsonSchema;
    const value = { name: 'John', age: 30 };

    expect(getObjectValueWithSchema(value, schema, undefined, [])).toEqual(
      value,
    );
  });
});

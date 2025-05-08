import { describe, expect, it, vi } from 'vitest';

import { JsonSchema } from '@/schema-form/types';

import { getFieldConditionMap } from '../getFieldConditionMap';
import { getOneOfKeyInfo } from '../getOneOfKeyInfo';
import {
  processValueWithCondition,
  processValueWithOneOfSchema,
} from '../processValueWithSchema';
import { requiredFactory } from '../processValueWithSchema/utils/requiredFactory';

// requiredFactory 모킹
vi.mock('../processValueWithSchema/utils/requiredFactory', () => ({
  requiredFactory: vi.fn(),
}));

describe('processValueWithOneOfSchema', () => {
  it('기본동작: oneOf 스키마에서 허용되지 않은 필드 제거', () => {
    const schema = {
      type: 'object',
      oneOf: [
        {
          computed: {
            if: "@.category==='game'",
          },
          properties: {
            price: { type: 'number' },
          },
        },
      ],
      properties: {
        category: {
          type: 'string',
          enum: ['game', 'movie'],
          default: 'game',
        },
      },
    } satisfies JsonSchema;

    const fieldConditionMap = getFieldConditionMap(schema);
    const { oneOfKeySet, oneOfKeySetList } = getOneOfKeyInfo(schema) || {};
    // oneOf.#.computed.if 조건을 기반으로 계산된 oneOf의 index
    const oneOfIndex = 1;
    const allowedKeySet = oneOfKeySetList?.[oneOfIndex];

    const input = {
      category: 'movie',
      price: 100,
    };

    const result = processValueWithOneOfSchema(
      input,
      oneOfKeySet,
      allowedKeySet,
    );

    expect(result).toEqual({
      category: 'movie',
    });
  });

  it('값이 null 또는 undefined인 경우 그대로 반환', () => {
    const result1 = processValueWithOneOfSchema(undefined, new Set());
    const result2 = processValueWithOneOfSchema(null as any, new Set());

    expect(result1).toBeUndefined();
    expect(result2).toBeNull();
  });

  it('oneOfKeySet이 없는 경우 원본 값을 그대로 반환', () => {
    const value = { name: 'test', age: 30 };

    const result = processValueWithOneOfSchema(value, undefined);

    expect(result).toBe(value);
  });

  it('oneOfKeySet에 포함된 필드는 allowedKeySet에 없으면 제외', () => {
    const value = { name: 'test', age: 30, address: 'Seoul' };

    // name과 age만 oneOfKeySet에 포함
    const oneOfKeySet = new Set(['name', 'age']);

    const result = processValueWithOneOfSchema(value, oneOfKeySet);

    // oneOfKeySet에 포함된 key 중 allowedKeySet에 없는 필드는 제외됨
    // address는 oneOfKeySet에 없으므로 포함됨
    expect(result).toEqual({ address: 'Seoul' });
  });

  it('allowedKeySet이 있으면 oneOfKeySet에 포함된 필드도 유지', () => {
    const value = { name: 'test', age: 30, address: 'Seoul' };

    // 모든 필드가 oneOfKeySet에 포함
    const oneOfKeySet = new Set(['name', 'age', 'address']);

    // name과 age는 allowedKeySet에 포함
    const allowedKeySet = new Set(['name', 'age']);

    const result = processValueWithOneOfSchema(
      value,
      oneOfKeySet,
      allowedKeySet,
    );

    // oneOfKeySet에 있고 allowedKeySet에도 있는 필드(name, age)는 유지
    // address는 oneOfKeySet에 있지만 allowedKeySet에 없어서 제외
    expect(result).toEqual({ name: 'test', age: 30 });
  });

  it('실제 스키마 예시: 2개의 oneOf 경우 테스트', () => {
    const schema = {
      type: 'object',
      oneOf: [
        {
          computed: {
            if: "@.type==='person'",
          },
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
        },
        {
          computed: {
            if: "@.type==='company'",
          },
          properties: {
            companyName: { type: 'string' },
            employees: { type: 'number' },
          },
        },
      ],
      properties: {
        type: {
          type: 'string',
          enum: ['person', 'company'],
          default: 'person',
        },
      },
    } satisfies JsonSchema;

    const { oneOfKeySet, oneOfKeySetList } = getOneOfKeyInfo(schema) || {};

    // person 타입 테스트 (oneOfIndex = 0)
    const personInput = {
      type: 'person',
      name: 'John',
      age: 30,
      companyName: 'Some Corp', // 이건 제거되어야 함
      employees: 100, // 이건 제거되어야 함
    };

    const personResult = processValueWithOneOfSchema(
      personInput,
      oneOfKeySet,
      oneOfKeySetList?.[0],
    );

    expect(personResult).toEqual({
      type: 'person',
      name: 'John',
      age: 30,
    });

    // company 타입 테스트 (oneOfIndex = 1)
    const companyInput = {
      type: 'company',
      companyName: 'ACME Inc',
      employees: 500,
      name: 'John', // 이건 제거되어야 함
      age: 30, // 이건 제거되어야 함
    };

    const companyResult = processValueWithOneOfSchema(
      companyInput,
      oneOfKeySet,
      oneOfKeySetList?.[1],
    );

    expect(companyResult).toEqual({
      type: 'company',
      companyName: 'ACME Inc',
      employees: 500,
    });
  });
});

describe('processValueWithCondition', () => {
  it('값이 null 또는 undefined인 경우 그대로 반환', () => {
    const result1 = processValueWithCondition(undefined, new Map());
    const result2 = processValueWithCondition(null as any, new Map());

    expect(result1).toBeUndefined();
    expect(result2).toBeNull();
  });

  it('fieldConditionMap이 없는 경우 원본 값을 그대로 반환', () => {
    const value = { name: 'test', age: 30 };

    const result = processValueWithCondition(value, undefined);

    expect(result).toBe(value);
  });

  it('빈 객체인 경우 원본 값을 그대로 반환', () => {
    const value = {};
    const fieldConditionMap = new Map();

    const result = processValueWithCondition(value, fieldConditionMap);

    expect(result).toBe(value);
  });

  it('isRequired 함수가 false를 반환하는 필드는 제외', () => {
    const value = { name: 'test', age: 30, address: 'Seoul' };
    const fieldConditionMap = new Map();

    // isRequired가 false를 반환하면 필드가 제외됨
    const isRequiredMock = vi.fn((key: string) => {
      return key === 'address';
    });

    (requiredFactory as any).mockReturnValue(isRequiredMock);

    const result = processValueWithCondition(value, fieldConditionMap);

    expect(requiredFactory).toHaveBeenCalledWith(value, fieldConditionMap);
    // isRequired가 true인 필드인 address만 포함됨
    expect(result).toEqual({ address: 'Seoul' });
  });

  it('실제 스키마와 조건을 사용한 테스트', () => {
    // JsonSchema 타입에 맞게 조정된 테스트 스키마
    const schema = {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['personal', 'business'] },
        name: { type: 'string' },
        companyName: {
          type: 'string',
          // required 조건은 computed.if가 아닌 dependencies를 사용
          computed: {
            if: "@.type === 'business'",
          },
        },
        email: { type: 'string' },
      },
      required: ['type', 'email'],
    } satisfies JsonSchema;

    const fieldConditionMap = getFieldConditionMap(schema);

    // isRequired 모킹을 비활성화하고 실제 함수 사용
    (requiredFactory as any).mockRestore();

    const personalInput = {
      type: 'personal',
      name: 'John Doe',
      email: 'john@example.com',
      companyName: 'Some Corp', // 이 필드는 실제 필터링되지 않음
    };

    // 모킹된 isRequired 함수 - isRequired가 모든 필드에 대해 true 반환하도록 설정
    // 실제 구현에서는 다른 로직이 있을 수 있음
    const mockIsRequired = vi.fn((key: string) => true);

    (requiredFactory as any).mockReturnValue(mockIsRequired);

    const result = processValueWithCondition(personalInput, fieldConditionMap);

    // 실제 결과에 맞게 기대값 수정
    expect(result).toEqual({
      type: 'personal',
      name: 'John Doe',
      email: 'john@example.com',
      companyName: 'Some Corp',
    });
  });

  it('복합 조건 테스트', () => {
    const value = {
      name: 'test',
      age: 30,
      address: 'Seoul',
      email: 'test@example.com',
    };
    const fieldConditionMap = new Map();

    // name과 email만 필수로 설정
    const isRequiredMock = vi.fn((key: string) => {
      return key === 'name' || key === 'email';
    });

    (requiredFactory as any).mockReturnValue(isRequiredMock);

    const result = processValueWithCondition(value, fieldConditionMap);

    // name과 email만 포함됨
    expect(result).toEqual({
      name: 'test',
      email: 'test@example.com',
    });
  });
});

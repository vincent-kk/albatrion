import { describe, expect, it, vi } from 'vitest';

import { JsonSchema } from '@/schema-form/types';

import { getFieldConditionMap } from '../getFieldConditionMap';
import { getOneOfKeyInfo } from '../getOneOfKeyInfo';
import { getValueWithSchema } from '../getValueWithSchema/getValueWithSchema';
import { requiredFactory } from '../getValueWithSchema/utils/requiredFactory';

// requiredFactory 모킹
vi.mock('../getValueWithSchema/utils/requiredFactory', () => ({
  requiredFactory: vi.fn(),
}));

describe('getValueWithSchema', () => {
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

    const result = getValueWithSchema(
      input,
      fieldConditionMap,
      oneOfKeySet,
      allowedKeySet,
    );

    expect(result).toEqual({
      category: 'movie',
    });
  });

  it('값이 null 또는 undefined인 경우 그대로 반환', () => {
    const result1 = getValueWithSchema(undefined, new Map());
    const result2 = getValueWithSchema(null as any, new Map());

    expect(result1).toBeUndefined();
    expect(result2).toBeNull();
  });

  it('fieldConditionMap과 oneOfKeySet이 모두 없는 경우 원본 값을 그대로 반환', () => {
    const value = { name: 'test', age: 30 };

    const result = getValueWithSchema(value, undefined, undefined);

    expect(result).toBe(value);
  });

  it('빈 객체인 경우 원본 값을 그대로 반환', () => {
    const value = {};
    const fieldConditionMap = new Map();

    const result = getValueWithSchema(value, fieldConditionMap);

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

    const result = getValueWithSchema(value, fieldConditionMap);

    expect(requiredFactory).toHaveBeenCalledWith(value, fieldConditionMap);
    // isRequired가 true인 필드인 address만 포함됨
    expect(result).toEqual({ address: 'Seoul' });
  });

  it('oneOfKeySet에 포함된 필드는 allowedKeySet에 없으면 제외', () => {
    const value = { name: 'test', age: 30, address: 'Seoul' };

    // isRequired 모킹 비활성화
    (requiredFactory as any).mockReturnValue(null);

    // name과 age만 oneOfKeySet에 포함
    const oneOfKeySet = new Set(['name', 'age']);

    const result = getValueWithSchema(value, undefined, oneOfKeySet);

    // oneOfKeySet에 포함된 key 중 allowedKeySet에 없는 필드는 제외됨
    // address는 oneOfKeySet에 없으므로 포함됨
    expect(result).toEqual({ address: 'Seoul' });
  });

  it('allowedKeySet이 있으면 oneOfKeySet에 포함된 필드도 유지', () => {
    const value = { name: 'test', age: 30, address: 'Seoul' };

    // isRequired 모킹 비활성화
    (requiredFactory as any).mockReturnValue(null);

    // 모든 필드가 oneOfKeySet에 포함
    const oneOfKeySet = new Set(['name', 'age', 'address']);

    // name과 age는 allowedKeySet에 포함
    const allowedKeySet = new Set(['name', 'age']);

    const result = getValueWithSchema(
      value,
      undefined,
      oneOfKeySet,
      allowedKeySet,
    );

    // oneOfKeySet에 있고 allowedKeySet에도 있는 필드(name, age)는 유지
    // address는 oneOfKeySet에 있지만 allowedKeySet에 없어서 제외
    expect(result).toEqual({ name: 'test', age: 30 });
  });

  it('복합 조건: isRequired와 oneOfKeySet 모두 적용', () => {
    const value = {
      name: 'test',
      age: 30,
      address: 'Seoul',
      email: 'test@example.com',
    };
    const fieldConditionMap = new Map();

    // name과 address만 필수
    const isRequiredMock = vi.fn((key: string) => {
      return key === 'name' || key === 'address';
    });

    (requiredFactory as any).mockReturnValue(isRequiredMock);

    // address와 email만 oneOfKeySet에 포함
    const oneOfKeySet = new Set(['address', 'email']);

    const result = getValueWithSchema(value, fieldConditionMap, oneOfKeySet);

    // 1. name은 isRequired가 true지만 oneOfKeySet에 없어서 포함
    // 2. age는 isRequired가 false라서 제외
    // 3. address는 oneOfKeySet에 있고 allowedKeySet이 없어서 제외
    // 4. email은 oneOfKeySet에 있고 allowedKeySet이 없어서 제외
    expect(result).toEqual({ name: 'test' });
  });

  it('복합 조건: isRequired, oneOfKeySet, allowedKeySet 모두 적용', () => {
    const value = {
      name: 'test',
      age: 30,
      address: 'Seoul',
      email: 'test@example.com',
    };
    const fieldConditionMap = new Map();

    // address와 email만 필수로 설정
    const isRequiredMock = vi.fn((key: string) => {
      return key === 'address' || key === 'email';
    });

    (requiredFactory as any).mockReturnValue(isRequiredMock);

    // 모든 필드가 oneOfKeySet에 포함
    const oneOfKeySet = new Set(['name', 'age', 'address', 'email']);

    // email과 age는 allowedKeySet에 포함됨
    const allowedKeySet = new Set(['email', 'age']);

    const result = getValueWithSchema(
      value,
      fieldConditionMap,
      oneOfKeySet,
      allowedKeySet,
    );

    // 실제 함수 동작 기준:
    // 1. name은 isRequired가 false라서 제외
    // 2. age는 isRequired가 false라서 제외 (allowedKeySet에 있어도 isRequired가 false면 제외)
    // 3. address는 isRequired가 true지만 oneOfKeySet에 있고 allowedKeySet에 없어서 제외
    // 4. email은 isRequired가 true이고 allowedKeySet에 있어서 포함
    expect(result).toEqual({ email: 'test@example.com' });
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

    // fieldConditionMap이 있어야 바르게 동작함
    const fieldConditionMap = getFieldConditionMap(schema);
    const { oneOfKeySet, oneOfKeySetList } = getOneOfKeyInfo(schema) || {};

    // isRequired 모킹을 비활성화하고 실제 함수 사용
    (requiredFactory as any).mockRestore();

    // person 타입 테스트 (oneOfIndex = 0)
    const personInput = {
      type: 'person',
      name: 'John',
      age: 30,
      companyName: 'Some Corp', // 이건 제거되어야 함
      employees: 100, // 이건 제거되어야 함
    };

    // oneOfKeySet과 allowedKeySet이 모두 필요함
    // 실제 함수 동작에서는 아래 항목들이 유지되어야 함
    // - type: oneOfKeySet에 없어서 유지
    // - name과 age: oneOfKeySet에 있지만 allowedKeySet에 있어서 유지
    // - companyName과 employees: oneOfKeySet에 있고 allowedKeySet에 없어서 제외
    const personResult = getValueWithSchema(
      personInput,
      fieldConditionMap,
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

    const companyResult = getValueWithSchema(
      companyInput,
      fieldConditionMap,
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

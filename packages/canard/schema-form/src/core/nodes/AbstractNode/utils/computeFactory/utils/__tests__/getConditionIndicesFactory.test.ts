import { describe, expect, it } from 'vitest';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { getConditionIndicesFactory } from '../getConditionIndexFactory/getConditionIndicesFactory';
import { getPathManager } from '../getPathManager';

describe('getConditionIndicesFactory', () => {
  it('유효하지 않은 스키마에 대해 undefined를 반환해야 함', () => {
    const pathManager = getPathManager();

    // type이 object가 아닌 경우
    const schema1 = { type: 'string' } as JsonSchemaWithVirtual;
    expect(
      getConditionIndicesFactory('string', schema1)(pathManager, 'oneOf', 'if'),
    ).toBeUndefined();

    // oneOf가 배열이 아닌 경우
    const schema2 = {
      type: 'object',
      oneOf: 'invalid',
    } as unknown as JsonSchemaWithVirtual;
    expect(
      getConditionIndicesFactory('object', schema2)(pathManager, 'oneOf', 'if'),
    ).toBeUndefined();

    // oneOf가 없는 경우
    const schema3 = { type: 'object' } as JsonSchemaWithVirtual;
    expect(
      getConditionIndicesFactory('object', schema3)(pathManager, 'oneOf', 'if'),
    ).toBeUndefined();
  });

  it('유효한 표현식이 없는 경우 undefined를 반환해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [{}, { computed: {} }, { computed: { if: false } }],
    } as unknown as JsonSchemaWithVirtual;

    expect(
      getConditionIndicesFactory(schema.type as any, schema)(
        pathManager,
        'oneOf',
        'if',
      ),
    ).toBeUndefined();
  });

  it('단일 조건 매칭 시 해당 인덱스를 배열로 반환해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { computed: { if: '/value === "option1"' } },
        { computed: { if: '/value === "option2"' } },
        { computed: { if: '/value === "option3"' } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(pathManager.get()).toContain('/value');
    expect(result).toBeDefined();

    // 각 옵션에 대한 결과 확인 - 단일 인덱스를 배열로 반환
    expect(result!(['option1'])).toEqual([0]);
    expect(result!(['option2'])).toEqual([1]);
    expect(result!(['option3'])).toEqual([2]);
    expect(result!(['other'])).toEqual([]); // 매칭 없으면 빈 배열
  });

  it('여러 조건이 매칭될 때 모든 인덱스를 배열로 반환해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      anyOf: [
        { computed: { if: '../value === "match"' } },
        { computed: { if: '../count > 10' } },
        { computed: { if: '../value === "match"' } },
        { computed: { if: '../count > 5' } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'anyOf',
      'if',
    );

    expect(pathManager.get()).toContain('../value');
    expect(pathManager.get()).toContain('../count');
    expect(result).toBeDefined();

    // value가 "match"이고 count가 15인 경우 - 모든 조건이 매칭
    expect(result!(['match', 15])).toEqual([0, 1, 2, 3]);

    // value가 "match"이고 count가 7인 경우 - 일부 조건만 매칭
    expect(result!(['match', 7])).toEqual([0, 2, 3]);

    // value가 "other"이고 count가 15인 경우
    expect(result!(['other', 15])).toEqual([1, 3]);

    // 아무 조건도 충족하지 않는 경우
    expect(result!(['other', 3])).toEqual([]);
  });

  it('다양한 종류의 조건을 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      allOf: [
        { '&if': '/type === "string" && /length > 0' },
        { computed: { if: '/age >= 18' } },
        { computed: { if: '(/value).includes("test")' } },
        { '&if': '/type === "string" || /age >= 21' },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'allOf',
      'if',
    );

    expect(pathManager.get()).toContain('/type');
    expect(pathManager.get()).toContain('/length');
    expect(pathManager.get()).toContain('/age');
    expect(pathManager.get()).toContain('/value');
    expect(result).toBeDefined();

    // 여러 조건이 동시에 만족하는 경우
    expect(result!(['string', 5, 20, 'test123'])).toEqual([0, 1, 2, 3]);

    // 일부 조건만 만족하는 경우
    expect(result!(['number', 0, 20, 'test'])).toEqual([1, 2]);

    // 특정 조건만 만족하는 경우
    expect(result!(['number', 0, 10, 'abc'])).toEqual([]);
  });

  it('동일한 필드에 대한 여러 조건을 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      anyOf: [
        { type: 'object', computed: { if: '/age < 18' } },
        { type: 'object', computed: { if: '#/age >= 18 && #/age < 65' } },
        { type: 'object', computed: { if: '/age >= 65' } },
        { type: 'object', computed: { if: '/age > 0' } }, // 대부분의 경우 매칭
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'anyOf',
      'if',
    );

    expect(pathManager.get()).toContain('/age');
    expect(result).toBeDefined();

    expect(result!([10])).toEqual([0, 3]); // 미성년자, age > 0
    expect(result!([30])).toEqual([1, 3]); // 성인, age > 0
    expect(result!([70])).toEqual([2, 3]); // 노인, age > 0
    expect(result!([-5])).toEqual([0]);
  });

  it('boolean 타입 조건을 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: false } },
        { type: 'object', computed: { if: true } },
        { type: 'object', computed: { if: '/value === "option"' } },
        { type: 'object', computed: { if: true } }, // 또 다른 true
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(result).toBeDefined();
    // true 조건들(인덱스 1, 3)은 항상 매칭됨
    expect(result!(['anything'])).toEqual([1, 3]);
    // value가 'option'일 때는 추가로 인덱스 2도 매칭
    expect(result!(['option'])).toEqual([1, 2, 3]);
  });

  it('조건이 false와 표현식 혼합인 경우 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: false } },
        { type: 'object', computed: { if: '#/value === "test"' } },
        { type: 'object', computed: { if: false } },
        { type: 'object', computed: { if: '#/value === "test"' } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(result).toBeDefined();
    expect(result!(['test'])).toEqual([1, 3]); // 동일한 조건 중복
    expect(result!(['not-match'])).toEqual([]);
  });

  it('빈 배열을 반환하는 경우를 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: '#/value === "a"' } },
        { type: 'object', computed: { if: '#/value === "b"' } },
        { type: 'object', computed: { if: '#/value === "c"' } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(result).toBeDefined();
    // 매칭되지 않는 값은 빈 배열 반환
    expect(result!(['d'])).toEqual([]);
    expect(result!([''])).toEqual([]);
    expect(result!([null])).toEqual([]);
    expect(result!([undefined])).toEqual([]);
  });

  it('순서를 유지하면서 인덱스를 반환해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      anyOf: [
        { computed: { if: './value >= 0' } }, // 인덱스 0
        { computed: { if: './value >= 10' } }, // 인덱스 1
        { computed: { if: './value >= 20' } }, // 인덱스 2
        { computed: { if: './value >= 30' } }, // 인덱스 3
        { computed: { if: './value >= 40' } }, // 인덱스 4
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'anyOf',
      'if',
    );

    expect(result).toBeDefined();
    // 값이 클수록 더 많은 조건을 만족
    expect(result!([5])).toEqual([0]);
    expect(result!([15])).toEqual([0, 1]);
    expect(result!([25])).toEqual([0, 1, 2]);
    expect(result!([35])).toEqual([0, 1, 2, 3]);
    expect(result!([45])).toEqual([0, 1, 2, 3, 4]);
    expect(result!([-5])).toEqual([]);
  });

  it('JsonSchemaError를 적절히 발생시켜야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        {
          computed: {
            if: 'invalid javascript @#$%',
          },
        },
      ],
    } as unknown as JsonSchemaWithVirtual;

    expect(() => {
      getConditionIndicesFactory(schema.type as any, schema)(
        pathManager,
        'oneOf',
        'if',
      );
    }).toThrow('Failed to create dynamic function');
  });

  it('null 및 undefined 표현식을 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: null } },
        { type: 'object', computed: { if: '#/value === "valid"' } },
        { type: 'object', '&if': undefined },
        { type: 'object', computed: { if: '#/value === "valid"' } }, // 중복
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(pathManager.get()).toContain('/value');
    expect(result).toBeDefined();

    expect(result!(['valid'])).toEqual([1, 3]); // 유효한 조건만 매칭
    expect(result!(['invalid'])).toEqual([]);
  });

  it('세미콜론이 포함된 표현식을 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: '/value === "option1";' } },
        { type: 'object', computed: { if: '/value === "option2";' } },
      ],
    } as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(result!(['option1'])).toEqual([0]);
    expect(result!(['option2'])).toEqual([1]);
    expect(result!(['option3'])).toEqual([]);
  });

  it('&if 속성도 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', '&if': false },
        { type: 'object', '&if': true },
        { type: 'object', '&if': '/value === "option"' },
        { type: 'object', '&if': true }, // 중복된 true
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(result).toBeDefined();
    // true 조건들(인덱스 1, 3)은 항상 매칭
    expect(result!(['anything'])).toEqual([1, 3]);
    // value가 'option'일 때는 인덱스 2도 추가
    expect(result!(['option'])).toEqual([1, 2, 3]);
  });

  it('computed.if와 &if를 혼합해서 사용할 때 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: true } },
        { type: 'object', '&if': true },
        { type: 'object', computed: { if: '/value === "test"' } },
        { type: 'object', '&if': '/value === "option"' },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(result).toBeDefined();
    // 기본적으로 true 조건들이 매칭
    expect(result!(['anything'])).toEqual([0, 1]);
    // value가 'test'일 때
    expect(result!(['test'])).toEqual([0, 1, 2]);
    // value가 'option'일 때
    expect(result!(['option'])).toEqual([0, 1, 3]);
  });

  it('빈 문자열 표현식을 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: '' } },
        { type: 'object', '&if': '' },
        { type: 'object', computed: { if: true } },
        { type: 'object', computed: { if: '/value === "test"' } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(result).toBeDefined();
    // 빈 문자열은 무시되고, true와 유효한 표현식만 평가
    expect(result!(['anything'])).toEqual([2]);
    expect(result!(['test'])).toEqual([2, 3]);
  });
});

describe('getConditionIndicesFactory with different fields', () => {
  it('allOf 필드와 함께 작동해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      allOf: [
        { computed: { if: './flag === true' } },
        { computed: { if: './count > 0' } },
        { computed: { if: './flag === true' } }, // 중복된 조건
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'allOf',
      'if',
    );

    expect(result).toBeDefined();
    expect(result!([true, 5])).toEqual([0, 1, 2]);
    expect(result!([true, -1])).toEqual([0, 2]);
    expect(result!([false, 5])).toEqual([1]);
    expect(result!([false, -1])).toEqual([]);
  });

  it('anyOf 필드와 함께 작동해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      anyOf: [
        { computed: { if: './type === "A"' } },
        { computed: { if: './type === "B"' } },
        { computed: { if: './type === "A"' } }, // A 타입 중복
        { computed: { if: './type === "C"' } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'anyOf',
      'if',
    );

    expect(result).toBeDefined();
    expect(result!(['A'])).toEqual([0, 2]); // A 타입은 두 개
    expect(result!(['B'])).toEqual([1]);
    expect(result!(['C'])).toEqual([3]);
    expect(result!(['D'])).toEqual([]);
  });
});

describe('getConditionIndicesFactory with properties const/enum conditions', () => {
  it('properties의 const 값이 조건에 자동으로 포함되어야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        {
          '&if': './status === "active"',
          properties: {
            type: { const: 'premium' },
            plan: { type: 'string' },
          },
        },
        {
          '&if': './status === "active"',
          properties: {
            type: { const: 'basic' },
            plan: { type: 'string' },
          },
        },
        {
          properties: {
            type: { const: 'free' },
            description: { type: 'string' },
          },
        },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // status가 active이고 type이 premium일 때 첫 번째 스키마 선택
    expect(result!(['active', 'premium'])).toEqual([0]);
    // status가 active이고 type이 basic일 때 두 번째 스키마 선택
    expect(result!(['active', 'basic'])).toEqual([1]);
    // status가 무엇이든 type이 free일 때 세 번째 스키마 선택
    expect(result!(['inactive', 'free'])).toEqual([2]);
    expect(result!(['active', 'free'])).toEqual([2]);
    // 매칭되지 않는 경우
    expect(result!(['inactive', 'premium'])).toEqual([]);
    expect(result!(['active', 'standard'])).toEqual([]);

    expect(pathManager.get()).toContain('./status');
    expect(pathManager.get()).toContain('./type');
  });

  it('properties의 enum 값이 조건에 자동으로 포함되어야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        {
          computed: { if: './enabled === true' },
          properties: {
            role: { enum: ['admin', 'moderator'] },
            permissions: { type: 'array' },
          },
        },
        {
          computed: { if: './enabled === true' },
          properties: {
            role: { enum: ['user'] },
            settings: { type: 'object' },
          },
        },
        {
          properties: {
            role: { enum: ['guest'] },
            access: { type: 'string' },
          },
        },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // enabled가 true이고 role이 admin 또는 moderator일 때
    expect(result!([true, 'admin'])).toEqual([0]);
    expect(result!([true, 'moderator'])).toEqual([0]);
    // enabled가 true이고 role이 user일 때
    expect(result!([true, 'user'])).toEqual([1]);
    // role이 guest일 때 (enabled 무관)
    expect(result!([false, 'guest'])).toEqual([2]);
    expect(result!([true, 'guest'])).toEqual([2]);
    // 매칭되지 않는 경우
    expect(result!([false, 'admin'])).toEqual([]);
    expect(result!([false, 'user'])).toEqual([]);
    expect(result!([true, 'other'])).toEqual([]);

    expect(pathManager.get()).toContain('./enabled');
    expect(pathManager.get()).toContain('./role');
  });

  it('조건 없이 properties의 const/enum만으로 조건을 생성해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        {
          properties: {
            category: { const: 'electronics' },
            brand: { const: 'apple' },
            products: { type: 'array' },
          },
        },
        {
          properties: {
            category: { const: 'electronics' },
            brand: { const: 'samsung' },
            products: { type: 'array' },
          },
        },
        {
          properties: {
            category: { const: 'clothing' },
            size: { enum: ['S', 'M', 'L'] },
            items: { type: 'array' },
          },
        },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // electronics + apple
    expect(result!(['electronics', 'apple'])).toEqual([0]);
    // electronics + samsung
    expect(result!(['electronics', 'samsung'])).toEqual([1]);
    // clothing + size
    expect(result!(['clothing', undefined, 'M'])).toEqual([2]);
    expect(result!(['clothing', undefined, 'L'])).toEqual([2]);
    // 매칭되지 않는 경우
    expect(result!(['electronics', 'sony'])).toEqual([]);
    expect(result!(['furniture', undefined, undefined])).toEqual([]);

    expect(pathManager.get()).toContain('./category');
    expect(pathManager.get()).toContain('./brand');
    expect(pathManager.get()).toContain('./size');
  });

  it('boolean const 값을 포함한 복합 조건을 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        {
          '&if': './mode === "advanced"',
          properties: {
            isEnabled: { const: true },
            isPublic: { const: false },
            settings: { type: 'object' },
          },
        },
        {
          '&if': './mode === "basic"',
          properties: {
            isEnabled: { const: true },
            configuration: { type: 'object' },
          },
        },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // mode가 advanced이고 isEnabled=true, isPublic=false일 때
    expect(result!(['advanced', true, false])).toEqual([0]);
    // mode가 advanced지만 다른 조건이 맞지 않을 때
    expect(result!(['advanced', false, false])).toEqual([]);
    expect(result!(['advanced', true, true])).toEqual([]);
    // mode가 basic이고 isEnabled=true일 때
    expect(result!(['basic', true])).toEqual([1]);
    // mode가 basic이지만 isEnabled가 false일 때
    expect(result!(['basic', false])).toEqual([]);

    expect(pathManager.get()).toContain('./mode');
    expect(pathManager.get()).toContain('./isEnabled');
    expect(pathManager.get()).toContain('./isPublic');
  });

  it('단일 값 enum을 const처럼 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        {
          computed: { if: './version > 2' },
          properties: {
            format: { enum: ['json'] },
            schema: { type: 'object' },
          },
        },
        {
          computed: { if: './version <= 2' },
          properties: {
            format: { enum: ['xml'] },
            schema: { type: 'object' },
          },
        },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // version > 2이고 format이 json일 때
    expect(result!([3, 'json'])).toEqual([0]);
    expect(result!([3, 'xml'])).toEqual([]);
    // version <= 2이고 format이 xml일 때
    expect(result!([2, 'xml'])).toEqual([1]);
    expect(result!([1, 'xml'])).toEqual([1]);
    expect(result!([2, 'json'])).toEqual([]);

    expect(pathManager.get()).toContain('./version');
    expect(pathManager.get()).toContain('./format');
  });

  it('null 값을 포함한 const 조건을 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        {
          '&if': './hasData === true',
          properties: {
            value: { const: null },
            fallback: { type: 'string' },
          },
        },
        {
          '&if': './hasData === false',
          properties: {
            value: { const: 'default' },
            fallback: { type: 'string' },
          },
        },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // hasData가 true이고 value가 null일 때
    expect(result!([true, null])).toEqual([0]);
    expect(result!([true, 'default'])).toEqual([]);
    // hasData가 false이고 value가 'default'일 때
    expect(result!([false, 'default'])).toEqual([1]);
    expect(result!([false, null])).toEqual([]);

    expect(pathManager.get()).toContain('./hasData');
    expect(pathManager.get()).toContain('./value');
  });

  it('type과 $ref가 있는 속성은 무시하고 const/enum만 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        {
          '&if': './level === "pro"',
          properties: {
            // type이 있으므로 무시됨
            name: { type: 'string' },
            // $ref가 있으므로 무시됨
            config: { $ref: '#/definitions/config' },
            // const는 처리됨
            tier: { const: 'gold' },
            // enum은 처리됨
            features: { enum: ['advanced', 'premium'] },
          },
        },
        {
          '&if': './level === "free"',
          properties: {
            tier: { const: 'bronze' },
            features: { enum: ['basic'] },
          },
        },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // level이 pro이고 tier가 gold, features가 advanced 또는 premium일 때
    expect(result!(['pro', 'gold', 'advanced'])).toEqual([0]);
    expect(result!(['pro', 'gold', 'premium'])).toEqual([0]);
    expect(result!(['pro', 'silver', 'advanced'])).toEqual([]);
    // level이 free이고 tier가 bronze, features가 basic일 때
    expect(result!(['free', 'bronze', 'basic'])).toEqual([1]);
    expect(result!(['free', 'bronze', 'advanced'])).toEqual([]);

    expect(pathManager.get()).toContain('./level');
    expect(pathManager.get()).toContain('./tier');
    expect(pathManager.get()).toContain('./features');
  });

  it('빈 enum 배열은 무시해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        {
          '&if': './active === true',
          properties: {
            options: { enum: [] }, // 빈 배열은 무시됨
            status: { const: 'ready' },
          },
        },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // active가 true이고 status가 ready일 때 (options는 무시됨)
    expect(result!([true, 'ready'])).toEqual([0]);
    expect(result!([true, 'notready'])).toEqual([]);
    expect(result!([false, 'ready'])).toEqual([]);

    expect(pathManager.get()).toContain('./active');
    expect(pathManager.get()).toContain('./status');
    expect(pathManager.get()).not.toContain('./options');
  });

  it('mixed type enum 값들을 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        {
          computed: { if: './type === "mixed"' },
          properties: {
            value: { enum: ['text', 123, true, null] },
            data: { type: 'string' },
          },
        },
        {
          computed: { if: './type === "simple"' },
          properties: {
            value: { const: false },
            data: { type: 'string' },
          },
        },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // type이 mixed이고 value가 enum에 포함될 때
    expect(result!(['mixed', 'text'])).toEqual([0]);
    expect(result!(['mixed', 123])).toEqual([0]);
    expect(result!(['mixed', true])).toEqual([0]);
    expect(result!(['mixed', null])).toEqual([0]);
    expect(result!(['mixed', false])).toEqual([]); // false는 enum에 없음
    // type이 simple이고 value가 false일 때
    expect(result!(['simple', false])).toEqual([1]);
    expect(result!(['simple', true])).toEqual([]);

    expect(pathManager.get()).toContain('./type');
    expect(pathManager.get()).toContain('./value');
  });

  it('복잡한 조건과 properties 조건이 AND 연산으로 결합되어야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      anyOf: [
        {
          computed: { if: './enabled === true && ./premium === true' },
          properties: {
            plan: { const: 'pro' },
            features: { enum: ['all', 'unlimited'] },
          },
        },
        {
          computed: { if: './enabled === true' },
          properties: {
            plan: { const: 'basic' },
            features: { enum: ['limited'] },
          },
        },
        {
          computed: { if: './premium === true' },
          properties: {
            plan: { const: 'trial' },
          },
        },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'anyOf',
      'if',
    );
    expect(result).toBeDefined();

    // 모든 조건이 충족될 때
    expect(result!([true, true, 'pro', 'all'])).toEqual([0]);
    expect(result!([true, true, 'pro', 'unlimited'])).toEqual([0]);
    // premium이지만 plan이 trial일 때
    expect(result!([false, true, 'trial'])).toEqual([2]);
    expect(result!([true, true, 'trial'])).toEqual([2]);
    // enabled만 true이고 plan이 basic일 때
    expect(result!([true, false, 'basic', 'limited'])).toEqual([1]);
    // 조건이 맞지만 properties 조건이 안 맞는 경우
    expect(result!([true, true, 'pro', 'limited'])).toEqual([]); // features가 매칭 안 됨
    expect(result!([true, false, 'pro', 'all'])).toEqual([]); // premium이 false

    expect(pathManager.get()).toContain('./enabled');
    expect(pathManager.get()).toContain('./premium');
    expect(pathManager.get()).toContain('./plan');
    expect(pathManager.get()).toContain('./features');
  });

  it('여러 스키마가 동시에 매칭될 수 있는 경우', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      anyOf: [
        {
          properties: {
            type: { enum: ['A', 'B'] },
            status: { const: 'active' },
          },
        },
        {
          properties: {
            type: { enum: ['B', 'C'] },
            status: { const: 'active' },
          },
        },
        {
          properties: {
            type: { const: 'B' },
            status: { enum: ['active', 'pending'] },
          },
        },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndicesFactory(schema.type as any, schema)(
      pathManager,
      'anyOf',
      'if',
    );
    expect(result).toBeDefined();

    // type이 B이고 status가 active일 때 모든 스키마가 매칭
    expect(result!(['B', 'active'])).toEqual([0, 1, 2]);
    // type이 A이고 status가 active일 때 첫 번째만 매칭
    expect(result!(['A', 'active'])).toEqual([0]);
    // type이 C이고 status가 active일 때 두 번째만 매칭
    expect(result!(['C', 'active'])).toEqual([1]);
    // type이 B이고 status가 pending일 때 세 번째만 매칭
    expect(result!(['B', 'pending'])).toEqual([2]);
    // 매칭 안 되는 경우
    expect(result!(['D', 'active'])).toEqual([]);
    expect(result!(['A', 'pending'])).toEqual([]);

    expect(pathManager.get()).toContain('./type');
    expect(pathManager.get()).toContain('./status');
  });
});

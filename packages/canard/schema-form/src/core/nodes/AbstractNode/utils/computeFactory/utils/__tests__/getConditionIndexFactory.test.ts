import { describe, expect, it } from 'vitest';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { getConditionIndexFactory } from '../getConditionIndexFactory';
import { getPathManager } from '../getPathManager';

describe('getConditionIndexFactory', () => {
  it('유효하지 않은 스키마에 대해 undefined를 반환해야 함', () => {
    const pathManager = getPathManager();

    // type이 object가 아닌 경우
    const schema1 = { type: 'string' } as JsonSchemaWithVirtual;
    expect(
      getConditionIndexFactory('string', schema1)(pathManager, 'oneOf', 'if'),
    ).toBeUndefined();

    // oneOf가 배열이 아닌 경우
    const schema2 = {
      type: 'object',
      oneOf: 'invalid',
    } as unknown as JsonSchemaWithVirtual;
    expect(
      getConditionIndexFactory('object', schema2)(pathManager, 'oneOf', 'if'),
    ).toBeUndefined();

    // oneOf가 없는 경우
    const schema3 = { type: 'object' } as JsonSchemaWithVirtual;
    expect(
      getConditionIndexFactory('object', schema3)(pathManager, 'oneOf', 'if'),
    ).toBeUndefined();
  });

  it('유효한 표현식이 없는 경우 undefined를 반환해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [{}, { computed: {} }, { computed: { if: false } }],
    } as unknown as JsonSchemaWithVirtual;

    expect(
      getConditionIndexFactory('object', schema)(pathManager, 'oneOf', 'if'),
    ).toBeUndefined();
  });

  it('단순 동등성 비교에 대해 최적화된 함수를 생성해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { computed: { if: '/value === "option1"' } },
        { computed: { if: '/value === "option2"' } },
        { computed: { if: '/value === "option3"' } },
        { computed: { if: '/value === "option3"' } },
        { computed: { if: '/value === "option2"' } },
        { computed: { if: '/value === "option2"' } },
        { computed: { if: '/value === "option2"' } },
        { computed: { if: '/value === "option3"' } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(pathManager.get()).toContain('/value');
    expect(result).toBeDefined();

    // 각 옵션에 대한 결과 확인
    expect(result!(['option1'])).toBe(0);
    expect(result!(['option2'])).toBe(1);
    expect(result!(['option3'])).toBe(2);
    expect(result!(['other'])).toBe(-1);
  });

  it('복잡한 조건에 대해 일반 평가 함수를 생성해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { computed: { if: '../value === "option1"' } },
        { computed: { if: '../value === "option2"' } },
        { computed: { if: '../count > 10' } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(pathManager.get()).toContain('../value');
    expect(pathManager.get()).toContain('../count');
    expect(result).toBeDefined();

    // 단순 동등성 비교
    expect(result!(['option1', 0])).toBe(0);
    expect(result!(['option2', 0])).toBe(1);

    // 복잡한 조건
    expect(result!(['other', 15])).toBe(2);

    // 아무 조건도 충족하지 않는 경우
    expect(result!(['other', 5])).toBe(-1);
  });

  it('다양한 종류의 조건을 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { '&if': '/type === "string" && /length > 0' },
        { computed: { if: '/age >= 18' } },
        { computed: { if: '(/value).includes("test")' } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(pathManager.get()).toContain('/type');
    expect(pathManager.get()).toContain('/length');
    expect(pathManager.get()).toContain('/age');
    expect(pathManager.get()).toContain('/value');
    expect(result).toBeDefined();

    // 첫 번째 조건
    expect(result!(['string', 5, 0, ''])).toBe(0);

    // 두 번째 조건
    expect(result!(['number', 0, 20, ''])).toBe(1);

    // 세 번째 조건
    expect(result!(['number', 0, 10, 'test123'])).toBe(2);

    // 아무 조건도 충족하지 않는 경우
    expect(result!(['number', 0, 10, 'abc'])).toBe(-1);
  });

  it('동일한 필드에 대한 여러 조건을 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: '/age < 18' } },
        { type: 'object', computed: { if: '#/age >= 18 && #/age < 65' } },
        { type: 'object', computed: { if: '/age >= 65' } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(pathManager.get()).toContain('/age');
    expect(result).toBeDefined();

    expect(result!([10])).toBe(0); // 미성년자
    expect(result!([30])).toBe(1); // 성인
    expect(result!([70])).toBe(2); // 노인
  });

  it('null 및 undefined 표현식을 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: null } },
        { type: 'object', computed: { if: '#/value === "valid"' } },
        { type: 'object', '&if': undefined },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(pathManager.get()).toContain('/value');
    expect(result).toBeDefined();

    expect(result!(['valid'])).toBe(1);
    expect(result!(['invalid'])).toBe(-1);
  });

  it('세미콜론이 포함된 표현식을 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [{ type: 'object', computed: { if: '/value === "option1";' } }],
    } as JsonSchemaWithVirtual;

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(result!(['option1'])).toBe(0);
  });

  it('boolean 타입 조건을 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: false } },
        { type: 'object', computed: { if: true } },
        { type: 'object', computed: { if: '$.value === "option"' } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(result).toBeDefined();
    // true 조건은 항상 매칭되어야 함 (인덱스 1)
    expect(result!(['anything'])).toBe(1);

    // 후속 조건이 있어도 무시
    expect(result!(['option'])).toBe(1);

    // false 조건은 항상 매칭되지 않아야 함
    // 따라서 result!()에서 첫 번째 인덱스(0)를 반환하지 않음
  });

  it('여러 true 조건이 있는 경우 첫 번째 true 조건이 선택되어야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: '#/value === "option"' } },
        { type: 'object', computed: { if: true } },
        { type: 'object', computed: { if: true } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(result).toBeDefined();
    // 구체적인 조건이 우선
    expect(result!(['option'])).toBe(0);

    // 구체적인 조건이 매칭되지 않으면 첫 번째 true 조건이 선택됨
    expect(result!(['not-match'])).toBe(1);
  });

  it('모든 조건이 false인 경우 아무 것도 선택되지 않아야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: false } },
        { type: 'object', computed: { if: false } },
        { type: 'object', computed: { if: false } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    // 유효한 표현식이 없으므로 undefined 반환
    expect(result).toBeUndefined();
  });

  it('조건이 false와 표현식 혼합인 경우 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: false } },
        { type: 'object', computed: { if: '#/value === "test"' } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(result).toBeDefined();
    expect(result!(['test'])).toBe(1);
    expect(result!(['not-match'])).toBe(-1);
  });

  it('&if 속성에서도 boolean 타입을 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', '&if': false },
        { type: 'object', '&if': true },
        { type: 'object', '&if': '/value === "option"' },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(result).toBeDefined();
    // true 조건은 항상 매칭되어야 함 (인덱스 1)
    expect(result!(['anything'])).toBe(1);

    // 후속 조건이 있어도 무시
    expect(result!(['option'])).toBe(1);
  });

  it('computed.if와 &if를 혼합해서 사용할 때 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: true } },
        { type: 'object', '&if': true },
        { type: 'object', computed: { if: '$.value === "test"' } },
        { type: 'object', '&if': '$.value === "option"' },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(result).toBeDefined();
    // 구체적인 조건이 우선
    expect(result!(['test'])).toBe(0);
    expect(result!(['option'])).toBe(0);

    // 구체적인 조건이 없으면 첫 번째 true 조건 (인덱스 0)이 선택됨
    expect(result!(['anything-else'])).toBe(0);
  });

  it('비어있는 표현식을 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: '' } },
        { type: 'object', '&if': '' },
        { type: 'object', computed: { if: true } },
      ],
    } as unknown as JsonSchemaWithVirtual;

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(result).toBeDefined();
    // 빈 문자열은 유효하지 않으므로 무시되고, true 조건(인덱스 2)이 선택됨
    expect(result!(['anything'])).toBe(2);
  });
});

describe('getConditionIndexFactory custom test', () => {
  // 기본 케이스: 단순 동등성 비교 (최적화된 경로)
  it('단순 동등성 비교: 문자열 일치 케이스를 올바르게 처리해야 함', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          '&if': './root/type === "foo"',
          properties: { foo: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': './root/type === "bar"',
          properties: { bar: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': './root/type === "baz"',
          properties: { baz: { type: 'string' } },
        },
      ],
    };

    const pathManager = getPathManager();
    const getOneOfIndex = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(getOneOfIndex).toBeDefined();
    expect(getOneOfIndex!(['foo'])).toBe(0);
    expect(getOneOfIndex!(['bar'])).toBe(1);
    expect(getOneOfIndex!(['baz'])).toBe(2);
    expect(getOneOfIndex!(['unknown'])).toBe(-1);

    // 의존성 경로가 정확히 추출되었는지 확인
    expect(pathManager.get()).toEqual(['./root/type']);
  });

  // 복잡한 조건 케이스 (일반 경로)
  it('복잡한 조건: 논리 연산자를 포함한 조건을 처리해야 함', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          '&if': './root/age > 18 && ./root/type === "adult"',
          properties: { adult: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': './root/age <= 18 || ./root/type === "child"',
          properties: { child: { type: 'string' } },
        },
      ],
    };

    const pathManager = getPathManager();
    const getOneOfIndex = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(getOneOfIndex).toBeDefined();
    expect(getOneOfIndex!([25, 'adult'])).toBe(0);
    expect(getOneOfIndex!([15, 'teen'])).toBe(1);
    expect(getOneOfIndex!([30, 'child'])).toBe(1);

    // 의존성 경로가 정확히 추출되었는지 확인
    expect(pathManager.get()).toContain('./root/age');
    expect(pathManager.get()).toContain('./root/type');
  });

  // oneOf 스키마가 혼합된 형태의 조건을 가진 케이스
  it('혼합된 형태의 조건을 가진 oneOf 스키마를 처리해야 함', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          computed: { if: './root/type === "simple"' },
          properties: { simple: { type: 'string' } },
        },
        {
          type: 'object',
          computed: { if: './root/age > 18 && ./root/role === "admin"' },
          properties: { complex: { type: 'string' } },
        },
        {
          type: 'object',
          // expression 없는 스키마
          properties: { default: { type: 'string' } },
        },
      ],
    };

    const pathManager = getPathManager();
    const getOneOfIndex = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(getOneOfIndex).toBeDefined();
    expect(getOneOfIndex!(['simple', 0, ''])).toBe(0);
    expect(getOneOfIndex!(['other', 20, 'admin'])).toBe(1);
    // 모든 조건이 실패하면 -1 반환
    expect(getOneOfIndex!(['other', 15, 'user'])).toBe(-1);
  });

  // 잘못된 입력 처리 (오류 가능성)
  it('잘못된 스키마 입력을 안전하게 처리해야 함', () => {
    // type이 object가 아닌 경우
    let schema: JsonSchemaWithVirtual = {
      type: 'string',
      oneOf: [],
    };
    let pathManager = getPathManager();
    let getOneOfIndex = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(getOneOfIndex).toBeUndefined();

    // oneOf가 배열이 아닌 경우
    schema = {
      type: 'object',
      oneOf: 'invalid' as any,
    };
    pathManager = getPathManager();
    getOneOfIndex = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(getOneOfIndex).toBeUndefined();

    // oneOf 배열이 비어있는 경우
    schema = {
      type: 'object',
      oneOf: [],
    };
    pathManager = getPathManager();
    getOneOfIndex = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(getOneOfIndex).toBeUndefined();
  });

  // 경계 케이스 (null 값, 빈 표현식 등)
  it('경계 케이스와 비정상적인 값을 처리해야 함', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          '&if': './root/value === null', // null 비교
          properties: { nullable: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': '', // 빈 표현식
          properties: { empty: { type: 'string' } },
        },
        null as any,
        {
          type: 'object',
          '&if': './root/value === undefined', // undefined 비교
          properties: { undefinable: { type: 'string' } },
        },
      ],
    };

    const pathManager = getPathManager();
    const getOneOfIndex = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(getOneOfIndex).toBeDefined();
    // null 값과 undefined 비교
    expect(getOneOfIndex!([null])).toBe(0);
    expect(getOneOfIndex!([undefined])).toBe(3);
  });

  // 정규식 패턴 매칭 테스트
  it('정규식 패턴이 다양한 표현식을 올바르게 매칭해야 함', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          '&if': './root/value === "따옴표가 있는 문자열"',
          properties: { quote: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': './root/value === "123"', // 숫자 문자열
          properties: { number: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': './root/value === "특수문자!@#$%^&*()"', // 특수문자
          properties: { special: { type: 'string' } },
        },
      ],
    };

    const pathManager = getPathManager();
    const getOneOfIndex = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(getOneOfIndex).toBeDefined();
    expect(getOneOfIndex!(['따옴표가 있는 문자열'])).toBe(0);
    expect(getOneOfIndex!(['123'])).toBe(1);
    expect(getOneOfIndex!(['특수문자!@#$%^&*()'])).toBe(2);
  });

  // 중첩 속성 경로 테스트
  it('중첩된 속성 경로를 올바르게 처리해야 함', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          '&if': './root/user/profile/type === "personal"',
          properties: { personal: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': './root/user/profile/type === "business"',
          properties: { business: { type: 'string' } },
        },
      ],
    };

    const pathManager = getPathManager();
    const getOneOfIndex = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(getOneOfIndex).toBeDefined();
    // 중첩 객체에서 값을 정확히 찾아야 함
    const dependencies = ['personal'];
    expect(getOneOfIndex!(dependencies)).toBe(0);

    // 의존성 경로가 정확히 추출되었는지 확인
    expect(pathManager.get()).toContain('./root/user/profile/type');
  });

  // 여러 개의 의존성 경로를 사용하는 케이스
  it('여러 의존성 경로를 사용하는 케이스를 처리해야 함', () => {
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          '&if': './rootPath1 === "value1" && ./rootPath2 === "value2"',
          properties: { both: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': './rootPath1 === "value1" || ./rootPath3 === "value3"',
          properties: { either: { type: 'string' } },
        },
      ],
    };

    const pathManager = getPathManager();

    // 미리 정의된 의존성 경로 배열
    ['./rootPath1', './rootPath2', './rootPath3'].forEach((path) => {
      pathManager.set(path);
    });
    const getOneOfIndex = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );

    expect(getOneOfIndex).toBeDefined();
    // 첫 번째 조건 매칭
    expect(getOneOfIndex!(['value1', 'value2', 'other'])).toBe(0);
    // 두 번째 조건 매칭
    expect(getOneOfIndex!(['value1', 'other', 'other'])).toBe(1);
    expect(getOneOfIndex!(['other', 'other', 'value3'])).toBe(1);
    // 아무 조건도 매칭되지 않음
    expect(getOneOfIndex!(['other', 'other', 'other'])).toBe(-1);
  });
});

describe('getConditionIndexFactory with schema property conditions', () => {
  it('스키마 properties의 const 값과 조건을 결합해야 함', () => {
    const pathManager = getPathManager();
    const schema: JsonSchemaWithVirtual = {
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
      ],
    };

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // status가 active이고 type이 premium일 때만 첫 번째 스키마가 선택됨
    expect(result!(['active', 'premium'])).toBe(0);
    // status가 active이고 type이 basic일 때만 두 번째 스키마가 선택됨
    expect(result!(['active', 'basic'])).toBe(1);
    // status가 active가 아니면 어느 스키마도 선택되지 않음
    expect(result!(['inactive', 'premium'])).toBe(-1);
    expect(result!(['inactive', 'basic'])).toBe(-1);
    // type이 매칭되지 않으면 어느 스키마도 선택되지 않음
    expect(result!(['active', 'standard'])).toBe(-1);

    expect(pathManager.get()).toContain('./status');
    expect(pathManager.get()).toContain('./type');
  });

  it('스키마 properties의 enum 값과 조건을 결합해야 함', () => {
    const pathManager = getPathManager();
    const schema: JsonSchemaWithVirtual = {
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
      ],
    };

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // enabled가 true이고 role이 admin 또는 moderator일 때
    expect(result!([true, 'admin'])).toBe(0);
    expect(result!([true, 'moderator'])).toBe(0);
    // enabled가 true이고 role이 user일 때
    expect(result!([true, 'user'])).toBe(1);
    // enabled가 false면 어느 스키마도 선택되지 않음
    expect(result!([false, 'admin'])).toBe(-1);
    expect(result!([false, 'user'])).toBe(-1);
    // role이 매칭되지 않으면 어느 스키마도 선택되지 않음
    expect(result!([true, 'guest'])).toBe(-1);

    expect(pathManager.get()).toContain('./enabled');
    expect(pathManager.get()).toContain('./role');
  });

  it('조건 없이 스키마 properties만으로 조건을 생성해야 함', () => {
    const pathManager = getPathManager();
    const schema: JsonSchemaWithVirtual = {
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
    };

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // electronics + apple
    expect(result!(['electronics', 'apple'])).toBe(0);
    // electronics + samsung
    expect(result!(['electronics', 'samsung'])).toBe(1);
    // clothing + size
    expect(result!(['clothing', undefined, 'M'])).toBe(2);
    expect(result!(['clothing', undefined, 'L'])).toBe(2);
    // 매칭되지 않는 경우
    expect(result!(['electronics', 'sony'])).toBe(-1);
    expect(result!(['furniture', undefined, undefined])).toBe(-1);

    expect(pathManager.get()).toContain('./category');
    expect(pathManager.get()).toContain('./brand');
    expect(pathManager.get()).toContain('./size');
  });

  it('boolean const 값을 포함한 복합 조건을 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema: JsonSchemaWithVirtual = {
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
    };

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // mode가 advanced이고 isEnabled=true, isPublic=false일 때
    expect(result!(['advanced', true, false])).toBe(0);
    // mode가 advanced지만 다른 조건이 맞지 않을 때
    expect(result!(['advanced', false, false])).toBe(-1);
    expect(result!(['advanced', true, true])).toBe(-1);
    // mode가 basic이고 isEnabled=true일 때
    expect(result!(['basic', true])).toBe(1);
    // mode가 basic이지만 isEnabled가 false일 때
    expect(result!(['basic', false])).toBe(-1);

    expect(pathManager.get()).toContain('./mode');
    expect(pathManager.get()).toContain('./isEnabled');
    expect(pathManager.get()).toContain('./isPublic');
  });

  it('단일 값 enum을 const처럼 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema: JsonSchemaWithVirtual = {
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
    };

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // version > 2이고 format이 json일 때
    expect(result!([3, 'json'])).toBe(0);
    expect(result!([3, 'xml'])).toBe(-1);
    // version <= 2이고 format이 xml일 때
    expect(result!([2, 'xml'])).toBe(1);
    expect(result!([1, 'xml'])).toBe(1);
    expect(result!([2, 'json'])).toBe(-1);

    expect(pathManager.get()).toContain('./version');
    expect(pathManager.get()).toContain('./format');
  });

  it('null 값을 포함한 const 조건을 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema: JsonSchemaWithVirtual = {
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
    };

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // hasData가 true이고 value가 null일 때
    expect(result!([true, null])).toBe(0);
    expect(result!([true, 'default'])).toBe(-1);
    // hasData가 false이고 value가 'default'일 때
    expect(result!([false, 'default'])).toBe(1);
    expect(result!([false, null])).toBe(-1);

    expect(pathManager.get()).toContain('./hasData');
    expect(pathManager.get()).toContain('./value');
  });

  it('type과 $ref가 있는 속성은 무시하고 const/enum만 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema: JsonSchemaWithVirtual = {
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
    };

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // level이 pro이고 tier가 gold, features가 advanced 또는 premium일 때
    expect(result!(['pro', 'gold', 'advanced'])).toBe(0);
    expect(result!(['pro', 'gold', 'premium'])).toBe(0);
    expect(result!(['pro', 'silver', 'advanced'])).toBe(-1);
    // level이 free이고 tier가 bronze, features가 basic일 때
    expect(result!(['free', 'bronze', 'basic'])).toBe(1);
    expect(result!(['free', 'bronze', 'advanced'])).toBe(-1);

    expect(pathManager.get()).toContain('./level');
    expect(pathManager.get()).toContain('./tier');
    expect(pathManager.get()).toContain('./features');
  });

  it('빈 enum 배열은 무시해야 함', () => {
    const pathManager = getPathManager();
    const schema: JsonSchemaWithVirtual = {
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
    };

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // active가 true이고 status가 ready일 때 (options는 무시됨)
    expect(result!([true, 'ready'])).toBe(0);
    expect(result!([true, 'notready'])).toBe(-1);
    expect(result!([false, 'ready'])).toBe(-1);

    expect(pathManager.get()).toContain('./active');
    expect(pathManager.get()).toContain('./status');
    expect(pathManager.get()).not.toContain('./options');
  });

  it('mixed type enum 값들을 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema: JsonSchemaWithVirtual = {
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
    };

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // type이 mixed이고 value가 enum에 포함될 때
    expect(result!(['mixed', 'text'])).toBe(0);
    expect(result!(['mixed', 123])).toBe(0);
    expect(result!(['mixed', true])).toBe(0);
    expect(result!(['mixed', null])).toBe(0);
    expect(result!(['mixed', false])).toBe(-1); // false는 enum에 없음
    // type이 simple이고 value가 false일 때
    expect(result!(['simple', false])).toBe(1);
    expect(result!(['simple', true])).toBe(-1);

    expect(pathManager.get()).toContain('./type');
    expect(pathManager.get()).toContain('./value');
  });

  it('조건이 없고 properties만 있을 때 올바르게 처리해야 함', () => {
    const pathManager = getPathManager();
    const schema: JsonSchemaWithVirtual = {
      type: 'object',
      oneOf: [
        {
          properties: {
            field1: { const: 'value1' },
            field2: { enum: ['a', 'b'] },
          },
        },
        {
          properties: {
            field1: { const: 'value2' },
            field3: { const: 100 },
          },
        },
      ],
    };

    const result = getConditionIndexFactory(schema.type as any, schema)(
      pathManager,
      'oneOf',
      'if',
    );
    expect(result).toBeDefined();

    // field1=value1이고 field2가 a 또는 b일 때
    expect(result!(['value1', 'a'])).toBe(0);
    expect(result!(['value1', 'b'])).toBe(0);
    expect(result!(['value1', 'c'])).toBe(-1);
    // field1=value2이고 field3이 100일 때
    expect(result!(['value2', undefined, 100])).toBe(1);
    expect(result!(['value2', undefined, 200])).toBe(-1);

    expect(pathManager.get()).toContain('./field1');
    expect(pathManager.get()).toContain('./field2');
    expect(pathManager.get()).toContain('./field3');
  });
});

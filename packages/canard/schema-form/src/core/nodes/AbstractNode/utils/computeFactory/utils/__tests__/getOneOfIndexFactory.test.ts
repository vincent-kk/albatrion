import { describe, expect, it } from 'vitest';

import type { JsonSchema } from '@/schema-form/types';

import { getOneOfIndexFactory } from '../getOneOfIndexFactory';

describe('getOneOfIndexFactory', () => {
  it('유효하지 않은 스키마에 대해 undefined를 반환해야 함', () => {
    const dependencyPaths: string[] = [];

    // type이 object가 아닌 경우
    const schema1 = { type: 'string' } as JsonSchema;
    expect(getOneOfIndexFactory(dependencyPaths, schema1)).toBeUndefined();

    // oneOf가 배열이 아닌 경우
    const schema2 = {
      type: 'object',
      oneOf: 'invalid',
    } as unknown as JsonSchema;
    expect(getOneOfIndexFactory(dependencyPaths, schema2)).toBeUndefined();

    // oneOf가 없는 경우
    const schema3 = { type: 'object' } as JsonSchema;
    expect(getOneOfIndexFactory(dependencyPaths, schema3)).toBeUndefined();
  });

  it('유효한 표현식이 없는 경우 undefined를 반환해야 함', () => {
    const dependencyPaths: string[] = [];
    const schema = {
      type: 'object',
      oneOf: [{}, { computed: {} }, { computed: { if: false } }],
    } as unknown as JsonSchema;

    expect(getOneOfIndexFactory(dependencyPaths, schema)).toBeUndefined();
  });

  it('단순 동등성 비교에 대해 최적화된 함수를 생성해야 함', () => {
    const dependencyPaths: string[] = [];
    const schema = {
      type: 'object',
      oneOf: [
        { computed: { if: '$.value === "option1"' } },
        { computed: { if: '$.value === "option2"' } },
        { computed: { if: '$.value === "option3"' } },
        { computed: { if: '$.value === "option3"' } },
        { computed: { if: '$.value === "option2"' } },
        { computed: { if: '$.value === "option2"' } },
        { computed: { if: '$.value === "option2"' } },
        { computed: { if: '$.value === "option3"' } },
      ],
    } as unknown as JsonSchema;

    const result = getOneOfIndexFactory(dependencyPaths, schema);

    expect(dependencyPaths).toContain('$.value');
    expect(result).toBeDefined();

    // 각 옵션에 대한 결과 확인
    expect(result!(['option1'])).toBe(0);
    expect(result!(['option2'])).toBe(1);
    expect(result!(['option3'])).toBe(2);
    expect(result!(['other'])).toBe(-1);
  });

  it('복잡한 조건에 대해 일반 평가 함수를 생성해야 함', () => {
    const dependencyPaths: string[] = [];
    const schema = {
      type: 'object',
      oneOf: [
        { computed: { if: '_.value === "option1"' } },
        { computed: { if: '_.value === "option2"' } },
        { computed: { if: '_.count > 10' } },
      ],
    } as unknown as JsonSchema;

    const result = getOneOfIndexFactory(dependencyPaths, schema);

    expect(dependencyPaths).toContain('_.value');
    expect(dependencyPaths).toContain('_.count');
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
    const dependencyPaths: string[] = [];
    const schema = {
      type: 'object',
      oneOf: [
        { '&if': '$.type === "string" && $.length > 0' },
        { computed: { if: '$.age >= 18' } },
        { computed: { if: '($.value).includes("test")' } },
      ],
    } as unknown as JsonSchema;

    const result = getOneOfIndexFactory(dependencyPaths, schema);

    expect(dependencyPaths).toContain('$.type');
    expect(dependencyPaths).toContain('$.length');
    expect(dependencyPaths).toContain('$.age');
    expect(dependencyPaths).toContain('$.value');
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
    const dependencyPaths: string[] = [];
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: '$.age < 18' } },
        { type: 'object', computed: { if: '$.age >= 18 && $.age < 65' } },
        { type: 'object', computed: { if: '$.age >= 65' } },
      ],
    } as unknown as JsonSchema;

    const result = getOneOfIndexFactory(dependencyPaths, schema);

    expect(dependencyPaths).toContain('$.age');
    expect(result).toBeDefined();

    expect(result!([10])).toBe(0); // 미성년자
    expect(result!([30])).toBe(1); // 성인
    expect(result!([70])).toBe(2); // 노인
  });

  it('null 및 undefined 표현식을 올바르게 처리해야 함', () => {
    const dependencyPaths: string[] = [];
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: null } },
        { type: 'object', computed: { if: '$.value === "valid"' } },
        { type: 'object', '&if': undefined },
      ],
    } as unknown as JsonSchema;

    const result = getOneOfIndexFactory(dependencyPaths, schema);

    expect(dependencyPaths).toContain('$.value');
    expect(result).toBeDefined();

    expect(result!(['valid'])).toBe(1);
    expect(result!(['invalid'])).toBe(-1);
  });

  it('세미콜론이 포함된 표현식을 올바르게 처리해야 함', () => {
    const dependencyPaths: string[] = [];
    const schema = {
      type: 'object',
      oneOf: [{ type: 'object', computed: { if: '$.value === "option1";' } }],
    } as unknown as JsonSchema;

    const result = getOneOfIndexFactory(dependencyPaths, schema);

    expect(result!(['option1'])).toBe(0);
  });

  it('boolean 타입 조건을 올바르게 처리해야 함', () => {
    const dependencyPaths: string[] = [];
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: false } },
        { type: 'object', computed: { if: true } },
        { type: 'object', computed: { if: '$.value === "option"' } },
      ],
    } as unknown as JsonSchema;

    const result = getOneOfIndexFactory(dependencyPaths, schema);

    expect(result).toBeDefined();
    // true 조건은 항상 매칭되어야 함 (인덱스 1)
    expect(result!(['anything'])).toBe(1);

    // 후속 조건이 있어도 무시
    expect(result!(['option'])).toBe(1);

    // false 조건은 항상 매칭되지 않아야 함
    // 따라서 result!()에서 첫 번째 인덱스(0)를 반환하지 않음
  });

  it('여러 true 조건이 있는 경우 첫 번째 true 조건이 선택되어야 함', () => {
    const dependencyPaths: string[] = [];
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: '$.value === "option"' } },
        { type: 'object', computed: { if: true } },
        { type: 'object', computed: { if: true } },
      ],
    } as unknown as JsonSchema;

    const result = getOneOfIndexFactory(dependencyPaths, schema);

    expect(result).toBeDefined();
    // 구체적인 조건이 우선
    expect(result!(['option'])).toBe(0);

    // 구체적인 조건이 매칭되지 않으면 첫 번째 true 조건이 선택됨
    expect(result!(['not-match'])).toBe(1);
  });

  it('모든 조건이 false인 경우 아무 것도 선택되지 않아야 함', () => {
    const dependencyPaths: string[] = [];
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: false } },
        { type: 'object', computed: { if: false } },
        { type: 'object', computed: { if: false } },
      ],
    } as unknown as JsonSchema;

    const result = getOneOfIndexFactory(dependencyPaths, schema);

    // 유효한 표현식이 없으므로 undefined 반환
    expect(result).toBeUndefined();
  });

  it('조건이 false와 표현식 혼합인 경우 올바르게 처리해야 함', () => {
    const dependencyPaths: string[] = [];
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: false } },
        { type: 'object', computed: { if: '$.value === "test"' } },
      ],
    } as unknown as JsonSchema;

    const result = getOneOfIndexFactory(dependencyPaths, schema);

    expect(result).toBeDefined();
    expect(result!(['test'])).toBe(1);
    expect(result!(['not-match'])).toBe(-1);
  });

  it('&if 속성에서도 boolean 타입을 올바르게 처리해야 함', () => {
    const dependencyPaths: string[] = [];
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', '&if': false },
        { type: 'object', '&if': true },
        { type: 'object', '&if': '$.value === "option"' },
      ],
    } as unknown as JsonSchema;

    const result = getOneOfIndexFactory(dependencyPaths, schema);

    expect(result).toBeDefined();
    // true 조건은 항상 매칭되어야 함 (인덱스 1)
    expect(result!(['anything'])).toBe(1);

    // 후속 조건이 있어도 무시
    expect(result!(['option'])).toBe(1);
  });

  it('computed.if와 &if를 혼합해서 사용할 때 올바르게 처리해야 함', () => {
    const dependencyPaths: string[] = [];
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: true } },
        { type: 'object', '&if': true },
        { type: 'object', computed: { if: '$.value === "test"' } },
        { type: 'object', '&if': '$.value === "option"' },
      ],
    } as unknown as JsonSchema;

    const result = getOneOfIndexFactory(dependencyPaths, schema);

    expect(result).toBeDefined();
    // 구체적인 조건이 우선
    expect(result!(['test'])).toBe(0);
    expect(result!(['option'])).toBe(0);

    // 구체적인 조건이 없으면 첫 번째 true 조건 (인덱스 0)이 선택됨
    expect(result!(['anything-else'])).toBe(0);
  });

  it('비어있는 표현식을 올바르게 처리해야 함', () => {
    const dependencyPaths: string[] = [];
    const schema = {
      type: 'object',
      oneOf: [
        { type: 'object', computed: { if: '' } },
        { type: 'object', '&if': '' },
        { type: 'object', computed: { if: true } },
      ],
    } as unknown as JsonSchema;

    const result = getOneOfIndexFactory(dependencyPaths, schema);

    expect(result).toBeDefined();
    // 빈 문자열은 유효하지 않으므로 무시되고, true 조건(인덱스 2)이 선택됨
    expect(result!(['anything'])).toBe(2);
  });
});

describe('getOneOfIndexFactory custom test', () => {
  // 기본 케이스: 단순 동등성 비교 (최적화된 경로)
  it('단순 동등성 비교: 문자열 일치 케이스를 올바르게 처리해야 함', () => {
    const schema: JsonSchema = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          '&if': '@.root.type === "foo"',
          properties: { foo: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': '@.root.type === "bar"',
          properties: { bar: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': '@.root.type === "baz"',
          properties: { baz: { type: 'string' } },
        },
      ],
    };

    const dependencyPaths: string[] = ['@.root.type'];
    const getOneOfIndex = getOneOfIndexFactory(dependencyPaths, schema);

    expect(getOneOfIndex).toBeDefined();
    expect(getOneOfIndex!(['foo'])).toBe(0);
    expect(getOneOfIndex!(['bar'])).toBe(1);
    expect(getOneOfIndex!(['baz'])).toBe(2);
    expect(getOneOfIndex!(['unknown'])).toBe(-1);

    // 의존성 경로가 정확히 추출되었는지 확인
    expect(dependencyPaths).toEqual(['@.root.type']);
  });

  // 복잡한 조건 케이스 (일반 경로)
  it('복잡한 조건: 논리 연산자를 포함한 조건을 처리해야 함', () => {
    const schema: JsonSchema = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          '&if': '@.root.age > 18 && @.root.type === "adult"',
          properties: { adult: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': '@.root.age <= 18 || @.root.type === "child"',
          properties: { child: { type: 'string' } },
        },
      ],
    };

    const dependencyPaths: string[] = [];
    const getOneOfIndex = getOneOfIndexFactory(dependencyPaths, schema);

    expect(getOneOfIndex).toBeDefined();
    expect(getOneOfIndex!([25, 'adult'])).toBe(0);
    expect(getOneOfIndex!([15, 'teen'])).toBe(1);
    expect(getOneOfIndex!([30, 'child'])).toBe(1);

    // 의존성 경로가 정확히 추출되었는지 확인
    expect(dependencyPaths).toContain('@.root.age');
    expect(dependencyPaths).toContain('@.root.type');
  });

  // oneOf 스키마가 혼합된 형태의 조건을 가진 케이스
  it('혼합된 형태의 조건을 가진 oneOf 스키마를 처리해야 함', () => {
    const schema: JsonSchema = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          computed: { if: '@.root.type === "simple"' },
          properties: { simple: { type: 'string' } },
        },
        {
          type: 'object',
          computed: { if: '@.root.age > 18 && @.root.role === "admin"' },
          properties: { complex: { type: 'string' } },
        },
        {
          type: 'object',
          // expression 없는 스키마
          properties: { default: { type: 'string' } },
        },
      ],
    };

    const dependencyPaths: string[] = [];
    const getOneOfIndex = getOneOfIndexFactory(dependencyPaths, schema);

    expect(getOneOfIndex).toBeDefined();
    expect(getOneOfIndex!(['simple', 0, ''])).toBe(0);
    expect(getOneOfIndex!(['other', 20, 'admin'])).toBe(1);
    // 모든 조건이 실패하면 -1 반환
    expect(getOneOfIndex!(['other', 15, 'user'])).toBe(-1);
  });

  // 잘못된 입력 처리 (오류 가능성)
  it('잘못된 스키마 입력을 안전하게 처리해야 함', () => {
    // type이 object가 아닌 경우
    let schema: JsonSchema = {
      type: 'string',
      oneOf: [],
    };
    let dependencyPaths: string[] = [];
    let getOneOfIndex = getOneOfIndexFactory(dependencyPaths, schema);
    expect(getOneOfIndex).toBeUndefined();

    // oneOf가 배열이 아닌 경우
    schema = {
      type: 'object',
      oneOf: 'invalid' as any,
    };
    dependencyPaths = [];
    getOneOfIndex = getOneOfIndexFactory(dependencyPaths, schema);
    expect(getOneOfIndex).toBeUndefined();

    // oneOf 배열이 비어있는 경우
    schema = {
      type: 'object',
      oneOf: [],
    };
    dependencyPaths = [];
    getOneOfIndex = getOneOfIndexFactory(dependencyPaths, schema);
    expect(getOneOfIndex).toBeUndefined();
  });

  // 경계 케이스 (null 값, 빈 표현식 등)
  it('경계 케이스와 비정상적인 값을 처리해야 함', () => {
    const schema: JsonSchema = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          '&if': '@.root.value === null', // null 비교
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
          '&if': '@.root.value === undefined', // undefined 비교
          properties: { undefinable: { type: 'string' } },
        },
      ],
    };

    const dependencyPaths: string[] = [];
    const getOneOfIndex = getOneOfIndexFactory(dependencyPaths, schema);

    expect(getOneOfIndex).toBeDefined();
    // null 값과 undefined 비교
    expect(getOneOfIndex!([null])).toBe(0);
    expect(getOneOfIndex!([undefined])).toBe(3);
  });

  // 정규식 패턴 매칭 테스트
  it('정규식 패턴이 다양한 표현식을 올바르게 매칭해야 함', () => {
    const schema: JsonSchema = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          '&if': '@.root.value === "따옴표가 있는 문자열"',
          properties: { quote: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': '@.root.value === "123"', // 숫자 문자열
          properties: { number: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': '@.root.value === "특수문자!@#$%^&*()"', // 특수문자
          properties: { special: { type: 'string' } },
        },
      ],
    };

    const dependencyPaths: string[] = [];
    const getOneOfIndex = getOneOfIndexFactory(dependencyPaths, schema);

    expect(getOneOfIndex).toBeDefined();
    expect(getOneOfIndex!(['따옴표가 있는 문자열'])).toBe(0);
    expect(getOneOfIndex!(['123'])).toBe(1);
    expect(getOneOfIndex!(['특수문자!@#$%^&*()'])).toBe(2);
  });

  // 중첩 속성 경로 테스트
  it('중첩된 속성 경로를 올바르게 처리해야 함', () => {
    const schema: JsonSchema = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          '&if': '@.root.user.profile.type === "personal"',
          properties: { personal: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': '@.root.user.profile.type === "business"',
          properties: { business: { type: 'string' } },
        },
      ],
    };

    const dependencyPaths: string[] = [];
    const getOneOfIndex = getOneOfIndexFactory(dependencyPaths, schema);

    expect(getOneOfIndex).toBeDefined();
    // 중첩 객체에서 값을 정확히 찾아야 함
    const dependencies = ['personal'];
    expect(getOneOfIndex!(dependencies)).toBe(0);

    // 의존성 경로가 정확히 추출되었는지 확인
    expect(dependencyPaths).toContain('@.root.user.profile.type');
  });

  // 여러 개의 의존성 경로를 사용하는 케이스
  it('여러 의존성 경로를 사용하는 케이스를 처리해야 함', () => {
    const schema: JsonSchema = {
      type: 'object',
      oneOf: [
        {
          type: 'object',
          '&if': '@.rootPath1 === "value1" && @.rootPath2 === "value2"',
          properties: { both: { type: 'string' } },
        },
        {
          type: 'object',
          '&if': '@.rootPath1 === "value1" || @.rootPath3 === "value3"',
          properties: { either: { type: 'string' } },
        },
      ],
    };

    // 미리 정의된 의존성 경로 배열
    const dependencyPaths: string[] = [
      '@.rootPath1',
      '@.rootPath2',
      '@.rootPath3',
    ];
    const getOneOfIndex = getOneOfIndexFactory(dependencyPaths, schema);

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

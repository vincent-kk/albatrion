import { describe, expect, test } from 'vitest';

import { JSON_POINTER_PATH_REGEX } from '../regex';

/**
 * JSON Pointer Path Expression Boundary Test
 *
 * Usage Guidelines:
 * 1. Use #/ for root references (recommended)
 * 2. / alone is treated as division operator
 * 3. /propertyName is an absolute path (property name required)
 * 4. #/ is a valid root reference
 * 5. All non-JavaScript variable characters act as path separators
 *
 * Division operator handling:
 * - "a / b" → / is division operator
 * - "/property" → absolute path
 * - "#/" → root reference
 */
describe('JSON_POINTER_REGEX 경계선 테스트', () => {
  // PathManager 목업
  class PathManager {
    private paths: string[] = [];

    set(path: string): void {
      if (!this.paths.includes(path)) {
        this.paths.push(path);
      }
    }

    findIndex(path: string): number {
      return this.paths.indexOf(path);
    }

    clear(): void {
      this.paths = [];
    }

    getPaths(): string[] {
      return [...this.paths];
    }
  }

  // Expression 변환 함수
  const transformExpression = (
    expression: string,
  ): { result: string; paths: string[] } => {
    const pathManager = new PathManager();
    const computedExpression = expression
      .replace(JSON_POINTER_PATH_REGEX, (path) => {
        pathManager.set(path);
        return `dependencies[${pathManager.findIndex(path)}]`;
      })
      .trim()
      .replace(/;$/, '');

    return {
      result: computedExpression,
      paths: pathManager.getPaths(),
    };
  };

  describe('✅ 허용되는 표현식 패턴', () => {
    test('기본 비교 연산자', () => {
      const cases = [
        {
          input: '../age > 18',
          expected: 'dependencies[0] > 18',
          paths: ['../age'],
        },
        {
          input: '../../price <= 100.50',
          expected: 'dependencies[0] <= 100.50',
          paths: ['../../price'],
        },
        {
          input: '../name === "John"',
          expected: 'dependencies[0] === "John"',
          paths: ['../name'],
        },
        {
          input: './status !== null',
          expected: 'dependencies[0] !== null',
          paths: ['./status'],
        },
        {
          input: '#/data/value >= 0',
          expected: 'dependencies[0] >= 0',
          paths: ['#/data/value'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('논리 연산자 조합', () => {
      const cases = [
        {
          input: '../isActive && ../../hasPermission',
          expected: 'dependencies[0] && dependencies[1]',
          paths: ['../isActive', '../../hasPermission'],
        },
        {
          input: './flag || ../backup || #/default',
          expected: 'dependencies[0] || dependencies[1] || dependencies[2]',
          paths: ['./flag', '../backup', '#/default'],
        },
        {
          input:
            '!(../disabled) && ((../../role) === "admin" || (../superuser))',
          expected:
            '!(dependencies[0]) && ((dependencies[1]) === "admin" || (dependencies[2]))',
          paths: ['../disabled', '../../role', '../superuser'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('산술 연산자', () => {
      const cases = [
        {
          input: '../../price * 0.9 + ../tax',
          expected: 'dependencies[0] * 0.9 + dependencies[1]',
          paths: ['../../price', '../tax'],
        },
        {
          input: '../total - ./discount',
          expected: 'dependencies[0] - dependencies[1]',
          paths: ['../total', './discount'],
        },
        {
          input: '(../base + ../bonus) / 2',
          expected: '(dependencies[0] + dependencies[1]) / 2',
          paths: ['../base', '../bonus'],
        },
        {
          input: '../quantity % 10 === 0',
          expected: 'dependencies[0] % 10 === 0',
          paths: ['../quantity'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('삼항 연산자', () => {
      const cases = [
        {
          input: '../isVIP ? ../../vipPrice : ../regularPrice',
          expected: 'dependencies[0] ? dependencies[1] : dependencies[2]',
          paths: ['../isVIP', '../../vipPrice', '../regularPrice'],
        },
        {
          input: '../../country === "US" ? #/states/list : ./provinces',
          expected:
            'dependencies[0] === "US" ? dependencies[1] : dependencies[2]',
          paths: ['../../country', '#/states/list', './provinces'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('메서드 호출', () => {
      const cases = [
        {
          input: '(../items).length > 0',
          expected: '(dependencies[0]).length > 0',
          paths: ['../items'],
        },
        {
          input: '(../../name).toLowerCase() === "admin"',
          expected: '(dependencies[0]).toLowerCase() === "admin"',
          paths: ['../../name'],
        },
        {
          input: '(../email).includes("@")',
          expected: '(dependencies[0]).includes("@")',
          paths: ['../email'],
        },
        {
          input: 'Math.max((../value1), (../value2))',
          expected: 'Math.max((dependencies[0]), (dependencies[1]))',
          paths: ['../value1', '../value2'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('배열 및 객체 접근', () => {
      const cases = [
        {
          input: '../items[0] === "first"',
          expected: 'dependencies[0] === "first"',
          paths: ['../items[0]'],
        },
        {
          input: '../../data["key"] !== undefined',
          expected: 'dependencies[0] !== undefined',
          paths: ['../../data["key"]'],
        },
        {
          input: '../users[../currentIndex].name',
          expected: 'dependencies[0]',
          paths: ['../users[../currentIndex].name'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('복잡한 중첩 표현식', () => {
      const cases = [
        {
          input:
            '(../../price > 100 && ../inStock) || (#/config/allowBackorder && ../quantity > 0)',
          expected:
            '(dependencies[0] > 100 && dependencies[1]) || (dependencies[2] && dependencies[3] > 0)',
          paths: [
            '../../price',
            '../inStock',
            '#/config/allowBackorder',
            '../quantity',
          ],
        },
        {
          input: 'typeof ../value === "string" && (../value).length >= 3',
          expected:
            'typeof dependencies[0] === "string" && (dependencies[0]).length >= 3',
          paths: ['../value'],
        },
        {
          input: '(../array).filter(item => item > ../threshold).length',
          expected:
            '(dependencies[0]).filter(item => item > dependencies[1]).length',
          paths: ['../array', '../threshold'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('함수 표현식 내 경로', () => {
      const cases = [
        {
          input: 'function check() { return (../isValid); }',
          expected: 'function check() { return (dependencies[0]); }',
          paths: ['../isValid'],
        },
        {
          input: '() => ../value * 2',
          expected: '() => dependencies[0] * 2',
          paths: ['../value'],
        },
        {
          input: '(../items).map(x => x + ../offset)',
          expected: '(dependencies[0]).map(x => x + dependencies[1])',
          paths: ['../items', '../offset'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });
  });

  describe('🔍 경로 구분자로 작동하는 문자들', () => {
    test('모든 종류의 괄호', () => {
      const cases = [
        {
          input: '(../a)',
          expected: '(dependencies[0])',
          paths: ['../a'],
        },
        {
          // ] is a structural delimiter (balanced brackets)
          input: '[../b]',
          expected: '[dependencies[0]]',
          paths: ['../b'],
        },
        {
          // } is a structural delimiter (template literal closing)
          input: '{../c}',
          expected: '{dependencies[0]}',
          paths: ['../c'],
        },
        {
          input: 'func((../arg1), (../arg2))',
          expected: 'func((dependencies[0]), (dependencies[1]))',
          paths: ['../arg1', '../arg2'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('모든 종류의 공백 문자', () => {
      const cases = [
        {
          input: '../a ../b', // space
          expected: 'dependencies[0] dependencies[1]',
          paths: ['../a', '../b'],
        },
        {
          input: '../a\t../b', // tab
          expected: 'dependencies[0]\tdependencies[1]',
          paths: ['../a', '../b'],
        },
        {
          input: '../a\n../b', // newline
          expected: 'dependencies[0]\ndependencies[1]',
          paths: ['../a', '../b'],
        },
        {
          input: '../a\r\n../b', // carriage return + newline
          expected: 'dependencies[0]\r\ndependencies[1]',
          paths: ['../a', '../b'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('연산자들', () => {
      const cases = [
        {
          input: '(../a)+(../b)',
          expected: '(dependencies[0])+(dependencies[1])',
          paths: ['../a', '../b'],
        },
        {
          input: '(../a)-(../b)',
          expected: '(dependencies[0])-(dependencies[1])',
          paths: ['../a', '../b'],
        },
        {
          input: '(../a)*(../b)',
          expected: '(dependencies[0])*(dependencies[1])',
          paths: ['../a', '../b'],
        },
        {
          input: '(../a)/(../../b)', // 슬래시가 경로 일부가 아닌 나누기 연산자로 해석되는지 확인
          expected: '(dependencies[0])/(dependencies[1])',
          paths: ['../a', '../../b'],
        },
        {
          input: '(../a)%(../b)',
          expected: '(dependencies[0])%(dependencies[1])',
          paths: ['../a', '../b'],
        },
        {
          input: '(../a)=(../b)',
          expected: '(dependencies[0])=(dependencies[1])',
          paths: ['../a', '../b'],
        },
        {
          input: '(../a)!(../b)',
          expected: '(dependencies[0])!(dependencies[1])',
          paths: ['../a', '../b'],
        },
        {
          input: '(../a)&(../b)',
          expected: '(dependencies[0])&(dependencies[1])',
          paths: ['../a', '../b'],
        },
        {
          input: '(../a)|(../b)',
          expected: '(dependencies[0])|(dependencies[1])',
          paths: ['../a', '../b'],
        },
        {
          input: '(../a)<(../b)',
          expected: '(dependencies[0])<(dependencies[1])',
          paths: ['../a', '../b'],
        },
        {
          input: '(../a)>(../b)',
          expected: '(dependencies[0])>(dependencies[1])',
          paths: ['../a', '../b'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('특수 문자들', () => {
      const cases = [
        {
          input: '(../a);(../b)',
          expected: '(dependencies[0]);(dependencies[1])',
          paths: ['../a', '../b'],
        },
        {
          input: '(../a),(../b)',
          expected: '(dependencies[0]),(dependencies[1])',
          paths: ['../a', '../b'],
        },
        {
          input: '(../a).method()', // 점은 메서드 접근자
          expected: '(dependencies[0]).method()',
          paths: ['../a'],
        },
        {
          input: '(../a):(../b)',
          expected: '(dependencies[0]):(dependencies[1])',
          paths: ['../a', '../b'],
        },
        {
          input: '(../a)?(../b)',
          expected: '(dependencies[0])?(dependencies[1])',
          paths: ['../a', '../b'],
        },
        {
          input: '(../a)"text"(../b)', // 따옴표
          expected: '(dependencies[0])"text"(dependencies[1])',
          paths: ['../a', '../b'],
        },
        {
          input: "(../a)'text'(../b)", // 작은 따옴표
          expected: "(dependencies[0])'text'(dependencies[1])",
          paths: ['../a', '../b'],
        },
        {
          input: '(../a)`template`(../b)', // 백틱
          expected: '(dependencies[0])`template`(dependencies[1])',
          paths: ['../a', '../b'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('템플릿 리터럴 placeholder', () => {
      // } 는 구조적 구분자로 템플릿 리터럴 placeholder 닫기에 사용
      const cases = [
        {
          // 가장 일반적인 패턴: ${../path}
          input: '${../path}',
          expected: '${dependencies[0]}',
          paths: ['../path'],
        },
        {
          // 여러 placeholder
          input: '${../a} + ${../b}',
          expected: '${dependencies[0]} + ${dependencies[1]}',
          paths: ['../a', '../b'],
        },
        {
          // 중첩된 경로
          input: '${#/data/items}',
          expected: '${dependencies[0]}',
          paths: ['#/data/items'],
        },
        {
          // 컨텍스트 참조
          input: '${@}',
          expected: '${dependencies[0]}',
          paths: ['@'],
        },
        {
          // 복잡한 표현식
          input: '${../price * ../quantity}',
          expected: '${dependencies[0] * dependencies[1]}',
          paths: ['../price', '../quantity'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });
  });

  describe('❌ 매칭되지 않는 패턴', () => {
    test('경로 구분자가 없는 일반 변수명', () => {
      const cases = [
        { input: 'variable', expected: 'variable', paths: [] },
        { input: 'myVar', expected: 'myVar', paths: [] },
        { input: '_private', expected: '_private', paths: [] },
        { input: '$jquery', expected: '$jquery', paths: [] },
        { input: 'CONSTANT', expected: 'CONSTANT', paths: [] },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('잘못된 경로 패턴', () => {
      const cases = [
        {
          input: '...path', // 점 3개는 유효한 prefix가 아님
          expected: '...path',
          paths: [],
        },
        {
          input: 'path/to/file', // 경로 시작 기호 없음
          expected: 'path/to/file',
          paths: [], // /to와 /file은 절대 경로로 인식
        },
        {
          input: '../123invalid', // 숫자로 시작하는 세그먼트
          expected: 'dependencies[0]', // ../만 매칭
          paths: ['../123invalid'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });
  });

  describe('🎯 경계 케이스', () => {
    test('나누기 연산자 vs 절대 경로 구분', () => {
      const cases = [
        {
          input: '10 / 2', // 나누기 연산자
          expected: '10 / 2',
          paths: [],
        },
        {
          input: '../value / 2', // 나누기 연산자
          expected: 'dependencies[0] / 2',
          paths: ['../value'],
        },
        {
          input: '/property', // 절대 경로
          expected: 'dependencies[0]',
          paths: ['/property'],
        },
        {
          input: '../a / /b', // 나누기 연산자와 절대 경로
          expected: 'dependencies[0] / dependencies[1]',
          paths: ['../a', '/b'],
        },
        {
          input: '(#/)', // 안전하게 괄호로 감싼 루트
          expected: '(dependencies[0])',
          paths: ['#/'],
        },
        {
          input: '(/)', // 괄호로 감싼 루트 경로
          expected: '(dependencies[0])',
          paths: ['/'],
        },
        {
          input: '/absolute/path', // 명확한 절대 경로
          expected: 'dependencies[0]',
          paths: ['/absolute/path'],
        },
        {
          input: '!../type', // 느낌표 다음의 상대 경로
          expected: '!dependencies[0]',
          paths: ['../type'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('경로만 있는 표현식', () => {
      const cases = [
        { input: '../path', expected: 'dependencies[0]', paths: ['../path'] },
        {
          input: '../../path',
          expected: 'dependencies[0]',
          paths: ['../../path'],
        },
        { input: '#/path', expected: 'dependencies[0]', paths: ['#/path'] },
        { input: './path', expected: 'dependencies[0]', paths: ['./path'] },
        { input: '/path', expected: 'dependencies[0]', paths: ['/path'] },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('세미콜론 처리', () => {
      const cases = [
        {
          input: '(../value);',
          expected: '(dependencies[0])', // 괄호 유지, 끝의 세미콜론은 제거됨
          paths: ['../value'],
        },
        {
          input: '(../a); (../b)',
          expected: '(dependencies[0]); (dependencies[1])', // 중간 세미콜론은 유지
          paths: ['../a', '../b'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('중복 경로 처리', () => {
      const result = transformExpression('../value > 10 && ../value < 100');
      expect(result.result).toBe(
        'dependencies[0] > 10 && dependencies[0] < 100',
      );
      expect(result.paths).toEqual(['../value']);
    });

    test('빈 경로 세그먼트', () => {
      const cases = [
        { input: '../', expected: 'dependencies[0]', paths: ['../'] },
        { input: '../../', expected: 'dependencies[0]', paths: ['../../'] },
        { input: '#/', expected: 'dependencies[0]', paths: ['#/'] },
        { input: './', expected: 'dependencies[0]', paths: ['./'] },
        // { input: '/', expected: 'dependencies[0]', paths: ['/'] }  // / 단독은 나누기 연산자로 처리
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('매우 긴 경로', () => {
      const longPath = '../' + 'a/'.repeat(50) + 'final';
      const result = transformExpression(longPath);
      expect(result.paths).toHaveLength(1);
      expect(result.paths[0]).toBe(longPath);
      expect(result.result).toBe('dependencies[0]');
    });

    test('매우 깊은 상위 참조', () => {
      const deepPath = '../'.repeat(20) + 'target';
      const result = transformExpression(deepPath);
      expect(result.paths).toHaveLength(1);
      expect(result.paths[0]).toBe(deepPath);
      expect(result.result).toBe('dependencies[0]');
    });
  });

  describe('🔄 JSON Pointer 이스케이프 시퀀스', () => {
    test('RFC 6901 이스케이프 규칙', () => {
      const cases = [
        {
          input: '../field~0name > 0', // ~0 은 / 를 의미
          expected: 'dependencies[0] > 0',
          paths: ['../field~0name'],
        },
        {
          input: '../field~1name === "test"', // ~1 은 ~ 를 의미
          expected: 'dependencies[0] === "test"',
          paths: ['../field~1name'],
        },
        {
          input: '../path~0to~1item !== null', // / 와 ~ 모두 이스케이프
          expected: 'dependencies[0] !== null',
          paths: ['../path~0to~1item'],
        },
        {
          input: '#/config~0data/enable~1flag || false',
          expected: 'dependencies[0] || false',
          paths: ['#/config~0data/enable~1flag'],
        },
        {
          input: './api~0v2~1test >= 1',
          expected: 'dependencies[0] >= 1',
          paths: ['./api~0v2~1test'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('잘못된 이스케이프 시퀀스는 매칭되지 않음', () => {
      const cases = [
        {
          input: '../field~name',
          expected: 'dependencies[0]~name',
          paths: ['../field'],
        }, // ~ 단독 사용 불가, field까지만 매칭
        {
          input: '../field~2name',
          expected: 'dependencies[0]~2name',
          paths: ['../field'],
        }, // ~2 는 유효하지 않음, field까지만 매칭
        {
          input: '../field~abcname',
          expected: 'dependencies[0]~abcname',
          paths: ['../field'],
        }, // ~ 뒤에 잘못된 문자, field까지만 매칭
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });
  });

  describe('🌍 다양한 JSON key 문자 지원', () => {
    test('특수 문자가 포함된 JSON key', () => {
      const cases = [
        {
          input: '../key:with:colons || false',
          expected: 'dependencies[0] || false',
          paths: ['../key:with:colons'],
        },
        {
          input: '../key;with;semicolons && true',
          expected: 'dependencies[0] && true',
          paths: ['../key;with;semicolons'],
        },
        {
          input: '../key,with,commas > 10',
          expected: 'dependencies[0] > 10',
          paths: ['../key,with,commas'],
        },
        {
          input: '../한글키 === "값"',
          expected: 'dependencies[0] === "값"',
          paths: ['../한글키'],
        },
        {
          input: '../属性名 <= 100',
          expected: 'dependencies[0] <= 100',
          paths: ['../属性名'],
        },
        {
          input: '../emoji🔥key !== undefined',
          expected: 'dependencies[0] !== undefined',
          paths: ['../emoji🔥key'],
        },
        {
          input: '../api+version >= 2',
          expected: 'dependencies[0] >= 2',
          paths: ['../api+version'],
        },
        {
          input: '../flag! === true',
          expected: 'dependencies[0] === true',
          paths: ['../flag!'],
        },
        {
          input: '../scope&filter !== null',
          expected: 'dependencies[0] !== null',
          paths: ['../scope&filter'],
        },
        {
          input: '../array[0] > 10',
          expected: 'dependencies[0] > 10',
          paths: ['../array[0]'],
        },
        {
          // Balanced braces are included in path
          input: '#/config{env} === "prod"',
          expected: 'dependencies[0] === "prod"',
          paths: ['#/config{env}'],
        },
        {
          // Balanced braces are included in path
          input: './template{value} !== null',
          expected: 'dependencies[0] !== null',
          paths: ['./template{value}'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('연산자와 특수 기호가 앞에 오는 경우', () => {
      const cases = [
        {
          input: '!../flag',
          expected: '!dependencies[0]',
          paths: ['../flag'],
        },
        {
          input: '~../mask',
          expected: '~dependencies[0]',
          paths: ['../mask'],
        },
        {
          input: '+../positive',
          expected: '+dependencies[0]',
          paths: ['../positive'],
        },
        {
          input: '-../negative',
          expected: '-dependencies[0]',
          paths: ['../negative'],
        },
        {
          input: '&../reference',
          expected: '&dependencies[0]',
          paths: ['../reference'],
        },
        {
          input: '*../pointer',
          expected: '*dependencies[0]',
          paths: ['../pointer'],
        },
        {
          // @../ 형태는 Context 뒤에 Parent 경로가 오는 것으로, @ 도 경로도 매칭되지 않음
          input: '@../annotation',
          expected: '@../annotation',
          paths: [],
        },
        {
          input: '%../modulo',
          expected: '%dependencies[0]',
          paths: ['../modulo'],
        },
        {
          input: '^../caret',
          expected: '^dependencies[0]',
          paths: ['../caret'],
        },
        {
          input: '|../pipe',
          expected: '|dependencies[0]',
          paths: ['../pipe'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });
  });

  describe('💡 실제 사용 예제', () => {
    test('나누기 연산자 사용법', () => {
      const cases = [
        {
          input: '(../value) / 2', // 괄호로 경로를 감싼 후 나누기
          expected: '(dependencies[0]) / 2',
          paths: ['../value'],
        },
        {
          input: '../value/2', // 띄어쓰기 없이 /2는 경로의 일부
          expected: 'dependencies[0]',
          paths: ['../value/2'],
        },
        {
          input: 'Math.floor(../value / 2)', // 함수 안에서 / 사용
          expected: 'Math.floor(dependencies[0] / 2)',
          paths: ['../value'],
        },
        {
          input: '(../a)*(../b)', // 곱셈 연산자는 문제 없음
          expected: '(dependencies[0])*(dependencies[1])',
          paths: ['../a', '../b'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('루트 참조 방법', () => {
      const cases = [
        {
          input: '#/config/value', // 추천: 명확한 루트 참조
          expected: 'dependencies[0]',
          paths: ['#/config/value'],
        },
        {
          input: '(#/) || ../fallback', // 괄호로 감싼 루트
          expected: '(dependencies[0]) || dependencies[1]',
          paths: ['#/', '../fallback'],
        },
        {
          input: '/absolutePath', // 절대 경로 (속성명 필수)
          expected: 'dependencies[0]',
          paths: ['/absolutePath'],
        },
        {
          input: '../value / 2', // 나누기 연산자 사용
          expected: 'dependencies[0] / 2',
          paths: ['../value'],
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('Form validation 규칙', () => {
      const validationRule = `
        (../../userType === "premium" || ../subscriptionLevel >= 2) &&
        ../age >= 18 &&
        ../age <= 120 &&
        ((../email).includes("@") && (../email).length > 5) &&
        (!../country || ../country === "US" || (#/allowedCountries).includes(../country))
      `;

      const result = transformExpression(validationRule);
      expect(result.paths).toEqual([
        '../../userType',
        '../subscriptionLevel',
        '../age',
        '../email',
        '../country',
        '#/allowedCountries',
      ]);
    });

    test('가격 계산 로직', () => {
      const priceCalculation = `
        (../../basePrice * ../quantity) * 
        (1 - (../discountRate || 0)) + 
        ../shippingFee - 
        (../loyaltyPoints > 100 ? ./loyaltyDiscount : 0)
      `;

      const result = transformExpression(priceCalculation);
      expect(result.paths).toEqual([
        '../../basePrice',
        '../quantity',
        '../discountRate',
        '../shippingFee',
        '../loyaltyPoints',
        './loyaltyDiscount',
      ]);
    });

    test('조건부 필드 표시 로직', () => {
      const displayLogic = `
        (../showAdvanced) &&
        ((../../role) === "admin" ||
         ((../permissions).includes("edit") && (../permissions).includes("view"))) &&
        !(#/config/maintenanceMode)
      `;

      const result = transformExpression(displayLogic);
      expect(result.paths).toEqual([
        '../showAdvanced',
        '../../role',
        '../permissions',
        '#/config/maintenanceMode',
      ]);
    });
  });

  describe('백슬래시 이스케이프 (정규식 리터럴)', () => {
    test('백슬래시로 이스케이프된 슬래시는 경로로 매칭되지 않음', () => {
      // \/ 는 JS에서 / 와 동일하지만, 정규식에서는 이스케이프로 처리
      // lookbehind가 백슬래시를 블랙리스트에 포함하므로 매칭 안됨
      const cases = [
        {
          input: '\\/pattern\\/',
          expected: '\\/pattern\\/',
          paths: [],
          description: '정규식 리터럴 이스케이프',
        },
        {
          input: '\\/test\\/i.test(../value)',
          expected: '\\/test\\/i.test(dependencies[0])',
          paths: ['../value'],
          description: '정규식 + 경로 조합',
        },
        {
          input: '(\\/abc\\/).test(../str)',
          expected: '(\\/abc\\/).test(dependencies[0])',
          paths: ['../str'],
          description: '괄호로 감싼 정규식 + 경로',
        },
        {
          // 경로와 메서드를 분리하려면 괄호 필요 (그렇지 않으면 .match가 경로의 일부)
          input: '(../value).match(\\/\\d+\\/)',
          expected: '(dependencies[0]).match(\\/\\d+\\/)',
          paths: ['../value'],
          description: 'match 메서드와 이스케이프된 정규식',
        },
      ];

      cases.forEach(({ input, expected, paths }) => {
        const result = transformExpression(input);
        expect(result.result).toBe(expected);
        expect(result.paths).toEqual(paths);
      });
    });

    test('이스케이프 안된 슬래시는 절대 경로로 매칭됨', () => {
      // 비교: 이스케이프 없이 /pattern/은 경로로 매칭
      const result = transformExpression('/pattern/');
      expect(result.paths).toEqual(['/pattern']);
      // /pattern/은 /pattern 경로 + / 나누기 연산자로 해석됨
    });
  });

  describe('Performance - deeply nested paths (ReDoS prevention)', () => {
    test('extremely deep parent references', () => {
      const deepParent = '../'.repeat(100) + 'target';
      const result = transformExpression(deepParent);
      expect(result.paths).toHaveLength(1);
      expect(result.paths[0]).toBe(deepParent);
    });

    test('extremely deep path segments', () => {
      const deepPath = '#/' + Array(200).fill('level').join('/');
      const result = transformExpression(deepPath);
      expect(result.paths).toHaveLength(1);
      expect(result.paths[0]).toBe(deepPath);
    });

    test('combined deep parent refs and segments', () => {
      const combinedPath =
        '../'.repeat(30) + Array(100).fill('segment').join('/');
      const result = transformExpression(combinedPath);
      expect(result.paths).toHaveLength(1);
      expect(result.paths[0]).toBe(combinedPath);
    });

    test('deeply nested paths should complete quickly', () => {
      const start = performance.now();

      transformExpression('../'.repeat(50) + 'a');
      transformExpression('#/' + 'a/'.repeat(200) + 'final');
      transformExpression('./' + 'path/'.repeat(100) + 'end');

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in < 100ms
    });

    test('multiple deep paths in single expression', () => {
      const expr = `${'../'.repeat(20)}a === "x" && #/${'b/'.repeat(50)}c > 0`;
      const result = transformExpression(expr);
      expect(result.paths).toHaveLength(2);
    });

    test('pathological nesting patterns should not cause ReDoS', () => {
      const start = performance.now();

      // Test various pathological patterns
      transformExpression('../'.repeat(200) + 'end');
      transformExpression('#/' + 'segment/'.repeat(300) + 'final');
      transformExpression(
        '../'.repeat(50) + 'a === "x" && ../' + 'b/'.repeat(50) + 'c > 0',
      );

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(200); // Should complete in < 200ms
    });
  });
});

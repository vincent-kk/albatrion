import { describe, expect, test } from 'vitest';

import { JSON_POINTER_REGEX } from '../regex';

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
      .replace(JSON_POINTER_REGEX, (path) => {
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
          input: '!(../disabled) && ((../../role) === "admin" || (../superuser))',
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
          expected: 'dependencies[0][0] === "first"',
          paths: ['../items'],
        },
        {
          input: '../../data["key"] !== undefined',
          expected: 'dependencies[0]["key"] !== undefined',
          paths: ['../../data'],
        },
        {
          input: '../users[../currentIndex].name',
          expected: 'dependencies[0][dependencies[1]].name',
          paths: ['../users', '../currentIndex'],
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
          input: '[../b]',
          expected: '[dependencies[0]]',
          paths: ['../b'],
        },
        {
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
          input: '(/)', // 괄호 안의 나누기 연산자
          expected: 'dependencies[0]',
          paths: ['(/)'],
        },
        {
          input: '/absolute/path', // 명확한 절대 경로
          expected: 'dependencies[0]',
          paths: ['/absolute/path'],
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
});

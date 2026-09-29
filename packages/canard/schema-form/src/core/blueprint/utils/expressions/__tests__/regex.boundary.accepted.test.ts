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
});

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
});

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
});

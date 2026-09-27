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
});

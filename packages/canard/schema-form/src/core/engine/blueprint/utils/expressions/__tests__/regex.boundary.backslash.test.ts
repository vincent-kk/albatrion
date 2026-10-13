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
});

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
});

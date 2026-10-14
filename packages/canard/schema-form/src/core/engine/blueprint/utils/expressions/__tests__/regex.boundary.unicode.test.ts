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
});

import { describe, expect, test } from 'vitest';

import { JSON_POINTER_PATH_REGEX } from '../regex';

describe('Context Symbol (@) - JSON_POINTER_REGEX', () => {

  // 헬퍼 함수: 의존성 변환 테스트
  const testDepsMatch = (input: string) => {
    const pathManager: string[] = [];
    const computedExpression = input
      .replace(JSON_POINTER_PATH_REGEX, (path) => {
        if (!pathManager.includes(path)) pathManager.push(path);
        return `dependencies[${pathManager.indexOf(path)}]`;
      })
      .trim()
      .replace(/;$/, '');
    return { pathManager, computedExpression };
  };

  describe('@ 단독 사용 사례', () => {
    test('@ 조건 체크', () => {
      const result = testDepsMatch('@ !== null');
      expect(result.pathManager).toEqual(['@']);
      expect(result.computedExpression).toBe('dependencies[0] !== null');
    });

    test('@ 속성 접근', () => {
      // @.property 형태가 아닌 @ 단독 사용 후 JavaScript 접근
      const result = testDepsMatch('(@).someProperty === "value"');
      expect(result.pathManager).toEqual(['@']);
      expect(result.computedExpression).toBe(
        '(dependencies[0]).someProperty === "value"',
      );
    });

    test('@ 타입 체크', () => {
      const result = testDepsMatch('typeof @ === "object"');
      expect(result.pathManager).toEqual(['@']);
      expect(result.computedExpression).toBe(
        'typeof dependencies[0] === "object"',
      );
    });

    test('@ null 체크와 속성 접근', () => {
      const result = testDepsMatch('@ && (@).enabled');
      expect(result.pathManager).toEqual(['@']);
      expect(result.computedExpression).toBe(
        'dependencies[0] && (dependencies[0]).enabled',
      );
    });
  });
});

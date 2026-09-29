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

  describe('@ 중복 사용', () => {
    test('@ 여러 번 사용시 동일 인덱스', () => {
      const result = testDepsMatch('@ !== null && @ !== undefined');
      expect(result.pathManager).toEqual(['@']);
      expect(result.computedExpression).toBe(
        'dependencies[0] !== null && dependencies[0] !== undefined',
      );
    });

    test('@ 복잡한 조건에서 중복', () => {
      const result = testDepsMatch('(@ && (@).active) || (@ && (@).enabled)');
      expect(result.pathManager).toEqual(['@']);
      expect(result.computedExpression).toBe(
        '(dependencies[0] && (dependencies[0]).active) || (dependencies[0] && (dependencies[0]).enabled)',
      );
    });
  });
});

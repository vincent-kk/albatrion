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

  describe('@ 와 다른 JSON Pointer 패턴 조합', () => {
    test('@ 와 상대 경로 조합', () => {
      const result = testDepsMatch('../path && @');
      expect(result.pathManager).toEqual(['../path', '@']);
      expect(result.computedExpression).toBe(
        'dependencies[0] && dependencies[1]',
      );
    });

    test('@ 와 현재 디렉토리 경로 조합', () => {
      const result = testDepsMatch('./current || @');
      expect(result.pathManager).toEqual(['./current', '@']);
      expect(result.computedExpression).toBe(
        'dependencies[0] || dependencies[1]',
      );
    });

    test('@ 와 프래그먼트 참조 조합', () => {
      const result = testDepsMatch('#/property && @');
      expect(result.pathManager).toEqual(['#/property', '@']);
      expect(result.computedExpression).toBe(
        'dependencies[0] && dependencies[1]',
      );
    });

    test('@ 와 절대 경로 조합', () => {
      const result = testDepsMatch('/absolute/path || @');
      expect(result.pathManager).toEqual(['/absolute/path', '@']);
      expect(result.computedExpression).toBe(
        'dependencies[0] || dependencies[1]',
      );
    });

    test('@ 여러 경로와 함께 사용', () => {
      const result = testDepsMatch(
        '../age >= 18 && @ !== null && #/status === "active"',
      );
      expect(result.pathManager).toEqual(['../age', '@', '#/status']);
      expect(result.computedExpression).toBe(
        'dependencies[0] >= 18 && dependencies[1] !== null && dependencies[2] === "active"',
      );
    });
  });
});

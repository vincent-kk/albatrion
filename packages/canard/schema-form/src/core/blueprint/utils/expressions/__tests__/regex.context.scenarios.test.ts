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

  describe('실제 사용 시나리오', () => {
    test('UserDefinedContext 참조 - 컨텍스트 존재 확인', () => {
      const result = testDepsMatch('@ !== null && @ !== undefined');
      expect(result.pathManager).toEqual(['@']);
      expect(result.computedExpression).toBe(
        'dependencies[0] !== null && dependencies[0] !== undefined',
      );
    });

    test('UserDefinedContext 참조 - 속성 기반 조건', () => {
      const result = testDepsMatch('@ && (@).userRole === "admin"');
      expect(result.pathManager).toEqual(['@']);
      expect(result.computedExpression).toBe(
        'dependencies[0] && (dependencies[0]).userRole === "admin"',
      );
    });

    test('UserDefinedContext와 폼 필드 조합', () => {
      const result = testDepsMatch(
        '(@).permissions?.edit && ../status === "draft"',
      );
      expect(result.pathManager).toEqual(['@', '../status']);
      expect(result.computedExpression).toBe(
        '(dependencies[0]).permissions?.edit && dependencies[1] === "draft"',
      );
    });

    test('복합 조건 - Context와 다중 경로', () => {
      const result = testDepsMatch(
        '@ && (#/userType === "premium" || ../age >= 21)',
      );
      expect(result.pathManager).toEqual(['@', '#/userType', '../age']);
      expect(result.computedExpression).toBe(
        'dependencies[0] && (dependencies[1] === "premium" || dependencies[2] >= 21)',
      );
    });

    test('Context 속성 접근 - @.property 패턴', () => {
      // @.property 형태에서 @만 매칭되고 .property는 JavaScript 속성 접근으로 남음
      const result = testDepsMatch('@.userRole === "admin"');
      expect(result.pathManager).toEqual(['@']);
      expect(result.computedExpression).toBe(
        'dependencies[0].userRole === "admin"',
      );
    });

    test('Context 중첩 속성 접근 - @.a.b.c 패턴', () => {
      const result = testDepsMatch('@.config.settings.enabled');
      expect(result.pathManager).toEqual(['@']);
      expect(result.computedExpression).toBe(
        'dependencies[0].config.settings.enabled',
      );
    });

    test('Context 속성 접근과 다른 경로 조합', () => {
      const result = testDepsMatch(
        '@.permissions.canEdit && ../status === "draft"',
      );
      expect(result.pathManager).toEqual(['@', '../status']);
      expect(result.computedExpression).toBe(
        'dependencies[0].permissions.canEdit && dependencies[1] === "draft"',
      );
    });
  });
});

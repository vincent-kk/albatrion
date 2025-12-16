import { describe, expect, test } from 'vitest';

import { JSON_POINTER_PATH_REGEX } from '../regex';

describe('Context Symbol (@) - JSON_POINTER_REGEX', () => {
  // 헬퍼 함수: 정규식 테스트 (전역 플래그 때문에 lastIndex 리셋 필요)
  const testRegex = (input: string): boolean => {
    JSON_POINTER_PATH_REGEX.lastIndex = 0;
    return JSON_POINTER_PATH_REGEX.test(input);
  };

  // 헬퍼 함수: 단독으로 테스트 (앞에 공백 추가)
  const testRegexStandalone = (input: string): boolean => {
    return testRegex(` ${input}`) || testRegex(input);
  };

  // 헬퍼 함수: 매칭된 결과 추출
  const extractMatches = (input: string): string[] => {
    JSON_POINTER_PATH_REGEX.lastIndex = 0;
    const matches: string[] = [];
    let match;
    while ((match = JSON_POINTER_PATH_REGEX.exec(input)) !== null) {
      matches.push(match[0]);
    }
    return matches;
  };

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

  describe('유효한 Context 패턴 - @ 단독 사용', () => {
    test('@ 단독으로 매칭되어야 함', () => {
      expect(testRegexStandalone('@')).toBe(true);
    });

    test('@ 뒤에 공백이 있는 경우 매칭', () => {
      expect(extractMatches('@ ')).toEqual(['@']);
      expect(extractMatches('@  ')).toEqual(['@']);
    });

    test('@ 앞뒤에 공백이 있는 경우 매칭', () => {
      expect(extractMatches(' @ ')).toEqual(['@']);
      expect(extractMatches('  @  ')).toEqual(['@']);
    });

    test('괄호 안의 @ 매칭', () => {
      expect(extractMatches('(@)')).toEqual(['@']);
      expect(extractMatches('( @ )')).toEqual(['@']);
    });

    test('표현식 끝에 @ 사용', () => {
      expect(extractMatches('value && @')).toEqual(['@']);
      expect(extractMatches('../path || @')).toEqual(['../path', '@']);
    });
  });

  describe('무효한 Context 패턴 - @ 연결된 경우', () => {
    test('@/ 형태는 전체가 매칭되지 않아야 함', () => {
      // @/ 로 시작하는 패턴은 @도 /path도 매칭되지 않음
      expect(extractMatches('@/')).toEqual([]);
      expect(extractMatches('@/path')).toEqual([]);
      expect(extractMatches('@/nested/path')).toEqual([]);
    });

    test('@property 형태는 매칭되지 않아야 함', () => {
      expect(extractMatches('@property')).toEqual([]);
      expect(extractMatches('@value')).toEqual([]);
      expect(extractMatches('@test123')).toEqual([]);
    });

    test('@숫자 형태는 매칭되지 않아야 함', () => {
      expect(extractMatches('@123')).toEqual([]);
      expect(extractMatches('@0')).toEqual([]);
    });

    test('@_ 형태는 매칭되지 않아야 함', () => {
      expect(extractMatches('@_private')).toEqual([]);
      expect(extractMatches('@_')).toEqual([]);
    });

    test('/something/@/something 형태 - @가 경로 세그먼트로 포함됨', () => {
      // @가 경로 세그먼트의 일부로 사용되면 전체 경로가 매칭됨
      // @는 Context(Pattern 5)로 개별 매칭되지 않음
      expect(extractMatches('/path/@/other')).toEqual(['/path/@/other']);
      expect(extractMatches('/a/@/b')).toEqual(['/a/@/b']);
    });
  });

  describe('@ 와 다른 JSON Pointer 패턴 조합', () => {
    test('@ 와 상대 경로 조합', () => {
      const result = testDepsMatch('../path && @');
      expect(result.pathManager).toEqual(['../path', '@']);
      expect(result.computedExpression).toBe('dependencies[0] && dependencies[1]');
    });

    test('@ 와 현재 디렉토리 경로 조합', () => {
      const result = testDepsMatch('./current || @');
      expect(result.pathManager).toEqual(['./current', '@']);
      expect(result.computedExpression).toBe('dependencies[0] || dependencies[1]');
    });

    test('@ 와 프래그먼트 참조 조합', () => {
      const result = testDepsMatch('#/property && @');
      expect(result.pathManager).toEqual(['#/property', '@']);
      expect(result.computedExpression).toBe('dependencies[0] && dependencies[1]');
    });

    test('@ 와 절대 경로 조합', () => {
      const result = testDepsMatch('/absolute/path || @');
      expect(result.pathManager).toEqual(['/absolute/path', '@']);
      expect(result.computedExpression).toBe('dependencies[0] || dependencies[1]');
    });

    test('@ 여러 경로와 함께 사용', () => {
      const result = testDepsMatch('../age >= 18 && @ !== null && #/status === "active"');
      expect(result.pathManager).toEqual(['../age', '@', '#/status']);
      expect(result.computedExpression).toBe(
        'dependencies[0] >= 18 && dependencies[1] !== null && dependencies[2] === "active"',
      );
    });
  });

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
      expect(result.computedExpression).toBe('(dependencies[0]).someProperty === "value"');
    });

    test('@ 타입 체크', () => {
      const result = testDepsMatch('typeof @ === "object"');
      expect(result.pathManager).toEqual(['@']);
      expect(result.computedExpression).toBe('typeof dependencies[0] === "object"');
    });

    test('@ null 체크와 속성 접근', () => {
      const result = testDepsMatch('@ && (@).enabled');
      expect(result.pathManager).toEqual(['@']);
      expect(result.computedExpression).toBe('dependencies[0] && (dependencies[0]).enabled');
    });
  });

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
      expect(result.computedExpression).toBe('dependencies[0].userRole === "admin"');
    });

    test('Context 중첩 속성 접근 - @.a.b.c 패턴', () => {
      const result = testDepsMatch('@.config.settings.enabled');
      expect(result.pathManager).toEqual(['@']);
      expect(result.computedExpression).toBe('dependencies[0].config.settings.enabled');
    });

    test('Context 속성 접근과 다른 경로 조합', () => {
      const result = testDepsMatch('@.permissions.canEdit && ../status === "draft"');
      expect(result.pathManager).toEqual(['@', '../status']);
      expect(result.computedExpression).toBe(
        'dependencies[0].permissions.canEdit && dependencies[1] === "draft"',
      );
    });
  });

  describe('엣지 케이스', () => {
    test('@ 뒤에 연산자가 오는 경우', () => {
      expect(extractMatches('@ === true')).toEqual(['@']);
      expect(extractMatches('@ !== false')).toEqual(['@']);
      expect(extractMatches('@ > 0')).toEqual(['@']);
      expect(extractMatches('@ && ../value')).toEqual(['@', '../value']);
      expect(extractMatches('@ || #/default')).toEqual(['@', '#/default']);
    });

    test('@ 뒤에 괄호가 오는 경우', () => {
      expect(extractMatches('@)')).toEqual(['@']);
      expect(extractMatches('(@))')).toEqual(['@']);
    });

    test('@ 뒤에 쉼표가 오는 경우', () => {
      expect(extractMatches('@,')).toEqual(['@']);
      expect(extractMatches('@, ../value')).toEqual(['@', '../value']);
    });

    test('@ 뒤에 세미콜론이 오는 경우', () => {
      expect(extractMatches('@;')).toEqual(['@']);
    });

    test('문자열 내의 @ - 매칭되지 않아야 함', () => {
      // 따옴표 바로 뒤의 @는 매칭되지 않음
      expect(extractMatches('"@"')).toEqual([]);
      expect(extractMatches("'@'")).toEqual([]);
      expect(extractMatches('`@`')).toEqual([]);

      // 문자열 리터럴 내부의 @도 매칭되지 않음
      expect(extractMatches('"test@email.com"')).toEqual([]);
    });

    test('email 형태 - 매칭되지 않아야 함', () => {
      expect(extractMatches('user@domain')).toEqual([]);
      expect(extractMatches('test@test.com')).toEqual([]);
    });

    test('특수문자 뒤의 @ - 매칭되지 않아야 함', () => {
      // 문자열 내 특수문자 조합에서 @는 매칭되지 않음
      expect(extractMatches('!@#$%')).toEqual([]);
      expect(extractMatches('특수문자!@#$%^&*()')).toEqual([]);
      expect(extractMatches('#@tag')).toEqual([]);
      expect(extractMatches('$@variable')).toEqual([]);
      expect(extractMatches('%@percent')).toEqual([]);
      expect(extractMatches('^@caret')).toEqual([]);
      expect(extractMatches('&@ampersand')).toEqual([]);
      expect(extractMatches('*@asterisk')).toEqual([]);
    });

    test('문자열 내 특수문자와 @ 조합이 포함된 표현식', () => {
      // 경로는 매칭되지만, 문자열 내의 @는 매칭되지 않음
      const result = testDepsMatch('./root/value === "특수문자!@#$%^&*()"');
      expect(result.pathManager).toEqual(['./root/value']);
      expect(result.computedExpression).toBe('dependencies[0] === "특수문자!@#$%^&*()"');
    });

    test('@./ 또는 @../ 형태 - @ 뒤에 Current/Parent 경로가 오는 경우', () => {
      // @./ 와 @../ 형태는 @ 도 경로도 매칭되지 않음
      expect(extractMatches('@./')).toEqual([]);
      expect(extractMatches('@../')).toEqual([]);
      expect(extractMatches('@./path')).toEqual([]);
      expect(extractMatches('@../path')).toEqual([]);
    });

    test('@.property 형태 - @ 뒤에 속성 접근이 오는 경우 @만 매칭', () => {
      // @.aa 형태는 @만 매칭되고 .aa는 남음 (JavaScript 속성 접근)
      expect(extractMatches('@.aa')).toEqual(['@']);
      expect(extractMatches('@.aa.bb.cc')).toEqual(['@']);
      expect(extractMatches('@.property')).toEqual(['@']);
    });

    test('includes("@") 같은 메서드 호출에서 @ - 매칭되지 않아야 함', () => {
      const result = testDepsMatch('(../email).includes("@")');
      expect(result.pathManager).toEqual(['../email']);
      expect(result.computedExpression).toBe('(dependencies[0]).includes("@")');
    });
  });
});

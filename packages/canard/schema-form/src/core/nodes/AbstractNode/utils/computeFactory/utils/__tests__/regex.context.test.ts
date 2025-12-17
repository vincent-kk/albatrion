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

    test('@ 뒤에 닫는 브래킷/중괄호가 오는 경우 - 매칭됨', () => {
      // 닫는 브래킷 ] 과 중괄호 } 는 유효한 JS 토큰으로 허용됨
      expect(extractMatches('@]')).toEqual(['@']);
      expect(extractMatches('@}')).toEqual(['@']);
      // 닫는 소괄호 ) 도 허용됨
      expect(extractMatches('@)')).toEqual(['@']);
    });

    test('유효한 @ + 브래킷 사용 - 열린 브래킷이 먼저 있는 경우', () => {
      // 브래킷 접근: @["key"] - @ 뒤에 [ 가 먼저 오므로 유효
      expect(extractMatches('@["key"]')).toEqual(['@']);
      expect(extractMatches('@[0]')).toEqual(['@']);
      // 객체 내 @: { value: @ } - @ 뒤에 공백 후 } 이므로 유효
      expect(extractMatches('{ value: @ }')).toEqual(['@']);
      // 배열 내 @: [ @, value ] - @ 뒤에 쉼표이므로 유효
      expect(extractMatches('[ @, value ]')).toEqual(['@']);
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

    test('path prefix 뒤의 @ - 매칭되지 않아야 함', () => {
      // # . / @ 뒤의 @는 path prefix 뒤이므로 매칭 안 됨
      expect(extractMatches('!@#$%')).toEqual([]);
      expect(extractMatches('특수문자!@#$%^&*()')).toEqual([]);
      expect(extractMatches('#@tag')).toEqual([]);
      expect(extractMatches('$@variable')).toEqual([]);
      expect(extractMatches('%@percent')).toEqual([]);
      expect(extractMatches('^@caret')).toEqual([]);
      expect(extractMatches('&@ampersand')).toEqual([]);
      expect(extractMatches('*@asterisk')).toEqual([]);

      expect(extractMatches('#@tag')).toEqual([]);
      expect(extractMatches('.@prop')).toEqual([]);
      expect(extractMatches('/@path')).toEqual(['/@path']); // /@ 는 절대경로의 일부
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

    test('@ 뒤에 @ 가 오는 경우 - 매칭되지 않아야 함', () => {
      expect(extractMatches('@@')).toEqual([]);
      expect(extractMatches('@@@')).toEqual([]);
    });
  });

  describe('연산자 뒤의 @ - JS 표현식 위치에서 매칭', () => {
    test('단항 연산자 뒤의 @', () => {
      // 논리 부정
      expect(extractMatches('!@')).toEqual(['@']);
      expect(extractMatches('!@.property')).toEqual(['@']);
      expect(extractMatches('!@.aa.bb.cc')).toEqual(['@']);

      // 비트 NOT
      expect(extractMatches('~@')).toEqual(['@']);
      expect(extractMatches('~@.value')).toEqual(['@']);

      // 단항 플러스/마이너스
      expect(extractMatches('+@')).toEqual(['@']);
      expect(extractMatches('-@')).toEqual(['@']);
    });

    test('소괄호 안의 @', () => {
      // 함수 호출의 인자로 사용
      expect(extractMatches('func(@)')).toEqual(['@']);
      expect(extractMatches('func(@, ../value)')).toEqual(['@', '../value']);
    });

    test('구분자 뒤의 @', () => {
      expect(extractMatches(',@')).toEqual(['@']);
      expect(extractMatches(';@')).toEqual(['@']);
      expect(extractMatches(':@')).toEqual(['@']);
      expect(extractMatches('?@')).toEqual(['@']);
    });

    test('이항 연산자 뒤의 @', () => {
      expect(extractMatches('x&&@')).toEqual(['@']);
      expect(extractMatches('x||@')).toEqual(['@']);
      expect(extractMatches('x===@')).toEqual(['@']);
      expect(extractMatches('x!==@')).toEqual(['@']);
      expect(extractMatches('x>@')).toEqual(['@']);
      expect(extractMatches('x<@')).toEqual(['@']);
      expect(extractMatches('x>=@')).toEqual(['@']);
      expect(extractMatches('x<=@')).toEqual(['@']);
    });

    test('연산자 뒤의 @ 와 속성 접근 조합 - 실제 사용 예시', () => {
      // !@.property 패턴 - 가장 일반적인 사용 케이스
      const result1 = testDepsMatch('!@.isAdmin');
      expect(result1.pathManager).toEqual(['@']);
      expect(result1.computedExpression).toBe('!dependencies[0].isAdmin');

      // !@.nested.property 패턴
      const result2 = testDepsMatch('!@.config.enabled && ../visible');
      expect(result2.pathManager).toEqual(['@', '../visible']);
      expect(result2.computedExpression).toBe(
        '!dependencies[0].config.enabled && dependencies[1]',
      );

      // 삼항 연산자에서 사용
      const result3 = testDepsMatch(
        '@.role === "admin" ? !@.disabled : @.enabled',
      );
      expect(result3.pathManager).toEqual(['@']);
      expect(result3.computedExpression).toBe(
        'dependencies[0].role === "admin" ? !dependencies[0].disabled : dependencies[0].enabled',
      );
    });

    test('대괄호 속성 접근 - @["key"] 및 @[index]', () => {
      // @['key'] 형태 - 대괄호 속성 접근
      const result1 = testDepsMatch('@["property"]');
      expect(result1.pathManager).toEqual(['@']);
      expect(result1.computedExpression).toBe('dependencies[0]["property"]');

      // @[index] 형태
      const result2 = testDepsMatch('@[0]');
      expect(result2.pathManager).toEqual(['@']);
      expect(result2.computedExpression).toBe('dependencies[0][0]');

      // 복합 표현식
      const result3 = testDepsMatch('@["items"][0].name');
      expect(result3.pathManager).toEqual(['@']);
      expect(result3.computedExpression).toBe(
        'dependencies[0]["items"][0].name',
      );
    });
  });

  describe('Performance - repeated @ characters (ReDoS prevention)', () => {
    test('many repeated @ characters should not cause catastrophic backtracking', () => {
      // Various @ repetitions - none should match
      expect(extractMatches('@@@@@@@')).toEqual([]);
      expect(extractMatches('@@@@@@@@@@')).toEqual([]);
      expect(extractMatches('@'.repeat(50))).toEqual([]);
      expect(extractMatches('@'.repeat(100))).toEqual([]);
    });

    test('@ followed by many repeated characters should not match', () => {
      expect(extractMatches('@' + 'a'.repeat(100))).toEqual([]);
      expect(extractMatches('@' + 'a'.repeat(1000))).toEqual([]);
    });

    test('alternating @ and other characters', () => {
      expect(extractMatches('@a@b@c@d@e')).toEqual([]);
      expect(extractMatches('a@b@c@d@e@')).toEqual([]);
    });

    test('@ in various problematic positions should complete quickly', () => {
      // All should complete quickly without hanging
      const start = performance.now();
      extractMatches('@'.repeat(1000));
      extractMatches('@/'.repeat(100));
      extractMatches('@..'.repeat(100));
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in < 100ms
    });

    test('pathological patterns with @ should not cause ReDoS', () => {
      const start = performance.now();

      // Test various pathological patterns
      extractMatches('user' + '@'.repeat(100));
      extractMatches('@'.repeat(50) + 'domain');
      extractMatches(('@/' + 'path').repeat(50));
      extractMatches(('@.' + 'prop').repeat(50));

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in < 100ms
    });
  });

  describe('Edge case verification - 스펙 확인', () => {
    test('{@ - 중괄호 뒤의 @', () => {
      // { 는 허용됨 (JS 표현식 내 객체 리터럴 컨텍스트)
      expect(extractMatches('{@')).toEqual(['@']);
      expect(extractMatches('{@}')).toEqual(['@']);
      // 공백이 있어도 매칭됨
      expect(extractMatches('{ @')).toEqual(['@']);
      expect(extractMatches('{ @ }')).toEqual(['@']);
    });

    test('# 단독 - Fragment 단독', () => {
      // # 단독 허용 (@ 와 유사)
      expect(extractMatches('#')).toEqual(['#']);
      expect(extractMatches('# ')).toEqual(['#']);
      expect(extractMatches('(#)')).toEqual(['#']);
      expect(extractMatches('#.prop')).toEqual(['#']);
      expect(extractMatches('#["key"]')).toEqual(['#']);
      // #/ 는 Pattern 1로 매칭
      expect(extractMatches('#/')).toEqual(['#/']);
      expect(extractMatches('#/path')).toEqual(['#/path']);
      // #identifier 는 매칭 안됨
      expect(extractMatches('#alone')).toEqual([]);
      expect(extractMatches('#123')).toEqual([]);
    });

    test('경로 내 @ 포함 - path segment 내에 @ 허용', () => {
      // @ 는 path segment에서 허용되는 문자
      expect(extractMatches('./aa/@asdas/bbb/cc')).toEqual(['./aa/@asdas/bbb/cc']);
      expect(extractMatches('#/config/@env/value')).toEqual(['#/config/@env/value']);
      expect(extractMatches('../@special/path')).toEqual(['../@special/path']);
      expect(extractMatches('/@root/@nested')).toEqual(['/@root/@nested']);
    });

    test('경로 내 @ 단독 세그먼트', () => {
      // @ 가 세그먼트 이름으로 사용되는 경우
      expect(extractMatches('./@/path')).toEqual(['./@/path']);
      expect(extractMatches('#/@/value')).toEqual(['#/@/value']);
      expect(extractMatches('../@/data')).toEqual(['../@/data']);
    });

    test('경로 내 @ vs 독립 @ 구분', () => {
      // @ 가 경로의 일부일 때 vs 독립적인 context일 때
      expect(extractMatches('./aa/@asdas/bbb/cc === true')).toEqual(['./aa/@asdas/bbb/cc']);
      expect(extractMatches('@ === true')).toEqual(['@']);
      expect(extractMatches('@.prop && ./path/@segment')).toEqual(['@', './path/@segment']);
    });
  });
});

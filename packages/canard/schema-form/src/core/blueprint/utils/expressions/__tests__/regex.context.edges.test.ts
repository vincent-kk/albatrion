import { describe, expect, test } from 'vitest';

import { JSON_POINTER_PATH_REGEX } from '../regex';

describe('Context Symbol (@) - JSON_POINTER_REGEX', () => {

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
});

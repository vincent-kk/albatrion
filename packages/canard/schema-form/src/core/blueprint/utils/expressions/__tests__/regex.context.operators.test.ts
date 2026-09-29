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
});

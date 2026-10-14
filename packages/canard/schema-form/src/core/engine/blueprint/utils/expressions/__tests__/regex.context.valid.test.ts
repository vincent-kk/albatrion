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
});

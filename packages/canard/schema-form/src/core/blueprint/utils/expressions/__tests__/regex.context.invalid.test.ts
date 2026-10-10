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
});

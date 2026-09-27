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
      expect(extractMatches('./aa/@asdas/bbb/cc')).toEqual([
        './aa/@asdas/bbb/cc',
      ]);
      expect(extractMatches('#/config/@env/value')).toEqual([
        '#/config/@env/value',
      ]);
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
      expect(extractMatches('./aa/@asdas/bbb/cc === true')).toEqual([
        './aa/@asdas/bbb/cc',
      ]);
      expect(extractMatches('@ === true')).toEqual(['@']);
      expect(extractMatches('@.prop && ./path/@segment')).toEqual([
        '@',
        './path/@segment',
      ]);
    });
  });
});

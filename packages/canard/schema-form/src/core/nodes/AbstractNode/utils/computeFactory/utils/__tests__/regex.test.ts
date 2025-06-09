import { describe, expect, test } from 'vitest';

import { JSON_POINTER_REGEX } from '../regex';

describe('JSON_POINTER_REGEX', () => {
  // 헬퍼 함수: 정규식 테스트 (전역 플래그 때문에 lastIndex 리셋 필요)
  const testRegex = (input: string): boolean => {
    JSON_POINTER_REGEX.lastIndex = 0;
    return JSON_POINTER_REGEX.test(input);
  };

  // 헬퍼 함수: 단독으로 테스트 (앞에 공백 추가)
  const testRegexStandalone = (input: string): boolean => {
    return testRegex(` ${input}`) || testRegex(input); // 공백 추가하거나 문자열 시작에서 테스트
  };

  // 헬퍼 함수: 매칭된 결과 추출
  const extractMatches = (input: string): string[] => {
    JSON_POINTER_REGEX.lastIndex = 0;
    const matches: string[] = [];
    let match;
    while ((match = JSON_POINTER_REGEX.exec(input)) !== null) {
      matches.push(match[0]);
    }
    return matches;
  };

  describe('유효한 JSON Pointer 패턴', () => {
    test('Root pointer (#) 패턴들', () => {
      expect(testRegexStandalone('#/property')).toBe(true);
      expect(testRegexStandalone('#/nested/path')).toBe(true);
      expect(testRegexStandalone('#/deeply/nested/path/property')).toBe(true);
      expect(testRegexStandalone('#/123numbers')).toBe(true);
      expect(testRegexStandalone('#/mixed123')).toBe(true);
    });

    test('Parent pointer (..) 패턴들', () => {
      expect(testRegexStandalone('../property')).toBe(true);
      expect(testRegexStandalone('../nested/path')).toBe(true);
      expect(testRegexStandalone('../deeply/nested/path/property')).toBe(true);
      expect(testRegexStandalone('../123numbers')).toBe(true);
      expect(testRegexStandalone('../mixed123')).toBe(true);
    });

    test('Current pointer (.) 패턴들', () => {
      expect(testRegexStandalone('./property')).toBe(true);
      expect(testRegexStandalone('./nested/path')).toBe(true);
      expect(testRegexStandalone('./deeply/nested/path/property')).toBe(true);
      expect(testRegexStandalone('./123numbers')).toBe(true);
      expect(testRegexStandalone('./mixed123')).toBe(true);
    });

    test('Absolute pointer (/) 패턴들', () => {
      expect(testRegexStandalone('/property')).toBe(true);
      expect(testRegexStandalone('/nested/path')).toBe(true);
      expect(testRegexStandalone('/deeply/nested/path/property')).toBe(true);
      expect(testRegexStandalone('/123numbers')).toBe(true);
      expect(testRegexStandalone('/mixed123')).toBe(true);
    });
  });

  describe('무효한 JSON Pointer 패턴', () => {
    test('prefix 없이 property만 있는 경우', () => {
      expect(testRegex('property')).toBe(false);
      expect(testRegex('nested')).toBe(false);
      expect(testRegex('123numbers')).toBe(false);
    });

    test('잘못된 prefix 패턴들', () => {
      expect(testRegexStandalone('#property')).toBe(false); // / 없음
      expect(testRegexStandalone('..property')).toBe(false); // / 없음
      expect(testRegexStandalone('.property')).toBe(false); // / 없음
    });

    test('빈 경로들', () => {
      expect(testRegexStandalone('#/')).toBe(false);
      expect(testRegexStandalone('../')).toBe(false);
      expect(testRegexStandalone('./')).toBe(false);
      expect(testRegexStandalone('/')).toBe(false);
    });

    test('특수 문자가 포함된 property names', () => {
      // 현재 정규식은 a-zA-Z0-9만 지원하므로 부분 매칭만 됨
      expect(testRegex('#/prop-with-dash')).toBe(true); // #/prop까지만 매칭
      expect(testRegex('#/prop_with_underscore')).toBe(true); // #/prop까지만 매칭
      expect(testRegex('#/prop with space')).toBe(true); // #/prop까지만 매칭
      expect(testRegex('#/prop.with.dot')).toBe(true); // #/prop까지만 매칭
    });

    test('비ASCII 문자들', () => {
      expect(testRegexStandalone('#/한글속성')).toBe(false);
      expect(testRegexStandalone('#/属性')).toBe(false);
      expect(testRegexStandalone('#/свойство')).toBe(false);
    });

    test('잘못된 구조들', () => {
      expect(testRegexStandalone('##/property')).toBe(false);
      expect(testRegexStandalone('...../property')).toBe(false);
      expect(testRegexStandalone('.//')).toBe(false);
      expect(testRegexStandalone('#//property')).toBe(false);
    });
  });

  describe('부분 매칭 동작', () => {
    test('텍스트 내에서 JSON Pointer 추출', () => {
      expect(extractMatches('text #/property more text')).toEqual([
        '#/property',
      ]);
      expect(extractMatches('some ../property in middle')).toEqual([
        '../property',
      ]);
      expect(extractMatches('start ./property end')).toEqual(['./property']);
      expect(extractMatches('begin /property finish')).toEqual(['/property']);
    });

    test('여러 JSON Pointer 패턴이 있는 경우', () => {
      expect(extractMatches('#/first ../second ./third')).toEqual([
        '#/first',
        '../second',
        './third',
      ]);
      expect(extractMatches('/absolute #/root ../parent ./current')).toEqual([
        '/absolute',
        '#/root',
        '../parent',
        './current',
      ]);
    });

    test('특수 문자로 인한 부분 매칭', () => {
      // 대시, 언더스코어, 공백 등이 있으면 그 앞까지만 매칭됨
      expect(extractMatches('#/prop-with-dash')).toEqual(['#/prop']);
      expect(extractMatches('#/prop_with_underscore')).toEqual(['#/prop']);
      expect(extractMatches('#/prop with space')).toEqual(['#/prop']);
      expect(extractMatches('#/prop.with.dot')).toEqual(['#/prop']);
    });
  });

  describe('edge cases', () => {
    test('빈 문자열', () => {
      expect(testRegex('')).toBe(false);
    });

    test('공백만 있는 문자열', () => {
      expect(testRegex('   ')).toBe(false);
      expect(testRegex('\t\n')).toBe(false);
    });

    test('숫자로만 구성된 property', () => {
      expect(testRegex('#/123')).toBe(true);
      expect(testRegex('../456')).toBe(true);
      expect(testRegex('./789')).toBe(true);
      expect(testRegex('/000')).toBe(true);
    });

    test('매우 긴 경로', () => {
      const longPath = '#/' + 'a'.repeat(1000);
      expect(testRegex(longPath)).toBe(true);

      const deepPath = '#/' + Array(100).fill('level').join('/');
      expect(testRegex(deepPath)).toBe(true);
    });
  });

  describe('실제 사용 사례', () => {
    test('JSON Schema에서 자주 사용되는 패턴들', () => {
      expect(testRegex('#/properties/name')).toBe(true);
      expect(testRegex('#/definitions/user')).toBe(true);
      expect(testRegex('../items/type')).toBe(true);
      expect(testRegex('./properties/age')).toBe(true);
      expect(testRegex('/allOf/0/properties')).toBe(true);
    });

    test('Form 관련 경로들', () => {
      expect(testRegex('#/formData/user/name')).toBe(true);
      expect(testRegex('../validation/required')).toBe(true);
      expect(testRegex('./uiSchema/widget')).toBe(true);
      expect(testRegex('/errors/0/message')).toBe(true);
    });
  });
});

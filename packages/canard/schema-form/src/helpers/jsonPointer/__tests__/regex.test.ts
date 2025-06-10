import { describe, expect, test } from 'vitest';

import { INCLUDE_INDEX_REGEX, JSON_POINTER_REGEX } from '../regex';

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

  const testDepsMatch = (input: string) => {
    const pathManager: string[] = [];
    const computedExpression = input
      .replace(JSON_POINTER_REGEX, (path) => {
        if (!pathManager.includes(path)) pathManager.push(path);
        return `dependencies[${pathManager.indexOf(path)}]`;
      })
      .trim()
      .replace(/;$/, '');
    return { pathManager, computedExpression };
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
      expect(testRegexStandalone('#/')).toBe(true);
      expect(testRegexStandalone('../')).toBe(true);
      expect(testRegexStandalone('./')).toBe(true);
      expect(testRegexStandalone('/')).toBe(true);
    });

    test('특수 문자가 포함된 property names', () => {
      // 현재 정규식은 a-zA-Z0-9만 지원하므로 부분 매칭만 됨
      expect(testRegex('#/prop-with-dash')).toBe(true); // #/prop까지만 매칭
      expect(testRegex('#/prop_with_underscore')).toBe(true); // #/prop까지만 매칭
      expect(testRegex('#/prop with space')).toBe(true); // #/prop까지만 매칭
      expect(testRegex('#/prop.with.dot')).toBe(true); // #/prop까지만 매칭
    });

    test('비ASCII 문자들', () => {
      expect(testRegexStandalone('#/한글속성')).toBe(true);
      expect(testRegexStandalone('#/属性')).toBe(true);
      expect(testRegexStandalone('#/свойство')).toBe(true);
    });

    test('부분 매칭 구조들', () => {
      expect(testRegexStandalone('##/property')).toBe(true);
      expect(testRegexStandalone('...../property')).toBe(true);
      expect(testRegexStandalone('#//property')).toBe(true);
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

    test('괄호 안의 JSON Pointer 추출', () => {
      expect(extractMatches('(../country)')).toEqual(['../country']);
      expect(extractMatches('(#/property)')).toEqual(['#/property']);
      expect(extractMatches('(./local/path)')).toEqual(['./local/path']);
      expect(extractMatches('(/absolute/path)')).toEqual(['/absolute/path']);
      expect(extractMatches('text (../country) more text')).toEqual([
        '../country',
      ]);
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

  describe('testDepsMatch 함수 직접 데이터 테스트', () => {
    test('단일 JSON Pointer 패턴 변환', () => {
      const result1 = testDepsMatch('../age > 18');
      expect(result1.pathManager).toEqual(['../age']);
      expect(result1.computedExpression).toBe('dependencies[0] > 18');

      const result2 = testDepsMatch('#/name === "John"');
      expect(result2.pathManager).toEqual(['#/name']);
      expect(result2.computedExpression).toBe('dependencies[0] === "John"');

      const result3 = testDepsMatch('./country !== null');
      expect(result3.pathManager).toEqual(['./country']);
      expect(result3.computedExpression).toBe('dependencies[0] !== null');

      const result4 = testDepsMatch('/status === "active"');
      expect(result4.pathManager).toEqual(['/status']);
      expect(result4.computedExpression).toBe('dependencies[0] === "active"');
    });

    test('복수 JSON Pointer 패턴 변환', () => {
      const result1 = testDepsMatch('../age > 18 && #/name === "John"');
      expect(result1.pathManager).toEqual(['../age', '#/name']);
      expect(result1.computedExpression).toBe(
        'dependencies[0] > 18 && dependencies[1] === "John"',
      );

      const result2 = testDepsMatch(
        './country === "KR" || ../region === "Asia"',
      );
      expect(result2.pathManager).toEqual(['./country', '../region']);
      expect(result2.computedExpression).toBe(
        'dependencies[0] === "KR" || dependencies[1] === "Asia"',
      );

      const result3 = testDepsMatch(
        '#/user/age >= 21 && #/user/status === "verified" && ../permissions/admin === true',
      );
      expect(result3.pathManager).toEqual([
        '#/user/age',
        '#/user/status',
        '../permissions/admin',
      ]);
      expect(result3.computedExpression).toBe(
        'dependencies[0] >= 21 && dependencies[1] === "verified" && dependencies[2] === true',
      );
    });

    test('중복 JSON Pointer 패턴 처리', () => {
      const result1 = testDepsMatch('../age > 18 && ../age < 65');
      expect(result1.pathManager).toEqual(['../age']);
      expect(result1.computedExpression).toBe(
        'dependencies[0] > 18 && dependencies[0] < 65',
      );

      const result2 = testDepsMatch(
        '#/name !== null && #/name !== "" && #/name.length > 2',
      );
      expect(result2.pathManager).toEqual(['#/name']);
      expect(result2.computedExpression).toBe(
        'dependencies[0] !== null && dependencies[0] !== "" && dependencies[0].length > 2',
      );
    });

    test('복잡한 조건식 변환', () => {
      const result1 = testDepsMatch(
        '(../age >= 18 && ../age <= 65) || #/status === "premium"',
      );
      expect(result1.pathManager).toEqual(['../age', '#/status']);
      expect(result1.computedExpression).toBe(
        '(dependencies[0] >= 18 && dependencies[0] <= 65) || dependencies[1] === "premium"',
      );

      const result2 = testDepsMatch(
        '../country === "US" ? #/state !== null : ./region === "international"',
      );
      expect(result2.pathManager).toEqual([
        '../country',
        '#/state',
        './region',
      ]);
      expect(result2.computedExpression).toBe(
        'dependencies[0] === "US" ? dependencies[1] !== null : dependencies[2] === "international"',
      );
    });

    test('JSON Pointer가 없는 경우', () => {
      const result1 = testDepsMatch('true');
      expect(result1.pathManager).toEqual([]);
      expect(result1.computedExpression).toBe('true');

      const result2 = testDepsMatch('age > 18 && name === "John"');
      expect(result2.pathManager).toEqual([]);
      expect(result2.computedExpression).toBe('age > 18 && name === "John"');

      const result3 = testDepsMatch('1 + 1 === 2');
      expect(result3.pathManager).toEqual([]);
      expect(result3.computedExpression).toBe('1 + 1 === 2');
    });

    test('세미콜론 제거 처리', () => {
      const result1 = testDepsMatch('../age > 18;');
      expect(result1.pathManager).toEqual(['../age']);
      expect(result1.computedExpression).toBe('dependencies[0] > 18');

      const result2 = testDepsMatch('#/name === "John" && ../age >= 21;');
      expect(result2.pathManager).toEqual(['#/name', '../age']);
      expect(result2.computedExpression).toBe(
        'dependencies[0] === "John" && dependencies[1] >= 21',
      );
    });

    test('공백 처리', () => {
      const result1 = testDepsMatch('  ../age > 18  ');
      expect(result1.pathManager).toEqual(['../age']);
      expect(result1.computedExpression).toBe('dependencies[0] > 18');

      const result2 = testDepsMatch('   #/name === "John"   ;   ');
      expect(result2.pathManager).toEqual(['#/name']);
      expect(result2.computedExpression).toBe('dependencies[0] === "John"   ');
    });

    test('실제 Form validation 시나리오', () => {
      // 나이 검증: 18세 이상이고 65세 이하
      const ageValidation = testDepsMatch('../age >= 18 && ../age <= 65');
      expect(ageValidation.pathManager).toEqual(['../age']);
      expect(ageValidation.computedExpression).toBe(
        'dependencies[0] >= 18 && dependencies[0] <= 65',
      );

      // 조건부 필수 필드: 국가가 US면 주(state) 필수
      const conditionalRequired = testDepsMatch(
        '../country === "US" && #/state !== null && #/state !== ""',
      );
      expect(conditionalRequired.pathManager).toEqual([
        '../country',
        '#/state',
      ]);
      expect(conditionalRequired.computedExpression).toBe(
        'dependencies[0] === "US" && dependencies[1] !== null && dependencies[1] !== ""',
      );

      // 복잡한 비즈니스 로직: 프리미엄 사용자이거나 (일반 사용자이면서 나이가 21세 이상)
      const businessLogic = testDepsMatch(
        '#/userType === "premium" || (#/userType === "regular" && ../age >= 21)',
      );
      expect(businessLogic.pathManager).toEqual(['#/userType', '../age']);
      expect(businessLogic.computedExpression).toBe(
        'dependencies[0] === "premium" || (dependencies[0] === "regular" && dependencies[1] >= 21)',
      );
    });
  });
});

describe('INCLUDE_INDEX_REGEX', () => {
  // 헬퍼 함수: 정규식 테스트
  const testIndexRegex = (input: string): boolean => {
    return INCLUDE_INDEX_REGEX.test(input);
  };

  describe('유효한 JSON Pointer with Index 패턴', () => {
    test('기본 * 패턴들', () => {
      expect(testIndexRegex('/*')).toBe(true);
      expect(testIndexRegex('#/*')).toBe(true);
      expect(testIndexRegex('/property/*')).toBe(true);
      expect(testIndexRegex('#/property/*')).toBe(true);
      expect(testIndexRegex('/*/nested')).toBe(true);
      expect(testIndexRegex('#/*/nested')).toBe(true);
    });

    test('특수문자 포함 속성명 패턴들', () => {
      expect(testIndexRegex('/prop.erty/*')).toBe(true);
      expect(testIndexRegex('#/prop-name/*/value')).toBe(true);
      expect(testIndexRegex('/prop_underscore/*')).toBe(true);
      expect(testIndexRegex('#/*/prop.with.dots')).toBe(true);
      expect(testIndexRegex('/array-items/*/prop_name')).toBe(true);
    });

    test('복잡한 중첩 패턴들', () => {
      expect(testIndexRegex('#/form.data/*/fields/*/errors/*')).toBe(true);
      expect(testIndexRegex('/users/*/posts/*/comments/*')).toBe(true);
    });

    test('* 혼합 세그먼트가 있는 경우 - 유효한 /* 패턴이 있으면 true', () => {
      // #/prefix*suffix/* 에서 /*가 있으므로 true
      expect(testIndexRegex('#/prefix*suffix/*')).toBe(true);
      expect(testIndexRegex('/property*/valid/*')).toBe(true);
      expect(testIndexRegex('/test*bad/*/good/more*bad')).toBe(true);
    });

    test('여러 패턴이 섞인 복잡한 경우', () => {
      expect(testIndexRegex('#/users/*/profile')).toBe(true);
      expect(testIndexRegex('/valid/*/path')).toBe(true);
    });
  });

  describe('* 없는 패턴들은 제외', () => {
    test('* 문자가 전혀 없는 패턴들', () => {
      expect(testIndexRegex('/property')).toBe(false);
      expect(testIndexRegex('#/property')).toBe(false);
      expect(testIndexRegex('/nested/path')).toBe(false);
      expect(testIndexRegex('#/prop.erty')).toBe(false);
      expect(testIndexRegex('/prop-name/value')).toBe(false);
    });

    test('*가 있지만 /* 패턴이 없는 경우', () => {
      expect(testIndexRegex('/prefix*suffix')).toBe(false);
      expect(testIndexRegex('#/test*invalid')).toBe(false);
      expect(testIndexRegex('/prop*name/value')).toBe(false);
    });
  });

  describe('잘못된 시작 패턴들은 제외', () => {
    test('/ 나 #/ 로 시작하지 않는 패턴들', () => {
      expect(testIndexRegex('property/*')).toBe(false);
      expect(testIndexRegex('*/property')).toBe(false);
      expect(testIndexRegex('nested/*/path')).toBe(false);
      expect(testIndexRegex('../property/*')).toBe(false);
      expect(testIndexRegex('./*/nested')).toBe(false);
    });
  });

  describe('실제 사용 사례', () => {
    test('Form validation 관련 실제 케이스', () => {
      expect(testIndexRegex('#/formData/*/validation')).toBe(true);
      expect(testIndexRegex('/fields/*/errors/*')).toBe(true);
    });

    test('API 응답에서 패턴 확인', () => {
      expect(testIndexRegex('#/response/*/data')).toBe(true);
      expect(testIndexRegex('/users/*/posts/*')).toBe(true);
    });

    test('복잡한 중첩 구조', () => {
      expect(testIndexRegex('#/users/*/profile/address/*')).toBe(true);
      expect(testIndexRegex('/data/*/items/*/meta/*')).toBe(true);
    });
  });

  describe('경계 사례', () => {
    test('빈 문자열이나 잘못된 형식', () => {
      expect(testIndexRegex('')).toBe(false);
      expect(testIndexRegex('*')).toBe(false);
      expect(testIndexRegex('#')).toBe(false);
      expect(testIndexRegex('/')).toBe(false);
    });

    test('/ 로 끝나는 패턴들', () => {
      expect(testIndexRegex('/property/*/')).toBe(false); // /로 끝나면 안됨
      expect(testIndexRegex('#/items/*/')).toBe(false); // /로 끝나면 안됨
    });

    test('복잡한 특수문자와 * 혼합', () => {
      expect(testIndexRegex('/a.b-c_d/*/e.f-g_h')).toBe(true);
      expect(testIndexRegex('#/complex.prop*/*/valid')).toBe(true); // /*가 있으므로 true
    });
  });
});

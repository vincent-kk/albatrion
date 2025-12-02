import { describe, expect, it, test } from 'vitest';

import { JSON_POINTER_PATH_REGEX, SIMPLE_EQUALITY_REGEX } from '../regex';

describe('JSON_POINTER_REGEX', () => {
  // 헬퍼 함수: 정규식 테스트 (전역 플래그 때문에 lastIndex 리셋 필요)
  const testRegex = (input: string): boolean => {
    JSON_POINTER_PATH_REGEX.lastIndex = 0;
    return JSON_POINTER_PATH_REGEX.test(input);
  };

  // 헬퍼 함수: 단독으로 테스트 (앞에 공백 추가)
  const testRegexStandalone = (input: string): boolean => {
    return testRegex(` ${input}`) || testRegex(input); // 공백 추가하거나 문자열 시작에서 테스트
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
      expect(testRegexStandalone('(/)')).toBe(true);
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
      expect(testRegexStandalone('#/한글속성')).toBe(true);
      expect(testRegexStandalone('#/属性')).toBe(true);
      expect(testRegexStandalone('#/свойство')).toBe(true);
    });

    test('한글 경로 패턴들', () => {
      // 기본 한글 패턴들
      expect(testRegexStandalone('#/사용자')).toBe(true);
      expect(testRegexStandalone('../나이')).toBe(true);
      expect(testRegexStandalone('./이름')).toBe(true);
      expect(testRegexStandalone('/주소')).toBe(true);

      // 복합 한글 경로들
      expect(testRegexStandalone('#/사용자/정보')).toBe(true);
      expect(testRegexStandalone('../사용자/나이')).toBe(true);
      expect(testRegexStandalone('./개인정보/이름')).toBe(true);
      expect(testRegexStandalone('/회원/주소/상세주소')).toBe(true);

      // 숫자와 한글 혼합
      expect(testRegexStandalone('#/사용자/0/이름')).toBe(true);
      expect(testRegexStandalone('/회원목록/123/개인정보')).toBe(true);

      // 영문과 한글 혼합
      expect(testRegexStandalone('#/user/이름')).toBe(true);
      expect(testRegexStandalone('./data/사용자정보')).toBe(true);
    });

    test('부분 매칭 구조들', () => {
      expect(testRegexStandalone('##/property')).toBe(false);
      expect(testRegexStandalone('...../property')).toBe(false);
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
      expect(extractMatches('#/prop-with-dash')).toEqual(['#/prop-with-dash']);
      expect(extractMatches('#/prop_with_underscore')).toEqual([
        '#/prop_with_underscore',
      ]);
      expect(extractMatches('#/prop with space')).toEqual(['#/prop']);
      expect(extractMatches('#/prop.with.dot')).toEqual(['#/prop.with.dot']);
    });

    test('한글 경로 추출', () => {
      // 단일 한글 경로 추출 (한글은 단어 경계가 모호하므로 연속된 문자까지 매칭됨)
      expect(extractMatches('조건: (/사용자/이름)이 있으면')).toEqual([
        '/사용자/이름',
      ]);
      expect(extractMatches('나이 확인: ../나이 > 18')).toEqual(['../나이']);
      expect(extractMatches('현재 상태: ./상태 === "활성"')).toEqual([
        './상태',
      ]);

      // 정확한 경계를 가진 한글 경로들
      expect(extractMatches('조건: /사용자/이름 && test')).toEqual([
        '/사용자/이름',
      ]);
      expect(extractMatches('나이: ../나이 > 18')).toEqual(['../나이']);

      // 복수 한글 경로 추출
      expect(
        extractMatches('#/사용자/이름 && ../나이 >= 20 && ./주소/지역'),
      ).toEqual(['#/사용자/이름', '../나이', './주소/지역']);

      // 영문과 한글 혼합 추출
      expect(extractMatches('user: (#/user/이름), age: (../나이)')).toEqual([
        '#/user/이름',
        '../나이',
      ]);

      // 숫자와 한글 혼합 추출
      expect(extractMatches('첫 번째 회원: /회원목록/0/이름')).toEqual([
        '/회원목록/0/이름',
      ]);

      // 괄호 안의 한글 경로
      expect(extractMatches('조건 (../나이 >= 18)')).toEqual(['../나이']);
      expect(extractMatches('사용자 정보 (#/개인정보/이름)')).toEqual([
        '#/개인정보/이름',
      ]);

      // 실제 사용 시나리오 - JavaScript 표현식에서 추출
      expect(extractMatches('../사용자나이 >= 18')).toEqual(['../사용자나이']);
      expect(extractMatches('#/개인정보데이터 !== null')).toEqual([
        '#/개인정보데이터',
      ]);
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
        '#/name !== null && #/name !== "" && (#/name).length > 2',
      );
      expect(result2.pathManager).toEqual(['#/name']);
      expect(result2.computedExpression).toBe(
        'dependencies[0] !== null && dependencies[0] !== "" && (dependencies[0]).length > 2',
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

    test('한글 경로를 사용한 동적 함수 생성', () => {
      // 기본 한글 패턴
      const result1 = testDepsMatch('../나이 >= 18');
      expect(result1.pathManager).toEqual(['../나이']);
      expect(result1.computedExpression).toBe('dependencies[0] >= 18');

      const result2 = testDepsMatch('#/사용자/이름 === "홍길동"');
      expect(result2.pathManager).toEqual(['#/사용자/이름']);
      expect(result2.computedExpression).toBe('dependencies[0] === "홍길동"');

      // 복합 한글 조건식
      const result3 = testDepsMatch(
        '../나이 >= 18 && #/개인정보/성별 === "남성" && ./주소/지역 === "서울"',
      );
      expect(result3.pathManager).toEqual([
        '../나이',
        '#/개인정보/성별',
        './주소/지역',
      ]);
      expect(result3.computedExpression).toBe(
        'dependencies[0] >= 18 && dependencies[1] === "남성" && dependencies[2] === "서울"',
      );

      // 영문과 한글 혼합
      const result4 = testDepsMatch(
        '#/user/이름 !== null && ../data/나이 > 20',
      );
      expect(result4.pathManager).toEqual(['#/user/이름', '../data/나이']);
      expect(result4.computedExpression).toBe(
        'dependencies[0] !== null && dependencies[1] > 20',
      );

      // 숫자 인덱스와 한글 혼합
      const result5 = testDepsMatch('#/회원목록/0/이름 === "김철수"');
      expect(result5.pathManager).toEqual(['#/회원목록/0/이름']);
      expect(result5.computedExpression).toBe('dependencies[0] === "김철수"');
    });
  });
});

describe('SIMPLE_EQUALITY_REGEX', () => {
  describe('valid patterns', () => {
    it('should match basic equality with double quotes', () => {
      const input = 'dependencies[0] === "email"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[1]).toBe('0');
      expect(matches?.[2]).toBe('"');
      expect(matches?.[3]).toBe('email');
    });

    it('should match basic equality with single quotes', () => {
      const input = "dependencies[1] === 'phone'";
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[1]).toBe('1');
      expect(matches?.[2]).toBe("'");
      expect(matches?.[3]).toBe('phone');
    });

    it('should match with parentheses around dependency', () => {
      const input = '(dependencies[2]) === "admin"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[1]).toBe('2');
      expect(matches?.[3]).toBe('admin');
    });

    it('should match with spaces around parentheses', () => {
      const input = ' ( dependencies[3] ) === "user"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[1]).toBe('3');
      expect(matches?.[3]).toBe('user');
    });

    it('should match without any spaces', () => {
      const input = 'dependencies[0]==="value"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[1]).toBe('0');
      expect(matches?.[3]).toBe('value');
    });

    it('should match with multiple spaces', () => {
      const input = '  dependencies[5]   ===   "test"  ';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[1]).toBe('5');
      expect(matches?.[3]).toBe('test');
    });

    it('should match multi-digit indices', () => {
      const input = 'dependencies[123] === "multi"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[1]).toBe('123');
      expect(matches?.[3]).toBe('multi');
    });

    it('should match values with special characters', () => {
      const input = 'dependencies[0] === "test-value_123"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[3]).toBe('test-value_123');
    });

    it('should match values with spaces', () => {
      const input = 'dependencies[0] === "hello world"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[3]).toBe('hello world');
    });
  });

  describe('invalid patterns', () => {
    it('should not match double equals', () => {
      const input = 'dependencies[0] == "email"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match loose equality', () => {
      const input = 'dependencies[0] != "email"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match reversed order', () => {
      const input = '"email" === dependencies[0]';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match mismatched quotes', () => {
      const input = 'dependencies[0] === "email\'';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match without quotes', () => {
      const input = 'dependencies[0] === email';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match with nested brackets', () => {
      const input = 'dependencies[[0]] === "email"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match non-numeric indices', () => {
      const input = 'dependencies[index] === "email"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match with additional text', () => {
      const input = 'if (dependencies[0] === "email")';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match complex expressions', () => {
      const input =
        'dependencies[0] === "email" && dependencies[1] === "phone"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });

    it('should not match array includes patterns', () => {
      const input = '["email", "phone"].includes(dependencies[0])';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeNull();
    });
  });

  describe('capture groups', () => {
    it('should correctly capture all groups', () => {
      const input = '(dependencies[42]) === "test-value"';
      const matches = input.match(SIMPLE_EQUALITY_REGEX);

      expect(matches).toBeTruthy();
      expect(matches?.[0]).toBe(input); // Full match
      expect(matches?.[1]).toBe('42'); // Dependency index
      expect(matches?.[2]).toBe('"'); // Quote character
      expect(matches?.[3]).toBe('test-value'); // Value
    });

    it('should maintain consistent group indices with parentheses', () => {
      const withParens = '(dependencies[1]) === "value"';
      const withoutParens = 'dependencies[1] === "value"';

      const matchesWithParens = withParens.match(SIMPLE_EQUALITY_REGEX);
      const matchesWithoutParens = withoutParens.match(SIMPLE_EQUALITY_REGEX);

      expect(matchesWithParens?.[1]).toBe('1');
      expect(matchesWithoutParens?.[1]).toBe('1');
      expect(matchesWithParens?.[3]).toBe('value');
      expect(matchesWithoutParens?.[3]).toBe('value');
    });
  });
});

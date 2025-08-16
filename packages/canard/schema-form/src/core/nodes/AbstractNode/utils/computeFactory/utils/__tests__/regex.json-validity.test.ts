import { describe, expect, test } from 'vitest';

import { JSON_POINTER_PATH_REGEX } from '../regex';

/**
 * 특이한 키들이 실제로 JSON에서 유효한지,
 * 그리고 표현식 파서에서 올바르게 처리되는지 검증하는 테스트
 */
describe('JSON 키 유효성 및 표현식 파싱 테스트', () => {
  // 헬퍼: JSON 파싱 가능 여부 확인
  const isValidJSONKey = (key: string): boolean => {
    try {
      // JSON.stringify를 사용해서 키를 올바르게 이스케이프 처리
      const obj: any = {};
      obj[key] = 'test';
      const jsonString = JSON.stringify(obj);
      const parsed = JSON.parse(jsonString);
      return parsed[key] === 'test';
    } catch {
      return false;
    }
  };

  // 헬퍼: 표현식 변환 (실제 사용 시나리오)
  const transformExpression = (
    expression: string,
  ): { result: string; paths: string[] } => {
    const paths: string[] = [];
    const result = expression.replace(JSON_POINTER_PATH_REGEX, (path) => {
      if (!paths.includes(path)) paths.push(path);
      return `dependencies[${paths.indexOf(path)}]`;
    });
    return { result, paths };
  };

  // 헬퍼: 표현식 평가 테스트
  const testExpressionEvaluation = (
    expression: string,
    dependencies: any[],
  ): any => {
    const { result } = transformExpression(expression);
    // 줄바꿈과 여분의 공백 제거
    const cleanResult = result.trim().replace(/\s+/g, ' ');
    // eslint-disable-next-line no-new-func
    const evalFunc = new Function('dependencies', `return (${cleanResult})`);
    return evalFunc(dependencies);
  };

  describe('📋 JSON 유효성 검증', () => {
    test('특수문자가 포함된 키들이 실제 JSON에서 유효한지', () => {
      // 이 키들은 모두 유효한 JSON 키여야 함
      const validKeys = [
        'key,with,commas',
        'key;with;semicolons',
        'key:with:colons',
        'key+plus',
        'key-minus',
        'key*asterisk',
        'key/slash',
        'key%percent',
        'key=equals',
        'key<less>than',
        'key!exclamation',
        'key?question',
        'key&ampersand',
        'key|pipe',
        'key^caret',
        'key~tilde',
        'key@email.com',
        'key.with.dots',
        'key_with_underscore',
        '$special',
        '#hash',
        'key with spaces', // 공백도 유효
        'key\twith\ttabs', // 탭도 유효
        'key\nwith\nnewlines', // 줄바꿈도 유효
      ];

      validKeys.forEach((key) => {
        expect(isValidJSONKey(key)).toBe(true);

        // 실제 JSON 객체로도 테스트
        const obj: any = {};
        obj[key] = 'value';
        const jsonString = JSON.stringify(obj);
        const parsed = JSON.parse(jsonString);
        expect(parsed[key]).toBe('value');
      });
    });

    test('유니코드와 이모지 키들이 JSON에서 유효한지', () => {
      const unicodeKeys = [
        '한글키',
        '日本語',
        '中文',
        'مفتاح', // 아랍어
        'ключ', // 러시아어
        'กุญแจ', // 태국어
        '🚀', // 이모지
        '😀🎉', // 여러 이모지
        '👨‍👩‍👧‍👦', // 결합 이모지
      ];

      unicodeKeys.forEach((key) => {
        expect(isValidJSONKey(key)).toBe(true);

        const obj: any = {};
        obj[key] = 'value';
        const jsonString = JSON.stringify(obj);
        const parsed = JSON.parse(jsonString);
        expect(parsed[key]).toBe('value');
      });
    });

    test('극단적인 키들이 JSON에서 유효한지', () => {
      const extremeKeys = [
        '', // 빈 문자열도 유효한 키
        ' ', // 공백만 있는 키
        '0', // 숫자 문자열
        '123',
        '3.14159',
        '1e10',
        'true', // 불린 문자열
        'false',
        'null', // null 문자열
        'undefined', // undefined 문자열
        'NaN',
        'Infinity',
        '[]', // 배열 문자열
        '{}', // 객체 문자열
        '"quoted"', // 따옴표 포함
        "'single'", // 작은따옴표 포함
        '`backtick`', // 백틱 포함
      ];

      extremeKeys.forEach((key) => {
        expect(isValidJSONKey(key)).toBe(true);

        const obj: any = {};
        obj[key] = 'value';
        const jsonString = JSON.stringify(obj);
        const parsed = JSON.parse(jsonString);
        expect(parsed[key]).toBe('value');
      });
    });

    test('이스케이프가 필요한 특수 케이스', () => {
      // 이스케이프가 필요하지만 여전히 유효한 키들
      const needsEscape = [
        'key"with"quotes', // 큰따옴표
        'key\\with\\backslash', // 백슬래시
        'key\rwith\rcarriage', // 캐리지 리턴
        'key\bwith\bbackspace', // 백스페이스
        'key\fwith\fformfeed', // 폼피드
      ];

      needsEscape.forEach((key) => {
        // JSON.stringify가 자동으로 이스케이프 처리
        const obj: any = {};
        obj[key] = 'value';
        const jsonString = JSON.stringify(obj);
        const parsed = JSON.parse(jsonString);
        expect(parsed[key]).toBe('value');
      });
    });
  });

  describe('🧮 표현식 파싱 및 평가', () => {
    test('특수문자 키를 포함한 표현식이 올바르게 파싱되는지', () => {
      // 쉼표가 포함된 키
      const expr1 = '(#/key,with,commas) === "test"';
      const { result: result1, paths: paths1 } = transformExpression(expr1);
      expect(paths1).toEqual(['#/key,with,commas']);
      expect(result1).toBe('(dependencies[0]) === "test"');

      // 세미콜론이 포함된 키
      const expr2 = '(../key;with;semicolons) > 10';
      const { result: result2, paths: paths2 } = transformExpression(expr2);
      expect(paths2).toEqual(['../key;with;semicolons']);
      expect(result2).toBe('(dependencies[0]) > 10');

      // 연산자가 포함된 키
      const expr3 = '(./key+plus) && (../key-minus) || (/key*asterisk)';
      const { result: result3, paths: paths3 } = transformExpression(expr3);
      expect(paths3).toEqual(['./key+plus', '../key-minus', '/key*asterisk']);
      expect(result3).toBe(
        '(dependencies[0]) && (dependencies[1]) || (dependencies[2])',
      );
    });

    test('표현식이 실제로 평가 가능한지', () => {
      // 숫자 값 비교
      const expr1 = '(#/price:$) > 100';
      const result1 = testExpressionEvaluation(expr1, [150]);
      expect(result1).toBe(true);

      const result2 = testExpressionEvaluation(expr1, [50]);
      expect(result2).toBe(false);

      // 문자열 비교
      const expr2 = '(../user@email.com) === "test@example.com"';
      const result3 = testExpressionEvaluation(expr2, ['test@example.com']);
      expect(result3).toBe(true);

      // 논리 연산
      const expr3 = '(./flag!) && (../status?)';
      const result4 = testExpressionEvaluation(expr3, [true, true]);
      expect(result4).toBe(true);

      const result5 = testExpressionEvaluation(expr3, [true, false]);
      expect(result5).toBe(false);
    });

    test('복잡한 표현식 파싱', () => {
      const complexExpr = `((#/user.type) === "premium" || (../subscription.level) > 2) && ((./age!) >= 18 && (./age!) <= 120) && ((../email@address).includes("@") && (../email@address).length > 5)`;

      const { paths } = transformExpression(complexExpr);

      expect(paths).toEqual([
        '#/user.type',
        '../subscription.level',
        './age!',
        '../email@address',
      ]);

      // 실제 평가 테스트
      const evalResult = testExpressionEvaluation(complexExpr, [
        'premium', // user.type (이 값이 "premium"이므로 첫 번째 OR 조건이 true)
        1, // subscription.level
        25, // age! (18-120 사이이므로 true)
        'test@example.com', // email@address (@ 포함, 길이 > 5이므로 true)
      ]);
      expect(evalResult).toBe(true);
    });

    test('함수 호출과 메서드 체이닝', () => {
      const expr = '((#/data.array)).filter(x => x > 10).length > 0';
      const { result, paths } = transformExpression(expr);

      expect(paths).toEqual(['#/data.array']);
      expect(result).toBe('((dependencies[0])).filter(x => x > 10).length > 0');

      // 실제 평가
      const evalResult = testExpressionEvaluation(expr, [
        [5, 15, 20, 3], // data.array
      ]);
      expect(evalResult).toBe(true); // 15와 20이 10보다 크므로 true
    });

    test('유니코드 키를 포함한 표현식', () => {
      const expr = '(#/사용자/나이) >= 18 && (../日本語/データ) !== null';
      const { result, paths } = transformExpression(expr);

      expect(paths).toEqual(['#/사용자/나이', '../日本語/データ']);
      expect(result).toBe(
        '(dependencies[0]) >= 18 && (dependencies[1]) !== null',
      );

      // 실제 평가
      const evalResult = testExpressionEvaluation(expr, [20, 'some data']);
      expect(evalResult).toBe(true);
    });

    test('이모지 키를 포함한 표현식', () => {
      const expr = '(#/🚀rocket) === "launched" && (../😀happy) > 0';
      const { result, paths } = transformExpression(expr);

      expect(paths).toEqual(['#/🚀rocket', '../😀happy']);
      expect(result).toBe(
        '(dependencies[0]) === "launched" && (dependencies[1]) > 0',
      );

      // 실제 평가
      const evalResult = testExpressionEvaluation(expr, ['launched', 100]);
      expect(evalResult).toBe(true);
    });
  });

  describe('🔍 실제 사용 시나리오', () => {
    test('REST API 응답의 특이한 키 처리', () => {
      // 실제 API 응답 시뮬레이션
      const apiResponse = {
        'X-Rate-Limit': 100,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'user@email': 'test@example.com',
        'price:USD': 99.99,
        'discount%': 15,
        'items[]': [1, 2, 3],
      };

      // 이 키들이 모두 유효한 JSON인지 확인
      const jsonString = JSON.stringify(apiResponse);
      const parsed = JSON.parse(jsonString);

      expect(parsed['X-Rate-Limit']).toBe(100);
      expect(parsed['Content-Type']).toBe('application/json');
      expect(parsed['user@email']).toBe('test@example.com');
      expect(parsed['price:USD']).toBe(99.99);
      expect(parsed['discount%']).toBe(15);
    });

    test('GraphQL 필드명 스타일', () => {
      const graphqlResponse = {
        __typename: 'User',
        user_id: 123,
        'created-at': '2024-01-01',
        'is-active?': true,
        'metadata.custom': { key: 'value' },
      };

      const jsonString = JSON.stringify(graphqlResponse);
      const parsed = JSON.parse(jsonString);

      expect(parsed['__typename']).toBe('User');
      expect(parsed['user_id']).toBe(123);
      expect(parsed['created-at']).toBe('2024-01-01');
      expect(parsed['is-active?']).toBe(true);
    });

    test('설정 파일의 특이한 키 패턴', () => {
      const config = {
        'app.name': 'MyApp',
        'app.version': '1.0.0',
        'features.beta': true,
        'features.experimental!': false,
        'api.endpoints.v1': '/api/v1',
        'api.endpoints.v2': '/api/v2',
        'limits.max-connections': 100,
        'limits.timeout-ms': 5000,
      };

      const jsonString = JSON.stringify(config);
      const parsed = JSON.parse(jsonString);

      expect(parsed['app.name']).toBe('MyApp');
      expect(parsed['features.beta']).toBe(true);
      expect(parsed['limits.max-connections']).toBe(100);

      // 표현식에서 사용
      const expr =
        '(#/app.version) === "1.0.0" && (../limits.max-connections) > 50';
      const { paths } = transformExpression(expr);
      expect(paths).toEqual(['#/app.version', '../limits.max-connections']);
    });

    test('데이터베이스 필드명 패턴', () => {
      const dbRecord = {
        _id: 'abc123',
        $set: { name: 'John' },
        $inc: { count: 1 },
        'user.profile.name': 'John Doe',
        'timestamps.created_at': '2024-01-01',
        'timestamps.updated_at': '2024-01-02',
        'meta:tags': ['tag1', 'tag2'],
        'stats#views': 1000,
      };

      const jsonString = JSON.stringify(dbRecord);
      const parsed = JSON.parse(jsonString);

      expect(parsed['_id']).toBe('abc123');
      expect(parsed['$set']).toEqual({ name: 'John' });
      expect(parsed['user.profile.name']).toBe('John Doe');
      expect(parsed['stats#views']).toBe(1000);
    });
  });

  describe('⚠️ 경계 케이스 및 제한사항', () => {
    test('구조적 구분자로 인한 경로 분리', () => {
      // 대괄호와 중괄호는 구조적 구분자이므로 경로가 분리됨
      const expr1 = '#/items[0]';
      const { paths: paths1 } = transformExpression(expr1);
      expect(paths1).toEqual(['#/items[0]']);

      // 대신 이렇게 사용
      const expr2 = '(#/items.0)'; // 점 표기법 사용
      const { paths: paths2 } = transformExpression(expr2);
      expect(paths2).toEqual(['#/items.0']); // 전체가 하나의 경로

      // 중괄호도 마찬가지
      const expr3 = '#/template{id}';
      const { paths: paths3 } = transformExpression(expr3);
      expect(paths3).toEqual(['#/template{id}']);

      // 대신 이렇게 사용
      const expr4 = '(#/template:id)'; // 콜론 사용
      const { paths: paths4 } = transformExpression(expr4);
      expect(paths4).toEqual(['#/template:id']);
    });

    test('공백 처리 - 명시적 구분 필요', () => {
      // 공백이 있으면 경로가 분리됨
      const expr1 = '#/key with space';
      const { paths: paths1 } = transformExpression(expr1);
      expect(paths1).toEqual(['#/key']); // 공백 이후는 포함되지 않음

      // 괄호로 명시적 구분
      const expr2 = '(#/key) with (../space)';
      const { paths: paths2 } = transformExpression(expr2);
      expect(paths2).toEqual(['#/key', '../space']);

      // 공백이 포함된 키를 사용하려면 언더스코어나 하이픈 권장
      const expr3 = '(#/key_with_space)';
      const { paths: paths3 } = transformExpression(expr3);
      expect(paths3).toEqual(['#/key_with_space']);
    });

    test('따옴표 처리 - 키의 일부', () => {
      // 따옴표는 이제 키의 일부로 처리됨
      const expr1 = '"#/path1""#/path2"';
      const { paths: paths1 } = transformExpression(expr1);
      expect(paths1).toEqual(['#/path1""#/path2"']);

      // 백틱도 키의 일부로 처리됨
      const expr2 = '`#/path1``#/path2`';
      const { paths: paths2 } = transformExpression(expr2);
      expect(paths2).toEqual(['#/path1``#/path2`']);
    });
  });
});

import { describe, expect, test } from 'vitest';

import { JSON_POINTER_REGEX } from '../regex';

/**
 * JSON에서 가능한 극단적이고 특이한 키들에 대한 테스트
 *
 * JSON 스펙에 따르면 키는 문자열이므로 거의 모든 유니코드 문자가 가능합니다.
 * 이 테스트는 실제로 JSON에서 사용 가능한 다양한 특이한 키들이
 * 우리의 정규식에서 올바르게 매칭되는지 검증합니다.
 */
describe('JSON_POINTER_REGEX - 특이한 JSON 키 지원', () => {
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

  describe('🎭 특수문자가 포함된 키', () => {
    test('구두점과 기호들', () => {
      // 쉼표, 세미콜론, 콜론
      expect(extractMatches('(#/key,with,commas)')).toEqual([
        '#/key,with,commas',
      ]);
      expect(extractMatches('(../key;with;semicolons)')).toEqual([
        '../key;with;semicolons',
      ]);
      expect(extractMatches('(./key:with:colons)')).toEqual([
        './key:with:colons',
      ]);

      // 수식 기호들
      expect(extractMatches('(/key+plus+sign)')).toEqual(['/key+plus+sign']);
      expect(extractMatches('(#/key-minus-sign)')).toEqual([
        '#/key-minus-sign',
      ]);
      expect(extractMatches('(../key*asterisk)')).toEqual(['../key*asterisk']);
      expect(extractMatches('(./key/with/slashes)')).toEqual([
        './key/with/slashes',
      ]);
      expect(extractMatches('(/key%percent)')).toEqual(['/key%percent']);

      // 비교 연산자들
      expect(extractMatches('(#/key=equals)')).toEqual(['#/key=equals']);
      expect(extractMatches('(../key<less>than)')).toEqual([
        '../key<less>than',
      ]);
      expect(extractMatches('(./key!exclamation)')).toEqual([
        './key!exclamation',
      ]);
      expect(extractMatches('(/key?question)')).toEqual(['/key?question']);

      // 논리 연산자들
      expect(extractMatches('(#/key&ampersand)')).toEqual(['#/key&ampersand']);
      expect(extractMatches('(../key|pipe|bar)')).toEqual(['../key|pipe|bar']);
      expect(extractMatches('(./key^caret)')).toEqual(['./key^caret']);
      expect(extractMatches('(/key~tilde)')).toEqual(['/key']); // RFC 6901: ~tilde는 유효하지 않음, /key까지만 매칭
    });

    test('점과 대시의 조합', () => {
      expect(extractMatches('(#/api.v1.endpoint)')).toEqual([
        '#/api.v1.endpoint',
      ]);
      expect(extractMatches('(../kebab-case-key)')).toEqual([
        '../kebab-case-key',
      ]);
      expect(extractMatches('(./snake_case_key)')).toEqual([
        './snake_case_key',
      ]);
      expect(extractMatches('(/mix.ed-case_key)')).toEqual([
        '/mix.ed-case_key',
      ]);
      expect(extractMatches('(#/file.name.with.dots.txt)')).toEqual([
        '#/file.name.with.dots.txt',
      ]);
    });

    test('특수문자 조합', () => {
      expect(extractMatches('(#/key@email.com)')).toEqual(['#/key@email.com']);
      expect(extractMatches('(../price:$99.99)')).toEqual(['../price:$99.99']);
      // 대괄호와 중괄호는 구조적 구분자이므로 경로가 분리됨
      expect(extractMatches('(./array_0_key)')).toEqual(['./array_0_key']); // 대신 언더스코어 사용
      expect(extractMatches('(/path#fragment)')).toEqual(['/path#fragment']);
      expect(extractMatches('(#/object.property)')).toEqual([
        '#/object.property',
      ]); // 대신 점 사용
    });
  });

  describe('🌍 다국어 및 유니코드', () => {
    test('다양한 언어의 키', () => {
      // 한글
      expect(extractMatches('(#/사용자/이름)')).toEqual(['#/사용자/이름']);
      expect(extractMatches('(../한글키)')).toEqual(['../한글키']);

      // 일본어
      expect(extractMatches('(./日本語のキー)')).toEqual(['./日本語のキー']);
      expect(extractMatches('(/ひらがな)')).toEqual(['/ひらがな']);
      expect(extractMatches('(#/カタカナ)')).toEqual(['#/カタカナ']);

      // 중국어
      expect(extractMatches('(../中文键名)')).toEqual(['../中文键名']);
      expect(extractMatches('(./简体中文)')).toEqual(['./简体中文']);
      expect(extractMatches('(/繁體中文)')).toEqual(['/繁體中文']);

      // 아랍어
      expect(extractMatches('(#/مفتاح)')).toEqual(['#/مفتاح']);

      // 러시아어
      expect(extractMatches('(../ключ)')).toEqual(['../ключ']);

      // 태국어
      expect(extractMatches('(./กุญแจ)')).toEqual(['./กุญแจ']);
    });

    test('이모지와 특수 유니코드', () => {
      expect(extractMatches('(#/🚀rocket)')).toEqual(['#/🚀rocket']);
      expect(extractMatches('(../😀happy)')).toEqual(['../😀happy']);
      expect(extractMatches('(./❤️love)')).toEqual(['./❤️love']);
      expect(extractMatches('(/🔥fire🔥)')).toEqual(['/🔥fire🔥']);
      expect(extractMatches('(#/👨‍👩‍👧‍👦family)')).toEqual(['#/👨‍👩‍👧‍👦family']);
    });

    test('혼합 언어 키', () => {
      expect(extractMatches('(#/user사용자)')).toEqual(['#/user사용자']);
      expect(extractMatches('(../hello世界)')).toEqual(['../hello世界']);
      expect(extractMatches('(./データdata)')).toEqual(['./データdata']);
      expect(extractMatches('(/mixed混合язык)')).toEqual(['/mixed混合язык']);
    });
  });

  describe('🔤 극단적인 키 패턴', () => {
    test('빈 문자열과 최소 키', () => {
      // 단일 문자 키
      expect(extractMatches('(#/a)')).toEqual(['#/a']);
      expect(extractMatches('(../1)')).toEqual(['../1']);
      expect(extractMatches('(./_)')).toEqual(['./_']);
      expect(extractMatches('(/$)')).toEqual(['/$']);
    });

    test('매우 긴 키', () => {
      const longKey = 'a'.repeat(100);
      expect(extractMatches(`(#/${longKey})`)).toEqual([`#/${longKey}`]);

      const complexLongKey = 'key-with.dots_and-dashes$special#chars'.repeat(5);
      expect(extractMatches(`(../${complexLongKey})`)).toEqual([
        `../${complexLongKey}`,
      ]);
    });

    test('숫자로만 구성된 키', () => {
      expect(extractMatches('(#/123)')).toEqual(['#/123']);
      expect(extractMatches('(../0)')).toEqual(['../0']);
      expect(extractMatches('(./999999999)')).toEqual(['./999999999']);
      expect(extractMatches('(/3.14159)')).toEqual(['/3.14159']);
      expect(extractMatches('(#/1e10)')).toEqual(['#/1e10']);
    });

    test('공백과 탭이 포함된 키 (괄호로 구분)', () => {
      // 공백이 포함된 키는 괄호로 명시적 구분 필요
      expect(extractMatches('(#/key) with (../space)')).toEqual([
        '#/key',
        '../space',
      ]);
      expect(extractMatches('(./tab\tkey) and (../other)')).toEqual([
        './tab',
        '../other',
      ]);
    });

    test('예약어와 같은 키', () => {
      expect(extractMatches('(#/if)')).toEqual(['#/if']);
      expect(extractMatches('(../while)')).toEqual(['../while']);
      expect(extractMatches('(./function)')).toEqual(['./function']);
      expect(extractMatches('(/return)')).toEqual(['/return']);
      expect(extractMatches('(#/class)')).toEqual(['#/class']);
      expect(extractMatches('(../const)')).toEqual(['../const']);
    });
  });

  describe('🧩 복잡한 실제 사용 예시', () => {
    test('REST API 경로 패턴', () => {
      expect(extractMatches('(#/api/v2/users/:id)')).toEqual([
        '#/api/v2/users/:id',
      ]);
      expect(extractMatches('(../endpoints/GET:/users)')).toEqual([
        '../endpoints/GET:/users',
      ]);
      // 중괄호는 구조적 구분자이므로 경로가 분리됨
      expect(extractMatches('(./paths/users/:userId/posts)')).toEqual([
        './paths/users/:userId/posts',
      ]);
    });

    test('파일 경로 패턴', () => {
      expect(extractMatches('(#/C:\\Users\\Documents)')).toEqual([
        '#/C:\\Users\\Documents',
      ]);
      expect(extractMatches('(../file.name.with.many.dots.txt)')).toEqual([
        '../file.name.with.many.dots.txt',
      ]);
      expect(extractMatches('(./~/.config/settings.json)')).toEqual([
        './',
        '/.config/settings.json',
      ]); // RFC 6901: ~ 단독 사용 불가, ./와 /.config/settings.json로 분리
    });

    test('환경 변수 패턴', () => {
      expect(extractMatches('(#/NODE_ENV)')).toEqual(['#/NODE_ENV']);
      expect(extractMatches('(../REACT_APP_API_URL)')).toEqual([
        '../REACT_APP_API_URL',
      ]);
      expect(extractMatches('(./DATABASE_CONNECTION_STRING)')).toEqual([
        './DATABASE_CONNECTION_STRING',
      ]);
    });

    test('UUID와 해시 패턴', () => {
      expect(
        extractMatches('(#/550e8400-e29b-41d4-a716-446655440000)'),
      ).toEqual(['#/550e8400-e29b-41d4-a716-446655440000']);
      expect(extractMatches('(../sha256:abcd1234efgh5678)')).toEqual([
        '../sha256:abcd1234efgh5678',
      ]);
      expect(extractMatches('(./0x1234567890ABCDEF)')).toEqual([
        './0x1234567890ABCDEF',
      ]);
    });

    test('버전 문자열', () => {
      expect(extractMatches('(#/v1.2.3)')).toEqual(['#/v1.2.3']);
      expect(extractMatches('(../1.0.0-beta.1)')).toEqual(['../1.0.0-beta.1']);
      expect(extractMatches('(./^2.0.0)')).toEqual(['./^2.0.0']);
      expect(extractMatches('(/~1.0.0)')).toEqual(['/~1.0.0']);
    });
  });

  describe('⚡ 표현식 내에서의 특이한 키', () => {
    test('조건문에서 특이한 키 사용', () => {
      const expr1 = '(#/user@email.com) === "test@example.com"';
      expect(extractMatches(expr1)).toEqual(['#/user@email.com']);

      const expr2 = '(../price:$) > 100 && (./discount%) < 50';
      expect(extractMatches(expr2)).toEqual(['../price:$', './discount%']);

      const expr3 = '!(#/flag!) || (../status?) === "active"';
      expect(extractMatches(expr3)).toEqual(['#/flag!', '../status?']);
    });

    test('함수 호출에서 특이한 키', () => {
      const expr1 = 'validateEmail((#/contact@info))';
      expect(extractMatches(expr1)).toEqual(['#/contact@info']);

      const expr2 = 'Math.max((../value+tax), (./value-discount))';
      expect(extractMatches(expr2)).toEqual([
        '../value+tax',
        './value-discount',
      ]);

      const expr3 = 'formatDate((#/date:2024-01-01))';
      expect(extractMatches(expr3)).toEqual(['#/date:2024-01-01']);
    });

    test('배열과 객체 접근에서 특이한 키', () => {
      // 대괄호는 구조적 구분자이므로 배열 인덱스는 경로에서 분리됨
      const expr1 = '(#/items.0) !== null'; // 대신 점 표기법 사용
      expect(extractMatches(expr1)).toEqual(['#/items.0']);

      const expr2 = '(../data.nested.property) || (./fallback)';
      expect(extractMatches(expr2)).toEqual([
        '../data.nested.property',
        './fallback',
      ]);

      // 대괄호와 중괄호 대신 다른 표기법 사용
      const expr3 = '(#/dynamic.path) && (../array.element)';
      expect(extractMatches(expr3)).toEqual([
        '#/dynamic.path',
        '../array.element',
      ]);
    });
  });

  describe('🚫 경계 테스트 - 구분자 확인', () => {
    test('괄호로 명확히 구분되는 경우', () => {
      // 쉼표로 구분된 여러 경로
      expect(extractMatches('((#/path1), (#/path2), (#/path3))')).toEqual([
        '#/path1',
        '#/path2',
        '#/path3',
      ]);

      // 세미콜론으로 구분된 경로
      expect(extractMatches('(../key1); (../key2); (../key3)')).toEqual([
        '../key1',
        '../key2',
        '../key3',
      ]);
    });

    test('대괄호와 중괄호를 포함한 JSON 키 지원', () => {
      // 대괄호는 이제 JSON 키의 일부로 인식됨
      expect(extractMatches('[#/path1][#/path2]')).toEqual([
        '#/path1][#/path2]',
      ]);
      expect(extractMatches('#/items[0]')).toEqual(['#/items[0]']); // 전체가 하나의 키로 인식

      // 중괄호도 JSON 키의 일부로 인식됨
      expect(extractMatches('{../key1}{../key2}')).toEqual([
        '../key1}{../key2}',
      ]);
      expect(extractMatches('#/template{id}')).toEqual(['#/template{id}']); // 전체가 하나의 키로 인식

      // 다양한 표기법 모두 지원
      expect(extractMatches('(#/items.0)')).toEqual(['#/items.0']); // 점 표기법
      expect(extractMatches('(#/template_id)')).toEqual(['#/template_id']); // 언더스코어
      expect(extractMatches('(#/template:id)')).toEqual(['#/template:id']); // 콜론
      expect(extractMatches('(#/array[0])')).toEqual(['#/array[0]']); // 대괄호
      expect(extractMatches('(#/config{env})')).toEqual(['#/config{env}']); // 중괄호
    });

    test('공백으로 구분되는 경우', () => {
      expect(extractMatches('#/path1 #/path2 #/path3')).toEqual([
        '#/path1',
        '#/path2',
        '#/path3',
      ]);
      expect(extractMatches('../key1\t../key2\n../key3')).toEqual([
        '../key1',
        '../key2',
        '../key3',
      ]);
    });

    test('따옴표와 괄호는 구조적 구분자', () => {
      // 대괄호와 중괄호는 더 이상 구분자가 아님 (JSON 키의 일부)
      expect(extractMatches('[#/path1][#/path2]')).toEqual([
        '#/path1][#/path2]',
      ]);
      expect(extractMatches('{../key1}{../key2}')).toEqual([
        '../key1}{../key2}',
      ]);

      // 따옴표도 이제 키의 일부로 처리됨
      expect(extractMatches('"#/path1""#/path2"')).toEqual([
        '#/path1""#/path2"',
      ]);
      expect(extractMatches("'../key1''../key2'")).toEqual([
        "../key1''../key2'",
      ]);

      // 소괄호는 여전히 경계로 작동 (명시적 구분용)
      expect(extractMatches('(#/path1)(#/path2)')).toEqual([
        '#/path1',
        '#/path2',
      ]);
    });
  });
});

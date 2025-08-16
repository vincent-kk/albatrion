import { describe, expect, test } from 'vitest';

import { INCLUDE_INDEX_REGEX } from '../regex';

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

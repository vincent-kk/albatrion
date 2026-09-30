import { describe, expect, it } from 'vitest';

import { isCircularReferenceError } from '../utils/isCircularReferenceError';

describe('isCircularReferenceError', () => {
  describe('순환 그래프로 판별해야 하는 경우', () => {
    it('RangeError 는 생성자만으로 판별한다', () => {
      expect(isCircularReferenceError(new RangeError('anything'))).toBe(true);
    });

    it('V8 의 스택 초과 메시지를 판별한다', () => {
      expect(
        isCircularReferenceError(new Error('Maximum call stack size exceeded')),
      ).toBe(true);
    });

    it('SpiderMonkey 의 스택 초과 메시지를 판별한다', () => {
      expect(isCircularReferenceError(new Error('too much recursion'))).toBe(
        true,
      );
    });

    it('circular 문구가 포함되면 판별한다', () => {
      expect(
        isCircularReferenceError(new Error('Converting circular structure')),
      ).toBe(true);
    });

    it('대소문자를 구분하지 않는다', () => {
      expect(
        isCircularReferenceError(new Error('MAXIMUM CALL STACK SIZE EXCEEDED')),
      ).toBe(true);
    });
  });

  describe('다른 컴파일 실패로 넘겨야 하는 경우', () => {
    it('nullable 모순은 순환이 아니다', () => {
      expect(
        isCircularReferenceError(
          new Error('type: null contradicts nullable: false'),
        ),
      ).toBe(false);
    });

    it('미해결 $ref 는 순환이 아니다', () => {
      expect(
        isCircularReferenceError(
          new Error("can't resolve reference #/$defs/nope from id #"),
        ),
      ).toBe(false);
    });

    it('메타 스키마 위반은 순환이 아니다', () => {
      expect(
        isCircularReferenceError(
          new Error('schema is invalid: data/required must be array'),
        ),
      ).toBe(false);
    });

    it('정규식 SyntaxError 는 순환이 아니다', () => {
      expect(
        isCircularReferenceError(
          new SyntaxError('Invalid regular expression: /[/u'),
        ),
      ).toBe(false);
    });

    it('중복 $id 는 순환이 아니다', () => {
      expect(
        isCircularReferenceError(
          new Error('schema with key or id "x" already exists'),
        ),
      ).toBe(false);
    });
  });

  describe('Error 가 아닌 입력', () => {
    it('문자열은 판별하지 않는다', () => {
      expect(isCircularReferenceError('Maximum call stack size exceeded')).toBe(
        false,
      );
    });

    it('nullish 는 판별하지 않는다', () => {
      expect(isCircularReferenceError(undefined)).toBe(false);
      expect(isCircularReferenceError(null)).toBe(false);
    });
  });
});

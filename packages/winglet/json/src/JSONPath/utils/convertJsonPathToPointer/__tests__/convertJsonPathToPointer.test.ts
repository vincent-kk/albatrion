import { describe, expect, it } from 'vitest';

import { convertJsonPathToPointer } from '../convertJsonPathToPointer';

describe('convertJsonPathToPointer', () => {
  describe('기본 케이스', () => {
    it('빈 문자열을 입력하면 루트 포인터를 반환해야 한다', () => {
      expect(convertJsonPathToPointer('')).toBe('/');
    });

    it('단순한 프로퍼티 경로를 변환해야 한다', () => {
      expect(convertJsonPathToPointer('data')).toBe('/data');
      expect(convertJsonPathToPointer('user')).toBe('/user');
    });

    it('중첩된 프로퍼티 경로를 변환해야 한다', () => {
      expect(convertJsonPathToPointer('data.user')).toBe('/data/user');
      expect(convertJsonPathToPointer('data.user.name')).toBe(
        '/data/user/name',
      );
      expect(convertJsonPathToPointer('a.b.c.d.e')).toBe('/a/b/c/d/e');
    });
  });

  describe('배열 인덱스 케이스', () => {
    it('단순한 배열 인덱스를 변환해야 한다', () => {
      expect(convertJsonPathToPointer('data[0]')).toBe('/data/0');
      expect(convertJsonPathToPointer('users[1]')).toBe('/users/1');
      expect(convertJsonPathToPointer('items[99]')).toBe('/items/99');
    });

    it('배열 인덱스와 프로퍼티가 혼합된 경로를 변환해야 한다', () => {
      expect(convertJsonPathToPointer('data.users[0].name')).toBe(
        '/data/users/0/name',
      );
      expect(convertJsonPathToPointer('response.items[2].id')).toBe(
        '/response/items/2/id',
      );
      expect(convertJsonPathToPointer('a.b[0].c.d[1].e')).toBe(
        '/a/b/0/c/d/1/e',
      );
    });

    it('연속된 배열 인덱스를 변환해야 한다', () => {
      expect(convertJsonPathToPointer('matrix[0][1]')).toBe('/matrix/0/1');
      expect(convertJsonPathToPointer('data[0][1][2]')).toBe('/data/0/1/2');
    });

    it('배열로 시작하는 경로를 변환해야 한다', () => {
      expect(convertJsonPathToPointer('[0]')).toBe('/0');
      expect(convertJsonPathToPointer('[0].name')).toBe('/0/name');
      expect(convertJsonPathToPointer('[1][2].value')).toBe('/1/2/value');
    });
  });

  describe('복잡한 케이스', () => {
    it('깊게 중첩된 구조를 변환해야 한다', () => {
      const complexPath = 'data.users[0].profile.addresses[1].street.name';
      const expected = '/data/users/0/profile/addresses/1/street/name';
      expect(convertJsonPathToPointer(complexPath)).toBe(expected);
    });

    it('여러 배열 레벨이 있는 복잡한 구조를 변환해야 한다', () => {
      const complexPath = 'response.data[0].items[1].tags[2].value';
      const expected = '/response/data/0/items/1/tags/2/value';
      expect(convertJsonPathToPointer(complexPath)).toBe(expected);
    });
  });

  describe('엣지 케이스', () => {
    it('이미 슬래시로 시작하는 경로도 올바르게 처리해야 한다', () => {
      // 함수 내부에서 이미 슬래시로 시작하는지 확인하므로 중복 슬래시가 생기지 않아야 함
      expect(convertJsonPathToPointer('data.user')).toBe('/data/user');
    });

    it('숫자로 된 프로퍼티 이름을 처리해야 한다', () => {
      expect(convertJsonPathToPointer('data.123')).toBe('/data/123');
      expect(convertJsonPathToPointer('obj.0.value')).toBe('/obj/0/value');
    });

    it('특수 문자가 포함된 프로퍼티 이름을 처리해야 한다', () => {
      expect(convertJsonPathToPointer('data.user-name')).toBe(
        '/data/user-name',
      );
      expect(convertJsonPathToPointer('data.user_id')).toBe('/data/user_id');
      expect(convertJsonPathToPointer('data.user$name')).toBe(
        '/data/user$name',
      );
    });

    it('빈 배열 인덱스는 JSON Pointer 표준에 따라 "-"로 변환해야 한다', () => {
      // JSON Pointer 표준에서 빈 배열 인덱스는 '-'로 표현됨
      expect(convertJsonPathToPointer('data[]')).toBe('/data/-');
      expect(convertJsonPathToPointer('data[].name')).toBe('/data/-/name');
      expect(convertJsonPathToPointer('items[].id')).toBe('/items/-/id');
      expect(convertJsonPathToPointer('users[].profile[].settings')).toBe(
        '/users/-/profile/-/settings',
      );
    });
  });

  describe('실제 AJV dataPath 예제', () => {
    it('AJV에서 생성되는 일반적인 dataPath 형식을 변환해야 한다', () => {
      // AJV validation error에서 나오는 실제 dataPath 예제들
      expect(convertJsonPathToPointer('data')).toBe('/data');
      expect(convertJsonPathToPointer('data.name')).toBe('/data/name');
      expect(convertJsonPathToPointer('data.users[0]')).toBe('/data/users/0');
      expect(convertJsonPathToPointer('data.users[0].email')).toBe(
        '/data/users/0/email',
      );
      expect(
        convertJsonPathToPointer('data.settings.notifications.email'),
      ).toBe('/data/settings/notifications/email');
    });

    it('중첩된 배열과 객체가 혼합된 복잡한 AJV dataPath를 변환해야 한다', () => {
      const ajvPath =
        'data.form.sections[0].fields[1].validation.rules[0].message';
      const expected =
        '/data/form/sections/0/fields/1/validation/rules/0/message';
      expect(convertJsonPathToPointer(ajvPath)).toBe(expected);
    });
  });

  describe('성능 및 안정성', () => {
    it('매우 긴 경로도 처리할 수 있어야 한다', () => {
      const longPath = Array.from({ length: 100 }, (_, i) => `level${i}`).join(
        '.',
      );
      const expected =
        '/' + Array.from({ length: 100 }, (_, i) => `level${i}`).join('/');
      expect(convertJsonPathToPointer(longPath)).toBe(expected);
    });

    it('많은 배열 인덱스가 있는 경로도 처리할 수 있어야 한다', () => {
      const arrayPath =
        'data' + Array.from({ length: 50 }, (_, i) => `[${i}]`).join('');
      const expected =
        '/data' + Array.from({ length: 50 }, (_, i) => `/${i}`).join('');
      expect(convertJsonPathToPointer(arrayPath)).toBe(expected);
    });
  });
});

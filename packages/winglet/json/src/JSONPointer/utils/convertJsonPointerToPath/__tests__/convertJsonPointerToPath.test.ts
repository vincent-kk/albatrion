import { describe, expect, it } from 'vitest';

import { convertJsonPointerToPath } from '../convertJsonPointerToPath';

describe('convertJsonPointerToPath', () => {
  describe('기본 케이스', () => {
    it('빈 문자열과 루트 포인터를 입력하면 "."을 반환해야 한다', () => {
      expect(convertJsonPointerToPath('')).toBe('.');
      expect(convertJsonPointerToPath('/')).toBe('.');
    });

    it('단순한 프로퍼티 경로를 변환해야 한다', () => {
      expect(convertJsonPointerToPath('/data')).toBe('.data');
      expect(convertJsonPointerToPath('/user')).toBe('.user');
    });

    it('중첩된 프로퍼티 경로를 변환해야 한다', () => {
      expect(convertJsonPointerToPath('/data/user')).toBe('.data.user');
      expect(convertJsonPointerToPath('/data/user/name')).toBe(
        '.data.user.name',
      );
      expect(convertJsonPointerToPath('/a/b/c/d/e')).toBe('.a.b.c.d.e');
    });
  });

  describe('배열 인덱스 케이스', () => {
    it('단순한 배열 인덱스를 변환해야 한다', () => {
      expect(convertJsonPointerToPath('/data/0')).toBe('.data[0]');
      expect(convertJsonPointerToPath('/users/1')).toBe('.users[1]');
      expect(convertJsonPointerToPath('/items/99')).toBe('.items[99]');
    });

    it('배열 인덱스와 프로퍼티가 혼합된 경로를 변환해야 한다', () => {
      expect(convertJsonPointerToPath('/data/users/0/name')).toBe(
        '.data.users[0].name',
      );
      expect(convertJsonPointerToPath('/response/items/2/id')).toBe(
        '.response.items[2].id',
      );
      expect(convertJsonPointerToPath('/a/b/0/c/d/1/e')).toBe(
        '.a.b[0].c.d[1].e',
      );
    });

    it('연속된 배열 인덱스를 변환해야 한다', () => {
      expect(convertJsonPointerToPath('/matrix/0/1')).toBe('.matrix[0][1]');
      expect(convertJsonPointerToPath('/data/0/1/2')).toBe('.data[0][1][2]');
    });

    it('배열로 시작하는 경로를 변환해야 한다', () => {
      expect(convertJsonPointerToPath('/0')).toBe('.[0]');
      expect(convertJsonPointerToPath('/0/name')).toBe('.[0].name');
      expect(convertJsonPointerToPath('/1/2/value')).toBe('.[1][2].value');
    });
  });

  describe('복잡한 케이스', () => {
    it('깊게 중첩된 구조를 변환해야 한다', () => {
      const complexPointer = '/data/users/0/profile/addresses/1/street/name';
      const expected = '.data.users[0].profile.addresses[1].street.name';
      expect(convertJsonPointerToPath(complexPointer)).toBe(expected);
    });

    it('여러 배열 레벨이 있는 복잡한 구조를 변환해야 한다', () => {
      const complexPointer = '/response/data/0/items/1/tags/2/value';
      const expected = '.response.data[0].items[1].tags[2].value';
      expect(convertJsonPointerToPath(complexPointer)).toBe(expected);
    });
  });

  describe('특수 케이스', () => {
    it('JSON Pointer 표준의 "-"를 빈 배열 인덱스로 변환해야 한다', () => {
      expect(convertJsonPointerToPath('/data/-')).toBe('.data[]');
      expect(convertJsonPointerToPath('/data/-/name')).toBe('.data[].name');
      expect(convertJsonPointerToPath('/items/-/id')).toBe('.items[].id');
      expect(convertJsonPointerToPath('/users/-/profile/-/settings')).toBe(
        '.users[].profile[].settings',
      );
    });

    it('"-"로 시작하는 경로를 처리해야 한다', () => {
      expect(convertJsonPointerToPath('/-')).toBe('.[]');
      expect(convertJsonPointerToPath('/-/name')).toBe('.[].name');
      expect(convertJsonPointerToPath('/-/-/value')).toBe('.[][].value');
    });

    it('숫자로 된 프로퍼티 이름을 배열 인덱스로 처리해야 한다', () => {
      expect(convertJsonPointerToPath('/data/123')).toBe('.data[123]');
      expect(convertJsonPointerToPath('/obj/0/value')).toBe('.obj[0].value');
    });

    it('특수 문자가 포함된 프로퍼티 이름을 처리해야 한다', () => {
      expect(convertJsonPointerToPath('/data/user-name')).toBe(
        '.data.user-name',
      );
      expect(convertJsonPointerToPath('/data/user_id')).toBe('.data.user_id');
      expect(convertJsonPointerToPath('/data/user$name')).toBe(
        '.data.user$name',
      );
    });

    it('점(.)이 포함된 프로퍼티 이름을 이스케이프해야 한다', () => {
      expect(convertJsonPointerToPath('/data/user.name')).toBe(
        '.data[user.name]',
      );
      expect(convertJsonPointerToPath('/config/app.version')).toBe(
        '.config[app.version]',
      );
      expect(convertJsonPointerToPath('/settings/db.host/port')).toBe(
        '.settings[db.host].port',
      );
      expect(convertJsonPointerToPath('/a.b/c.d/e.f')).toBe('.[a.b][c.d][e.f]');
    });
  });

  describe('실제 JSON Pointer 예제', () => {
    it('일반적인 JSON Pointer 형식을 변환해야 한다', () => {
      expect(convertJsonPointerToPath('/data')).toBe('.data');
      expect(convertJsonPointerToPath('/data/name')).toBe('.data.name');
      expect(convertJsonPointerToPath('/data/users/0')).toBe('.data.users[0]');
      expect(convertJsonPointerToPath('/data/users/0/email')).toBe(
        '.data.users[0].email',
      );
      expect(
        convertJsonPointerToPath('/data/settings/notifications/email'),
      ).toBe('.data.settings.notifications.email');
    });

    it('중첩된 배열과 객체가 혼합된 복잡한 JSON Pointer를 변환해야 한다', () => {
      const jsonPointer =
        '/data/form/sections/0/fields/1/validation/rules/0/message';
      const expected =
        '.data.form.sections[0].fields[1].validation.rules[0].message';
      expect(convertJsonPointerToPath(jsonPointer)).toBe(expected);
    });
  });

  describe('성능 및 안정성', () => {
    it('매우 긴 경로도 처리할 수 있어야 한다', () => {
      const longPointer =
        '/' + Array.from({ length: 100 }, (_, i) => `level${i}`).join('/');
      const expected =
        '.' + Array.from({ length: 100 }, (_, i) => `level${i}`).join('.');
      expect(convertJsonPointerToPath(longPointer)).toBe(expected);
    });

    it('많은 배열 인덱스가 있는 경로도 처리할 수 있어야 한다', () => {
      const arrayPointer =
        '/data' + Array.from({ length: 50 }, (_, i) => `/${i}`).join('');
      const expected =
        '.data' + Array.from({ length: 50 }, (_, i) => `[${i}]`).join('');
      expect(convertJsonPointerToPath(arrayPointer)).toBe(expected);
    });
  });
});

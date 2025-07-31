import { describe, expect, it } from 'vitest';

import { convertJsonPointerToPath } from '../convertJsonPointerToPath';

describe('convertJsonPointerToPath - 멱등성 테스트 (Idempotency)', () => {
  describe('JSONPath 형식 입력에 대한 멱등성', () => {
    it('이미 JSONPath 형식인 입력을 그대로 반환해야 한다', () => {
      // 기본 JSONPath 형식 (점으로 시작)
      expect(convertJsonPointerToPath('.data')).toBe('.data');
      expect(convertJsonPointerToPath('.data.user')).toBe('.data.user');
      expect(convertJsonPointerToPath('.data.users[0]')).toBe('.data.users[0]');
      expect(convertJsonPointerToPath('.data.users[0].name')).toBe(
        '.data.users[0].name',
      );
    });

    it('루트 JSONPath를 그대로 반환해야 한다', () => {
      expect(convertJsonPointerToPath('.')).toBe('.');
    });

    it('복잡한 JSONPath 경로를 그대로 반환해야 한다', () => {
      const complexPath = '.data.users[0].profile.addresses[1].street.name';
      expect(convertJsonPointerToPath(complexPath)).toBe(complexPath);

      const arrayPath = '.response.data[0].items[1].tags[2].value';
      expect(convertJsonPointerToPath(arrayPath)).toBe(arrayPath);
    });

    it('배열 인덱스가 포함된 JSONPath를 그대로 반환해야 한다', () => {
      expect(convertJsonPointerToPath('.matrix[0][1]')).toBe('.matrix[0][1]');
      expect(convertJsonPointerToPath('.data[0][1][2]')).toBe('.data[0][1][2]');
      expect(convertJsonPointerToPath('.items[].id')).toBe('.items[].id');
      expect(convertJsonPointerToPath('.users[].profile[].settings')).toBe(
        '.users[].profile[].settings',
      );
    });

    it('JSONPath 표준 형식($ 시작)을 그대로 반환해야 한다', () => {
      expect(convertJsonPointerToPath('$.data')).toBe('$.data');
      expect(convertJsonPointerToPath('$.data.user.name')).toBe(
        '$.data.user.name',
      );
      expect(convertJsonPointerToPath('$.items[0].id')).toBe('$.items[0].id');
      expect(convertJsonPointerToPath('$.users[].profile')).toBe(
        '$.users[].profile',
      );
    });

    it('JSONPath 표준 형식(@ 시작)을 그대로 반환해야 한다', () => {
      expect(convertJsonPointerToPath('@.data')).toBe('@.data');
      expect(convertJsonPointerToPath('@.current.value')).toBe(
        '@.current.value',
      );
      expect(convertJsonPointerToPath('@.items[0].name')).toBe(
        '@.items[0].name',
      );
    });

    it('특수 문자가 포함된 JSONPath를 그대로 반환해야 한다', () => {
      expect(convertJsonPointerToPath('.data.user-name')).toBe(
        '.data.user-name',
      );
      expect(convertJsonPointerToPath('.data.user_id')).toBe('.data.user_id');
      expect(convertJsonPointerToPath('.data.user$name')).toBe(
        '.data.user$name',
      );
      expect(convertJsonPointerToPath('.config[app.version]')).toBe(
        '.config[app.version]',
      );
    });

    it('이스케이프된 프로퍼티명을 포함한 JSONPath를 그대로 반환해야 한다', () => {
      expect(convertJsonPointerToPath('.data[user.name]')).toBe(
        '.data[user.name]',
      );
      expect(convertJsonPointerToPath('.config[db.host].port')).toBe(
        '.config[db.host].port',
      );
      expect(convertJsonPointerToPath('.[a.b][c.d][e.f]')).toBe(
        '.[a.b][c.d][e.f]',
      );
    });
  });

  describe('멱등성 연속 적용 테스트', () => {
    it('JSONPath 연산의 연속 적용 시 멱등성을 보장해야 한다', () => {
      const jsonPaths = [
        '.data',
        '.data.users[0]',
        '.items[].id',
        '$.config.settings',
        '.a.b.c.d.e',
        '.matrix[0][1][2]',
        '.users[].profile[].settings',
        '$.response.data[0].items[1]',
        '@.current.value',
        '.config[db.host].port',
      ];

      jsonPaths.forEach((path) => {
        // 첫 번째 적용
        const result1 = convertJsonPointerToPath(path);
        expect(result1).toBe(path);

        // 두 번째 적용 (멱등성 검증)
        const result2 = convertJsonPointerToPath(result1);
        expect(result2).toBe(path);

        // 세 번째 적용 (멱등성 재검증)
        const result3 = convertJsonPointerToPath(result2);
        expect(result3).toBe(path);
      });
    });

    it('복잡한 경로에서도 멱등성을 보장해야 한다', () => {
      const complexPaths = [
        '.data.form.sections[0].fields[1].validation.rules[0].message',
        '.response.users[].profile.addresses[1].street.name',
        '$.config.database.connections[0].settings.timeout',
        '.api.v1.users[123].permissions[0].roles[].name',
        '.settings[app.version].features[].enabled',
      ];

      complexPaths.forEach((path) => {
        // 여러 번 연속 적용해도 결과가 변하지 않아야 함
        let current = path;
        for (let i = 0; i < 5; i++) {
          current = convertJsonPointerToPath(current);
          expect(current).toBe(path);
        }
      });
    });
  });

  describe('경계 케이스 멱등성', () => {
    it('숫자로만 구성된 세그먼트를 포함한 JSONPath의 멱등성', () => {
      const numericPaths = [
        '.[0]',
        '.[123]',
        '.data[0].value',
        '.matrix[0][1][2][3]',
        '.items[999].id',
      ];

      numericPaths.forEach((path) => {
        expect(convertJsonPointerToPath(path)).toBe(path);
        expect(convertJsonPointerToPath(convertJsonPointerToPath(path))).toBe(
          path,
        );
      });
    });

    it('특수 JSONPath 문자를 포함한 경로의 멱등성', () => {
      const specialPaths = [
        '.data[]',
        '.items[].subItems[]',
        '.config[app.name].version',
        '.users[user@example.com].profile',
        '.[0][1].value',
      ];

      specialPaths.forEach((path) => {
        expect(convertJsonPointerToPath(path)).toBe(path);
        expect(convertJsonPointerToPath(convertJsonPointerToPath(path))).toBe(
          path,
        );
      });
    });

    it('빈 배열 인덱스를 포함한 JSONPath의 멱등성', () => {
      const emptyArrayPaths = [
        '.data[]',
        '.items[].name',
        '.users[].profile[].settings',
        '.[].value',
        '.matrix[][].element',
      ];

      emptyArrayPaths.forEach((path) => {
        expect(convertJsonPointerToPath(path)).toBe(path);
        expect(convertJsonPointerToPath(convertJsonPointerToPath(path))).toBe(
          path,
        );
      });
    });
  });

  describe('성능 관련 멱등성', () => {
    it('매우 긴 JSONPath 경로에서도 멱등성을 보장해야 한다', () => {
      const longPath =
        '.' + Array.from({ length: 100 }, (_, i) => `level${i}`).join('.');

      expect(convertJsonPointerToPath(longPath)).toBe(longPath);
      expect(convertJsonPointerToPath(convertJsonPointerToPath(longPath))).toBe(
        longPath,
      );
    });

    it('많은 배열 인덱스가 있는 JSONPath에서도 멱등성을 보장해야 한다', () => {
      const arrayPath =
        '.data' + Array.from({ length: 50 }, (_, i) => `[${i}]`).join('');

      expect(convertJsonPointerToPath(arrayPath)).toBe(arrayPath);
      expect(
        convertJsonPointerToPath(convertJsonPointerToPath(arrayPath)),
      ).toBe(arrayPath);
    });
  });

  describe('실제 사용 사례 멱등성', () => {
    it('AJV dataPath 형식의 멱등성', () => {
      const ajvPaths = [
        '.data',
        '.data.name',
        '.data.users[0].email',
        '.settings.notifications.email',
        '.form.sections[0].fields[1].value',
      ];

      ajvPaths.forEach((path) => {
        expect(convertJsonPointerToPath(path)).toBe(path);
      });
    });

    it('JSONPath 쿼리 형식의 멱등성', () => {
      const queryPaths = [
        '$.store.book[0].title',
        '$.users[].name',
        '$.data.items[*].id',
        '@.current.value',
      ];

      queryPaths.forEach((path) => {
        expect(convertJsonPointerToPath(path)).toBe(path);
      });
    });

    it('객체 프로퍼티 접근 형식의 멱등성', () => {
      const propertyPaths = [
        '.data.users[0].profile.name',
        '.response.items[].metadata.created',
        '.config[database.host].port',
        '.settings[app.theme].colors.primary',
      ];

      propertyPaths.forEach((path) => {
        expect(convertJsonPointerToPath(path)).toBe(path);
      });
    });
  });

  describe('혼합 시나리오 멱등성', () => {
    it('다양한 JSONPath 형식이 혼합된 경우의 멱등성', () => {
      const mixedPaths = [
        '.users[0].profile[contacts.email].value',
        '.data[nested.key].items[].properties[meta.info]',
        '.[0][nested.prop].values[].data',
        '.config[app.settings][database.config].connection',
      ];

      mixedPaths.forEach((path) => {
        // 연속 적용 테스트
        const result1 = convertJsonPointerToPath(path);
        expect(result1).toBe(path);

        const result2 = convertJsonPointerToPath(result1);
        expect(result2).toBe(path);

        const result3 = convertJsonPointerToPath(result2);
        expect(result3).toBe(path);
      });
    });

    it('중첩된 이스케이프 구조의 멱등성', () => {
      const escapedPaths = [
        '.[user.name][profile.data].settings',
        '.config[db.primary][table.users].columns[name.first]',
        '.[a.b.c][d.e.f][g.h.i]',
      ];

      escapedPaths.forEach((path) => {
        expect(convertJsonPointerToPath(path)).toBe(path);
        expect(convertJsonPointerToPath(convertJsonPointerToPath(path))).toBe(
          path,
        );
      });
    });
  });

  describe('경계값 테스트', () => {
    it('다양한 접두사 형식의 멱등성', () => {
      const prefixPaths = [
        '.data', // 표준 점 접두사
        '$.data', // JSONPath 표준 루트
        '@.data', // JSONPath 현재 컨텍스트
      ];

      prefixPaths.forEach((path) => {
        expect(convertJsonPointerToPath(path)).toBe(path);
      });
    });

    it('극단적인 경우의 멱등성', () => {
      const extremePaths = [
        '.', // 루트만
        '.[]', // 빈 배열 접근
        '.[0]', // 숫자 키 접근
        '.[a.b.c.d.e]', // 매우 긴 이스케이프 키
      ];

      extremePaths.forEach((path) => {
        expect(convertJsonPointerToPath(path)).toBe(path);
      });
    });
  });
});

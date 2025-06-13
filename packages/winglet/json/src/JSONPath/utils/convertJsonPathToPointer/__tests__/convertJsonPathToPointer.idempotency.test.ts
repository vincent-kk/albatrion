import { describe, expect, it } from 'vitest';

import { convertJsonPathToPointer } from '../convertJsonPathToPointer';

describe('convertJsonPathToPointer - 멱등성 테스트 (Idempotency)', () => {
  describe('JSON Pointer 형식 입력에 대한 멱등성', () => {
    it('이미 JSON Pointer 형식인 입력을 그대로 반환해야 한다', () => {
      // 기본 JSON Pointer 형식
      expect(convertJsonPathToPointer('/data')).toBe('/data');
      expect(convertJsonPathToPointer('/data/user')).toBe('/data/user');
      expect(convertJsonPathToPointer('/data/users/0')).toBe('/data/users/0');
      expect(convertJsonPathToPointer('/data/users/0/name')).toBe('/data/users/0/name');
    });

    it('루트 포인터를 그대로 반환해야 한다', () => {
      expect(convertJsonPathToPointer('/')).toBe('/');
    });

    it('복잡한 JSON Pointer 경로를 그대로 반환해야 한다', () => {
      const complexPointer = '/data/users/0/profile/addresses/1/street/name';
      expect(convertJsonPathToPointer(complexPointer)).toBe(complexPointer);
      
      const arrayPointer = '/response/data/0/items/1/tags/2/value';
      expect(convertJsonPathToPointer(arrayPointer)).toBe(arrayPointer);
    });

    it('배열 인덱스가 포함된 JSON Pointer를 그대로 반환해야 한다', () => {
      expect(convertJsonPathToPointer('/matrix/0/1')).toBe('/matrix/0/1');
      expect(convertJsonPathToPointer('/data/0/1/2')).toBe('/data/0/1/2');
      expect(convertJsonPathToPointer('/items/-/id')).toBe('/items/-/id');
      expect(convertJsonPathToPointer('/users/-/profile/-/settings')).toBe('/users/-/profile/-/settings');
    });

    it('JSON Pointer URI Fragment 형식(#/ 시작)을 그대로 반환해야 한다', () => {
      expect(convertJsonPathToPointer('#/data')).toBe('#/data');
      expect(convertJsonPathToPointer('#/data/user/name')).toBe('#/data/user/name');
      expect(convertJsonPathToPointer('#/items/0/id')).toBe('#/items/0/id');
      expect(convertJsonPathToPointer('#/users/-/profile')).toBe('#/users/-/profile');
    });

    it('특수 문자가 포함된 JSON Pointer를 그대로 반환해야 한다', () => {
      expect(convertJsonPathToPointer('/data/user-name')).toBe('/data/user-name');
      expect(convertJsonPathToPointer('/data/user_id')).toBe('/data/user_id');
      expect(convertJsonPathToPointer('/data/user$name')).toBe('/data/user$name');
      expect(convertJsonPathToPointer('/config/db.host/port')).toBe('/config/db.host/port');
    });
  });

  describe('멱등성 연속 적용 테스트', () => {
    it('JSON Pointer 연산의 연속 적용 시 멱등성을 보장해야 한다', () => {
      const jsonPointers = [
        '/data',
        '/data/users/0',
        '/items/-/id',
        '#/config/settings',
        '/a/b/c/d/e',
        '/matrix/0/1/2',
        '/users/-/profile/-/settings',
        '#/response/data/0/items/1'
      ];

      jsonPointers.forEach(pointer => {
        // 첫 번째 적용
        const result1 = convertJsonPathToPointer(pointer);
        expect(result1).toBe(pointer);
        
        // 두 번째 적용 (멱등성 검증)
        const result2 = convertJsonPathToPointer(result1);
        expect(result2).toBe(pointer);
        
        // 세 번째 적용 (멱등성 재검증)
        const result3 = convertJsonPathToPointer(result2);
        expect(result3).toBe(pointer);
      });
    });

    it('복잡한 경로에서도 멱등성을 보장해야 한다', () => {
      const complexPointers = [
        '/data/form/sections/0/fields/1/validation/rules/0/message',
        '/response/users/-/profile/addresses/1/street/name',
        '#/config/database/connections/0/settings/timeout',
        '/api/v1/users/123/permissions/0/roles/-/name'
      ];

      complexPointers.forEach(pointer => {
        // 여러 번 연속 적용해도 결과가 변하지 않아야 함
        let current = pointer;
        for (let i = 0; i < 5; i++) {
          current = convertJsonPathToPointer(current);
          expect(current).toBe(pointer);
        }
      });
    });
  });

  describe('경계 케이스 멱등성', () => {
    it('숫자로만 구성된 세그먼트를 포함한 JSON Pointer의 멱등성', () => {
      const numericPointers = [
        '/0',
        '/123',
        '/data/0/value',
        '/matrix/0/1/2/3',
        '/items/999/id'
      ];

      numericPointers.forEach(pointer => {
        expect(convertJsonPathToPointer(pointer)).toBe(pointer);
        expect(convertJsonPathToPointer(convertJsonPathToPointer(pointer))).toBe(pointer);
      });
    });

    it('특수 JSON Pointer 문자를 포함한 경로의 멱등성', () => {
      const specialPointers = [
        '/data/-',
        '/items/-/subItems/-',
        '/config/app.name/version',
        '/users/user@example.com/profile'
      ];

      specialPointers.forEach(pointer => {
        expect(convertJsonPathToPointer(pointer)).toBe(pointer);
        expect(convertJsonPathToPointer(convertJsonPathToPointer(pointer))).toBe(pointer);
      });
    });
  });

  describe('성능 관련 멱등성', () => {
    it('매우 긴 JSON Pointer 경로에서도 멱등성을 보장해야 한다', () => {
      const longPointer = '/' + Array.from({ length: 100 }, (_, i) => `level${i}`).join('/');
      
      expect(convertJsonPathToPointer(longPointer)).toBe(longPointer);
      expect(convertJsonPathToPointer(convertJsonPathToPointer(longPointer))).toBe(longPointer);
    });

    it('많은 배열 인덱스가 있는 JSON Pointer에서도 멱등성을 보장해야 한다', () => {
      const arrayPointer = '/data' + Array.from({ length: 50 }, (_, i) => `/${i}`).join('');
      
      expect(convertJsonPathToPointer(arrayPointer)).toBe(arrayPointer);
      expect(convertJsonPathToPointer(convertJsonPathToPointer(arrayPointer))).toBe(arrayPointer);
    });
  });

  describe('실제 사용 사례 멱등성', () => {
    it('JSON Schema 검증에서 사용되는 JSON Pointer 형식의 멱등성', () => {
      const schemaPointers = [
        '/properties/name',
        '/properties/users/items/properties/email',
        '/definitions/Address/properties/street',
        '#/definitions/User/properties/profile/properties/age'
      ];

      schemaPointers.forEach(pointer => {
        expect(convertJsonPathToPointer(pointer)).toBe(pointer);
      });
    });

    it('REST API 응답 경로에서 사용되는 JSON Pointer 형식의 멱등성', () => {
      const apiPointers = [
        '/data/users/0/id',
        '/response/items/-/name',
        '/result/pagination/page',
        '/error/details/0/message'
      ];

      apiPointers.forEach(pointer => {
        expect(convertJsonPathToPointer(pointer)).toBe(pointer);
      });
    });
  });
});

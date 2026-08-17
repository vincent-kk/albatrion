import { describe, expect, it } from 'vitest';

import type { Patch } from '../../../patchModel';
import { Operation } from '../../../patchModel';
import { applyPatch } from '../applyPatch';
import type { ApplyPatchOptions } from '../type';
import { JsonPatchError } from '../utils/error';

describe('applyPatch', () => {
  describe('기본 기능', () => {
    it('단일 ADD 패치를 적용해야 한다', () => {
      const source = { name: 'John' };
      const patches: Patch[] = [{ op: Operation.ADD, path: '/age', value: 30 }];

      const result = applyPatch(source, patches);

      expect(result).toEqual({ name: 'John', age: 30 });
      expect(result).not.toBe(source); // immutable이 기본값
    });

    it('단일 REPLACE 패치를 적용해야 한다', () => {
      const source = { name: 'John', age: 25 };
      const patches: Patch[] = [
        { op: Operation.REPLACE, path: '/age', value: 30 },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('단일 REMOVE 패치를 적용해야 한다', () => {
      const source = { name: 'John', age: 25 };
      const patches: Patch[] = [{ op: Operation.REMOVE, path: '/age' }];

      const result = applyPatch(source, patches);

      expect(result).toEqual({ name: 'John' });
    });

    it('여러 패치를 순차적으로 적용해야 한다', () => {
      const source = { name: 'John' };
      const patches: Patch[] = [
        { op: Operation.ADD, path: '/age', value: 25 },
        { op: Operation.ADD, path: '/city', value: 'New York' },
        { op: Operation.REPLACE, path: '/age', value: 30 },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({ name: 'John', age: 30, city: 'New York' });
    });

    it('여러 패치를 순차적으로 적용해야 한다 2', () => {
      const source = {
        user: {
          id: 1,
          name: 'Vincent',
          email: 'vincent@example.com',
          roles: ['user', 'admin'],
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
        projects: [
          { id: 'p1', title: 'Alpha' },
          { id: 'p2', title: 'Beta' },
        ],
      };
      const patches: Patch[] = [
        // 1. test 연산 (값 확인용)
        { op: 'test', path: '/user/name', value: 'Vincent' },

        // 2. replace 연산
        { op: 'replace', path: '/user/email', value: 'vincent@newdomain.com' },

        // 3. add 연산 - 객체 필드 추가
        { op: 'add', path: '/user/status', value: 'active' },

        // 4. add 연산 - 배열 중간 삽입
        { op: 'add', path: '/user/roles/1', value: 'editor' },

        // 5. remove 연산 - 배열 값 제거
        { op: 'remove', path: '/user/roles/0' },

        // 6. move 연산 - user.settings.theme → user.theme (상위로 이동)
        { op: 'move', from: '/user/settings/theme', path: '/user/theme' },

        // 7. copy 연산 - user.theme → user.settings.appearance
        { op: 'copy', from: '/user/theme', path: '/user/settings/appearance' },

        // 8. remove 연산 - 하위 객체 제거
        { op: 'remove', path: '/user/settings/notifications' },

        // 9. replace 연산 - 배열 내 객체 속성 변경
        { op: 'replace', path: '/projects/1/title', value: 'Gamma' },

        // 10. add 연산 - 배열에 새 프로젝트 추가
        {
          op: 'add',
          path: '/projects/-',
          value: { id: 'p3', title: 'Delta' },
        },
      ];
      const result = applyPatch(source, patches);

      expect(result).toEqual({
        projects: [
          {
            id: 'p1',
            title: 'Alpha',
          },
          {
            id: 'p2',
            title: 'Gamma',
          },
          {
            id: 'p3',
            title: 'Delta',
          },
        ],
        user: {
          email: 'vincent@newdomain.com',
          id: 1,
          name: 'Vincent',
          roles: ['editor', 'admin'],
          settings: {
            appearance: 'dark',
          },
          status: 'active',
          theme: 'dark',
        },
      });
    });
  });

  describe('배열 처리', () => {
    it('배열에 요소를 추가해야 한다', () => {
      const source = { items: [1, 2, 3] };
      const patches: Patch[] = [
        { op: Operation.ADD, path: '/items/1', value: 10 },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({ items: [1, 10, 2, 3] });
    });

    it('배열 끝에 요소를 추가해야 한다 (- 인덱스)', () => {
      const source = { items: [1, 2, 3] };
      const patches: Patch[] = [
        { op: Operation.ADD, path: '/items/-', value: 4 },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({ items: [1, 2, 3, 4] });
    });

    it('배열 요소를 교체해야 한다', () => {
      const source = { items: [1, 2, 3] };
      const patches: Patch[] = [
        { op: Operation.REPLACE, path: '/items/1', value: 20 },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({ items: [1, 20, 3] });
    });

    it('배열 요소를 제거해야 한다', () => {
      const source = { items: [1, 2, 3] };
      const patches: Patch[] = [{ op: Operation.REMOVE, path: '/items/1' }];

      const result = applyPatch(source, patches);

      expect(result).toEqual({ items: [1, 3] });
    });
  });

  describe('중첩 객체 처리', () => {
    it('중첩된 객체에 값을 추가해야 한다', () => {
      const source = {
        user: {
          name: 'John',
          address: { city: 'New York' },
        },
      };
      const patches: Patch[] = [
        { op: Operation.ADD, path: '/user/address/zip', value: '10001' },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({
        user: {
          name: 'John',
          address: { city: 'New York', zip: '10001' },
        },
      });
    });

    it('중첩된 객체의 값을 변경해야 한다', () => {
      const source = {
        user: {
          name: 'John',
          address: { city: 'New York' },
        },
      };
      const patches: Patch[] = [
        { op: Operation.REPLACE, path: '/user/address/city', value: 'Boston' },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({
        user: {
          name: 'John',
          address: { city: 'Boston' },
        },
      });
    });
  });

  describe('MOVE 연산', () => {
    it('객체의 값을 이동해야 한다', () => {
      const source = { name: 'John', age: 30, temp: 'value' };
      const patches: Patch[] = [
        { op: Operation.MOVE, path: '/nickname', from: '/name' },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({ age: 30, temp: 'value', nickname: 'John' });
    });

    it('배열 요소를 이동해야 한다', () => {
      const source = { items: [1, 2, 3], value: 10 };
      const patches: Patch[] = [
        { op: Operation.MOVE, path: '/items/0', from: '/value' },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({ items: [10, 2, 3] });
    });
  });

  describe('COPY 연산', () => {
    it('객체의 값을 복사해야 한다', () => {
      const source = { name: 'John', age: 30 };
      const patches: Patch[] = [
        { op: Operation.COPY, path: '/nickname', from: '/name' },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({ name: 'John', age: 30, nickname: 'John' });
    });

    it('배열 요소를 복사해야 한다', () => {
      const source = { items: [1, 2, 3], value: 10 };
      const patches: Patch[] = [
        { op: Operation.COPY, path: '/items/1', from: '/value' },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({ items: [1, 10, 3], value: 10 });
    });
  });

  describe('TEST 연산', () => {
    it('strict 모드에서 테스트가 성공하면 원본을 반환해야 한다', () => {
      const source = { name: 'John', age: 30 };
      const patches: Patch[] = [
        { op: Operation.TEST, path: '/name', value: 'John' },
      ];

      const result = applyPatch(source, patches, { strict: true });

      expect(result).toEqual(source);
    });

    it('strict 모드에서 객체 프로퍼티 테스트가 실패하면 PATCH_TEST_FAILED 에러를 발생시켜야 한다', () => {
      const source = { name: 'John', age: 30 };
      const patches: Patch[] = [
        { op: Operation.TEST, path: '/name', value: 'Jane' },
      ];

      expect(() => {
        applyPatch(source, patches, { strict: true });
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches, { strict: true });
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe('PATCH_TEST_FAILED');
        expect((error as JsonPatchError).message).toContain(
          'Test operation failed for property',
        );
        expect((error as JsonPatchError).message).toContain('name');
        expect((error as JsonPatchError).details.actualValue).toBe('John');
        expect((error as JsonPatchError).details.expectedValue).toBe('Jane');
        expect((error as JsonPatchError).details.property).toBe('name');
        expect((error as JsonPatchError).details.operation).toBe('test');
      }
    });

    it('strict 모드에서 배열 요소 테스트가 실패하면 PATCH_TEST_FAILED 에러를 발생시켜야 한다', () => {
      const source = { items: [1, 2, 3] };
      const patches: Patch[] = [
        { op: Operation.TEST, path: '/items/1', value: 5 },
      ];

      expect(() => {
        applyPatch(source, patches, { strict: true });
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches, { strict: true });
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe('PATCH_TEST_FAILED');
        expect((error as JsonPatchError).message).toContain(
          'Test operation failed at array index',
        );
        expect((error as JsonPatchError).details.actualValue).toBe(2);
        expect((error as JsonPatchError).details.expectedValue).toBe(5);
        expect((error as JsonPatchError).details.index).toBe(1);
        expect((error as JsonPatchError).details.operation).toBe('test');
      }
    });

    it('strict 모드에서 루트 테스트가 실패하면 PATCH_TEST_FAILED 에러를 발생시켜야 한다', () => {
      const source = { name: 'John', age: 30 };
      const patches: Patch[] = [
        { op: Operation.TEST, path: '', value: { name: 'Jane', age: 30 } },
      ];

      expect(() => {
        applyPatch(source, patches, { strict: true });
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches, { strict: true });
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe('PATCH_TEST_FAILED');
        expect((error as JsonPatchError).message).toContain(
          'Test operation failed at root level',
        );
        expect((error as JsonPatchError).details.path).toBe('/');
        expect((error as JsonPatchError).details.operation).toBe('test');
      }
    });

    it('non-strict 모드에서는 테스트 실패에도 에러가 발생하지 않아야 한다', () => {
      const source = { name: 'John', age: 30 };
      const patches: Patch[] = [
        { op: Operation.TEST, path: '/name', value: 'Jane' },
      ];

      const result = applyPatch(source, patches, { strict: false });

      expect(result).toEqual(source);
    });
  });

  describe('루트 패치', () => {
    it('루트에 ADD 패치를 적용해야 한다', () => {
      const source = { name: 'John' };
      const patches: Patch[] = [
        { op: Operation.ADD, path: '', value: { age: 30 } },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({ age: 30 });
    });

    it('루트에 REPLACE 패치를 적용해야 한다', () => {
      const source = { name: 'John' };
      const patches: Patch[] = [
        { op: Operation.REPLACE, path: '', value: { age: 30 } },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({ age: 30 });
    });

    it('루트에 REMOVE 패치를 적용해야 한다', () => {
      const source = { name: 'John' };
      const patches: Patch[] = [{ op: Operation.REMOVE, path: '' }];

      const result = applyPatch(source, patches);

      expect(result).toBeNull();
    });
  });

  describe('옵션 처리', () => {
    it('immutable: false로 설정하면 원본을 수정해야 한다', () => {
      const source = { name: 'John' };
      const patches: Patch[] = [{ op: Operation.ADD, path: '/age', value: 30 }];

      const result = applyPatch(source, patches, { immutable: false });

      expect(result).toBe(source); // 동일한 참조
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('예약 멤버 경로는 옵션과 무관하게 own 데이터 의미론으로 처리되어야 한다', () => {
      const source = { name: 'John' };
      const patches: Patch[] = [
        { op: Operation.ADD, path: '/__proto__/custom', value: 'value' },
      ];

      // own '__proto__' 컨테이너가 없으므로 일반 누락 중간 경로와 동일하게 실패한다
      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      // 제거된 legacy protectPrototype 옵션을 넘겨도 동작은 달라지지 않는다
      const legacyOptions: ApplyPatchOptions & { protectPrototype: boolean } = {
        protectPrototype: false,
      };
      expect(() => {
        applyPatch(source, patches, legacyOptions);
      }).toThrow(JsonPatchError);

      expect(({} as Record<string, unknown>).custom).toBeUndefined();
    });
  });

  describe('특수 문자 처리', () => {
    it('JSON Pointer 이스케이프를 처리해야 한다', () => {
      const source = { 'special~key': 'value1', 'special/key': 'value2' };
      const patches: Patch[] = [
        { op: Operation.REPLACE, path: '/special~0key', value: 'newValue1' },
        { op: Operation.REPLACE, path: '/special~1key', value: 'newValue2' },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({
        'special~key': 'newValue1',
        'special/key': 'newValue2',
      });
    });
  });

  describe('복잡한 시나리오', () => {
    it('복잡한 중첩 구조와 여러 패치를 처리해야 한다', () => {
      const source = {
        users: [
          { id: 1, name: 'John', profile: { age: 25, city: 'New York' } },
          { id: 2, name: 'Jane', profile: { age: 30, city: 'Boston' } },
        ],
        meta: { count: 2 },
      };

      const patches: Patch[] = [
        {
          op: Operation.ADD,
          path: '/users/-',
          value: { id: 3, name: 'Bob', profile: { age: 35, city: 'Chicago' } },
        },
        { op: Operation.REPLACE, path: '/users/0/profile/age', value: 26 },
        { op: Operation.REMOVE, path: '/users/1/profile/city' },
        { op: Operation.REPLACE, path: '/meta/count', value: 3 },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({
        users: [
          { id: 1, name: 'John', profile: { age: 26, city: 'New York' } },
          { id: 2, name: 'Jane', profile: { age: 30 } },
          { id: 3, name: 'Bob', profile: { age: 35, city: 'Chicago' } },
        ],
        meta: { count: 3 },
      });
    });

    it('배열과 객체가 혼재된 복잡한 구조를 처리해야 한다', () => {
      const source = {
        data: {
          items: [
            { type: 'text', content: 'Hello' },
            {
              type: 'image',
              content: 'image.jpg',
              metadata: { width: 100, height: 200 },
            },
          ],
        },
      };

      const patches: Patch[] = [
        { op: Operation.ADD, path: '/data/items/0/id', value: 'text-1' },
        {
          op: Operation.REPLACE,
          path: '/data/items/1/metadata/width',
          value: 150,
        },
        {
          op: Operation.ADD,
          path: '/data/items/1/metadata/alt',
          value: 'Sample image',
        },
        { op: Operation.ADD, path: '/data/title', value: 'Document' },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({
        data: {
          title: 'Document',
          items: [
            { type: 'text', content: 'Hello', id: 'text-1' },
            {
              type: 'image',
              content: 'image.jpg',
              metadata: { width: 150, height: 200, alt: 'Sample image' },
            },
          ],
        },
      });
    });
  });

  describe('타입 검증', () => {
    it('타입이 올바르게 유지되어야 한다', () => {
      interface User {
        name: string;
        age: number;
        email?: string;
      }

      const source: User = { name: 'John', age: 25 };
      const patches: Patch[] = [
        { op: Operation.ADD, path: '/email', value: 'john@example.com' },
      ];

      const result = applyPatch<User>(source, patches);

      expect(result.name).toBe('John');
      expect(result.age).toBe(25);
      expect(result.email).toBe('john@example.com');
    });

    it('결과 타입이 다를 수 있음을 허용해야 한다', () => {
      interface Source {
        temp: string;
      }

      interface Result {
        name: string;
        age: number;
      }

      const source: Source = { temp: 'value' };
      const patches: Patch[] = [
        { op: Operation.REMOVE, path: '/temp' },
        { op: Operation.ADD, path: '/name', value: 'John' },
        { op: Operation.ADD, path: '/age', value: 30 },
      ];

      const result = applyPatch<Result>(source, patches);

      expect(result).toEqual({ name: 'John', age: 30 });
    });
  });

  describe('빈 패치 배열', () => {
    it('빈 패치 배열을 처리해야 한다', () => {
      const source = { name: 'John', age: 30 };
      const patches: Patch[] = [];

      const result = applyPatch(source, patches);

      expect(result).toEqual(source);
      expect(result).not.toBe(source); // immutable이 기본값이므로 복사본 반환
    });
  });
});

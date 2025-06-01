import { describe, expect, it } from 'vitest';

import { difference } from '@/json/JSONPointer/utils/patch/difference/difference';

import { mergePatch } from '../mergePatch';

describe('difference + mergePatch 통합 테스트 - RFC 7386 Round-trip', () => {
  describe('Round-trip 테스트: mergePatch(original, difference(original, target)) === target', () => {
    it('RFC 7386 Appendix A 표준 테스트 케이스들', () => {
      const testCases = [
        {
          name: '속성 값 변경',
          original: { a: 'b' },
          target: { a: 'c' },
        },
        {
          name: '새 속성 추가',
          original: { a: 'b' },
          target: { a: 'b', b: 'c' },
        },
        {
          name: '속성 제거',
          original: { a: 'b' },
          target: {},
        },
        {
          name: '여러 속성 중 하나만 제거',
          original: { a: 'b', b: 'c' },
          target: { b: 'c' },
        },
        {
          name: '배열을 문자열로 대체',
          original: { a: ['b'] },
          target: { a: 'c' },
        },
        {
          name: '문자열을 배열로 대체',
          original: { a: 'c' },
          target: { a: ['b'] },
        },
        {
          name: '중첩 객체 병합',
          original: { a: { b: 'c' } },
          target: { a: { b: 'd' } },
        },
        {
          name: '중첩 객체에서 속성 제거',
          original: { a: { b: 'c', c: 'd' } },
          target: { a: { b: 'd' } },
        },
        {
          name: '객체 내 배열 완전 대체',
          original: { a: [{ b: 'c' }] },
          target: { a: [1] },
        },
        {
          name: '배열 완전 대체',
          original: ['a', 'b'],
          target: ['c', 'd'],
        },
        {
          name: '객체를 배열로 대체',
          original: { a: 'b' },
          target: ['c'],
        },
        {
          name: '객체를 null로 대체',
          original: { a: 'foo' },
          target: null,
        },
        {
          name: '객체를 문자열로 대체',
          original: { a: 'foo' },
          target: 'bar',
        },
        {
          name: '기존 null 값 유지하고 새 속성 추가',
          original: { e: null },
          target: { e: null, a: 1 },
        },
        {
          name: '배열에 객체 패치 적용',
          original: [1, 2],
          target: { a: 'b' },
        },
        {
          name: '깊이 중첩된 객체',
          original: {},
          target: { a: { bb: {} } },
        },
      ];

      testCases.forEach(({ original, target }) => {
        const patch = difference(original, target);

        if (patch === undefined) {
          // 변경사항이 없는 경우
          expect(original).toEqual(target);
        } else {
          // 패치를 적용했을 때 타깃과 같아야 함
          const result = mergePatch(original, patch);
          expect(result).toEqual(target);
        }
      });
    });
  });

  describe('복잡한 실제 시나리오 Round-trip 테스트', () => {
    it('사용자 프로필 업데이트', () => {
      const original = {
        user: {
          id: 123,
          name: 'Vincent',
          email: 'vincent@example.com',
          profile: {
            age: 30,
            city: 'Seoul',
            hobbies: ['coding', 'reading'],
          },
          settings: {
            theme: 'dark',
            notifications: {
              email: true,
              push: false,
            },
          },
        },
      };

      const target = {
        user: {
          id: 123,
          name: 'Vincent Kim', // 이름 변경
          email: 'vincent@example.com',
          profile: {
            age: 31, // 나이 변경
            city: 'Busan', // 도시 변경
            hobbies: ['coding', 'gaming'], // 취미 완전 대체
            bio: 'Software Engineer', // 새 필드 추가
          },
          settings: {
            theme: 'light', // 테마 변경
            notifications: {
              email: true,
              push: true, // 푸시 알림 활성화
              sms: false, // 새 알림 타입 추가
            },
          },
        },
      };

      const patch = difference(original, target);
      const result = mergePatch(original, patch);

      expect(result).toEqual(target);
    });

    it('API 응답 구조 변경', () => {
      const original = {
        data: {
          users: [
            { id: 1, name: 'Alice', active: true },
            { id: 2, name: 'Bob', active: false },
          ],
          pagination: {
            page: 1,
            total: 2,
            hasNext: false,
          },
        },
        meta: {
          timestamp: '2024-01-01T00:00:00Z',
          version: 'v1',
        },
      };

      const target = {
        data: {
          users: [{ id: 1, name: 'Alice Smith', active: true, role: 'admin' }], // 사용자 배열 완전 변경
          pagination: {
            page: 1,
            total: 1,
            hasNext: false,
            limit: 10, // 새 필드 추가
          },
        },
        meta: {
          timestamp: '2024-01-02T00:00:00Z', // 타임스탬프 업데이트
          version: 'v2', // 버전 업데이트
        },
        errors: [], // 새 최상위 필드 추가
      };

      const patch = difference(original, target);
      const result = mergePatch(original, patch);

      expect(result).toEqual(target);
    });

    it('설정 구성 마이그레이션', () => {
      const original = {
        database: {
          host: 'localhost',
          port: 5432,
          name: 'myapp',
          ssl: false,
        },
        cache: {
          type: 'redis',
          url: 'redis://localhost:6379',
        },
        logging: {
          level: 'info',
          format: 'json',
        },
      };

      const target = {
        database: {
          host: 'prod-db.example.com', // 호스트 변경
          port: 5432,
          name: 'myapp_prod', // DB 이름 변경
          ssl: true, // SSL 활성화
          pool: {
            // 새 연결 풀 설정
            min: 5,
            max: 20,
          },
        },
        cache: {
          type: 'memcached', // 캐시 타입 변경
          servers: ['cache1:11211', 'cache2:11211'], // URL에서 서버 배열로 변경
        },
        // logging 섹션 제거됨
      };

      const patch = difference(original, target);
      const result = mergePatch(original, patch);

      expect(result).toEqual(target);
    });
  });

  describe('엣지 케이스 Round-trip 테스트', () => {
    it('동일한 객체 (변경사항 없음)', () => {
      const original = { a: 1, b: { c: 2 } };
      const target = { a: 1, b: { c: 2 } };

      const patch = difference(original, target);
      expect(patch).toBeUndefined();

      // 패치가 undefined인 경우 원본과 타깃이 같아야 함
      expect(original).toEqual(target);
    });

    it('빈 객체에서 복잡한 객체로', () => {
      const original = {};
      const target = {
        nested: {
          deep: {
            array: [1, 2, 3],
            object: { key: 'value' },
          },
        },
      };

      const patch = difference(original, target);
      const result = mergePatch(original, patch);

      expect(result).toEqual(target);
    });

    it('복잡한 객체에서 빈 객체로', () => {
      const original = {
        a: 1,
        b: { c: 2, d: [3, 4] },
        e: 'string',
      };
      const target = {};

      const patch = difference(original, target);
      const result = mergePatch(original, patch);

      expect(result).toEqual(target);
    });

    it('null 값의 한계 - JSON Merge Patch에서 null은 삭제 신호임', () => {
      // JSON Merge Patch에서는 null 값 자체를 설정할 수 없음
      // null은 항상 속성 삭제를 의미함 (RFC 7386)
      const original = {
        a: 'value',
        b: null,
        c: 'remove me',
      };

      // 이런 target은 JSON Merge Patch로 표현 불가능:
      // { a: null, b: 'value' }
      // 왜냐하면 { a: null }은 "a 속성 삭제"를 의미하기 때문

      // 대신 실제로 가능한 변환을 테스트:
      const possibleTarget = {
        b: 'value', // null에서 값으로 변경
        d: 'new property', // 새 속성 추가
        // a와 c는 삭제됨
      };

      const patch = difference(original, possibleTarget);
      const result = mergePatch(original, patch);

      expect(result).toEqual(possibleTarget);

      // 패치 내용도 검증
      expect(patch).toEqual({
        a: null, // 삭제
        b: 'value', // 값 변경
        c: null, // 삭제
        d: 'new property', // 추가
      });
    });

    it('falsy 값들 처리', () => {
      const original = {
        zero: 1,
        emptyString: 'not empty',
        falseBool: true,
      };
      const target = {
        zero: 0,
        emptyString: '',
        falseBool: false,
      };

      const patch = difference(original, target);
      const result = mergePatch(original, patch);

      expect(result).toEqual(target);
    });
  });

  describe('타입 변환 Round-trip 테스트', () => {
    it('primitive 타입 간 변환', () => {
      const testCases = [
        { original: 'string', target: 42 },
        { original: 42, target: 'string' },
        { original: true, target: false },
        { original: null, target: 'value' },
        { original: 'value', target: null },
      ];

      testCases.forEach(({ original, target }) => {
        const patch = difference(original, target);
        const result = mergePatch(original, patch);
        expect(result).toEqual(target);
      });
    });

    it('객체와 다른 타입 간 변환', () => {
      const testCases = [
        {
          original: { complex: 'object' },
          target: 'simple string',
        },
        {
          original: [1, 2, 3],
          target: { converted: 'to object' },
        },
        {
          original: 'simple',
          target: { complex: 'object' },
        },
        {
          original: { data: 'object' },
          target: [1, 2, 3],
        },
      ];

      testCases.forEach(({ original, target }) => {
        const patch = difference(original, target);
        const result = mergePatch(original, patch);
        expect(result).toEqual(target);
      });
    });
  });

  describe('성능 및 메모리 효율성 테스트', () => {
    it('큰 객체에서 작은 변경', () => {
      const original = {
        largeData: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          data: `item-${i}`,
          metadata: {
            created: '2024-01-01',
            updated: '2024-01-01',
          },
        })),
        config: {
          setting1: 'value1',
          setting2: 'value2',
          setting3: 'value3',
        },
      };

      const target = {
        ...original,
        config: {
          ...original.config,
          setting2: 'updated value', // 작은 변경
        },
      };

      const patch = difference(original, target);

      // 패치는 변경된 부분만 포함해야 함
      expect(patch).toEqual({
        config: {
          setting2: 'updated value',
        },
      });

      const result = mergePatch(original, patch);
      expect(result).toEqual(target);
    });
  });

  describe('Mutable 모드 테스트 (immutable = false)', () => {
    it('기본 객체 수정 - 참조 동일성 확인', () => {
      const original = { a: 1, b: 2, c: 3 };
      const patch = { b: 20, d: 4 };

      const result = mergePatch(original, patch, false);

      // 참조가 동일해야 함
      expect(result).toBe(original);

      // 값이 올바르게 수정되어야 함
      expect(result).toEqual({ a: 1, b: 20, c: 3, d: 4 });
      expect(original).toEqual({ a: 1, b: 20, c: 3, d: 4 });
    });

    it('속성 삭제 - null 값 처리', () => {
      const original = {
        keep: 'value',
        remove1: 'delete me',
        remove2: 'delete me too',
      };
      const patch = { remove1: null, remove2: null, add: 'new value' };

      const result = mergePatch(original, patch, false);

      expect(result).toBe(original);
      expect(result).toEqual({ keep: 'value', add: 'new value' });

      // 안전한 속성 확인
      const resultObj = result as Record<string, any>;
      expect('remove1' in resultObj).toBe(false);
      expect('remove2' in resultObj).toBe(false);
    });

    it('중첩 객체 수정 - 깊은 참조 확인', () => {
      const original = {
        user: { name: 'Alice', age: 25 },
        config: { theme: 'dark', lang: 'ko' },
      };
      const patch = {
        user: { age: 26, role: 'admin' },
        config: { theme: 'light' },
      };

      const result = mergePatch(original, patch, false);

      expect(result).toBe(original);
      expect(result).toEqual({
        user: { name: 'Alice', age: 26, role: 'admin' },
        config: { theme: 'light', lang: 'ko' },
      });

      // 타입 안전한 중첩 객체 확인
      const resultObj = result as typeof original;
      expect(resultObj.user.name).toBe('Alice'); // 기존 값 유지
      expect(resultObj.user.age).toBe(26); // 수정된 값
      expect((resultObj.user as any).role).toBe('admin'); // 추가된 값
    });

    it('복합 시나리오 - 추가, 수정, 삭제', () => {
      const original = {
        keep: 'unchanged',
        modify: 'old value',
        delete: 'remove this',
        nested: {
          keep: 'nested unchanged',
          modify: 'nested old',
          delete: 'nested remove',
        },
      };

      const patch = {
        modify: 'new value',
        delete: null,
        add: 'added value',
        nested: {
          modify: 'nested new',
          delete: null,
          add: 'nested added',
        },
      };

      const originalRef = original;
      const nestedRef = original.nested;

      const result = mergePatch(original, patch, false);

      // 최상위 참조 동일성
      expect(result).toBe(originalRef);

      // 중첩 객체도 직접 수정됨 (immutable = false이므로)
      const resultObj = result as typeof original;
      expect(resultObj.nested).toBe(nestedRef); // mutable 모드에서는 동일한 참조

      expect(result).toEqual({
        keep: 'unchanged',
        modify: 'new value',
        add: 'added value',
        nested: {
          keep: 'nested unchanged',
          modify: 'nested new',
          add: 'nested added',
        },
      });
    });

    it('primitive 값으로 완전 대체', () => {
      const original = { complex: 'object' };
      const patch = 'simple string';

      const result = mergePatch(original, patch, false);

      // primitive 값으로 완전 대체
      expect(result).toBe(patch);
      expect(result).toBe('simple string');
    });

    it('배열로 완전 대체', () => {
      const original = { data: 'object' };
      const patch = [1, 2, 3];

      const result = mergePatch(original, patch, false);

      expect(result).toBe(patch);
      expect(result).toEqual([1, 2, 3]);
    });

    it('빈 객체에 패치 적용', () => {
      const original = {};
      const patch = { a: 1, b: { c: 2 } };

      const result = mergePatch(original, patch, false);

      expect(result).toBe(original);
      expect(result).toEqual({ a: 1, b: { c: 2 } });
    });

    it('non-object source에 패치 적용', () => {
      const original = 'string';
      const patch = { converted: 'to object' };

      const result = mergePatch(original, patch, false);

      // non-object source는 빈 객체로 처리되므로 새 객체 반환
      expect(result).not.toBe(original);
      expect(result).toEqual({ converted: 'to object' });
    });

    it('immutable vs mutable 성능 비교용 대용량 객체', () => {
      const createLargeObject = () => ({
        data: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          value: `item-${i}`,
        })),
        metadata: { created: new Date().toISOString(), version: 1 },
        config: { setting1: 'value1', setting2: 'value2', setting3: 'value3' },
      });

      const original = createLargeObject();
      const originalRef = original;
      const patch = {
        metadata: { version: 2 },
        config: { setting2: 'updated' },
        newField: 'added',
      };

      const result = mergePatch(original, patch, false);

      // 참조 동일성 확인 (메모리 효율성)
      expect(result).toBe(originalRef);

      // 데이터 무결성 확인 - 타입 안전한 접근
      const resultObj = result as typeof original & { newField: string };
      expect(resultObj.data).toBe(originalRef.data); // 배열은 변경되지 않았으므로 동일 참조
      expect(resultObj.metadata.version).toBe(2);
      expect(resultObj.config.setting2).toBe('updated');
      expect(resultObj.newField).toBe('added');
    });
  });
});

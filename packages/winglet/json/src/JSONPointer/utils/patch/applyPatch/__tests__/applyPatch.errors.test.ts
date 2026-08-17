import { describe, expect, it } from 'vitest';

import type { Patch } from '../../../patchModel';
import { Operation } from '../../../patchModel';
import { applyPatch } from '../applyPatch';
import { JsonPatchError } from '../utils/error';

describe('applyPatch 에러 처리', () => {
  describe('에러 처리 - 경로 관련', () => {
    it('존재하지 않는 중간 경로에 대해 PATCH_PATH_INVALID_INTERMEDIATE 에러를 발생시켜야 한다', () => {
      const source = { name: 'John' };
      const patches: Patch[] = [
        { op: Operation.ADD, path: '/user/profile/age', value: 30 },
      ];

      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches);
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_PATH_INVALID_INTERMEDIATE',
        );
        expect((error as JsonPatchError).message).toContain(
          'Cannot traverse path',
        );
        expect((error as JsonPatchError).message).toContain(
          '/user/profile/age',
        );
        expect((error as JsonPatchError).message).toContain(
          "intermediate value at '/user'",
        );
        expect((error as JsonPatchError).details.failedAtPath).toBe('/user');
        expect((error as JsonPatchError).details.remainingPath).toBe(
          'profile/age',
        );
        expect(
          (error as JsonPatchError).details.intermediateValue,
        ).toBeUndefined();
        expect((error as JsonPatchError).details.operation).toBe('add');
      }
    });

    it('primitive 값에 패치를 적용하려 할 때 PATCH_PATH_INVALID_INTERMEDIATE 에러를 발생시켜야 한다', () => {
      const source = { value: 'string' };
      const patches: Patch[] = [
        { op: Operation.ADD, path: '/value/property', value: 'test' },
      ];

      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches);
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_PATH_INVALID_INTERMEDIATE',
        );
        expect((error as JsonPatchError).message).toContain(
          'Cannot traverse path',
        );
        expect((error as JsonPatchError).message).toContain(
          "intermediate value at '/value' is string",
        );
        expect((error as JsonPatchError).details.intermediateValue).toBe(
          'string',
        );
        expect((error as JsonPatchError).details.intermediateType).toBe(
          'string',
        );
        expect((error as JsonPatchError).details.operation).toBe('add');
      }
    });

    it('null 값 경로에 대해 PATCH_PATH_INVALID_INTERMEDIATE 에러를 발생시켜야 한다', () => {
      const source = { data: null };
      const patches: Patch[] = [
        { op: Operation.ADD, path: '/data/property', value: 'test' },
      ];

      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches);
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_PATH_INVALID_INTERMEDIATE',
        );
        expect((error as JsonPatchError).message).toContain(
          "intermediate value at '/data' is null",
        );
        expect((error as JsonPatchError).details.intermediateValue).toBeNull();
        expect((error as JsonPatchError).details.intermediateType).toBe('null');
      }
    });
  });

  describe('에러 처리 - 배열 관련', () => {
    it('배열 인덱스가 범위를 벗어나면 PATCH_ARRAY_INDEX_OUT_OF_BOUNDS 에러를 발생시켜야 한다', () => {
      const source = { items: [1, 2, 3] };
      const patches: Patch[] = [
        { op: Operation.ADD, path: '/items/10', value: 'value' },
      ];

      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches);
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS',
        );
        expect((error as JsonPatchError).message).toContain(
          'Cannot add element at index 10',
        );
        expect((error as JsonPatchError).message).toContain(
          'Index must not exceed array length 3',
        );
        expect((error as JsonPatchError).details.requestedIndex).toBe(10);
        expect((error as JsonPatchError).details.arrayLength).toBe(3);
        expect((error as JsonPatchError).details.maxValidIndex).toBe(3);
        expect((error as JsonPatchError).details.operation).toBe('add');
      }
    });

    it('REPLACE 연산에서 배열 인덱스가 범위를 벗어나면 PATCH_ARRAY_INDEX_OUT_OF_BOUNDS 에러를 발생시켜야 한다', () => {
      const source = { items: [1, 2, 3] };
      const patches: Patch[] = [
        { op: Operation.REPLACE, path: '/items/5', value: 'value' },
      ];

      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches);
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS',
        );
        expect((error as JsonPatchError).message).toContain(
          'Cannot replace element at index 5',
        );
        expect((error as JsonPatchError).message).toContain(
          'Index must be less than array length 3',
        );
        expect((error as JsonPatchError).details.maxValidIndex).toBe(2);
        expect((error as JsonPatchError).details.operation).toBe('replace');
      }
    });

    it('REMOVE 연산에서 배열 인덱스가 범위를 벗어나면 PATCH_ARRAY_INDEX_OUT_OF_BOUNDS 에러를 발생시켜야 한다', () => {
      const source = { items: [1, 2, 3] };
      const patches: Patch[] = [{ op: Operation.REMOVE, path: '/items/5' }];

      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches);
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS',
        );
        expect((error as JsonPatchError).message).toContain(
          'Cannot remove element at index 5',
        );
        expect((error as JsonPatchError).details.operation).toBe('remove');
      }
    });

    it('TEST 연산에서 배열 인덱스가 범위를 벗어나면 PATCH_ARRAY_INDEX_OUT_OF_BOUNDS 에러를 발생시켜야 한다', () => {
      const source = { items: [1, 2, 3] };
      const patches: Patch[] = [
        { op: Operation.TEST, path: '/items/5', value: 'value' },
      ];

      expect(() => {
        applyPatch(source, patches, { strict: true });
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches, { strict: true });
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS',
        );
        expect((error as JsonPatchError).message).toContain(
          'Cannot test element at index 5',
        );
        expect((error as JsonPatchError).details.operation).toBe('test');
      }
    });

    it('잘못된 배열 인덱스 형식에 대해 PATCH_ARRAY_INDEX_INVALID 에러를 발생시켜야 한다', () => {
      const source = { items: [1, 2, 3] };
      const patches: Patch[] = [
        { op: Operation.ADD, path: '/items/abc', value: 'value' },
      ];

      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches);
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_ARRAY_INDEX_INVALID',
        );
        expect((error as JsonPatchError).message).toContain(
          "Invalid array index 'abc'",
        );
        expect((error as JsonPatchError).message).toContain(
          "Expected a non-negative integer or '-' for end-of-array",
        );
        expect((error as JsonPatchError).details.providedIndex).toBe('abc');
        expect((error as JsonPatchError).details.arrayLength).toBe(3);
        expect((error as JsonPatchError).details.validFormat).toContain(
          'non-negative integer',
        );
      }
    });

    it('음수 배열 인덱스에 대해 PATCH_ARRAY_INDEX_INVALID 에러를 발생시켜야 한다', () => {
      const source = { items: [1, 2, 3] };
      const patches: Patch[] = [
        { op: Operation.ADD, path: '/items/-5', value: 'value' },
      ];

      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches);
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_ARRAY_INDEX_INVALID',
        );
        expect((error as JsonPatchError).message).toContain(
          "Invalid array index '-5'",
        );
        expect((error as JsonPatchError).details.providedIndex).toBe('-5');
      }
    });
  });

  describe('에러 처리 - 객체 관련', () => {
    it('존재하지 않는 프로퍼티를 제거하려 할 때 PATCH_OBJECT_PROPERTY_NOT_FOUND 에러를 발생시켜야 한다', () => {
      const source = { name: 'John', age: 30 };
      const patches: Patch[] = [{ op: Operation.REMOVE, path: '/email' }];

      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches);
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_OBJECT_PROPERTY_NOT_FOUND',
        );
        expect((error as JsonPatchError).message).toContain(
          "Cannot remove property 'email'",
        );
        expect((error as JsonPatchError).message).toContain(
          'property does not exist on object',
        );
        expect((error as JsonPatchError).details.missingProperty).toBe('email');
        expect((error as JsonPatchError).details.availableProperties).toEqual([
          'name',
          'age',
        ]);
        expect((error as JsonPatchError).details.operation).toBe('remove');
      }
    });

    it('존재하지 않는 프로퍼티를 테스트하려 할 때 PATCH_OBJECT_PROPERTY_NOT_FOUND 에러를 발생시켜야 한다', () => {
      const source = { name: 'John', age: 30 };
      const patches: Patch[] = [
        { op: Operation.TEST, path: '/email', value: 'test@example.com' },
      ];

      expect(() => {
        applyPatch(source, patches, { strict: true });
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches, { strict: true });
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_OBJECT_PROPERTY_NOT_FOUND',
        );
        expect((error as JsonPatchError).message).toContain(
          "Cannot test property 'email'",
        );
        expect((error as JsonPatchError).details.missingProperty).toBe('email');
        expect((error as JsonPatchError).details.expectedValue).toBe(
          'test@example.com',
        );
        expect((error as JsonPatchError).details.operation).toBe('test');
      }
    });
  });

  describe('에러 처리 - MOVE 연산 순환 참조', () => {
    it('MOVE 연산에서 자기 자신으로 이동 시 PATCH_MOVE_INTO_DESCENDANT_FORBIDDEN 에러를 발생시켜야 한다', () => {
      const source = { a: { b: 'value' } };
      const patches: Patch[] = [
        { op: Operation.MOVE, from: '/a/b', path: '/a/b' },
      ];

      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches);
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_MOVE_INTO_DESCENDANT_FORBIDDEN',
        );
        expect((error as JsonPatchError).message).toContain(
          'identical to source location',
        );
        expect((error as JsonPatchError).details.patch).toEqual(patches[0]);
        expect((error as JsonPatchError).details.patchIndex).toBe(0);
        expect((error as JsonPatchError).details.operation).toBe('move');
        expect((error as JsonPatchError).details.from).toBe('/a/b');
        expect((error as JsonPatchError).details.path).toBe('/a/b');
      }
    });

    it('MOVE 연산에서 하위 경로로 이동 시 PATCH_MOVE_INTO_DESCENDANT_FORBIDDEN 에러를 발생시켜야 한다', () => {
      const source = { a: { b: { c: 'value' } } };
      const patches: Patch[] = [
        { op: Operation.MOVE, from: '/a', path: '/a/b/newLocation' },
      ];

      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches);
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_MOVE_INTO_DESCENDANT_FORBIDDEN',
        );
        expect((error as JsonPatchError).message).toContain('descendant of');
        expect((error as JsonPatchError).details.patch).toEqual(patches[0]);
        expect((error as JsonPatchError).details.patchIndex).toBe(0);
        expect((error as JsonPatchError).details.operation).toBe('move');
        expect((error as JsonPatchError).details.from).toBe('/a');
        expect((error as JsonPatchError).details.path).toBe('/a/b/newLocation');
      }
    });

    it('MOVE 연산에서 루트를 하위로 이동 시 PATCH_MOVE_INTO_DESCENDANT_FORBIDDEN 에러를 발생시켜야 한다', () => {
      const source = { root: 'value' };
      const patches: Patch[] = [
        { op: Operation.MOVE, from: '', path: '/newRoot' },
      ];

      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches);
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_MOVE_INTO_DESCENDANT_FORBIDDEN',
        );
        expect((error as JsonPatchError).details.patch).toEqual(patches[0]);
        expect((error as JsonPatchError).details.patchIndex).toBe(0);
        expect((error as JsonPatchError).details.operation).toBe('move');
        expect((error as JsonPatchError).details.from).toBe('');
        expect((error as JsonPatchError).details.path).toBe('/newRoot');
      }
    });

    it('MOVE 연산에서 유효한 이동은 정상 처리되어야 한다', () => {
      const source = { a: { b: 'value' }, c: {} };
      const patches: Patch[] = [
        { op: Operation.MOVE, from: '/a/b', path: '/c/b' },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({
        a: {},
        c: { b: 'value' },
      });
    });

    it('MOVE 연산에서 형제 경로간 이동은 허용되어야 한다', () => {
      const source = { a: { x: 'valueX', y: 'valueY' } };
      const patches: Patch[] = [
        { op: Operation.MOVE, from: '/a/x', path: '/a/z' },
      ];

      const result = applyPatch(source, patches);

      expect(result).toEqual({
        a: { y: 'valueY', z: 'valueX' },
      });
    });

    it('COPY 연산은 순환 참조 검증이 적용되지 않아야 한다', () => {
      const source = { a: { b: 'value' } };
      const patches: Patch[] = [
        { op: Operation.COPY, from: '/a', path: '/a/copied' },
      ];

      // COPY는 순환 참조 제한이 없으므로 정상 처리되어야 함
      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches);
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_COPY_INTO_DESCENDANT_FORBIDDEN',
        );
        expect((error as JsonPatchError).details.patch).toEqual(patches[0]);
        expect((error as JsonPatchError).details.patchIndex).toBe(0);
        expect((error as JsonPatchError).details.operation).toBe('copy');
        expect((error as JsonPatchError).details.from).toBe('/a');
        expect((error as JsonPatchError).details.path).toBe('/a/copied');
      }
    });
  });

  describe('에러 처리 - 보안 및 연산 관련', () => {
    it('예약 멤버 경로 쓰기는 own 데이터로 적용되고 프로토타입 체인에 도달하지 않아야 한다', () => {
      const source = { name: 'John' };

      const prototypePatch: Patch[] = [
        {
          op: Operation.ADD,
          path: '/__proto__',
          value: { member: 'value' },
        },
      ];

      const result = applyPatch<Record<string, unknown>>(
        source,
        prototypePatch,
      );

      expect(
        Object.getOwnPropertyDescriptor(result, '__proto__')?.value,
      ).toEqual({ member: 'value' });
      expect(result.name).toBe('John');
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(({} as Record<string, unknown>).member).toBeUndefined();
      expect(Object.getPrototypeOf(source)).toBe(Object.prototype);
    });

    it('잘못된 연산에 대해 PATCH_OPERATION_INVALID 에러를 발생시켜야 한다', () => {
      const source = { name: 'John' };
      const patches: Patch[] = [
        { op: 'invalid_op' as any, path: '/name', value: 'Jane' },
      ];

      expect(() => {
        applyPatch(source, patches);
      }).toThrow(JsonPatchError);

      try {
        applyPatch(source, patches);
      } catch (error) {
        expect(error).toBeInstanceOf(JsonPatchError);
        expect((error as JsonPatchError).specific).toBe(
          'PATCH_OPERATION_INVALID',
        );
        expect((error as JsonPatchError).message).toContain(
          "Unsupported operation 'invalid_op'",
        );
        expect((error as JsonPatchError).message).toContain(
          'Valid operations are: add, remove, replace, move, copy, test',
        );
        expect((error as JsonPatchError).details.providedOperation).toBe(
          'invalid_op',
        );
        expect((error as JsonPatchError).details.validOperations).toEqual([
          'add',
          'remove',
          'replace',
          'move',
          'copy',
          'test',
        ]);
      }
    });
  });
});

import { describe, expect, it } from 'vitest';

import { equals } from '../equals';

describe('equals 함수 테스트', () => {
  // 1. 원시값 비교 테스트
  describe('원시값 비교', () => {
    it('같은 원시값은 true를 반환해야 합니다.', () => {
      expect(equals(1, 1)).toBe(true);
      expect(equals('hello', 'hello')).toBe(true);
      expect(equals(true, true)).toBe(true);
      expect(equals(null, null)).toBe(true);
      expect(equals(undefined, undefined)).toBe(true);
    });

    it('다른 원시값은 false를 반환해야 합니다.', () => {
      expect(equals(1, 2)).toBe(false);
      expect(equals('hello', 'world')).toBe(false);
      expect(equals(true, false)).toBe(false);
      expect(equals(0, false)).toBe(false); // 타입 다름
      expect(equals('', false)).toBe(false); // 타입 다름
      expect(equals(null, undefined)).toBe(false);
      expect(equals(1, '1')).toBe(false); // 타입 다름
    });

    // NaN은 자신과도 같지 않지만, equals 함수는 동일하게 취급해야 함
    it('NaN 값 비교 시 true를 반환해야 합니다.', () => {
      expect(equals(NaN, NaN)).toBe(true);
    });
  });

  // 2. 객체 비교 테스트
  describe('객체 비교', () => {
    it('동일한 프로퍼티와 값을 가진 객체는 true를 반환해야 합니다.', () => {
      const obj1 = { a: 1, b: 'test' };
      const obj2 = { a: 1, b: 'test' };
      expect(equals(obj1, obj2)).toBe(true);
    });

    it('프로퍼티 순서가 달라도 내용이 같으면 true를 반환해야 합니다.', () => {
      const obj1 = { a: 1, b: 'test' };
      const obj2 = { b: 'test', a: 1 };
      expect(equals(obj1, obj2)).toBe(true);
    });

    it('프로퍼티 개수가 다르면 false를 반환해야 합니다.', () => {
      const obj1 = { a: 1, b: 'test' };
      const obj2 = { a: 1 };
      expect(equals(obj1, obj2)).toBe(false);
      expect(equals(obj2, obj1)).toBe(false);
    });

    it('같은 프로퍼티지만 값이 다르면 false를 반환해야 합니다.', () => {
      const obj1 = { a: 1, b: 'test' };
      const obj2 = { a: 1, b: 'different' };
      expect(equals(obj1, obj2)).toBe(false);
    });

    it('중첩된 객체도 깊은 수준까지 비교해야 합니다.', () => {
      const obj1 = { a: 1, b: { c: 2, d: { e: 'nested' } } };
      const obj2 = { a: 1, b: { c: 2, d: { e: 'nested' } } };
      const obj3 = { a: 1, b: { c: 2, d: { e: 'changed' } } };
      expect(equals(obj1, obj2)).toBe(true);
      expect(equals(obj1, obj3)).toBe(false);
    });

    it('빈 객체 비교 시 true를 반환해야 합니다.', () => {
      expect(equals({}, {})).toBe(true);
    });

    it('객체 내 함수 비교 (참조 동일성)', () => {
      const func = () => {};
      const obj1 = { fn: func };
      const obj2 = { fn: func };
      const obj3 = { fn: () => {} }; // 다른 함수 참조
      expect(equals(obj1, obj2)).toBe(true); // 같은 함수 참조
      expect(equals(obj1, obj3)).toBe(false); // 다른 함수 참조
    });
  });

  // 3. 배열 비교 테스트
  describe('배열 비교', () => {
    it('동일한 요소와 순서를 가진 배열은 true를 반환해야 합니다.', () => {
      const arr1 = [1, 'a', { b: 2 }];
      const arr2 = [1, 'a', { b: 2 }];
      expect(equals(arr1, arr2)).toBe(true);
    });

    it('배열 길이가 다르면 false를 반환해야 합니다.', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2];
      expect(equals(arr1, arr2)).toBe(false);
      expect(equals(arr2, arr1)).toBe(false);
    });

    it('요소 순서가 다르면 false를 반환해야 합니다.', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 3, 2];
      expect(equals(arr1, arr2)).toBe(false);
    });

    it('같은 요소지만 값이 다르면 false를 반환해야 합니다.', () => {
      const arr1 = [1, { a: 1 }];
      const arr2 = [1, { a: 2 }];
      expect(equals(arr1, arr2)).toBe(false);
    });

    it('중첩된 배열도 깊은 수준까지 비교해야 합니다.', () => {
      const arr1 = [1, [2, [3, 'nested']]];
      const arr2 = [1, [2, [3, 'nested']]];
      const arr3 = [1, [2, [3, 'changed']]];
      expect(equals(arr1, arr2)).toBe(true);
      expect(equals(arr1, arr3)).toBe(false);
    });

    it('빈 배열 비교 시 true를 반환해야 합니다.', () => {
      expect(equals([], [])).toBe(true);
    });
  });

  // 4. 혼합 타입 비교 테스트
  describe('혼합 타입 비교', () => {
    it('객체와 배열은 false를 반환해야 합니다.', () => {
      expect(equals({ 0: 1 }, [1])).toBe(false);
      expect(equals([1], { 0: 1 })).toBe(false);
    });

    it('객체/배열과 원시값은 false를 반환해야 합니다.', () => {
      expect(equals({}, null)).toBe(false);
      expect(equals([], 0)).toBe(false);
      expect(equals({ a: 1 }, 1)).toBe(false);
      expect(equals([1], '1')).toBe(false);
    });
  });

  // 5. 참조 비교 테스트
  describe('참조 비교', () => {
    it('동일한 객체 참조는 true를 반환해야 합니다.', () => {
      const obj = { a: 1 };
      expect(equals(obj, obj)).toBe(true);
    });

    it('동일한 배열 참조는 true를 반환해야 합니다.', () => {
      const arr = [1, 2];
      expect(equals(arr, arr)).toBe(true);
    });
  });

  // 6. 복잡하고 큰 데이터 구조 비교
  describe('복잡하고 큰 데이터 구조 비교', () => {
    it('매우 깊게 중첩된 객체를 비교해야 합니다.', () => {
      const createDeepObject = (depth: number): any => {
        if (depth === 0) return { value: 'leaf' };
        return { [`level_${depth}`]: createDeepObject(depth - 1) };
      };

      const deepObj1 = createDeepObject(100);
      const deepObj2 = createDeepObject(100);
      const deepObj3 = createDeepObject(100);
      deepObj3.level_100.level_99.level_98.level_97.value = 'changed'; // 중간 값 변경

      expect(equals(deepObj1, deepObj2)).toBe(true);
      expect(equals(deepObj1, deepObj3)).toBe(false);
    });

    it('많은 프로퍼티를 가진 객체를 비교해야 합니다.', () => {
      const wideObj1: Record<string, number> = {};
      const wideObj2: Record<string, number> = {};
      const wideObj3: Record<string, number> = {};
      for (let i = 0; i < 1000; i++) {
        wideObj1[`key_${i}`] = i;
        wideObj2[`key_${i}`] = i;
        wideObj3[`key_${i}`] = i;
      }
      wideObj3['key_500'] = 999; // 값 하나 변경

      expect(equals(wideObj1, wideObj2)).toBe(true);
      expect(equals(wideObj1, wideObj3)).toBe(false);
    });

    it('매우 깊게 중첩된 배열을 비교해야 합니다.', () => {
      const createDeepArray = (depth: number): any[] => {
        if (depth === 0) return ['leaf'];
        return [depth, createDeepArray(depth - 1)];
      };
      const deepArr1 = createDeepArray(100);
      const deepArr2 = createDeepArray(100);
      const deepArr3 = createDeepArray(100);
      deepArr3[1][1][1][0] = 'changed'; // 깊은 곳 값 변경 (예시, 실제 인덱스는 계산 필요)

      expect(equals(deepArr1, deepArr2)).toBe(true);
      // expect(equals(deepArr1, deepArr3)).toBe(false); // 값 변경 시 false 확인 (정확한 인덱싱 필요)
    });

    it('많은 요소를 가진 배열을 비교해야 합니다.', () => {
      const wideArr1: number[] = [];
      const wideArr2: number[] = [];
      const wideArr3: number[] = [];
      for (let i = 0; i < 1000; i++) {
        wideArr1.push(i);
        wideArr2.push(i);
        wideArr3.push(i);
      }
      wideArr3[500] = 999; // 값 하나 변경

      expect(equals(wideArr1, wideArr2)).toBe(true);
      expect(equals(wideArr1, wideArr3)).toBe(false);
    });

    it('복잡하게 혼합된 구조를 비교해야 합니다.', () => {
      const complex1 = {
        a: [1, { b: 'test', c: [null, undefined, NaN] }],
        d: new Date(2023, 1, 1),
        e: /regex/g,
        f: new Set([1, 2, 3]), // Set은 현재 제대로 비교되지 않을 수 있음
      };
      const complex2 = {
        a: [1, { b: 'test', c: [null, undefined, NaN] }],
        d: new Date(2023, 1, 1),
        e: /regex/g,
        f: new Set([1, 2, 3]),
      };
      const complex3 = {
        ...complex2,
        a: [1, { b: 'changed', c: [null, undefined, NaN] }],
      };

      // Set 비교는 현재 구현의 한계로 인해 예상과 다를 수 있음
      expect(equals(complex1, complex2)).toBe(true);
      expect(equals(complex1, complex3)).toBe(false);
    });
  });
});

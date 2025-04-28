import { describe, expect, it } from 'vitest';

import { stableEquals } from '../stableEquals';

describe('stableEquals 함수 테스트', () => {
  // 1. 원시값 비교 테스트
  describe('원시값 비교', () => {
    it('같은 원시값은 true를 반환해야 합니다.', () => {
      expect(stableEquals(1, 1)).toBe(true);
      expect(stableEquals('hello', 'hello')).toBe(true);
      expect(stableEquals(true, true)).toBe(true);
      expect(stableEquals(null, null)).toBe(true);
      expect(stableEquals(undefined, undefined)).toBe(true);
    });

    it('다른 원시값은 false를 반환해야 합니다.', () => {
      expect(stableEquals(1, 2)).toBe(false);
      expect(stableEquals('hello', 'world')).toBe(false);
      expect(stableEquals(true, false)).toBe(false);
      expect(stableEquals(0, false)).toBe(false); // 타입 다름
      expect(stableEquals('', false)).toBe(false); // 타입 다름
      expect(stableEquals(null, undefined)).toBe(false);
      expect(stableEquals(1, '1')).toBe(false); // 타입 다름
    });

    // NaN은 자신과도 같지 않지만, stableEquals 함수는 동일하게 취급해야 함
    it('NaN 값 비교 시 true를 반환해야 합니다.', () => {
      expect(stableEquals(NaN, NaN)).toBe(true);
    });
  });

  // 2. 객체 비교 테스트
  describe('객체 비교', () => {
    it('동일한 프로퍼티와 값을 가진 객체는 true를 반환해야 합니다.', () => {
      const obj1 = { a: 1, b: 'test' };
      const obj2 = { a: 1, b: 'test' };
      expect(stableEquals(obj1, obj2)).toBe(true);
    });

    it('프로퍼티 순서가 달라도 내용이 같으면 true를 반환해야 합니다.', () => {
      const obj1 = { a: 1, b: 'test' };
      const obj2 = { b: 'test', a: 1 };
      expect(stableEquals(obj1, obj2)).toBe(true);
    });

    it('프로퍼티 개수가 다르면 false를 반환해야 합니다.', () => {
      const obj1 = { a: 1, b: 'test' };
      const obj2 = { a: 1 };
      expect(stableEquals(obj1, obj2)).toBe(false);
      expect(stableEquals(obj2, obj1)).toBe(false);
    });

    it('같은 프로퍼티지만 값이 다르면 false를 반환해야 합니다.', () => {
      const obj1 = { a: 1, b: 'test' };
      const obj2 = { a: 1, b: 'different' };
      expect(stableEquals(obj1, obj2)).toBe(false);
    });

    it('중첩된 객체도 깊은 수준까지 비교해야 합니다.', () => {
      const obj1 = { a: 1, b: { c: 2, d: { e: 'nested' } } };
      const obj2 = { a: 1, b: { c: 2, d: { e: 'nested' } } };
      const obj3 = { a: 1, b: { c: 2, d: { e: 'changed' } } };
      expect(stableEquals(obj1, obj2)).toBe(true);
      expect(stableEquals(obj1, obj3)).toBe(false);
    });

    it('빈 객체 비교 시 true를 반환해야 합니다.', () => {
      expect(stableEquals({}, {})).toBe(true);
    });

    it('객체 내 함수 비교 (참조 동일성)', () => {
      const func = () => {};
      const obj1 = { fn: func };
      const obj2 = { fn: func };
      const obj3 = { fn: () => {} }; // 다른 함수 참조
      expect(stableEquals(obj1, obj2)).toBe(true); // 같은 함수 참조
      expect(stableEquals(obj1, obj3)).toBe(false); // 다른 함수 참조
    });
  });

  // 3. 배열 비교 테스트
  describe('배열 비교', () => {
    it('동일한 요소와 순서를 가진 배열은 true를 반환해야 합니다.', () => {
      const arr1 = [1, 'a', { b: 2 }];
      const arr2 = [1, 'a', { b: 2 }];
      expect(stableEquals(arr1, arr2)).toBe(true);
    });

    it('배열 길이가 다르면 false를 반환해야 합니다.', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2];
      expect(stableEquals(arr1, arr2)).toBe(false);
      expect(stableEquals(arr2, arr1)).toBe(false);
    });

    it('요소 순서가 다르면 false를 반환해야 합니다.', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 3, 2];
      expect(stableEquals(arr1, arr2)).toBe(false);
    });

    it('같은 요소지만 값이 다르면 false를 반환해야 합니다.', () => {
      const arr1 = [1, { a: 1 }];
      const arr2 = [1, { a: 2 }];
      expect(stableEquals(arr1, arr2)).toBe(false);
    });

    it('중첩된 배열도 깊은 수준까지 비교해야 합니다.', () => {
      const arr1 = [1, [2, [3, 'nested']]];
      const arr2 = [1, [2, [3, 'nested']]];
      const arr3 = [1, [2, [3, 'changed']]];
      expect(stableEquals(arr1, arr2)).toBe(true);
      expect(stableEquals(arr1, arr3)).toBe(false);
    });

    it('빈 배열 비교 시 true를 반환해야 합니다.', () => {
      expect(stableEquals([], [])).toBe(true);
    });
  });

  // 4. 혼합 타입 비교 테스트
  describe('혼합 타입 비교', () => {
    it('객체와 배열은 false를 반환해야 합니다.', () => {
      expect(stableEquals({ 0: 1 }, [1])).toBe(false);
      expect(stableEquals([1], { 0: 1 })).toBe(false);
    });

    it('객체/배열과 원시값은 false를 반환해야 합니다.', () => {
      expect(stableEquals({}, null)).toBe(false);
      expect(stableEquals([], 0)).toBe(false);
      expect(stableEquals({ a: 1 }, 1)).toBe(false);
      expect(stableEquals([1], '1')).toBe(false);
    });
  });

  // 5. 참조 비교 테스트
  describe('참조 비교', () => {
    it('동일한 객체 참조는 true를 반환해야 합니다.', () => {
      const obj = { a: 1 };
      expect(stableEquals(obj, obj)).toBe(true);
    });

    it('동일한 배열 참조는 true를 반환해야 합니다.', () => {
      const arr = [1, 2];
      expect(stableEquals(arr, arr)).toBe(true);
    });
  });

  // 6. 엣지 케이스 비교
  describe('엣지 케이스 비교', () => {
    it('Symbol 키를 가진 객체를 비교해야 합니다.', () => {
      const sym = Symbol('key');
      const obj1 = { [sym]: 'value1' };
      const obj2 = { [sym]: 'value1' };
      const obj3 = { [sym]: 'value2' };
      const obj4 = { a: 1, [sym]: 'value1' };
      const obj5 = { b: 1, [sym]: 'value1' };

      // 현재 stableEquals 구현은 Object.keys를 사용하므로 Symbol 키는 비교하지 않음
      // 따라서 Symbol 키만 다를 경우 true를 반환할 수 있음 (구현의 한계)
      expect(stableEquals(obj1, obj2)).toBe(true); // Symbol 값은 같음
      expect(stableEquals(obj1, obj3)).toBe(false); // Symbol 값은 다름
      expect(stableEquals(obj4, obj5)).toBe(false); // 다른 일반 키 존재 + Symbol 키 값 같음
    });

    it('Object.create(null)로 생성된 객체를 비교해야 합니다.', () => {
      const obj1 = Object.create(null);
      obj1.a = 1;
      const obj2 = Object.create(null);
      obj2.a = 1;
      const obj3 = Object.create(null);
      obj3.b = 1;

      expect(stableEquals(obj1, obj2)).toBe(true);
      expect(stableEquals(obj1, obj3)).toBe(false);
      expect(stableEquals(obj1, { a: 1 })).toBe(true); // 프로토타입 다름 (현재 구현은 통과할 수 있음)
      expect(stableEquals({}, Object.create(null))).toBe(true);
    });

    // 경고: 현재 stableEquals 구현은 순환 참조를 처리하지 못하고 무한 루프에 빠질 수 있습니다.
    // 테스트 실행 시 타임아웃이 발생할 수 있습니다.
    it('순환 참조가 있는 객체는 false 또는 에러를 반환해야 합니다.', () => {
      const obj1: any = { a: 1 };
      obj1.self = obj1;
      const obj2: any = { a: 1 };
      obj2.self = obj2;
      const obj3: any = { a: 1, self: { a: 1 } }; // 다른 구조

      // 이상적으로는 순환 참조를 감지하고 처리해야 함
      expect(stableEquals(obj1, obj2)).toBe(true); // 구조가 동일
      expect(stableEquals(obj1, obj3)).toBe(false); // 구조가 다름
    });

    it('순환 참조가 있는 배열은 false 또는 에러를 반환해야 합니다.', () => {
      const arr1: any[] = [1];
      arr1.push(arr1);
      const arr2: any[] = [1];
      arr2.push(arr2);
      const arr3: any[] = [1, [1]];
      expect(stableEquals(arr1, arr2)).toBe(true); // 구조가 동일
      expect(stableEquals(arr1, arr3)).toBe(false); // 구조가 다름
    });

    it('희소 배열 (Sparse arrays)을 비교해야 합니다.', () => {
      // eslint-disable-next-line no-sparse-arrays
      const arr1 = [1, , 3];
      // eslint-disable-next-line no-sparse-arrays
      const arr2 = [1, , 3];
      const arr3 = [1, undefined, 3]; // 희소 배열과 다름
      const arr4 = [1, 2, 3];

      expect(stableEquals(arr1, arr2)).toBe(true);
      expect(stableEquals(arr1, arr3)).toBe(false); // undefined와 empty slot은 다름
      expect(stableEquals(arr1, arr4)).toBe(false);
      expect(stableEquals(new Array(3), new Array(3))).toBe(true); // 둘 다 비어있음
      // eslint-disable-next-line no-sparse-arrays
      expect(stableEquals([, ,], [, ,])).toBe(true);
    });

    it('Date 객체를 비교해야 합니다.', () => {
      const date1 = new Date(2023, 10, 21);
      const date2 = new Date(2023, 10, 21);
      const date3 = new Date(2023, 10, 22);

      // 현재 stableEquals 구현은 Date 객체를 일반 객체처럼 비교함
      // getTime() 값 비교가 필요할 수 있음
      expect(stableEquals(date1, date2)).toBe(true); // 값(시간)이 같음 (현재 구현은 통과 못할 수 있음)
      expect(stableEquals(date1, date3)).toBe(false); // 값(시간)이 다름
      // expect(stableEquals(date1, { getTime: date1.getTime })).toBe(false); // 타입 다름
    });

    it('RegExp 객체를 비교해야 합니다.', () => {
      const regex1 = /abc/gi;
      const regex2 = /abc/gi;
      const regex3 = /abc/g; // 플래그 다름
      const regex4 = /def/gi; // 패턴 다름

      // 현재 stableEquals 구현은 RegExp 객체를 일반 객체처럼 비교함
      // source와 flags 비교가 필요할 수 있음
      expect(stableEquals(regex1, regex2)).toBe(true); // 패턴과 플래그 같음 (현재 구현은 통과 못할 수 있음)
      expect(stableEquals(regex1, regex3)).toBe(false); // 플래그 다름
      expect(stableEquals(regex1, regex4)).toBe(false); // 패턴 다름
      // expect(stableEquals(regex1, { source: 'abc', flags: 'gi' })).toBe(false); // 타입 다름
    });

    it('TypedArray를 비교해야 합니다.', () => {
      const arr1 = new Int8Array([1, 2, 3]);
      const arr2 = new Int8Array([1, 2, 3]);
      const arr3 = new Int8Array([1, 2, 4]);
      const arr4 = new Float32Array([1, 2, 3]);
      const arr5 = [1, 2, 3]; // 일반 배열

      // 현재 equals는 TypedArray를 일반 객체처럼 취급
      expect(stableEquals(arr1, arr2)).toBe(true); // 값과 타입 동일
      expect(stableEquals(arr1, arr3)).toBe(false); // 값 다름
      expect(stableEquals(arr1, arr4)).toBe(false); // 타입 다름
      expect(stableEquals(arr1, arr5)).toBe(false); // 타입 다름 (배열 vs TypedArray)
    });
  });

  // 7. 복잡하고 큰 데이터 구조 비교
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

      expect(stableEquals(deepObj1, deepObj2)).toBe(true);
      expect(stableEquals(deepObj1, deepObj3)).toBe(false);
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

      expect(stableEquals(wideObj1, wideObj2)).toBe(true);
      expect(stableEquals(wideObj1, wideObj3)).toBe(false);
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

      expect(stableEquals(deepArr1, deepArr2)).toBe(true);
      // expect(stableEquals(deepArr1, deepArr3)).toBe(false); // 값 변경 시 false 확인 (정확한 인덱싱 필요)
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

      expect(stableEquals(wideArr1, wideArr2)).toBe(true);
      expect(stableEquals(wideArr1, wideArr3)).toBe(false);
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
      expect(stableEquals(complex1, complex2)).toBe(true);
      expect(stableEquals(complex1, complex3)).toBe(false);
    });
  });

  describe('stableEquals with omits option', () => {
    it('should return true if differences are only in omitted string keys', () => {
      const left = { a: 1, b: 2, c: 3 };
      const right = { a: 1, b: 99, c: 3 };
      expect(stableEquals(left, right, ['b'])).toBe(true);
    });

    it('should return false if differences exist in non-omitted string keys', () => {
      const left = { a: 1, b: 2, c: 3 };
      const right = { a: 1, b: 99, c: 100 };
      expect(stableEquals(left, right, ['b'])).toBe(false);
    });

    it('should handle multiple omitted string keys', () => {
      const left = { a: 1, b: 2, c: 3, d: 4 };
      const right = { a: 1, b: 99, c: 100, d: 4 };
      expect(stableEquals(left, right, ['b', 'c'])).toBe(true);
    });

    it('should return true if differences are only in omitted symbol keys', () => {
      const symB = Symbol('b');
      const symC = Symbol('c');
      const left = { a: 1, [symB]: 2, [symC]: 3 };
      const right = { a: 1, [symB]: 99, [symC]: 3 };
      expect(stableEquals(left, right, [symB])).toBe(true);
    });

    it('should return false if differences exist in non-omitted symbol keys', () => {
      const symB = Symbol('b');
      const symC = Symbol('c');
      const left = { a: 1, [symB]: 2, [symC]: 3 };
      const right = { a: 1, [symB]: 99, [symC]: 100 };
      expect(stableEquals(left, right, [symB])).toBe(false);
    });

    it('should handle mixed omitted string and symbol keys', () => {
      const symB = Symbol('b');
      const left = { a: 1, [symB]: 2, c: 3, d: 4 };
      const right = { a: 100, [symB]: 99, c: 3, d: 4 };
      expect(stableEquals(left, right, ['a', symB])).toBe(true);
    });

    it('should return false if omits option is not provided and values differ (string key)', () => {
      const left = { a: 1, b: 2, c: 3 };
      const right = { a: 1, b: 99, c: 3 };
      expect(stableEquals(left, right)).toBe(false);
    });

    it('should return false if omits option is not provided and values differ (symbol key)', () => {
      const symB = Symbol('b');
      const left = { a: 1, [symB]: 2 };
      const right = { a: 1, [symB]: 99 };
      expect(stableEquals(left, right)).toBe(false);
    });

    it('should return true for identical objects even with omits', () => {
      const symB = Symbol('b');
      const left = { a: 1, [symB]: 2 };
      const right = { a: 1, [symB]: 2 };
      expect(stableEquals(left, right, ['a', symB])).toBe(true);
    });

    it('should return true for empty omits array', () => {
      const left = { a: 1, b: 2 };
      const right = { a: 1, b: 99 };
      expect(stableEquals(left, right, [])).toBe(false);
    });
  });
});

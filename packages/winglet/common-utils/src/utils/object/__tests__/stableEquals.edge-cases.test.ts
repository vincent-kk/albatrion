import { describe, expect, it } from 'vitest';

import { stableEquals } from '../stableEquals';

describe('stableEquals 함수 테스트', () => {
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
});

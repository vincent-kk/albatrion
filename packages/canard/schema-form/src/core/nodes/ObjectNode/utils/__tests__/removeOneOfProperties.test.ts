import { describe, expect, it } from 'vitest';

import type { JsonSchema, ObjectValue } from '@/schema-form/types';

import { getOneOfKeyInfo } from '../getOneOfKeyInfo';
import { removeOneOfProperties } from '../removeOneOfProperties';

/**
 * 새로운 테스트 코드
 * removeOneOfProperties 함수가 4개의 매개변수를 받도록 업데이트됨:
 * 1. value: ObjectValue | undefined - 원본 객체 값
 * 2. oneOfKeySet: Set<string> | undefined - oneOf에 정의된 속성 키 집합
 * 3. oneOfKeySetList: Array<Set<string>> | undefined - 각 oneOf 항목별 속성 키 집합 목록
 * 4. allowedKeySetIndex: number - 허용된 속성 키 집합의 인덱스
 */
describe('removeOneOfProperties', () => {
  // 기본 동작 테스트
  it('기본 동작: oneOf에 정의된 프로퍼티 제거', () => {
    const value: ObjectValue = {
      name: 'John',
      age: 30,
      address: '서울시',
      email: 'john@example.com',
    };

    const oneOfKeySet = new Set(['age', 'email']);
    const oneOfKeySetList = [new Set(['age']), new Set(['email'])];
    const allowedKeySetIndex = 0; // age만 허용

    const result = removeOneOfProperties(
      value,
      oneOfKeySet,
      oneOfKeySetList,
      allowedKeySetIndex,
    );

    expect(result).toEqual({
      name: 'John',
      age: 30,
      address: '서울시',
    });
  });

  // value가 undefined인 경우
  it('value가 undefined인 경우 undefined 반환', () => {
    const oneOfKeySet = new Set(['test']);
    const oneOfKeySetList = [new Set(['test'])];
    const allowedKeySetIndex = 0;

    const result = removeOneOfProperties(
      undefined,
      oneOfKeySet,
      oneOfKeySetList,
      allowedKeySetIndex,
    );
    expect(result).toBeUndefined();
  });

  // oneOfKeySet이 undefined인 경우
  it('oneOfKeySet이 undefined인 경우 원본 value 반환', () => {
    const value: ObjectValue = { name: 'John', age: 30 };
    const result = removeOneOfProperties(value, undefined, undefined, 0);
    expect(result).toBe(value);
  });

  // oneOfKeySetList가 undefined인 경우
  it('oneOfKeySetList가 undefined인 경우 원본 value 반환', () => {
    const value: ObjectValue = { name: 'John', age: 30 };
    const oneOfKeySet = new Set(['age']);
    const result = removeOneOfProperties(value, oneOfKeySet, undefined, 0);
    expect(result).toBe(value);
  });

  // allowedKeySetIndex와 oneOfKeySetList 처리 테스트
  it('allowedKeySetIndex에 해당하는 oneOfKeySetList의 키는 제거하지 않음', () => {
    const value: ObjectValue = {
      name: 'John',
      age: 30,
      address: '서울시',
      email: 'john@example.com',
    };

    const oneOfKeySet = new Set(['age', 'email', 'address']);
    const oneOfKeySetList = [new Set(['age']), new Set(['email', 'address'])];
    const allowedKeySetIndex = 1; // email과 address가 허용됨

    const result = removeOneOfProperties(
      value,
      oneOfKeySet,
      oneOfKeySetList,
      allowedKeySetIndex,
    );

    expect(result).toEqual({
      name: 'John',
      email: 'john@example.com',
      address: '서울시',
    });
  });

  // 복합 테스트
  it('복합 케이스: oneOfKeySetList와 allowedKeySetIndex 상호작용', () => {
    const value: ObjectValue = {
      id: 1,
      name: 'John',
      age: 30,
      role: 'user',
      email: 'john@example.com',
      phone: '010-1234-5678',
      address: '서울시',
    };

    const oneOfKeySet = new Set(['age', 'email', 'phone', 'address']);
    const oneOfKeySetList = [
      new Set(['age', 'email']),
      new Set(['phone', 'address']),
    ];
    const allowedKeySetIndex = 0; // age와 email만 허용

    const result = removeOneOfProperties(
      value,
      oneOfKeySet,
      oneOfKeySetList,
      allowedKeySetIndex,
    );

    expect(result).toEqual({
      id: 1,
      name: 'John',
      role: 'user',
      age: 30,
      email: 'john@example.com',
    });
  });

  // allowedKeySetIndex가 범위를 벗어나는 경우
  it('allowedKeySetIndex가 oneOfKeySetList 범위를 벗어나는 경우', () => {
    const value: ObjectValue = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
    };

    const oneOfKeySet = new Set(['age', 'email']);
    const oneOfKeySetList = [new Set(['age']), new Set(['email'])];
    const outOfBoundsIndex = 5; // 범위를 벗어남

    const result = removeOneOfProperties(
      value,
      oneOfKeySet,
      oneOfKeySetList,
      outOfBoundsIndex,
    );

    // 범위를 벗어나면 oneOf 속성들이 전부 제거되어야 함
    expect(result).toEqual({
      name: 'John',
    });
  });

  // oneOfKeySetList가 빈 배열인 경우
  it('oneOfKeySetList가 빈 배열인 경우', () => {
    const value: ObjectValue = {
      id: 1,
      name: 'John',
      age: 30,
    };

    const oneOfKeySet = new Set(['age']);
    const oneOfKeySetList: Array<Set<string>> = [];
    const allowedKeySetIndex = 0;

    const result = removeOneOfProperties(
      value,
      oneOfKeySet,
      oneOfKeySetList,
      allowedKeySetIndex,
    );

    // oneOfKeyList가 비어있으면 모든 oneOf 속성이 제거되어야 함
    expect(result).toEqual({
      id: 1,
      name: 'John',
    });
  });

  // 실제 스키마와 함께 테스트
  it('실제 JSON 스키마와 함께 테스트', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'number' } },
      oneOf: [
        { properties: { c: { type: 'string' }, d: { type: 'number' } } },
        { properties: { e: { type: 'boolean' } } },
      ],
    };

    const value = { a: 'A', b: 1, c: 'C', d: 2, e: true, x: 99 };

    // oneOfKeyInfo를 직접 만들지 않고 getOneOfKeyInfo 함수 사용
    const oneOfKeyInfo = getOneOfKeyInfo(schema);

    if (oneOfKeyInfo) {
      const { oneOfKeySet, oneOfKeySetList } = oneOfKeyInfo;

      // allowedKeySetIndex를 0으로 설정하여 첫 번째 oneOf 항목 (c, d)를 허용
      const result = removeOneOfProperties(
        value,
        oneOfKeySet,
        oneOfKeySetList,
        0,
      );

      expect(result).toEqual({
        a: 'A',
        b: 1,
        c: 'C',
        d: 2,
        x: 99, // 어디에도 정의되지 않은 속성은 유지
      });

      // allowedKeySetIndex를 1로 설정하여 두 번째 oneOf 항목 (e)를 허용
      const result2 = removeOneOfProperties(
        value,
        oneOfKeySet,
        oneOfKeySetList,
        1,
      );

      expect(result2).toEqual({
        a: 'A',
        b: 1,
        e: true,
        x: 99, // 어디에도 정의되지 않은 속성은 유지
      });
    }
  });

  // null 입력 처리 테스트
  it('value가 null인 경우', () => {
    const oneOfKeySet = new Set(['test']);
    const oneOfKeySetList = [new Set(['test'])];
    const allowedKeySetIndex = 0;

    const result = removeOneOfProperties(
      null as any,
      oneOfKeySet,
      oneOfKeySetList,
      allowedKeySetIndex,
    );
    expect(result).toBeNull();
  });
});

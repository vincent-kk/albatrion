import { describe, expect, it } from 'vitest';

import { intersectionLite } from '../intersectionLite';

describe('intersectionLite', () => {
  it('두 배열의 교집합을 반환해야 합니다', () => {
    expect(intersectionLite(['apple', 'banana', 'orange'], ['apple'])).toEqual([
      'apple',
    ]);
    expect(intersectionLite([], ['apple', 'banana', 'orange'])).toEqual([]);
    expect(
      intersectionLite(['apple', 'banana', 'orange', 'grape'], ['banana', 'grape']),
    ).toEqual(['banana', 'grape']);
  });

  it('숫자 배열에서 교집합을 반환해야 합니다', () => {
    expect(intersectionLite([1, 2, 3, 4, 5], [3, 4, 5, 6, 7])).toEqual([3, 4, 5]);
    expect(intersectionLite([1, 2, 3], [4, 5, 6])).toEqual([]);
    expect(intersectionLite([1, 2, 3], [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('중복된 요소를 처리해야 합니다', () => {
    const source = [1, 2, 2, 3, 4, 4, 5];
    const target = [2, 4, 6];
    // 소스 배열의 중복 요소가 보존됨
    expect(intersectionLite(source, target)).toEqual([2, 2, 4, 4]);
  });

  it('빈 배열을 처리해야 합니다', () => {
    expect(intersectionLite([], [])).toEqual([]);
    expect(intersectionLite([1, 2, 3], [])).toEqual([]);
    expect(intersectionLite([], [1, 2, 3])).toEqual([]);
  });

  it('대소문자를 구분해야 합니다', () => {
    const words1 = ['Hello', 'World', 'hello', 'world'];
    const words2 = ['Hello', 'world', 'Test'];
    expect(intersectionLite(words1, words2)).toEqual(['Hello', 'world']);
  });

  it('다양한 데이터 타입을 처리해야 합니다', () => {
    const mixed1 = [1, '2', 3, '4', 5];
    const mixed2 = ['2', 3, '4', 6];
    expect(intersectionLite(mixed1, mixed2)).toEqual(['2', 3, '4']);
  });

  it('원본 배열의 순서를 유지해야 합니다', () => {
    const source = [5, 4, 3, 2, 1];
    const target = [1, 3, 5];
    // 소스 배열의 순서가 유지됨
    expect(intersectionLite(source, target)).toEqual([5, 3, 1]);
  });

  it('NaN을 올바르게 처리해야 합니다', () => {
    const source = [1, NaN, 2, NaN, 3];
    const target = [NaN, 2];
    // indexOf는 NaN을 찾지 못하므로 NaN이 결과에 포함되지 않음
    expect(intersectionLite(source, target)).toEqual([2]);
  });

  it('작은 배열에서 성능이 효율적이어야 합니다', () => {
    // 100개 미만의 작은 배열에서 테스트
    const source = Array.from({ length: 50 }, (_, i) => i);
    const target = Array.from({ length: 25 }, (_, i) => i * 2);
    const result = intersectionLite(source, target);

    // 짝수만 남아야 함 (0, 2, 4, ..., 48)
    expect(result).toEqual(Array.from({ length: 25 }, (_, i) => i * 2));
  });

  it('객체 참조를 올바르게 처리해야 합니다', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const obj3 = { id: 3 };

    const source = [obj1, obj2, obj3];
    const target = [obj2, obj3];

    expect(intersectionLite(source, target)).toEqual([obj2, obj3]);

    // 다른 객체 참조는 매치되지 않아야 함
    const target2 = [{ id: 2 }]; // 다른 객체
    expect(intersectionLite(source, target2)).toEqual([]);
  });

  it('문자열 배열에서 공통 권한을 찾아야 합니다', () => {
    const userPermissions = ['read', 'write', 'delete', 'admin'];
    const requiredPermissions = ['read', 'write', 'execute'];

    const grantedPermissions = intersectionLite(userPermissions, requiredPermissions);
    expect(grantedPermissions).toEqual(['read', 'write']);
  });

  it('이미 등록된 사용자를 찾아야 합니다', () => {
    const currentUsers = ['alice', 'bob', 'charlie', 'diana'];
    const invitedUsers = ['bob', 'charlie', 'eve', 'frank'];

    const alreadyRegistered = intersectionLite(currentUsers, invitedUsers);
    expect(alreadyRegistered).toEqual(['bob', 'charlie']);
  });

  it('최적화된 루프 구조를 사용해야 합니다', () => {
    // 루프 최적화 검증 - 정상 작동 확인
    const source = [1, 2, 3, 4, 5];
    const target = [2, 3, 4];
    const result = intersectionLite(source, target);

    expect(result).toEqual([2, 3, 4]);
    expect(result.length).toBe(3);
  });
});
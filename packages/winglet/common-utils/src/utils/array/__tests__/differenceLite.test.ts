import { describe, expect, it } from 'vitest';

import { differenceLite } from '../differenceLite';

describe('differenceLite', () => {
  it('두 배열의 차집합을 반환해야 합니다', () => {
    expect(differenceLite(['apple', 'banana', 'orange'], ['apple'])).toEqual([
      'banana',
      'orange',
    ]);
    expect(differenceLite([], ['apple', 'banana', 'orange'])).toEqual([]);
    expect(
      differenceLite(
        ['apple', 'banana', 'orange', 'grape'],
        ['banana', 'grape'],
      ),
    ).toEqual(['apple', 'orange']);
  });

  it('숫자 배열에서 차집합을 반환해야 합니다', () => {
    expect(differenceLite([1, 2, 3, 4, 5], [2, 4])).toEqual([1, 3, 5]);
    expect(differenceLite([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3]);
    expect(differenceLite([1, 2, 3], [1, 2, 3])).toEqual([]);
  });

  it('중복된 요소를 처리해야 합니다', () => {
    const source = [1, 2, 2, 3, 4, 4, 5];
    const exclude = [2, 4];
    expect(differenceLite(source, exclude)).toEqual([1, 3, 5]);
  });

  it('빈 배열을 처리해야 합니다', () => {
    expect(differenceLite([], [])).toEqual([]);
    expect(differenceLite([1, 2, 3], [])).toEqual([1, 2, 3]);
    expect(differenceLite([], [1, 2, 3])).toEqual([]);
  });

  it('대소문자를 구분해야 합니다', () => {
    const words = ['Hello', 'World', 'hello', 'world'];
    const exclude = ['Hello', 'World'];
    expect(differenceLite(words, exclude)).toEqual(['hello', 'world']);
  });

  it('다양한 데이터 타입을 처리해야 합니다', () => {
    const mixed = [1, '2', 3, '4', true, false, null, undefined];
    const exclude = ['2', 3, false, null];
    expect(differenceLite(mixed, exclude)).toEqual([1, '4', true, undefined]);
  });

  it('원본 배열의 순서를 유지해야 합니다', () => {
    const source = [5, 4, 3, 2, 1];
    const exclude = [3, 1];
    expect(differenceLite(source, exclude)).toEqual([5, 4, 2]);
  });

  it('NaN을 올바르게 처리해야 합니다', () => {
    const source = [1, NaN, 2, NaN, 3];
    const exclude = [NaN];
    // indexOf는 NaN을 찾지 못하므로 NaN이 결과에 포함됨
    const result = differenceLite(source, exclude);
    expect(result.length).toBe(5);
    expect(result[0]).toBe(1);
    expect(Number.isNaN(result[1])).toBe(true);
    expect(result[2]).toBe(2);
    expect(Number.isNaN(result[3])).toBe(true);
    expect(result[4]).toBe(3);
  });

  it('작은 배열에서 성능이 효율적이어야 합니다', () => {
    // 100개 미만의 작은 배열에서 테스트
    const source = Array.from({ length: 50 }, (_, i) => i);
    const exclude = Array.from({ length: 25 }, (_, i) => i * 2);
    const result = differenceLite(source, exclude);

    // 홀수만 남아야 함 (1, 3, 5, ..., 47, 49)
    expect(result).toEqual(Array.from({ length: 25 }, (_, i) => i * 2 + 1));
  });

  it('객체 참조를 올바르게 처리해야 합니다', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const obj3 = { id: 3 };

    const source = [obj1, obj2, obj3];
    const exclude = [obj2];

    expect(differenceLite(source, exclude)).toEqual([obj1, obj3]);

    // 다른 객체 참조는 제외되지 않아야 함
    const exclude2 = [{ id: 2 }]; // 다른 객체
    expect(differenceLite(source, exclude2)).toEqual([obj1, obj2, obj3]);
  });

  it('최적화된 루프 구조를 사용해야 합니다', () => {
    // 루프 최적화 검증 - 정상 작동 확인
    const source = [1, 2, 3, 4, 5];
    const exclude = [2, 4];
    const result = differenceLite(source, exclude);

    expect(result).toEqual([1, 3, 5]);
    expect(result.length).toBe(3);
  });
});

import { describe, expect, it } from 'vitest';

import { getWatchValuesFactory } from '../getWatchValuesFactory';

describe('getWatchValuesFactory', () => {
  it('watch가 없을 때 undefined를 반환해야 함', () => {
    const dependencyPaths: string[] = [];

    expect(getWatchValuesFactory(dependencyPaths, undefined)).toBeUndefined();
  });

  it('watch가 문자열이나 배열이 아닐 때 undefined를 반환해야 함', () => {
    const dependencyPaths: string[] = [];

    // 숫자형을 전달하는 런타임 테스트
    expect(getWatchValuesFactory(dependencyPaths, 123 as any)).toBeUndefined();
    // 객체형을 전달하는 런타임 테스트
    expect(
      getWatchValuesFactory(dependencyPaths, { key: 'value' } as any),
    ).toBeUndefined();
  });

  it('watch가 빈 배열일 때 undefined를 반환해야 함', () => {
    const dependencyPaths: string[] = [];

    expect(getWatchValuesFactory(dependencyPaths, [])).toBeUndefined();
  });

  it('문자열 watch로 함수를 생성해야 함', () => {
    const dependencyPaths: string[] = [];
    const watch = '$.value';
    const result = getWatchValuesFactory(dependencyPaths, watch);

    expect(dependencyPaths).toContain('$.value');
    expect(result).toBeDefined();
    expect(typeof result).toBe('function');

    const values = [42];
    expect(result!(values)).toEqual([42]);
  });

  it('문자열 배열 watch로 함수를 생성해야 함', () => {
    const dependencyPaths: string[] = [];
    const watch = ['$.value1', '$.value2', '$.value3'];
    const result = getWatchValuesFactory(dependencyPaths, watch);

    expect(dependencyPaths).toEqual(watch);
    expect(result).toBeDefined();

    const values = [10, 'test', true];
    expect(result!(values)).toEqual([10, 'test', true]);
  });

  it('이미 의존성 경로 배열에 있는 경로를 다시 추가하지 않아야 함', () => {
    const dependencyPaths: string[] = ['$.existingPath'];
    const watch = ['$.existingPath', '$.newPath'];
    const result = getWatchValuesFactory(dependencyPaths, watch);

    expect(dependencyPaths).toContain('$.existingPath');
    expect(dependencyPaths).toContain('$.newPath');
    expect(dependencyPaths.length).toBe(2);

    const values = ['existing', 'new'];
    expect(result!(values)).toEqual(['existing', 'new']);
  });

  it('의존성 배열에서 올바른 인덱스의 값을 가져와야 함', () => {
    const dependencyPaths: string[] = ['$.value1', '$.value2', '$.value3'];
    const watch = ['$.value2', '$.value1']; // 순서가 다른 경우
    const result = getWatchValuesFactory(dependencyPaths, watch);

    // 새로운 경로는 추가되지 않아야 함
    expect(dependencyPaths.length).toBe(3);

    const values = [1, 2, 3];
    // 원래 순서대로 값을 가져와야 함
    expect(result!(values)).toEqual([2, 1]);
  });

  it('더 많은 의존성이 있는 경우에도 watch된 값만 반환해야 함', () => {
    const dependencyPaths: string[] = [
      '$.value1',
      '$.value2',
      '$.value3',
      '$.value4',
    ];
    const watch = ['$.value2', '$.value4'];
    const result = getWatchValuesFactory(dependencyPaths, watch);

    const values = [1, 2, 3, 4, 5]; // 더 많은 값이 있는 경우
    expect(result!(values)).toEqual([2, 4]);
  });
});

import { describe, expect, it } from 'vitest';

import { checkComputedOptionFactory } from '../checkComputedOptionFactory';

describe('checkComputedOptionFactory', () => {
  it('문자열이 아닌 expression에 대해 undefined를 반환해야 함', () => {
    const dependencyPaths: string[] = [];

    expect(checkComputedOptionFactory(dependencyPaths, true)).toBeUndefined();
    expect(
      checkComputedOptionFactory(dependencyPaths, undefined),
    ).toBeUndefined();
  });

  it('빈 표현식에 대해 undefined를 반환해야 함', () => {
    const dependencyPaths: string[] = [];

    expect(checkComputedOptionFactory(dependencyPaths, '')).toBeUndefined();
  });

  it('JSON 경로가 없는 표현식으로부터 함수를 생성해야 함', () => {
    const dependencyPaths: string[] = [];
    const result = checkComputedOptionFactory(dependencyPaths, 'true');

    expect(result).toBeDefined();
    expect(typeof result).toBe('function');
    expect(result!([]).valueOf()).toBe(true);
  });

  it('JSON 경로가 있는 표현식을 올바르게 변환해야 함', () => {
    const dependencyPaths: string[] = [];
    const expression = '$.value > 10';
    const result = checkComputedOptionFactory(dependencyPaths, expression);

    expect(dependencyPaths).toContain('$.value');
    expect(result).toBeDefined();

    expect(result!([5])).toBe(false);
    expect(result!([15])).toBe(true);
  });

  it('여러 JSON 경로가 있는 복잡한 표현식을 올바르게 처리해야 함', () => {
    const dependencyPaths: string[] = [];
    const expression = '$.value1 > 10 && $.value2 === "test"';
    const result = checkComputedOptionFactory(dependencyPaths, expression);

    expect(dependencyPaths).toContain('$.value1');
    expect(dependencyPaths).toContain('$.value2');
    expect(dependencyPaths.length).toBe(2);

    expect(result!([15, 'wrong'])).toBe(false);
    expect(result!([5, 'test'])).toBe(false);
    expect(result!([15, 'test'])).toBe(true);
  });

  it('표현식 끝의 세미콜론을 제거해야 함', () => {
    const dependencyPaths: string[] = [];
    const expression = '$.value > 10;';
    const result = checkComputedOptionFactory(dependencyPaths, expression);

    expect(result!([15])).toBe(true);
  });

  it('이미 의존성 경로 배열에 있는 경로를 다시 추가하지 않아야 함', () => {
    const dependencyPaths: string[] = ['$.value'];
    const expression = '$.value > 10 && $.newValue === true';
    const result = checkComputedOptionFactory(dependencyPaths, expression);

    expect(dependencyPaths).toContain('$.value');
    expect(dependencyPaths).toContain('$.newValue');
    expect(dependencyPaths.length).toBe(2);

    expect(result!([15, true])).toBe(true);
    expect(result!([15, false])).toBe(false);
  });
});

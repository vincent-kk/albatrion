import { describe, expect, it } from 'vitest';

import { getJSONPointer } from '../getJSONPointer';

describe('getJSONPointer', () => {
  it('루트 객체 자체를 타겟으로 할 경우 "/"를 반환해야 합니다.', () => {
    const root = { a: 1 };
    expect(getJSONPointer(root, root)).toBe('/');
  });

  it('직속 자식 객체를 타겟으로 할 경우 해당 키 경로를 반환해야 합니다.', () => {
    const child = { id: 'child' };
    const root = { a: 1, b: child, c: 'hello' };
    expect(getJSONPointer(root, child)).toBe('/b');
  });

  it('중첩된 객체를 타겟으로 할 경우 전체 경로를 반환해야 합니다.', () => {
    const grandchild = { value: true };
    const child = { nested: grandchild };
    const root = { level1: child };
    expect(getJSONPointer(root, grandchild)).toBe('/level1/nested');
  });

  it('키에 "/" 문자가 포함된 경우 "~1"로 이스케이프 처리해야 합니다.', () => {
    const target = {};
    const root = { 'a/b': target };
    expect(getJSONPointer(root, target)).toBe('/a~1b');
  });

  it('키에 "~" 문자가 포함된 경우 "~0"으로 이스케이프 처리해야 합니다.', () => {
    const target = {};
    const root = { 'c~d': target };
    expect(getJSONPointer(root, target)).toBe('/c~0d');
  });

  it('키에 "/"와 "~" 문자가 모두 포함된 경우 올바르게 이스케이프 처리해야 합니다.', () => {
    const target = {};
    const root = { 'e/~f/g': target };
    expect(getJSONPointer(root, target)).toBe('/e~1~0f~1g');
  });

  it('배열 내의 객체를 타겟으로 할 경우 배열 인덱스를 경로로 사용해야 합니다.', () => {
    const targetInArray = { item: 2 };
    const root = { list: [{ item: 1 }, targetInArray] };
    expect(getJSONPointer(root, targetInArray)).toBe('/list/1');
  });

  it('중첩된 배열 내의 객체를 타겟으로 할 경우 올바른 경로를 반환해야 합니다.', () => {
    const deepTarget = { found: true };
    const root = { data: [0, [1, 2, deepTarget]] };
    expect(getJSONPointer(root, deepTarget)).toBe('/data/1/2');
  });

  it('복잡하게 중첩되고 특수 문자가 포함된 경로를 올바르게 찾아야 합니다.', () => {
    const deepTarget = { name: 'final' };
    const root = {
      'a/b': {
        'c~d': [null, { 'e/~f': deepTarget }],
      },
    };
    expect(getJSONPointer(root, deepTarget)).toBe('/a~1b/c~0d/1/e~1~0f');
  });

  it('타겟 객체를 찾을 수 없는 경우 null을 반환해야 합니다.', () => {
    const missingTarget = {};
    const root = { a: 1, b: { c: 2 } };
    expect(getJSONPointer(root, missingTarget)).toBe(null);
  });

  it('빈 객체를 루트로 사용할 때 루트 자체를 타겟으로 하면 "/"를 반환해야 합니다.', () => {
    const root = {};
    expect(getJSONPointer(root, root)).toBe('/');
  });

  it('빈 객체를 루트로 사용할 때 다른 객체를 찾으려 하면 null을 반환해야 합니다.', () => {
    const root = {};
    const target = { a: 1 };
    expect(getJSONPointer(root, target)).toBe(null);
  });

  it('루트와 타겟이 동일한 빈 객체 참조인 경우 "/"를 반환해야 합니다.', () => {
    const obj = {};
    expect(getJSONPointer(obj, obj)).toBe('/');
  });
});

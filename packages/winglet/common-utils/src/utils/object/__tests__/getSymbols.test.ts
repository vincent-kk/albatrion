import { describe, expect, it } from 'vitest';

import { getSymbols } from '../getSymbols';

describe('getSymbols', () => {
  it('객체에 심볼 속성이 없으면 빈 배열을 반환해야 합니다.', () => {
    const obj = { a: 1, b: 2 };
    expect(getSymbols(obj)).toEqual([]);
  });

  it('열거 가능한 심볼 속성만 있는 경우 해당 심볼들을 반환해야 합니다.', () => {
    const sym1 = Symbol('a');
    const sym2 = Symbol('b');
    const obj = { [sym1]: 1, [sym2]: 2 };
    expect(getSymbols(obj)).toEqual([sym1, sym2]);
  });

  it('열거 불가능한 심볼 속성만 있는 경우 빈 배열을 반환해야 합니다.', () => {
    const sym1 = Symbol('a');
    const obj = {};
    Object.defineProperty(obj, sym1, {
      value: 1,
      enumerable: false, // 열거 불가능하도록 설정
    });
    expect(getSymbols(obj)).toEqual([]);
  });

  it('열거 가능한 심볼과 열거 불가능한 심볼이 섞여 있는 경우 열거 가능한 심볼만 반환해야 합니다.', () => {
    const symEnumerable = Symbol('enumerable');
    const symNonEnumerable = Symbol('non-enumerable');
    const obj = { [symEnumerable]: 1 };
    Object.defineProperty(obj, symNonEnumerable, {
      value: 2,
      enumerable: false,
    });
    expect(getSymbols(obj)).toEqual([symEnumerable]);
  });

  it('상속된 심볼 속성은 반환하지 않아야 합니다.', () => {
    const parentSym = Symbol('parent');
    const childSym = Symbol('child');

    const parent = { [parentSym]: 'parentValue' };
    const child = Object.create(parent);
    child[childSym] = 'childValue';

    expect(getSymbols(child)).toEqual([childSym]);
  });

  it('빈 객체를 입력하면 빈 배열을 반환해야 합니다.', () => {
    const obj = {};
    expect(getSymbols(obj)).toEqual([]);
  });
});

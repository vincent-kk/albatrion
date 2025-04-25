import { describe, expect, it } from 'vitest';

import { removeUndefined } from '../removeUndefined';

describe('removeUndefined', () => {
  it('일반 객체에서 undefined 속성을 제거해야 합니다', () => {
    const input = {
      name: 'test',
      age: undefined,
      email: 'test@example.com',
    };

    const expected = {
      name: 'test',
      email: 'test@example.com',
    };

    const result = removeUndefined(input);

    expect(result).toEqual(expected);
  });

  it('중첩된 객체에서 undefined 속성을 제거해야 합니다', () => {
    const input = {
      user: {
        name: 'test',
        age: undefined,
        contact: {
          email: undefined,
          phone: '123-456-7890',
        },
      },
    };

    const expected = {
      user: {
        name: 'test',
        contact: {
          phone: '123-456-7890',
        },
      },
    };

    expect(removeUndefined(input)).toEqual(expected);
  });

  it('배열이 포함된 객체에서 undefined 속성을 제거해야 합니다', () => {
    const input = {
      name: 'test',
      hobbies: ['reading', undefined, 'gaming'],
      info: {
        age: undefined,
        skills: ['javascript', undefined, 'typescript'],
      },
    };

    const expected = {
      name: 'test',
      hobbies: ['reading', 'gaming'],
      info: {
        skills: ['javascript', 'typescript'],
      },
    };

    expect(removeUndefined(input)).toEqual(expected);
  });

  it('모든 속성이 undefined인 객체는 빈 객체를 반환해야 합니다', () => {
    const input = {
      name: undefined,
      age: undefined,
      email: undefined,
    };

    expect(removeUndefined(input)).toEqual({});
  });

  it('undefined가 없는 객체는 그대로 반환해야 합니다', () => {
    const input = {
      name: 'test',
      age: 25,
      email: 'test@example.com',
    };

    expect(removeUndefined(input)).toEqual(input);
  });

  it('null 값은 유지되어야 합니다', () => {
    const input = {
      name: 'test',
      age: null,
      email: undefined,
    };

    const expected = {
      name: 'test',
      age: null,
    };

    expect(removeUndefined(input)).toEqual(expected);
  });

  it('빈 객체는 그대로 반환해야 합니다', () => {
    const input = {};
    expect(removeUndefined(input)).toEqual({});
  });

  it('다양한 타입의 값들이 포함된 객체를 처리해야 합니다', () => {
    const input = {
      string: 'hello',
      number: 42,
      boolean: true,
      null: null,
      undefined: undefined,
      array: [1, undefined, 3],
      object: {
        nested: undefined,
        value: 'test',
      },
      regex: /test/,
    };

    const expected = {
      array: [1, 3],
      boolean: true,
      null: null,
      number: 42,
      object: {
        value: 'test',
      },
      regex: /test/,
      string: 'hello',
    };

    expect(removeUndefined(input)).toEqual(expected);
  });

  it('중첩된 배열을 처리해야 합니다', () => {
    const input = {
      matrix: [
        [1, undefined, 3],
        [undefined, 5, 6],
        [7, 8, undefined],
      ],
      nested: {
        array: [
          { value: undefined, id: 1 },
          { value: 'test', id: 2 },
          { value: undefined, id: 3 },
        ],
      },
    };

    const expected = {
      matrix: [
        [1, 3],
        [5, 6],
        [7, 8],
      ],
      nested: {
        array: [{ id: 1 }, { value: 'test', id: 2 }, { id: 3 }],
      },
    };

    expect(removeUndefined(input)).toEqual(expected);
  });
});

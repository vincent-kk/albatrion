import { describe, expect, it } from 'vitest';

import { transformValues } from '../transformValues';

describe('transformValues', () => {
  it('객체의 값을 새로운 값으로 변환해야 합니다', () => {
    const input = {
      price1: 100,
      price2: 200,
      price3: 300,
    };

    const result = transformValues(input, (value) => value * 2);

    expect(result).toEqual({
      price1: 200,
      price2: 400,
      price3: 600,
    });
  });

  it('값과 키를 사용하여 변환해야 합니다', () => {
    const input = {
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = transformValues(input, (value, key) => `${key}: ${value}`);

    expect(result).toEqual({
      firstName: 'firstName: John',
      lastName: 'lastName: Doe',
    });
  });

  it('원본 객체를 사용하여 변환해야 합니다', () => {
    const input = {
      x: 10,
      y: 20,
    };

    const result = transformValues(
      input,
      (value, _, obj) => value + Object.keys(obj).length,
    );

    expect(result).toEqual({
      x: 12,
      y: 22,
    });
  });

  it('다양한 타입의 값을 변환해야 합니다', () => {
    const input = {
      number: 42,
      string: 'hello',
      boolean: true,
      array: [1, 2, 3],
      object: { key: 'value' },
    };

    const result = transformValues(input, (value) => {
      if (typeof value === 'number') return value * 2;
      if (typeof value === 'string') return value.toUpperCase();
      if (typeof value === 'boolean') return !value;
      if (Array.isArray(value)) return value.length;
      if (typeof value === 'object') return Object.keys(value).length;
      return value;
    });

    expect(result).toEqual({
      number: 84,
      string: 'HELLO',
      boolean: false,
      array: 3,
      object: 1,
    });
  });

  it('빈 객체는 빈 객체를 반환해야 합니다', () => {
    const input = {};
    const result = transformValues(input, (value) => value);
    expect(result).toEqual({});
  });
});

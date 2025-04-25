import { describe, expect, it } from 'vitest';

import { transformKeys } from '../transformKeys';

describe('transformKeys', () => {
  it('객체의 키를 새로운 키로 변환해야 합니다', () => {
    const input = {
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
    };

    const result = transformKeys(input, (_, key) => key.toUpperCase());

    expect(result).toEqual({
      FIRSTNAME: 'John',
      LASTNAME: 'Doe',
      AGE: 30,
    });
  });

  it('값을 기반으로 키를 변환해야 합니다', () => {
    const input = {
      user1: { id: 1, name: 'John' },
      user2: { id: 2, name: 'Jane' },
    };

    const result = transformKeys(input, (value) => `user_${value.id}`);

    expect(result).toEqual({
      user_1: { id: 1, name: 'John' },
      user_2: { id: 2, name: 'Jane' },
    });
  });

  it('원본 객체와 키를 사용하여 변환해야 합니다', () => {
    const input = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
    };

    const result = transformKeys(
      input,
      (_, key, obj) => `${key}_${Object.keys(obj).length}`,
    );

    expect(result).toEqual({
      name_3: 'John',
      age_3: 30,
      email_3: 'john@example.com',
    });
  });

  it('빈 객체는 빈 객체를 반환해야 합니다', () => {
    const input = {};
    const result = transformKeys(input, (_, key) => key);
    expect(result).toEqual({});
  });
});

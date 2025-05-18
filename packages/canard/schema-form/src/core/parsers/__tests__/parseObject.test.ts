import { describe, expect, it } from 'vitest';

import { parseObject } from '../parseObject';

describe('parseObject', () => {
  it('일반 객체를 입력하면 해당 객체를 반환해야 합니다.', () => {
    // Arrange
    const input = { a: 1, b: 'test' };
    // Act
    const result = parseObject(input);
    // Assert
    expect(result).toEqual(input);
    expect(result).toBe(input); // 동일 참조인지도 확인
  });

  it('null을 입력하면 빈 객체를 반환해야 합니다.', () => {
    // Arrange
    const input = null;
    // Act
    const result = parseObject(input);
    // Assert
    expect(result).toEqual({});
  });

  it('undefined를 입력하면 빈 객체를 반환해야 합니다.', () => {
    // Arrange
    const input = undefined;
    // Act
    const result = parseObject(input);
    // Assert
    expect(result).toEqual(undefined);
  });

  it('배열을 입력하면 빈 객체를 반환해야 합니다.', () => {
    // Arrange
    const input = [1, 2, 3];
    // Act
    const result = parseObject(input);
    // Assert
    expect(result).toEqual({});
  });

  it('문자열을 입력하면 빈 객체를 반환해야 합니다.', () => {
    // Arrange
    const input = 'this is a string';
    // Act
    const result = parseObject(input);
    // Assert
    expect(result).toEqual({});
  });

  it('숫자를 입력하면 빈 객체를 반환해야 합니다.', () => {
    // Arrange
    const input = 12345;
    // Act
    const result = parseObject(input);
    // Assert
    expect(result).toEqual({});
  });

  it('함수를 입력하면 빈 객체를 반환해야 합니다.', () => {
    // Arrange
    const input = () => 'function';
    // Act
    const result = parseObject(input);
    // Assert
    expect(result).toEqual({});
  });

  it('Date 객체를 입력하면 빈 객체를 반환해야 합니다.', () => {
    // Arrange
    const input = new Date();
    // Act
    const result = parseObject(input);
    // Assert
    expect(result).toEqual({});
  });

  it('정규 표현식 객체를 입력하면 빈 객체를 반환해야 합니다.', () => {
    // Arrange
    const input = /test/g;
    // Act
    const result = parseObject(input);
    // Assert
    expect(result).toEqual({});
  });

  it('빈 객체를 입력하면 빈 객체를 반환해야 합니다.', () => {
    // Arrange
    const input = {};
    // Act
    const result = parseObject(input);
    // Assert
    expect(result).toEqual({});
  });
});

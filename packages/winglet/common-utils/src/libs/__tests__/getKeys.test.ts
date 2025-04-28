import { describe, expect, it } from 'vitest';

import { getKeys } from '../getKeys';

describe('getKeys', () => {
  // Test Cases for Objects
  it('should return an array of own property keys for a simple object', () => {
    // Arrange
    const obj = { a: 1, b: 'hello', c: true };
    // Act
    const keys = getKeys(obj);
    // Assert
    expect(keys).toEqual(['a', 'b', 'c']);
    expect(keys.length).toBe(3);
  });

  it('should return an empty array for an empty object', () => {
    // Arrange
    const obj = {};
    // Act
    const keys = getKeys(obj);
    // Assert
    expect(keys).toEqual([]);
    expect(keys.length).toBe(0);
  });

  it('should only return own properties, excluding inherited ones', () => {
    // Arrange
    const parent = { inherited: 'value' };
    const child = Object.create(parent);
    child.own = 'another value';
    // Act
    const keys = getKeys(child);
    // Assert
    expect(keys).toEqual(['own']);
    expect(keys.length).toBe(1);
  });

  it('should handle objects with symbol keys (symbols are typically not enumerated by Object.keys)', () => {
    // Arrange
    const sym = Symbol('id');
    const obj = { a: 1, [sym]: 2 };
    // Act
    const keys = getKeys(obj);
    // Assert
    expect(keys).toEqual(['a']); // Object.keys doesn't return symbol keys
  });

  // Test Cases for Arrays
  it('should return an array of string indices for an array', () => {
    // Arrange
    const arr = [10, 20, 30];
    // Act
    const keys = getKeys(arr);
    // Assert
    expect(keys).toEqual(['0', '1', '2']);
    expect(keys.length).toBe(3);
  });

  it('should return an empty array for an empty array', () => {
    // Arrange
    const arr: unknown[] = [];
    // Act
    const keys = getKeys(arr);
    // Assert
    expect(keys).toEqual([]);
    expect(keys.length).toBe(0);
  });

  // Test Cases for Primitives and Null/Undefined
  it('should return an empty array for null', () => {
    // Act
    const keys = getKeys(null);
    // Assert
    expect(keys).toEqual([]);
  });

  it('should return an empty array for undefined', () => {
    // Act
    const keys = getKeys(undefined);
    // Assert
    expect(keys).toEqual([]);
  });

  it('should return an empty array for primitive numbers', () => {
    // Act
    const keys = getKeys(123);
    // Assert
    expect(keys).toEqual([]);
  });

  it('should return string indices for primitive strings (similar to arrays)', () => {
    // Arrange
    const str = 'abc';
    // Act
    const keys = getKeys(str);
    // Assert
    // The for...in loop treats string characters like array elements
    expect(keys).toEqual(['0', '1', '2']);
  });

  it('should return an empty array for primitive booleans', () => {
    // Act
    const keys = getKeys(true);
    // Assert
    expect(keys).toEqual([]);
  });

  // Test case for objects created with null prototype
  it('should work correctly for objects with null prototype', () => {
    // Arrange
    const obj = Object.create(null);
    obj.a = 1;
    obj.b = 2;
    // Act
    const keys = getKeys(obj);
    // Assert
    expect(keys.sort()).toEqual(['a', 'b'].sort());
  });
});

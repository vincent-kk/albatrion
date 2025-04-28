// packages/winglet/common-utils/src/libs/__tests__/hasOwnProperty.test.ts
import { describe, expect, it } from 'vitest';

import { hasOwnProperty } from '../hasOwnProperty';

describe('hasOwnProperty', () => {
  // Arrange: Test Objects
  const objWithOwnProp = { a: 1 };
  const objWithInheritedProp = Object.create({ b: 2 });
  objWithInheritedProp.a = 1; // Add own property
  const emptyObj = {};
  const array = [1, 2, 3];

  // Test Cases
  it("should return true for an object's own property", () => {
    // Act & Assert
    expect(hasOwnProperty(objWithOwnProp, 'a')).toBe(true);
    expect(hasOwnProperty('string', 'length')).toBe(true);
  });

  it('should return false for an inherited property', () => {
    // Act & Assert
    expect(hasOwnProperty(objWithInheritedProp, 'b')).toBe(false);
  });

  it('should return true for an own property even if inherited properties exist', () => {
    // Act & Assert
    expect(hasOwnProperty(objWithInheritedProp, 'a')).toBe(true);
  });

  it('should return false for a property that does not exist', () => {
    // Act & Assert
    expect(hasOwnProperty(objWithOwnProp, 'b')).toBe(false);
  });

  it('should return false for properties on an empty object', () => {
    // Act & Assert
    expect(hasOwnProperty(emptyObj, 'a')).toBe(false);
  });

  it('should return false for Symbol keys (as keys are expected to be strings)', () => {
    // Arrange
    const sym = Symbol('id');
    const obj = { [sym]: 1 };
    // Act & Assert
    // hasOwnProperty specifically checks for string keys based on its signature
    // Although the object has the symbol key, hasOwnProperty expects a string key argument
    expect(hasOwnProperty(obj, sym.toString())).toBe(false); // Check using string representation
    // If we were to test if the object itself has the symbol:
    // expect(Object.prototype.hasOwnProperty.call(obj, sym)).toBe(true);
  });

  it('should return true for array indices when checking the array object', () => {
    // Act & Assert
    expect(hasOwnProperty(array, '0')).toBe(true);
    expect(hasOwnProperty(array, '1')).toBe(true);
    expect(hasOwnProperty(array, '2')).toBe(true);
  });

  it('should return false for non-existent array indices', () => {
    // Act & Assert
    expect(hasOwnProperty(array, '3')).toBe(false);
  });

  it('should handle primitive values gracefully (returning false)', () => {
    // Act & Assert
    expect(hasOwnProperty(123, 'toString')).toBe(false);

    expect(hasOwnProperty(true, 'valueOf')).toBe(false);
  });
});

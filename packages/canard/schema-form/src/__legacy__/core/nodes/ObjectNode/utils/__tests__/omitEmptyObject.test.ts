import { describe, expect, it } from 'vitest';

import type { ObjectValue } from '@/schema-form/types';

import { omitEmptyObject } from '../omitEmptyObject';

describe('omitEmptyObject', () => {
  it('should return undefined for empty object', () => {
    const value: ObjectValue = {};
    const result = omitEmptyObject(value);
    expect(result).toBeUndefined();
  });

  it('should return the object for non-empty object', () => {
    const value: ObjectValue = { name: 'John' };
    const result = omitEmptyObject(value);
    expect(result).toBe(value);
    expect(result).toEqual({ name: 'John' });
  });

  it('should return null for null', () => {
    const value = null;
    const result = omitEmptyObject(value);
    expect(result).toBeNull();
  });

  it('should return undefined for undefined', () => {
    const value = undefined;
    const result = omitEmptyObject(value);
    expect(result).toBeUndefined();
  });

  it('should return the object for object with multiple properties', () => {
    const value: ObjectValue = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
    };
    const result = omitEmptyObject(value);
    expect(result).toBe(value);
    expect(result).toEqual({
      name: 'John',
      age: 30,
      email: 'john@example.com',
    });
  });

  it('should return the object for nested objects', () => {
    const value: ObjectValue = {
      person: {
        name: 'John',
        address: {
          city: 'Seoul',
        },
      },
    };
    const result = omitEmptyObject(value);
    expect(result).toBe(value);
    expect(result).toEqual({
      person: {
        name: 'John',
        address: {
          city: 'Seoul',
        },
      },
    });
  });

  it('should return the object even if it contains empty nested objects', () => {
    const value: ObjectValue = {
      name: 'John',
      nested: {},
    };
    const result = omitEmptyObject(value);
    expect(result).toBe(value);
    expect(result).toEqual({
      name: 'John',
      nested: {},
    });
  });

  it('should return the object for object with undefined values', () => {
    const value: ObjectValue = {
      name: 'John',
      age: undefined,
      email: 'john@example.com',
    };
    const result = omitEmptyObject(value);
    expect(result).toBe(value);
    expect(result).toEqual({
      name: 'John',
      age: undefined,
      email: 'john@example.com',
    });
  });

  it('should return the object for object with null values', () => {
    const value: ObjectValue = {
      name: 'John',
      age: null,
      email: 'john@example.com',
    };
    const result = omitEmptyObject(value);
    expect(result).toBe(value);
    expect(result).toEqual({
      name: 'John',
      age: null,
      email: 'john@example.com',
    });
  });

  it('should return the object for object with 0 value', () => {
    const value: ObjectValue = {
      count: 0,
    };
    const result = omitEmptyObject(value);
    expect(result).toBe(value);
    expect(result).toEqual({ count: 0 });
  });

  it('should return the object for object with false value', () => {
    const value: ObjectValue = {
      flag: false,
    };
    const result = omitEmptyObject(value);
    expect(result).toBe(value);
    expect(result).toEqual({ flag: false });
  });

  it('should return the object for object with empty string value', () => {
    const value: ObjectValue = {
      name: '',
    };
    const result = omitEmptyObject(value);
    expect(result).toBe(value);
    expect(result).toEqual({ name: '' });
  });

  it('should handle object with symbol keys', () => {
    const sym = Symbol('test');
    const value: ObjectValue = {
      [sym]: 'value',
      name: 'John',
    };
    const result = omitEmptyObject(value);
    expect(result).toBe(value);
    expect((result as any)[sym]).toBe('value');
  });

  it('should handle object with array values', () => {
    const value: ObjectValue = {
      items: [1, 2, 3],
      tags: ['a', 'b'],
    };
    const result = omitEmptyObject(value);
    expect(result).toBe(value);
    expect(result).toEqual({
      items: [1, 2, 3],
      tags: ['a', 'b'],
    });
  });

  it('should handle object with empty array', () => {
    const value: ObjectValue = {
      items: [],
    };
    const result = omitEmptyObject(value);
    expect(result).toBe(value);
    expect(result).toEqual({ items: [] });
  });

  it('should return same reference for non-empty object (no cloning)', () => {
    const value: ObjectValue = { name: 'John' };
    const result = omitEmptyObject(value);
    expect(result).toBe(value); // Same reference
  });

  it('should handle object created with Object.create(null)', () => {
    const value = Object.create(null) as ObjectValue;
    value.name = 'John';
    const result = omitEmptyObject(value);
    expect(result).toBe(value);
    expect(result).toBeDefined();
    expect((result as ObjectValue).name).toBe('John');
  });

  it('should return undefined for Object.create(null) with no properties', () => {
    const value = Object.create(null) as ObjectValue;
    const result = omitEmptyObject(value);
    expect(result).toBeUndefined();
  });
});

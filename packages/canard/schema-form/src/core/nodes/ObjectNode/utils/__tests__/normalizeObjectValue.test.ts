import { describe, expect, it } from 'vitest';

import type { ObjectValue } from '@/schema-form/types';

import { normalizeObjectValue } from '../normalizeObjectValue';

describe('normalizeObjectValue', () => {
  it('should set undefined for properties not in the schema', () => {
    const value: ObjectValue = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
      extra: 'should be removed',
    };
    const properties = ['name', 'age'];

    normalizeObjectValue(value, properties);

    expect(value).toEqual({
      name: 'John',
      age: 30,
      email: undefined,
      extra: undefined,
    });
  });

  it('should keep all properties when all are in schema', () => {
    const value: ObjectValue = {
      name: 'John',
      age: 30,
    };
    const properties = ['name', 'age', 'email'];

    normalizeObjectValue(value, properties);

    expect(value).toEqual({
      name: 'John',
      age: 30,
    });
  });

  it('should handle undefined value', () => {
    const value = undefined;
    const properties = ['name', 'age'];

    normalizeObjectValue(value, properties);

    expect(value).toBeUndefined();
  });

  it('should handle null value', () => {
    const value = null;
    const properties = ['name', 'age'];

    normalizeObjectValue(value, properties);

    expect(value).toBeNull();
  });

  it('should handle empty object', () => {
    const value: ObjectValue = {};
    const properties = ['name', 'age'];

    normalizeObjectValue(value, properties);

    expect(value).toEqual({});
  });

  it('should handle empty properties array', () => {
    const value: ObjectValue = {
      name: 'John',
      age: 30,
    };
    const properties: string[] = [];

    normalizeObjectValue(value, properties);

    expect(value).toEqual({
      name: undefined,
      age: undefined,
    });
  });

  it('should handle nested objects (shallow normalization only)', () => {
    const value: ObjectValue = {
      name: 'John',
      age: 30,
      nested: {
        email: 'john@example.com',
        phone: '010-1234-5678',
      },
      extra: 'remove',
    };
    const properties = ['name', 'nested'];

    normalizeObjectValue(value, properties);

    expect(value).toEqual({
      name: 'John',
      age: undefined,
      nested: {
        email: 'john@example.com',
        phone: '010-1234-5678',
      },
      extra: undefined,
    });
  });

  it('should handle special characters in property names', () => {
    const value: ObjectValue = {
      'prop-with-dash': 'value1',
      'prop.with.dot': 'value2',
      'prop/with/slash': 'value3',
      normal: 'value4',
    };
    const properties = ['prop-with-dash', 'normal'];

    normalizeObjectValue(value, properties);

    expect(value).toEqual({
      'prop-with-dash': 'value1',
      'prop.with.dot': undefined,
      'prop/with/slash': undefined,
      normal: 'value4',
    });
  });

  it('should handle numeric string keys', () => {
    const value: ObjectValue = {
      '0': 'zero',
      '1': 'one',
      name: 'test',
    };
    const properties = ['0', 'name'];

    normalizeObjectValue(value, properties);

    expect(value).toEqual({
      '0': 'zero',
      '1': undefined,
      name: 'test',
    });
  });

  it('should handle properties with undefined values', () => {
    const value: ObjectValue = {
      name: 'John',
      age: undefined,
      email: 'john@example.com',
    };
    const properties = ['name', 'age'];

    normalizeObjectValue(value, properties);

    expect(value).toEqual({
      name: 'John',
      age: undefined,
      email: undefined,
    });
  });

  it('should handle properties with null values', () => {
    const value: ObjectValue = {
      name: 'John',
      age: null,
      email: 'john@example.com',
    };
    const properties = ['name', 'age'];

    normalizeObjectValue(value, properties);

    expect(value).toEqual({
      name: 'John',
      age: null,
      email: undefined,
    });
  });

  it('should mutate the original object', () => {
    const value: ObjectValue = {
      keep: 'this',
      remove: 'this',
    };
    const properties = ['keep'];
    const original = value;

    normalizeObjectValue(value, properties);

    expect(value).toBe(original);
    expect(original.remove).toBeUndefined();
  });

  it('should handle large number of properties efficiently', () => {
    const value: ObjectValue = {};
    const properties: string[] = [];

    // Create 500 properties in schema
    for (let i = 0; i < 500; i++) {
      properties.push(`prop${i}`);
    }

    // Create 600 properties in value (500 in schema + 100 extra)
    for (let i = 0; i < 600; i++) {
      value[`prop${i}`] = i;
    }

    normalizeObjectValue(value, properties);

    // Check that first 500 are preserved
    for (let i = 0; i < 500; i++) {
      expect(value[`prop${i}`]).toBe(i);
    }

    // Check that last 100 are undefined
    for (let i = 500; i < 600; i++) {
      expect(value[`prop${i}`]).toBeUndefined();
    }
  });
});

import { describe, expect, it } from 'vitest';

import { getDefaultValue } from '../getDefaultValue';

describe('getDefaultValue', () => {
  it('should return the default value if it exists', () => {
    expect(
      getDefaultValue({
        type: 'string',
        default: 'test',
      }),
    ).toBe('test');
    expect(
      getDefaultValue({
        type: 'integer',
        default: 1,
      }),
    ).toBe(1);
    expect(
      getDefaultValue({
        type: 'boolean',
        default: true,
      }),
    ).toBe(true);
    expect(
      getDefaultValue({
        type: 'object',
        default: {
          test: 'test',
        },
      }),
    ).toEqual({
      test: 'test',
    });
    expect(
      getDefaultValue({
        type: 'array',
        items: {
          type: 'string',
        },
        default: ['test'],
      }),
    ).toEqual(['test']);
  });
  it('should return an empty object if the type is object', () => {
    expect(getDefaultValue({ type: 'object' })).toEqual({});
  });
  it('should return an empty array if the type is array', () => {
    expect(
      getDefaultValue({
        type: 'array',
        items: {
          type: 'string',
        },
      }),
    ).toEqual([]);
  });
  it('should return undefined if the type is not object, array, or string', () => {
    expect(getDefaultValue({ type: 'string' })).toBeUndefined();
    expect(getDefaultValue({ type: 'number' })).toBeUndefined();
    expect(getDefaultValue({ type: 'boolean' })).toBeUndefined();
    expect(getDefaultValue({ type: 'integer' })).toBeUndefined();
  });
});

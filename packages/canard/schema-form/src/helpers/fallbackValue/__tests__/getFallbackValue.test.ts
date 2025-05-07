import { describe, expect, it } from 'vitest';

import { getFallbackValue } from '../getFallbackValue';

describe('getFallbackValue', () => {
  it('should return the default value if it exists', () => {
    expect(
      getFallbackValue({
        type: 'string',
        default: 'test',
      }),
    ).toBe('test');
    expect(
      getFallbackValue({
        type: 'integer',
        default: 1,
      }),
    ).toBe(1);
    expect(
      getFallbackValue({
        type: 'boolean',
        default: true,
      }),
    ).toBe(true);
    expect(
      getFallbackValue({
        type: 'object',
        default: {
          test: 'test',
        },
      }),
    ).toEqual({
      test: 'test',
    });
    expect(
      getFallbackValue({
        type: 'array',
        items: {
          type: 'string',
        },
        default: ['test'],
      }),
    ).toEqual(['test']);
  });
  it('should return an empty object if the type is object', () => {
    expect(getFallbackValue({ type: 'object' })).toEqual(undefined);
  });
  it('should return an empty array if the type is array', () => {
    expect(
      getFallbackValue({
        type: 'array',
        items: {
          type: 'string',
        },
      }),
    ).toEqual(undefined);
  });
  it('should return undefined if the type is not object, array, or string', () => {
    expect(getFallbackValue({ type: 'string' })).toBeUndefined();
    expect(getFallbackValue({ type: 'number' })).toBeUndefined();
    expect(getFallbackValue({ type: 'boolean' })).toBeUndefined();
    expect(getFallbackValue({ type: 'integer' })).toBeUndefined();
  });
});

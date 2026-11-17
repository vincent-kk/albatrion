import { describe, expect, it } from 'vitest';

import { getValue } from '../getValue';

describe('getValue reads only own members and array indexes (RFC 6901 4)', () => {
  it.each([
    [{}, '/toString'],
    [{ a: {} }, '/a/hasOwnProperty'],
    [{ a: [1] }, '/a/length'],
    [{ a: [1] }, '/a/map'],
    [[1, 2], '/length'],
  ])('resolves %j at %s to undefined', (value, pointer) => {
    expect(getValue(value, pointer)).toBeUndefined();
  });
});

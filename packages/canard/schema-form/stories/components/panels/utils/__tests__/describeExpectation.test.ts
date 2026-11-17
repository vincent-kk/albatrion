import { describe, expect, it } from 'vitest';

import { describeExpectation } from '../describeExpectation';

describe('describeExpectation', () => {
  it('returns no labels when a step asserts nothing', () => {
    expect(describeExpectation(undefined)).toEqual([]);
    expect(describeExpectation({})).toEqual([]);
  });
  it('names up to three paths of a path-indexed observation and counts longer lists', () => {
    expect(describeExpectation({ values: { '/a': 1, '': {} } })).toEqual(['Values at /a, (root)']);
    expect(describeExpectation({ errors: { '/a': [], '/b': [], '/c': [], '/d': [] } })).toEqual(['Errors at 4 paths']);
    expect(describeExpectation({ shape: { '/a': 'absent' } })).toEqual(['Field presence at /a']);
  });
  it('shows counts, error codes and diagnostics status without other values', () => {
    expect(describeExpectation({ onChangeCount: 1, validationRequestCount: 0 })).toEqual(['onChange × 1', 'Validation requests × 0']);
    expect(describeExpectation({ onErrorCodes: [] })).toEqual(['No error codes']);
    expect(describeExpectation({ onErrorCodes: ['A', 'B'] })).toEqual(['Error codes: A, B']);
    expect(describeExpectation({ diagnostics: { status: 'degraded' } })).toEqual(['Diagnostics: degraded']);
  });
  it('labels an expected undefined result and keeps display order', () => {
    expect(describeExpectation({ result: undefined, outputValue: { a: 1 } })).toEqual(['Output value', 'Return value']);
  });
});

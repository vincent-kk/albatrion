import { describe, expect, it } from 'vitest';

import { getPathSegments } from '../traversal/getPathSegments';

describe('getPathSegments', () => {
  it('should return an empty array for an empty path', () => {
    expect(getPathSegments('')).toEqual(null);
  });

  it('should return an empty array for a path that is only a slash', () => {
    expect(getPathSegments('/')).toEqual(null);
  });

  it('should split a simple path into segments', () => {
    const path = '/foo/bar/0';
    const expected = ['foo', 'bar', '0'];
    expect(getPathSegments(path)).toEqual(expected);
  });

  it('should ignore a leading slash', () => {
    const path = '/foo/bar';
    const expected = ['foo', 'bar'];
    expect(getPathSegments(path)).toEqual(expected);
  });

  it('should ignore a trailing slash', () => {
    const path = 'foo/bar/';
    const expected = ['foo', 'bar'];
    expect(getPathSegments(path)).toEqual(expected);
  });

  it('should handle consecutive slashes by filtering out empty segments', () => {
    const path = '/foo//bar';
    const expected = ['foo', 'bar'];
    expect(getPathSegments(path)).toEqual(expected);
  });

  it('getPathSegments will not unescape escaped characters', () => {
    const path = '/a~1b/c~0d';
    const expected = ['a~1b', 'c~0d'];
    expect(getPathSegments(path)).toEqual(expected);
  });

  it('should handle segments that are just numbers (array indices)', () => {
    const path = '/data/0/items/1';
    const expected = ['data', '0', 'items', '1'];
    expect(getPathSegments(path)).toEqual(expected);
  });
});

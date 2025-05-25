import { describe, expect, it } from 'vitest';

import { getPathSegments } from './getPathSegments';

describe('getPathSegments', () => {
  it('should split path into segments correctly', () => {
    const path = '.foo[0].bar';
    const expectedSegments = ['foo', '0', 'bar'];
    expect(getPathSegments(path)).toEqual(expectedSegments);
  });

  it('should handle paths without leading dot', () => {
    const path = '.foo[0].bar';
    const expectedSegments = ['foo', '0', 'bar'];
    expect(getPathSegments(path)).toEqual(expectedSegments);
  });

  it('should handle paths with multiple array indices', () => {
    const path = '.foo[0].bar[1]';
    const expectedSegments = ['foo', '0', 'bar', '1'];
    expect(getPathSegments(path)).toEqual(expectedSegments);
  });
  it('should handle paths with multiple array indices', () => {
    const path = '.foo.[0].bar[1]';
    const expectedSegments = ['foo', '0', 'bar', '1'];
    expect(getPathSegments(path)).toEqual(expectedSegments);
  });
});

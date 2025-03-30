import { describe, expect, it } from 'vitest';

import { getPathSegments } from './getPathSegments';

// TODO: 테스트 코드 작성
// AbstractNode 수정이 완료된 후 테스트 가능

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

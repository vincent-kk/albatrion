import { describe, expect, it } from 'vitest';

import { escapeSegment } from '../escapeSegment';

describe('escapeSegment', () => {
  // Test case 1: 빈 문자열
  it('should return an empty string for an empty input', () => {
    expect(escapeSegment('')).toBe('');
  });

  // Test case 2: 특별한 문자 없음
  it('should return the original string if no special characters are present', () => {
    expect(escapeSegment('foo')).toBe('foo');
    expect(escapeSegment('bar123')).toBe('bar123');
  });

  // Test case 3: '/' 만 포함
  it('should escape only / characters', () => {
    expect(escapeSegment('/foo')).toBe('~1foo');
    expect(escapeSegment('foo/bar')).toBe('foo~1bar');
    expect(escapeSegment('foo/')).toBe('foo~1');
    expect(escapeSegment('//')).toBe('~1~1');
  });

  // Test case 4: '~' 만 포함
  it('should escape only ~ characters', () => {
    expect(escapeSegment('~foo')).toBe('~0foo');
    expect(escapeSegment('foo~bar')).toBe('foo~0bar');
    expect(escapeSegment('foo~')).toBe('foo~0');
    expect(escapeSegment('~~')).toBe('~0~0');
  });

  // Test case 5: '/' 와 '~' 모두 포함
  it('should escape both / and ~ characters', () => {
    expect(escapeSegment('/~foo')).toBe('~1~0foo');
    expect(escapeSegment('foo/~bar')).toBe('foo~1~0bar');
    expect(escapeSegment('~foo/bar~')).toBe('~0foo~1bar~0');
    expect(escapeSegment('/~/~')).toBe('~1~0~1~0');
    expect(escapeSegment('a/b~c/d')).toBe('a~1b~0c~1d');
  });

  // Test case 6: 복잡한 경로
  it('should handle complex paths correctly', () => {
    expect(escapeSegment('m~n/o~p')).toBe('m~0n~1o~0p');
    expect(escapeSegment('/clients/~1/scopes')).toBe('~1clients~1~01~1scopes'); // From RFC6901 example
  });
});

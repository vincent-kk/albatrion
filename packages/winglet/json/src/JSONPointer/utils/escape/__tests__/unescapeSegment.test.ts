import { describe, expect, it } from 'vitest';

import { unescapePath as unescapeSegment } from '../unescapePath';

describe('unescapeSegment', () => {
  it('should return the original segment if no tilde is present', () => {
    const segment = 'simpleSegment';
    expect(unescapeSegment(segment)).toBe(segment);
  });

  it('should return an empty string if the input is empty', () => {
    expect(unescapeSegment('')).toBe('');
  });

  it('should unescape standard RFC 6901 sequences', () => {
    expect(unescapeSegment('a~0b')).toBe('a~b');
    expect(unescapeSegment('c~1d')).toBe('c/d');
  });

  it('should handle multiple escape sequences in a single segment', () => {
    expect(unescapeSegment('~0~1')).toBe('~/');
  });

  it('should handle mixed segments with escaped and normal characters', () => {
    expect(unescapeSegment('path~1to~1some~1place')).toBe('path/to/some/place');
    expect(unescapeSegment('tilde~0char')).toBe('tilde~char');
  });

  it('should not unescape invalid sequences and should preserve the original characters', () => {
    expect(unescapeSegment('invalid~2sequence')).toBe('invalid~2sequence');
    expect(unescapeSegment('invalid~zsequence')).toBe('invalid~zsequence');
  });

  it('should handle a trailing tilde correctly', () => {
    expect(unescapeSegment('segment~')).toBe('segment~');
  });

  it('should handle a segment that is only a tilde', () => {
    expect(unescapeSegment('~')).toBe('~');
  });

  it('should handle a complex path with various cases', () => {
    const complexPath = 'a~1b/c~0d/e';
    const expectedPath = 'a/b/c~d/e';
    expect(unescapeSegment(complexPath)).toBe(expectedPath);
  });
});

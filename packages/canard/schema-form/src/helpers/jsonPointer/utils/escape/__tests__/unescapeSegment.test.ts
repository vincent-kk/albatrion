import { describe, expect, it } from 'vitest';

import { unescapeSegment } from '../unescapeSegment';

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

  it('should unescape custom sequences', () => {
    expect(unescapeSegment('e~2f')).toBe('e..f');
    expect(unescapeSegment('g~3h')).toBe('g.h');
    expect(unescapeSegment('i~4j')).toBe('i*j');
    expect(unescapeSegment('k~5l')).toBe('k#l');
  });

  it('should handle multiple escape sequences in a single segment', () => {
    expect(unescapeSegment('~0~1~2~3~4~5')).toBe('~/...*#');
  });

  it('should handle mixed segments with escaped and normal characters', () => {
    expect(unescapeSegment('name~3first')).toBe('name.first');
    expect(unescapeSegment('path~1to~1some~1place')).toBe('path/to/some/place');
  });

  it('should work correctly for full paths', () => {
    expect(unescapeSegment('/user/name~3first/address')).toBe(
      '/user/name.first/address',
    );
    expect(unescapeSegment('/items/~4/value')).toBe('/items/*/value');
  });

  it('should not unescape invalid sequences and should preserve the original characters', () => {
    expect(unescapeSegment('invalid~6sequence')).toBe('invalid~6sequence');
    expect(unescapeSegment('invalid~zsequence')).toBe('invalid~zsequence');
  });

  it('should handle a trailing tilde correctly', () => {
    expect(unescapeSegment('segment~')).toBe('segment~');
  });

  it('should handle a segment that is only a tilde', () => {
    expect(unescapeSegment('~')).toBe('~');
  });

  it('should handle a complex path with various cases', () => {
    const complexPath = 'a~1b/c~0d~3e/f~2g~4h~5i';
    const expectedPath = 'a/b/c~d.e/f..g*h#i';
    expect(unescapeSegment(complexPath)).toBe(expectedPath);
  });
});

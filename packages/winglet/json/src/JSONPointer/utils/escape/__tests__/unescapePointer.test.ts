import { describe, expect, it } from 'vitest';

import { JSONPointer } from '../../../enum';
import { unescapePath } from '../unescapePath';

describe('unescapePath', () => {
  // Test case 1: 빈 문자열
  it('should return an empty string for an empty input', () => {
    expect(unescapePath('')).toBe('');
  });

  // Test case 2: 이스케이프 시퀀스 없음
  it('should return the original string if no escape sequences are present', () => {
    expect(unescapePath('foo')).toBe('foo');
    expect(unescapePath('foo/bar')).toBe('foo/bar'); // 일반 슬래시는 변경되지 않음
    expect(unescapePath('foo~bar')).toBe('foo~bar'); // 일반 틸드는 변경되지 않음
  });

  // Test case 3: '~1' 만 포함 (unescapes to '/')
  it('should unescape only ~1 sequences to /', () => {
    expect(unescapePath('~1foo')).toBe('/foo');
    expect(unescapePath('foo~1bar')).toBe('foo/bar');
    expect(unescapePath('foo~1')).toBe('foo/');
    expect(unescapePath('~1~1')).toBe('//');
  });

  // Test case 4: '~0' 만 포함 (unescapes to '~')
  it('should unescape only ~0 sequences to ~', () => {
    expect(unescapePath('~0foo')).toBe('~foo');
    expect(unescapePath('foo~0bar')).toBe('foo~bar');
    expect(unescapePath('foo~0')).toBe('foo~');
    expect(unescapePath('~0~0')).toBe('~~');
  });

  // Test case 5: '~1' 와 '~0' 모두 포함
  it('should unescape both ~1 and ~0 sequences', () => {
    expect(unescapePath('~1~0foo')).toBe('/~foo');
    expect(unescapePath('foo~1~0bar')).toBe('foo/~bar');
    expect(unescapePath('~0foo~1bar~0')).toBe('~foo/bar~');
    expect(unescapePath('~1~0~1~0')).toBe('/~/~');
    expect(unescapePath('a~1b~0c~1d')).toBe('a/b~c/d');
  });

  // Test case 6: 복잡한 경로 및 RFC 예시
  it('should handle complex paths correctly', () => {
    expect(unescapePath('m~0n~1o~0p')).toBe('m~n/o~p');
    expect(unescapePath('~1clients~1~01~1scopes')).toBe('/clients/~1/scopes'); // RFC6901 example
  });

  it('should return the same string if no escape sequences are present', () => {
    expect(unescapePath('normal/path')).toBe('normal/path');
    expect(unescapePath('123')).toBe('123');
    expect(unescapePath('')).toBe('');
  });

  it('should correctly unescapePath ~0 to tilde', () => {
    expect(unescapePath('~0')).toBe('~');
    expect(unescapePath('path~0end')).toBe(`path${'~'}end`);
  });

  it('should correctly unescapePath ~1 to forward slash', () => {
    expect(unescapePath('~1')).toBe(JSONPointer.Child);
    expect(unescapePath('path~1end')).toBe(`path${JSONPointer.Child}end`);
  });

  it('should handle multiple escape sequences', () => {
    expect(unescapePath('~0~1')).toBe(`${'~'}${JSONPointer.Child}`);
    expect(unescapePath('path~0middle~1end')).toBe(
      `path${'~'}middle${JSONPointer.Child}end`,
    );
  });
});

import { describe, expect, it } from 'vitest';

import { JSONPointer, TILDE } from '../../enum';
import { JSONPointerError } from '../error';
import { unescape } from '../unescape';

describe('unescape', () => {
  it('should return the same string if no escape sequences are present', () => {
    expect(unescape('normal/path')).toBe('normal/path');
    expect(unescape('123')).toBe('123');
    expect(unescape('')).toBe('');
  });

  it('should correctly unescape ~0 to tilde', () => {
    expect(unescape('~0')).toBe(TILDE);
    expect(unescape('path~0end')).toBe(`path${TILDE}end`);
  });

  it('should correctly unescape ~1 to forward slash', () => {
    expect(unescape('~1')).toBe(JSONPointer.Child);
    expect(unescape('path~1end')).toBe(`path${JSONPointer.Child}end`);
  });

  it('should handle multiple escape sequences', () => {
    expect(unescape('~0~1')).toBe(`${TILDE}${JSONPointer.Child}`);
    expect(unescape('path~0middle~1end')).toBe(
      `path${TILDE}middle${JSONPointer.Child}end`,
    );
  });

  it('should throw error for invalid escape sequences', () => {
    expect(() => unescape('~2')).toThrow(JSONPointerError);
    expect(() => unescape('path~3end')).toThrow(JSONPointerError);
    expect(() => unescape('~')).not.toThrow();
  });
});

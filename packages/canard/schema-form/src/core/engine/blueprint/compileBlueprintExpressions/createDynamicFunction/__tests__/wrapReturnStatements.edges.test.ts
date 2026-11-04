import { describe, expect, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('edge cases', () => {
    it('should not modify text that looks like return but is not a keyword', () => {
      expect(wrapReturnStatements('const returned = 1;')).toBe(
        'const returned = 1;',
      );
    });

    it('should not modify returnValue variable', () => {
      expect(wrapReturnStatements('const returnValue = 1;')).toBe(
        'const returnValue = 1;',
      );
    });

    it('should not modify noreturn variable', () => {
      expect(wrapReturnStatements('const noreturn = 1;')).toBe(
        'const noreturn = 1;',
      );
    });

    it('should handle return at end of string', () => {
      expect(wrapReturnStatements('return x')).toBe('return !!(x)');
    });

    it('should handle empty string', () => {
      expect(wrapReturnStatements('')).toBe('');
    });

    it('should handle string with no return', () => {
      expect(wrapReturnStatements('const x = 1;')).toBe('const x = 1;');
    });

    it('should handle only whitespace', () => {
      expect(wrapReturnStatements('   ')).toBe('   ');
    });

    it('should handle return in string literal (not modified)', () => {
      // Note: This is a limitation - string literals containing "return" are modified
      // In practice, this is acceptable because block expressions typically don't have
      // string literals with "return" keyword pattern
      const input = 'return "return value";';
      expect(wrapReturnStatements(input)).toBe('return !!("return value");');
    });

    it('should handle return in comment-like text', () => {
      // Note: This is a limitation - "return" in comments is also modified
      // In practice, this is acceptable because block expressions typically don't have
      // inline comments with "return" keyword pattern
      const input = 'return x; // return early';
      expect(wrapReturnStatements(input)).toBe(
        'return !!(x); // return !!(early)',
      );
    });
  });
});

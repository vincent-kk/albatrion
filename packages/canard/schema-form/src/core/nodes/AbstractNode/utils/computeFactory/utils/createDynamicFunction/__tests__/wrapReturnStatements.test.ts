import { describe, expect, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('basic return statements', () => {
    it('should wrap single return statement with value', () => {
      expect(wrapReturnStatements('return value;')).toBe('return !!(value);');
    });

    it('should wrap return statement without semicolon', () => {
      expect(wrapReturnStatements('return value')).toBe('return !!(value)');
    });

    it('should handle multiple return statements', () => {
      expect(wrapReturnStatements('if (x) return a; return b;')).toBe(
        'if (x) return !!(a); return !!(b);',
      );
    });

    it('should handle return with newline terminator', () => {
      expect(wrapReturnStatements('return value\n')).toBe('return !!(value)\n');
    });
  });

  describe('empty return statements', () => {
    it('should convert empty return with semicolon to return false', () => {
      expect(wrapReturnStatements('return;')).toBe('return false;');
    });

    it('should convert empty return without semicolon to return false', () => {
      expect(wrapReturnStatements('return')).toBe('return false');
    });

    it('should handle mixed empty and value returns', () => {
      expect(wrapReturnStatements('if (x) return; return value;')).toBe(
        'if (x) return false; return !!(value);',
      );
    });

    it('should handle empty return with newline', () => {
      expect(wrapReturnStatements('return\n')).toBe('return false\n');
    });
  });

  describe('complex expressions', () => {
    it('should wrap object literal return', () => {
      expect(wrapReturnStatements('return { key: v };')).toBe(
        'return !!({ key: v });',
      );
    });

    it('should wrap nested object literal', () => {
      expect(wrapReturnStatements('return { a: { b: c } };')).toBe(
        'return !!({ a: { b: c } });',
      );
    });

    it('should wrap array literal return', () => {
      expect(wrapReturnStatements('return [1, 2, 3];')).toBe(
        'return !!([1, 2, 3]);',
      );
    });

    it('should wrap ternary expression', () => {
      expect(wrapReturnStatements('return a ? b : c;')).toBe(
        'return !!(a ? b : c);',
      );
    });

    it('should wrap logical operators', () => {
      expect(wrapReturnStatements('return a && b || c;')).toBe(
        'return !!(a && b || c);',
      );
    });

    it('should wrap function call', () => {
      expect(wrapReturnStatements('return func();')).toBe('return !!(func());');
    });

    it('should wrap nullish coalescing', () => {
      expect(wrapReturnStatements('return a ?? b;')).toBe('return !!(a ?? b);');
    });

    it('should wrap optional chaining', () => {
      expect(wrapReturnStatements('return obj?.prop;')).toBe(
        'return !!(obj?.prop);',
      );
    });
  });

  describe('conditional blocks with returns', () => {
    it('should wrap returns in if-else blocks', () => {
      const input = 'if (cond) { return a; } else { return b; }';
      const expected = 'if (cond) { return !!(a); } else { return !!(b); }';
      expect(wrapReturnStatements(input)).toBe(expected);
    });

    it('should handle early return pattern', () => {
      const input = 'if (!valid) return; return result;';
      const expected = 'if (!valid) return false; return !!(result);';
      expect(wrapReturnStatements(input)).toBe(expected);
    });
  });

  describe('whitespace handling', () => {
    it('should trim expression value', () => {
      expect(wrapReturnStatements('return   value  ;')).toBe(
        'return !!(value);',
      );
    });

    it('should handle multiple spaces after return', () => {
      expect(wrapReturnStatements('return    x;')).toBe('return !!(x);');
    });
  });

  describe('edge cases', () => {
    it('should not modify text that looks like return but is not a keyword', () => {
      // 'returned' should not be modified
      expect(wrapReturnStatements('const returned = 1;')).toBe(
        'const returned = 1;',
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
  });
});

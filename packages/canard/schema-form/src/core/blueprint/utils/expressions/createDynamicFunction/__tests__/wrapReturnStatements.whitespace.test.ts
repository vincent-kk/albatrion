import { describe, expect, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('whitespace handling', () => {
    it('should trim expression value', () => {
      expect(wrapReturnStatements('return   value  ;')).toBe(
        'return !!(value);',
      );
    });

    it('should handle multiple spaces after return', () => {
      expect(wrapReturnStatements('return    x;')).toBe('return !!(x);');
    });

    it('should handle tab after return', () => {
      expect(wrapReturnStatements('return\tx;')).toBe('return !!(x);');
    });

    it('should handle mixed tabs and spaces', () => {
      expect(wrapReturnStatements('return \t  \t x;')).toBe('return !!(x);');
    });

    it('should preserve indentation before return', () => {
      expect(wrapReturnStatements('  return x;')).toBe('  return !!(x);');
    });

    it('should handle multiline with proper indentation', () => {
      const input = '  if (a) {\n    return x;\n  }';
      const expected = '  if (a) {\n    return !!(x);\n  }';
      expect(wrapReturnStatements(input)).toBe(expected);
    });
  });
});

import { describe, expect, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
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

    it('should handle return followed by semicolon with spaces', () => {
      expect(wrapReturnStatements('return  ;')).toBe('return false;');
    });

    it('should handle return followed by newline then more code', () => {
      expect(wrapReturnStatements('return\nconst x = 1;')).toBe(
        'return false\nconst x = 1;',
      );
    });
  });
});

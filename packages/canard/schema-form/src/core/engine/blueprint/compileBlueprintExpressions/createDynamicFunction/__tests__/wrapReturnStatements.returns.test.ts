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
});

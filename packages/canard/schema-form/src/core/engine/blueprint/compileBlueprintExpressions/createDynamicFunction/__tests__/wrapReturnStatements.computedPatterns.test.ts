import { describe, expect, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('real-world computed expression patterns', () => {
    it('should handle visibility check pattern', () => {
      const input =
        'if (dependencies[0] === "premium") return true; return false;';
      const expected =
        'if (dependencies[0] === "premium") return !!(true); return !!(false);';
      expect(wrapReturnStatements(input)).toBe(expected);
    });

    it('should handle value derivation pattern', () => {
      const input =
        'const val = dependencies[0] * dependencies[1]; return val > 100;';
      const expected =
        'const val = dependencies[0] * dependencies[1]; return !!(val > 100);';
      expect(wrapReturnStatements(input)).toBe(expected);
    });

    it('should handle null check pattern', () => {
      const input =
        'if (dependencies[0] == null) return; return dependencies[0].active;';
      const expected =
        'if (dependencies[0] == null) return false; return !!(dependencies[0].active);';
      expect(wrapReturnStatements(input)).toBe(expected);
    });

    it('should handle array length check pattern', () => {
      expect(wrapReturnStatements('return dependencies[0].length > 0;')).toBe(
        'return !!(dependencies[0].length > 0);',
      );
    });

    it('should handle enum check pattern', () => {
      expect(
        wrapReturnStatements(
          'return ["active", "pending"].includes(dependencies[0]);',
        ),
      ).toBe('return !!(["active", "pending"].includes(dependencies[0]));');
    });

    it('should handle date comparison pattern', () => {
      expect(
        wrapReturnStatements('return new Date(dependencies[0]) > new Date();'),
      ).toBe('return !!(new Date(dependencies[0]) > new Date());');
    });
  });
});

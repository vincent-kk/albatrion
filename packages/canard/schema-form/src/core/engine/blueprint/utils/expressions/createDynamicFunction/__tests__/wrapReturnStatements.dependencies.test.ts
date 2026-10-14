import { describe, expect, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('dependencies array access patterns', () => {
    it('should wrap dependencies array access', () => {
      expect(wrapReturnStatements('return dependencies[0];')).toBe(
        'return !!(dependencies[0]);',
      );
    });

    it('should wrap multiple dependencies access', () => {
      expect(
        wrapReturnStatements('return dependencies[0] && dependencies[1];'),
      ).toBe('return !!(dependencies[0] && dependencies[1]);');
    });

    it('should wrap dependencies comparison', () => {
      expect(wrapReturnStatements('return dependencies[0] > 10;')).toBe(
        'return !!(dependencies[0] > 10);',
      );
    });

    it('should wrap complex dependencies expression', () => {
      expect(
        wrapReturnStatements(
          'return dependencies[0] === "active" && dependencies[1] > 0;',
        ),
      ).toBe('return !!(dependencies[0] === "active" && dependencies[1] > 0);');
    });

    it('should handle conditional with dependencies', () => {
      const input =
        'if (dependencies[0]) return dependencies[1]; return dependencies[2];';
      const expected =
        'if (dependencies[0]) return !!(dependencies[1]); return !!(dependencies[2]);';
      expect(wrapReturnStatements(input)).toBe(expected);
    });
  });
});

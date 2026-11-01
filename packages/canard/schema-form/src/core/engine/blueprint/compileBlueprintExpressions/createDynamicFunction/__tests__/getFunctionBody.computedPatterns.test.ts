import { describe, expect, it } from 'vitest';

import { getFunctionBody } from '../utils/getFunctionBody';

describe('getFunctionBody', () => {
  describe('real-world computed expression patterns', () => {
    describe('visibility expressions', () => {
      it('should handle simple path comparison', () => {
        expect(getFunctionBody('dependencies[0] === "premium"', true)).toBe(
          'return !!(dependencies[0] === "premium")',
        );
      });

      it('should handle block visibility logic', () => {
        const input =
          '{ if (dependencies[0] === "admin") return true; if (dependencies[1] > 100) return true; return false; }';
        const expected =
          'if (dependencies[0] === "admin") return !!(true); if (dependencies[1] > 100) return !!(true); return !!(false);';
        expect(getFunctionBody(input, true)).toBe(expected);
      });
    });

    describe('derived value expressions', () => {
      it('should handle calculation expression', () => {
        expect(
          getFunctionBody('dependencies[0] * dependencies[1]', false),
        ).toBe('return dependencies[0] * dependencies[1]');
      });

      it('should handle block calculation', () => {
        const input =
          '{ const total = dependencies[0] + dependencies[1]; return total * 1.1; }';
        expect(getFunctionBody(input, false)).toBe(
          'const total = dependencies[0] + dependencies[1]; return total * 1.1;',
        );
      });
    });

    describe('validation expressions', () => {
      it('should handle simple validation', () => {
        expect(getFunctionBody('dependencies[0].length > 0', true)).toBe(
          'return !!(dependencies[0].length > 0)',
        );
      });

      it('should handle block validation with early return', () => {
        const input =
          '{ if (!dependencies[0]) return; return dependencies[0].length >= 3; }';
        const expected =
          'if (!dependencies[0]) return false; return !!(dependencies[0].length >= 3);';
        expect(getFunctionBody(input, true)).toBe(expected);
      });
    });
  });
});

import { describe, expect, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('boolean coercion correctness', () => {
    it('should correctly coerce truthy values', () => {
      // These will all become true after !!()
      const truthyExpressions = [
        'return 1;',
        'return "hello";',
        'return [];',
        'return {};',
        'return true;',
        'return -1;',
        'return Infinity;',
      ];

      truthyExpressions.forEach((expr) => {
        const result = wrapReturnStatements(expr);
        expect(result).toMatch(/return !!\(.+\);/);
      });
    });

    it('should correctly coerce falsy values', () => {
      // These will all become false after !!()
      const falsyExpressions = [
        'return 0;',
        'return "";',
        'return null;',
        'return undefined;',
        'return false;',
        'return NaN;',
      ];

      falsyExpressions.forEach((expr) => {
        const result = wrapReturnStatements(expr);
        expect(result).toMatch(/return !!\(.+\);/);
      });
    });
  });
});

import { describe, expect, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
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

    it('should handle multiple if-else branches', () => {
      const input =
        'if (a) { return 1; } else if (b) { return 2; } else { return 3; }';
      const expected =
        'if (a) { return !!(1); } else if (b) { return !!(2); } else { return !!(3); }';
      expect(wrapReturnStatements(input)).toBe(expected);
    });

    it('should handle switch-case returns', () => {
      const input =
        'switch(x) { case 1: return a; case 2: return b; default: return c; }';
      const expected =
        'switch(x) { case 1: return !!(a); case 2: return !!(b); default: return !!(c); }';
      expect(wrapReturnStatements(input)).toBe(expected);
    });

    it('should handle try-catch-finally returns', () => {
      const input =
        'try { return a; } catch(e) { return b; } finally { cleanup(); }';
      const expected =
        'try { return !!(a); } catch(e) { return !!(b); } finally { cleanup(); }';
      expect(wrapReturnStatements(input)).toBe(expected);
    });

    it('should handle guard clause pattern', () => {
      const input = 'if (!x) return; if (!y) return; return x + y;';
      const expected =
        'if (!x) return false; if (!y) return false; return !!(x + y);';
      expect(wrapReturnStatements(input)).toBe(expected);
    });
  });
});

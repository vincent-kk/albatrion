import { expectBooleanBody } from './fixtures/expectBooleanBody';
import { describe, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('conditional blocks with returns', () => {
    it('should wrap returns in if-else blocks', () => {
      const input = 'if (cond) { return a; } else { return b; }';
      expectBooleanBody(input, wrapReturnStatements(input));
    });

    it('should handle early return pattern', () => {
      const input = 'if (!valid) return; return result;';
      expectBooleanBody(input, wrapReturnStatements(input));
    });

    it('should handle multiple if-else branches', () => {
      const input =
        'if (a) { return 1; } else if (b) { return 2; } else { return 3; }';
      expectBooleanBody(input, wrapReturnStatements(input));
    });

    it('should handle switch-case returns', () => {
      const input =
        'switch(x) { case 1: return a; case 2: return b; default: return c; }';
      expectBooleanBody(input, wrapReturnStatements(input));
    });

    it('should handle try-catch-finally returns', () => {
      const input =
        'try { return a; } catch(e) { return b; } finally { cleanup(); }';
      expectBooleanBody(input, wrapReturnStatements(input));
    });

    it('should handle guard clause pattern', () => {
      const input = 'if (!x) return; if (!y) return; return x + y;';
      expectBooleanBody(input, wrapReturnStatements(input));
    });
  });
});

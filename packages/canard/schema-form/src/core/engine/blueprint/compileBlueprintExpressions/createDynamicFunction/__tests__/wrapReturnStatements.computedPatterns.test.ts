import { expectBooleanBody } from './fixtures/expectBooleanBody';
import { describe, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('real-world computed expression patterns', () => {
    it('should handle visibility check pattern', () => {
      const input =
        'if (dependencies[0] === "premium") return true; return false;';
      expectBooleanBody(input, wrapReturnStatements(input));
    });

    it('should handle value derivation pattern', () => {
      const input =
        'const val = dependencies[0] * dependencies[1]; return val > 100;';
      expectBooleanBody(input, wrapReturnStatements(input));
    });

    it('should handle null check pattern', () => {
      const input =
        'if (dependencies[0] == null) return; return dependencies[0].active;';
      expectBooleanBody(input, wrapReturnStatements(input));
    });

    it('should handle array length check pattern', () => {
      expectBooleanBody('return dependencies[0].length > 0;', wrapReturnStatements('return dependencies[0].length > 0;'));
    });

    it('should handle enum check pattern', () => {
      expectBooleanBody('return ["active", "pending"].includes(dependencies[0]);', wrapReturnStatements('return ["active", "pending"].includes(dependencies[0]);'));
    });

    it('should handle date comparison pattern', () => {
      expectBooleanBody('return new Date(dependencies[0]) > new Date();', wrapReturnStatements('return new Date(dependencies[0]) > new Date();'));
    });
  });
});

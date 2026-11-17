import { expectBooleanBody } from './fixtures/expectBooleanBody';
import { describe, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('basic return statements', () => {
    it('should wrap single return statement with value', () => {
      expectBooleanBody('return value;', wrapReturnStatements('return value;'));
    });

    it('should wrap return statement without semicolon', () => {
      expectBooleanBody('return value', wrapReturnStatements('return value'));
    });

    it('should handle multiple return statements', () => {
      expectBooleanBody('if (x) return a; return b;', wrapReturnStatements('if (x) return a; return b;'));
    });

    it('should handle return with newline terminator', () => {
      expectBooleanBody('return value\n', wrapReturnStatements('return value\n'));
    });
  });
});

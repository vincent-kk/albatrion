import { expectBooleanBody } from './fixtures/expectBooleanBody';
import { describe, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('empty return statements', () => {
    it('should convert empty return with semicolon to return false', () => {
      expectBooleanBody('return;', wrapReturnStatements('return;'));
    });

    it('should convert empty return without semicolon to return false', () => {
      expectBooleanBody('return', wrapReturnStatements('return'));
    });

    it('should handle mixed empty and value returns', () => {
      expectBooleanBody('if (x) return; return value;', wrapReturnStatements('if (x) return; return value;'));
    });

    it('should handle empty return with newline', () => {
      expectBooleanBody('return\n', wrapReturnStatements('return\n'));
    });

    it('should handle return followed by semicolon with spaces', () => {
      expectBooleanBody('return  ;', wrapReturnStatements('return  ;'));
    });

    it('should handle return followed by newline then more code', () => {
      expectBooleanBody('return\nconst x = 1;', wrapReturnStatements('return\nconst x = 1;'));
    });
  });
});

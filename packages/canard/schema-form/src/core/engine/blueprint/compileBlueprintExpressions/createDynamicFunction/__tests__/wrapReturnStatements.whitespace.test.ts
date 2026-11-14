import { expectBooleanBody } from './fixtures/expectBooleanBody';
import { describe, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('whitespace handling', () => {
    it('should trim expression value', () => {
      expectBooleanBody('return   value  ;', wrapReturnStatements('return   value  ;'));
    });

    it('should handle multiple spaces after return', () => {
      expectBooleanBody('return    x;', wrapReturnStatements('return    x;'));
    });

    it('should handle tab after return', () => {
      expectBooleanBody('return\tx;', wrapReturnStatements('return\tx;'));
    });

    it('should handle mixed tabs and spaces', () => {
      expectBooleanBody('return \t  \t x;', wrapReturnStatements('return \t  \t x;'));
    });

    it('should preserve indentation before return', () => {
      expectBooleanBody('  return x;', wrapReturnStatements('  return x;'));
    });

    it('should handle multiline with proper indentation', () => {
      const input = '  if (a) {\n    return x;\n  }';
      expectBooleanBody(input, wrapReturnStatements(input));
    });
  });
});

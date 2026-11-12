import { expectBooleanBody } from './fixtures/expectBooleanBody';
import { describe, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('edge cases', () => {
    it('should not modify text that looks like return but is not a keyword', () => {
      expectBooleanBody('const returned = 1;', wrapReturnStatements('const returned = 1;'));
    });

    it('should not modify returnValue variable', () => {
      expectBooleanBody('const returnValue = 1;', wrapReturnStatements('const returnValue = 1;'));
    });

    it('should not modify noreturn variable', () => {
      expectBooleanBody('const noreturn = 1;', wrapReturnStatements('const noreturn = 1;'));
    });

    it('should handle return at end of string', () => {
      expectBooleanBody('return x', wrapReturnStatements('return x'));
    });

    it('should handle empty string', () => {
      expectBooleanBody('', wrapReturnStatements(''));
    });

    it('should handle string with no return', () => {
      expectBooleanBody('const x = 1;', wrapReturnStatements('const x = 1;'));
    });

    it('should handle only whitespace', () => {
      expectBooleanBody('   ', wrapReturnStatements('   '));
    });

    it('should handle return in string literal (not modified)', () => {
      const input = 'return "return value";';
      expectBooleanBody(input, wrapReturnStatements(input));
    });

    it('should handle return in comment-like text', () => {
      const input = 'return x; // return early';
      expectBooleanBody(input, wrapReturnStatements(input));
    });
  });
});

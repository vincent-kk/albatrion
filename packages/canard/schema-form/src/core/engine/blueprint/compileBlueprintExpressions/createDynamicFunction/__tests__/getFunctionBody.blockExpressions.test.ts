import { expectBooleanBody } from './fixtures/expectBooleanBody';
import { describe, expect, it } from 'vitest';

import { getFunctionBody } from '../utils/getFunctionBody';

describe('getFunctionBody', () => {
  describe('block expressions', () => {
    describe('coerceToBoolean = false', () => {
      it('should extract block body without modification', () => {
        expect(getFunctionBody('{ return value; }', false)).toBe(
          'return value;',
        );
      });

      it('should handle block with multiple statements', () => {
        expect(getFunctionBody('{ const x = 1; return x; }', false)).toBe(
          'const x = 1; return x;',
        );
      });

      it('should handle block with if-else', () => {
        expect(getFunctionBody('{ if (a) return b; return c; }', false)).toBe(
          'if (a) return b; return c;',
        );
      });

      it('should handle block with complex logic', () => {
        const input =
          '{ const val = dependencies[0]; if (val > 10) return true; return false; }';
        const expected =
          'const val = dependencies[0]; if (val > 10) return true; return false;';
        expect(getFunctionBody(input, false)).toBe(expected);
      });

      it('should trim block body', () => {
        expect(getFunctionBody('{   return value;   }', false)).toBe(
          'return value;',
        );
      });

      it('should handle empty block body', () => {
        expect(getFunctionBody('{  }', false)).toBe('');
      });

      it('should handle multiline block', () => {
        const input = `{
  const x = 1;
  return x;
}`;
        const expected = `const x = 1;
  return x;`;
        expect(getFunctionBody(input, false)).toBe(expected);
      });
    });

    describe('coerceToBoolean = true', () => {
      it('should wrap single return with !!', () => {
        expectBooleanBody(getFunctionBody('{ return value; }', false), getFunctionBody('{ return value; }', true));
      });

      it('should wrap multiple returns with !!', () => {
        expectBooleanBody(getFunctionBody('{ if (a) return b; return c; }', false), getFunctionBody('{ if (a) return b; return c; }', true));
      });

      it('should convert empty return to return false', () => {
        expectBooleanBody(getFunctionBody('{ return; }', false), getFunctionBody('{ return; }', true));
      });

      it('should handle mixed empty and value returns', () => {
        expectBooleanBody(getFunctionBody('{ if (a) return; return value; }', false), getFunctionBody('{ if (a) return; return value; }', true));
      });

      it('should wrap object literal return with !!', () => {
        expectBooleanBody(getFunctionBody('{ return { key: v }; }', false), getFunctionBody('{ return { key: v }; }', true));
      });

      it('should wrap array literal return with !!', () => {
        expectBooleanBody(getFunctionBody('{ return [1, 2]; }', false), getFunctionBody('{ return [1, 2]; }', true));
      });

      it('should wrap ternary return with !!', () => {
        expectBooleanBody(getFunctionBody('{ return a ? b : c; }', false), getFunctionBody('{ return a ? b : c; }', true));
      });

      it('should wrap complex expression return with !!', () => {
        expectBooleanBody(getFunctionBody('{ return dependencies[0] && dependencies[1]; }', false), getFunctionBody('{ return dependencies[0] && dependencies[1]; }', true));
      });

      it('should handle guard clause pattern', () => {
        const input = '{ if (!x) return; if (!y) return; return x + y; }';
        expectBooleanBody(getFunctionBody(input, false), getFunctionBody(input, true));
      });

      it('should handle visibility check pattern', () => {
        const input =
          '{ if (dependencies[0] === "premium") return true; return false; }';
        expectBooleanBody(getFunctionBody(input, false), getFunctionBody(input, true));
      });

      it('should handle null check pattern', () => {
        const input =
          '{ if (dependencies[0] == null) return; return dependencies[0].active; }';
        expectBooleanBody(getFunctionBody(input, false), getFunctionBody(input, true));
      });

      it('should handle multiline block with coercion', () => {
        const input = `{
  if (dependencies[0]) {
    return true;
  } else {
    return false;
  }
}`;
        expectBooleanBody(getFunctionBody(input, false), getFunctionBody(input, true));
      });
    });
  });
});

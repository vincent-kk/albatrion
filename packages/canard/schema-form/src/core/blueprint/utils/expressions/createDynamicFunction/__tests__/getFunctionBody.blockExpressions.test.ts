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
        expect(getFunctionBody('{ return value; }', true)).toBe(
          'return !!(value);',
        );
      });

      it('should wrap multiple returns with !!', () => {
        expect(getFunctionBody('{ if (a) return b; return c; }', true)).toBe(
          'if (a) return !!(b); return !!(c);',
        );
      });

      it('should convert empty return to return false', () => {
        expect(getFunctionBody('{ return; }', true)).toBe('return false;');
      });

      it('should handle mixed empty and value returns', () => {
        expect(getFunctionBody('{ if (a) return; return value; }', true)).toBe(
          'if (a) return false; return !!(value);',
        );
      });

      it('should wrap object literal return with !!', () => {
        expect(getFunctionBody('{ return { key: v }; }', true)).toBe(
          'return !!({ key: v });',
        );
      });

      it('should wrap array literal return with !!', () => {
        expect(getFunctionBody('{ return [1, 2]; }', true)).toBe(
          'return !!([1, 2]);',
        );
      });

      it('should wrap ternary return with !!', () => {
        expect(getFunctionBody('{ return a ? b : c; }', true)).toBe(
          'return !!(a ? b : c);',
        );
      });

      it('should wrap complex expression return with !!', () => {
        expect(
          getFunctionBody(
            '{ return dependencies[0] && dependencies[1]; }',
            true,
          ),
        ).toBe('return !!(dependencies[0] && dependencies[1]);');
      });

      it('should handle guard clause pattern', () => {
        const input = '{ if (!x) return; if (!y) return; return x + y; }';
        const expected =
          'if (!x) return false; if (!y) return false; return !!(x + y);';
        expect(getFunctionBody(input, true)).toBe(expected);
      });

      it('should handle visibility check pattern', () => {
        const input =
          '{ if (dependencies[0] === "premium") return true; return false; }';
        const expected =
          'if (dependencies[0] === "premium") return !!(true); return !!(false);';
        expect(getFunctionBody(input, true)).toBe(expected);
      });

      it('should handle null check pattern', () => {
        const input =
          '{ if (dependencies[0] == null) return; return dependencies[0].active; }';
        const expected =
          'if (dependencies[0] == null) return false; return !!(dependencies[0].active);';
        expect(getFunctionBody(input, true)).toBe(expected);
      });

      it('should handle multiline block with coercion', () => {
        const input = `{
  if (dependencies[0]) {
    return true;
  } else {
    return false;
  }
}`;
        const expected = `if (dependencies[0]) {
    return !!(true);
  } else {
    return !!(false);
  }`;
        expect(getFunctionBody(input, true)).toBe(expected);
      });
    });
  });
});

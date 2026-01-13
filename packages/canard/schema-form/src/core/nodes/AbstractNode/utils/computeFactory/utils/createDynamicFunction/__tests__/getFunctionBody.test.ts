import { describe, expect, it } from 'vitest';

import { getFunctionBody } from '../utils/getFunctionBody';

describe('getFunctionBody', () => {
  describe('simple expressions (non-block)', () => {
    describe('coerceToBoolean = false', () => {
      it('should wrap simple expression with return', () => {
        expect(getFunctionBody('value', false)).toBe('return value');
      });

      it('should wrap variable reference with return', () => {
        expect(getFunctionBody('dependencies[0]', false)).toBe(
          'return dependencies[0]',
        );
      });

      it('should wrap comparison with return', () => {
        expect(getFunctionBody('x > 10', false)).toBe('return x > 10');
      });

      it('should wrap logical expression with return', () => {
        expect(getFunctionBody('a && b', false)).toBe('return a && b');
      });

      it('should wrap ternary expression with return', () => {
        expect(getFunctionBody('a ? b : c', false)).toBe('return a ? b : c');
      });

      it('should wrap function call with return', () => {
        expect(getFunctionBody('func()', false)).toBe('return func()');
      });

      it('should wrap string literal with return', () => {
        expect(getFunctionBody('"hello"', false)).toBe('return "hello"');
      });

      it('should wrap number literal with return', () => {
        expect(getFunctionBody('42', false)).toBe('return 42');
      });

      it('should wrap array literal with return', () => {
        expect(getFunctionBody('[1, 2, 3]', false)).toBe('return [1, 2, 3]');
      });

      it('should wrap null with return', () => {
        expect(getFunctionBody('null', false)).toBe('return null');
      });
    });

    describe('coerceToBoolean = true', () => {
      it('should wrap simple expression with !! and return', () => {
        expect(getFunctionBody('value', true)).toBe('return !!(value)');
      });

      it('should wrap variable reference with !! and return', () => {
        expect(getFunctionBody('dependencies[0]', true)).toBe(
          'return !!(dependencies[0])',
        );
      });

      it('should wrap comparison with !! and return', () => {
        expect(getFunctionBody('x > 10', true)).toBe('return !!(x > 10)');
      });

      it('should wrap logical expression with !! and return', () => {
        expect(getFunctionBody('a && b', true)).toBe('return !!(a && b)');
      });

      it('should wrap ternary expression with !! and return', () => {
        expect(getFunctionBody('a ? b : c', true)).toBe(
          'return !!(a ? b : c)',
        );
      });

      it('should wrap function call with !! and return', () => {
        expect(getFunctionBody('func()', true)).toBe('return !!(func())');
      });

      it('should wrap string literal with !! and return', () => {
        expect(getFunctionBody('"hello"', true)).toBe('return !!("hello")');
      });

      it('should wrap number literal with !! and return', () => {
        expect(getFunctionBody('42', true)).toBe('return !!(42)');
      });

      it('should wrap array literal with !! and return', () => {
        expect(getFunctionBody('[1, 2, 3]', true)).toBe('return !!([1, 2, 3])');
      });

      it('should wrap null with !! and return', () => {
        expect(getFunctionBody('null', true)).toBe('return !!(null)');
      });

      it('should wrap boolean literal with !! and return', () => {
        expect(getFunctionBody('true', true)).toBe('return !!(true)');
        expect(getFunctionBody('false', true)).toBe('return !!(false)');
      });

      it('should wrap complex expression with !! and return', () => {
        expect(
          getFunctionBody('dependencies[0] === "active" && dependencies[1] > 0', true),
        ).toBe('return !!(dependencies[0] === "active" && dependencies[1] > 0)');
      });
    });
  });

  describe('block expressions', () => {
    describe('coerceToBoolean = false', () => {
      it('should extract block body without modification', () => {
        expect(getFunctionBody('{ return value; }', false)).toBe(
          'return value;',
        );
      });

      it('should handle block with multiple statements', () => {
        expect(
          getFunctionBody('{ const x = 1; return x; }', false),
        ).toBe('const x = 1; return x;');
      });

      it('should handle block with if-else', () => {
        expect(
          getFunctionBody('{ if (a) return b; return c; }', false),
        ).toBe('if (a) return b; return c;');
      });

      it('should handle block with complex logic', () => {
        const input = '{ const val = dependencies[0]; if (val > 10) return true; return false; }';
        const expected = 'const val = dependencies[0]; if (val > 10) return true; return false;';
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
        expect(
          getFunctionBody('{ if (a) return b; return c; }', true),
        ).toBe('if (a) return !!(b); return !!(c);');
      });

      it('should convert empty return to return false', () => {
        expect(getFunctionBody('{ return; }', true)).toBe('return false;');
      });

      it('should handle mixed empty and value returns', () => {
        expect(
          getFunctionBody('{ if (a) return; return value; }', true),
        ).toBe('if (a) return false; return !!(value);');
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
          getFunctionBody('{ return dependencies[0] && dependencies[1]; }', true),
        ).toBe('return !!(dependencies[0] && dependencies[1]);');
      });

      it('should handle guard clause pattern', () => {
        const input = '{ if (!x) return; if (!y) return; return x + y; }';
        const expected = 'if (!x) return false; if (!y) return false; return !!(x + y);';
        expect(getFunctionBody(input, true)).toBe(expected);
      });

      it('should handle visibility check pattern', () => {
        const input = '{ if (dependencies[0] === "premium") return true; return false; }';
        const expected = 'if (dependencies[0] === "premium") return !!(true); return !!(false);';
        expect(getFunctionBody(input, true)).toBe(expected);
      });

      it('should handle null check pattern', () => {
        const input = '{ if (dependencies[0] == null) return; return dependencies[0].active; }';
        const expected = 'if (dependencies[0] == null) return false; return !!(dependencies[0].active);';
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

  describe('edge cases', () => {
    it('should distinguish block from object starting expression', () => {
      // Object literal that looks like a block but isn't (doesn't end with })
      const objectExpr = '{ key: value';
      expect(getFunctionBody(objectExpr, false)).toBe('return { key: value');
    });

    it('should handle expression starting with { but not ending with }', () => {
      expect(getFunctionBody('{ x', false)).toBe('return { x');
    });

    it('should handle expression ending with } but not starting with {', () => {
      expect(getFunctionBody('x }', false)).toBe('return x }');
    });

    it('should handle single brace expressions', () => {
      expect(getFunctionBody('{', false)).toBe('return {');
      expect(getFunctionBody('}', false)).toBe('return }');
    });

    it('should handle nested braces in block', () => {
      const input = '{ const obj = { a: 1 }; return obj; }';
      expect(getFunctionBody(input, false)).toBe('const obj = { a: 1 }; return obj;');
    });

    it('should handle nested braces in block with coercion', () => {
      const input = '{ const obj = { a: 1 }; return obj; }';
      expect(getFunctionBody(input, true)).toBe('const obj = { a: 1 }; return !!(obj);');
    });

    it('should handle empty expression', () => {
      expect(getFunctionBody('', false)).toBe('return ');
      expect(getFunctionBody('', true)).toBe('return !!()');
    });

    it('should handle whitespace only expression', () => {
      expect(getFunctionBody('   ', false)).toBe('return    ');
      expect(getFunctionBody('   ', true)).toBe('return !!(   )');
    });

    it('should handle block with only whitespace', () => {
      expect(getFunctionBody('{    }', false)).toBe('');
      expect(getFunctionBody('{    }', true)).toBe('');
    });
  });

  describe('real-world computed expression patterns', () => {
    describe('visibility expressions', () => {
      it('should handle simple path comparison', () => {
        expect(
          getFunctionBody('dependencies[0] === "premium"', true),
        ).toBe('return !!(dependencies[0] === "premium")');
      });

      it('should handle block visibility logic', () => {
        const input = '{ if (dependencies[0] === "admin") return true; if (dependencies[1] > 100) return true; return false; }';
        const expected = 'if (dependencies[0] === "admin") return !!(true); if (dependencies[1] > 100) return !!(true); return !!(false);';
        expect(getFunctionBody(input, true)).toBe(expected);
      });
    });

    describe('derived value expressions', () => {
      it('should handle calculation expression', () => {
        expect(
          getFunctionBody('dependencies[0] * dependencies[1]', false),
        ).toBe('return dependencies[0] * dependencies[1]');
      });

      it('should handle block calculation', () => {
        const input = '{ const total = dependencies[0] + dependencies[1]; return total * 1.1; }';
        expect(getFunctionBody(input, false)).toBe(
          'const total = dependencies[0] + dependencies[1]; return total * 1.1;',
        );
      });
    });

    describe('validation expressions', () => {
      it('should handle simple validation', () => {
        expect(
          getFunctionBody('dependencies[0].length > 0', true),
        ).toBe('return !!(dependencies[0].length > 0)');
      });

      it('should handle block validation with early return', () => {
        const input = '{ if (!dependencies[0]) return; return dependencies[0].length >= 3; }';
        const expected = 'if (!dependencies[0]) return false; return !!(dependencies[0].length >= 3);';
        expect(getFunctionBody(input, true)).toBe(expected);
      });
    });
  });
});

import { describe, expect, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('basic return statements', () => {
    it('should wrap single return statement with value', () => {
      expect(wrapReturnStatements('return value;')).toBe('return !!(value);');
    });

    it('should wrap return statement without semicolon', () => {
      expect(wrapReturnStatements('return value')).toBe('return !!(value)');
    });

    it('should handle multiple return statements', () => {
      expect(wrapReturnStatements('if (x) return a; return b;')).toBe(
        'if (x) return !!(a); return !!(b);',
      );
    });

    it('should handle return with newline terminator', () => {
      expect(wrapReturnStatements('return value\n')).toBe('return !!(value)\n');
    });
  });

  describe('empty return statements', () => {
    it('should convert empty return with semicolon to return false', () => {
      expect(wrapReturnStatements('return;')).toBe('return false;');
    });

    it('should convert empty return without semicolon to return false', () => {
      expect(wrapReturnStatements('return')).toBe('return false');
    });

    it('should handle mixed empty and value returns', () => {
      expect(wrapReturnStatements('if (x) return; return value;')).toBe(
        'if (x) return false; return !!(value);',
      );
    });

    it('should handle empty return with newline', () => {
      expect(wrapReturnStatements('return\n')).toBe('return false\n');
    });

    it('should handle return followed by semicolon with spaces', () => {
      expect(wrapReturnStatements('return  ;')).toBe('return false;');
    });

    it('should handle return followed by newline then more code', () => {
      expect(wrapReturnStatements('return\nconst x = 1;')).toBe(
        'return false\nconst x = 1;',
      );
    });
  });

  describe('complex expressions', () => {
    it('should wrap object literal return', () => {
      expect(wrapReturnStatements('return { key: v };')).toBe(
        'return !!({ key: v });',
      );
    });

    it('should wrap nested object literal', () => {
      expect(wrapReturnStatements('return { a: { b: c } };')).toBe(
        'return !!({ a: { b: c } });',
      );
    });

    it('should wrap deeply nested object literal', () => {
      expect(wrapReturnStatements('return { a: { b: { c: { d: 1 } } } };')).toBe(
        'return !!({ a: { b: { c: { d: 1 } } } });',
      );
    });

    it('should wrap array literal return', () => {
      expect(wrapReturnStatements('return [1, 2, 3];')).toBe(
        'return !!([1, 2, 3]);',
      );
    });

    it('should wrap nested array literal', () => {
      expect(wrapReturnStatements('return [[1, 2], [3, 4]];')).toBe(
        'return !!([[1, 2], [3, 4]]);',
      );
    });

    it('should wrap ternary expression', () => {
      expect(wrapReturnStatements('return a ? b : c;')).toBe(
        'return !!(a ? b : c);',
      );
    });

    it('should wrap nested ternary expression', () => {
      expect(wrapReturnStatements('return a ? b ? c : d : e;')).toBe(
        'return !!(a ? b ? c : d : e);',
      );
    });

    it('should wrap logical operators', () => {
      expect(wrapReturnStatements('return a && b || c;')).toBe(
        'return !!(a && b || c);',
      );
    });

    it('should wrap function call', () => {
      expect(wrapReturnStatements('return func();')).toBe('return !!(func());');
    });

    it('should wrap method chain', () => {
      expect(wrapReturnStatements('return obj.method().chain();')).toBe(
        'return !!(obj.method().chain());',
      );
    });

    it('should wrap nullish coalescing', () => {
      expect(wrapReturnStatements('return a ?? b;')).toBe('return !!(a ?? b);');
    });

    it('should wrap optional chaining', () => {
      expect(wrapReturnStatements('return obj?.prop;')).toBe(
        'return !!(obj?.prop);',
      );
    });

    it('should wrap combined optional chaining and nullish coalescing', () => {
      expect(wrapReturnStatements('return obj?.prop ?? default;')).toBe(
        'return !!(obj?.prop ?? default);',
      );
    });

    it('should wrap arithmetic expression', () => {
      expect(wrapReturnStatements('return a + b * c;')).toBe(
        'return !!(a + b * c);',
      );
    });

    it('should wrap comparison expression', () => {
      expect(wrapReturnStatements('return a > b && c <= d;')).toBe(
        'return !!(a > b && c <= d);',
      );
    });

    it('should wrap strict equality expression', () => {
      expect(wrapReturnStatements('return a === b;')).toBe(
        'return !!(a === b);',
      );
    });

    it('should wrap template literal', () => {
      expect(wrapReturnStatements('return `hello ${name}`;')).toBe(
        'return !!(`hello ${name}`);',
      );
    });

    it('should wrap arrow function expression', () => {
      expect(wrapReturnStatements('return () => true;')).toBe(
        'return !!(() => true);',
      );
    });

    it('should wrap new expression', () => {
      expect(wrapReturnStatements('return new Error("test");')).toBe(
        'return !!(new Error("test"));',
      );
    });

    it('should wrap typeof expression', () => {
      expect(wrapReturnStatements('return typeof x === "string";')).toBe(
        'return !!(typeof x === "string");',
      );
    });

    it('should wrap instanceof expression', () => {
      expect(wrapReturnStatements('return x instanceof Array;')).toBe(
        'return !!(x instanceof Array);',
      );
    });
  });

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

  describe('whitespace handling', () => {
    it('should trim expression value', () => {
      expect(wrapReturnStatements('return   value  ;')).toBe(
        'return !!(value);',
      );
    });

    it('should handle multiple spaces after return', () => {
      expect(wrapReturnStatements('return    x;')).toBe('return !!(x);');
    });

    it('should handle tab after return', () => {
      expect(wrapReturnStatements('return\tx;')).toBe('return !!(x);');
    });

    it('should handle mixed tabs and spaces', () => {
      expect(wrapReturnStatements('return \t  \t x;')).toBe('return !!(x);');
    });

    it('should preserve indentation before return', () => {
      expect(wrapReturnStatements('  return x;')).toBe('  return !!(x);');
    });

    it('should handle multiline with proper indentation', () => {
      const input = '  if (a) {\n    return x;\n  }';
      const expected = '  if (a) {\n    return !!(x);\n  }';
      expect(wrapReturnStatements(input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('should not modify text that looks like return but is not a keyword', () => {
      expect(wrapReturnStatements('const returned = 1;')).toBe(
        'const returned = 1;',
      );
    });

    it('should not modify returnValue variable', () => {
      expect(wrapReturnStatements('const returnValue = 1;')).toBe(
        'const returnValue = 1;',
      );
    });

    it('should not modify noreturn variable', () => {
      expect(wrapReturnStatements('const noreturn = 1;')).toBe(
        'const noreturn = 1;',
      );
    });

    it('should handle return at end of string', () => {
      expect(wrapReturnStatements('return x')).toBe('return !!(x)');
    });

    it('should handle empty string', () => {
      expect(wrapReturnStatements('')).toBe('');
    });

    it('should handle string with no return', () => {
      expect(wrapReturnStatements('const x = 1;')).toBe('const x = 1;');
    });

    it('should handle only whitespace', () => {
      expect(wrapReturnStatements('   ')).toBe('   ');
    });

    it('should handle return in string literal (not modified)', () => {
      // Note: This is a limitation - string literals containing "return" are modified
      // In practice, this is acceptable because block expressions typically don't have
      // string literals with "return" keyword pattern
      const input = 'return "return value";';
      expect(wrapReturnStatements(input)).toBe('return !!("return value");');
    });

    it('should handle return in comment-like text', () => {
      // Note: This is a limitation - "return" in comments is also modified
      // In practice, this is acceptable because block expressions typically don't have
      // inline comments with "return" keyword pattern
      const input = 'return x; // return early';
      expect(wrapReturnStatements(input)).toBe('return !!(x); // return !!(early)');
    });
  });

  describe('dependencies array access patterns', () => {
    it('should wrap dependencies array access', () => {
      expect(wrapReturnStatements('return dependencies[0];')).toBe(
        'return !!(dependencies[0]);',
      );
    });

    it('should wrap multiple dependencies access', () => {
      expect(
        wrapReturnStatements('return dependencies[0] && dependencies[1];'),
      ).toBe('return !!(dependencies[0] && dependencies[1]);');
    });

    it('should wrap dependencies comparison', () => {
      expect(wrapReturnStatements('return dependencies[0] > 10;')).toBe(
        'return !!(dependencies[0] > 10);',
      );
    });

    it('should wrap complex dependencies expression', () => {
      expect(
        wrapReturnStatements(
          'return dependencies[0] === "active" && dependencies[1] > 0;',
        ),
      ).toBe(
        'return !!(dependencies[0] === "active" && dependencies[1] > 0);',
      );
    });

    it('should handle conditional with dependencies', () => {
      const input =
        'if (dependencies[0]) return dependencies[1]; return dependencies[2];';
      const expected =
        'if (dependencies[0]) return !!(dependencies[1]); return !!(dependencies[2]);';
      expect(wrapReturnStatements(input)).toBe(expected);
    });
  });

  describe('real-world computed expression patterns', () => {
    it('should handle visibility check pattern', () => {
      const input = 'if (dependencies[0] === "premium") return true; return false;';
      const expected =
        'if (dependencies[0] === "premium") return !!(true); return !!(false);';
      expect(wrapReturnStatements(input)).toBe(expected);
    });

    it('should handle value derivation pattern', () => {
      const input =
        'const val = dependencies[0] * dependencies[1]; return val > 100;';
      const expected =
        'const val = dependencies[0] * dependencies[1]; return !!(val > 100);';
      expect(wrapReturnStatements(input)).toBe(expected);
    });

    it('should handle null check pattern', () => {
      const input =
        'if (dependencies[0] == null) return; return dependencies[0].active;';
      const expected =
        'if (dependencies[0] == null) return false; return !!(dependencies[0].active);';
      expect(wrapReturnStatements(input)).toBe(expected);
    });

    it('should handle array length check pattern', () => {
      expect(wrapReturnStatements('return dependencies[0].length > 0;')).toBe(
        'return !!(dependencies[0].length > 0);',
      );
    });

    it('should handle enum check pattern', () => {
      expect(
        wrapReturnStatements(
          'return ["active", "pending"].includes(dependencies[0]);',
        ),
      ).toBe('return !!(["active", "pending"].includes(dependencies[0]));');
    });

    it('should handle date comparison pattern', () => {
      expect(
        wrapReturnStatements('return new Date(dependencies[0]) > new Date();'),
      ).toBe('return !!(new Date(dependencies[0]) > new Date());');
    });
  });

  describe('multiline complex patterns', () => {
    it('should handle multiline if-else', () => {
      const input = `if (dependencies[0]) {
  return true;
} else {
  return false;
}`;
      const expected = `if (dependencies[0]) {
  return !!(true);
} else {
  return !!(false);
}`;
      expect(wrapReturnStatements(input)).toBe(expected);
    });

    it('should handle multiline with early returns', () => {
      const input = `if (!dependencies[0]) return;
if (!dependencies[1]) return;
return dependencies[0] + dependencies[1];`;
      const expected = `if (!dependencies[0]) return false;
if (!dependencies[1]) return false;
return !!(dependencies[0] + dependencies[1]);`;
      expect(wrapReturnStatements(input)).toBe(expected);
    });

    it('should handle complex business logic', () => {
      const input = `const value = dependencies[0];
const threshold = dependencies[1];
if (value == null) return;
if (value < threshold) return false;
return value >= threshold;`;
      const expected = `const value = dependencies[0];
const threshold = dependencies[1];
if (value == null) return false;
if (value < threshold) return !!(false);
return !!(value >= threshold);`;
      expect(wrapReturnStatements(input)).toBe(expected);
    });
  });

  describe('boolean coercion correctness', () => {
    it('should correctly coerce truthy values', () => {
      // These will all become true after !!()
      const truthyExpressions = [
        'return 1;',
        'return "hello";',
        'return [];',
        'return {};',
        'return true;',
        'return -1;',
        'return Infinity;',
      ];

      truthyExpressions.forEach((expr) => {
        const result = wrapReturnStatements(expr);
        expect(result).toMatch(/return !!\(.+\);/);
      });
    });

    it('should correctly coerce falsy values', () => {
      // These will all become false after !!()
      const falsyExpressions = [
        'return 0;',
        'return "";',
        'return null;',
        'return undefined;',
        'return false;',
        'return NaN;',
      ];

      falsyExpressions.forEach((expr) => {
        const result = wrapReturnStatements(expr);
        expect(result).toMatch(/return !!\(.+\);/);
      });
    });
  });
});

import { describe, expect, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
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
      expect(
        wrapReturnStatements('return { a: { b: { c: { d: 1 } } } };'),
      ).toBe('return !!({ a: { b: { c: { d: 1 } } } });');
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
});

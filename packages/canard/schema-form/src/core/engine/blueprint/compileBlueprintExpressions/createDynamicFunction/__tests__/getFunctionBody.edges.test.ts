import { describe, expect, it } from 'vitest';

import { getFunctionBody } from '../utils/getFunctionBody';

describe('getFunctionBody', () => {
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
      expect(getFunctionBody(input, false)).toBe(
        'const obj = { a: 1 }; return obj;',
      );
    });

    it('should handle nested braces in block with coercion', () => {
      const input = '{ const obj = { a: 1 }; return obj; }';
      expect(getFunctionBody(input, true)).toBe(
        'const obj = { a: 1 }; return !!(obj);',
      );
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
});

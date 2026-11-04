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
        expect(getFunctionBody('a ? b : c', true)).toBe('return !!(a ? b : c)');
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
          getFunctionBody(
            'dependencies[0] === "active" && dependencies[1] > 0',
            true,
          ),
        ).toBe(
          'return !!(dependencies[0] === "active" && dependencies[1] > 0)',
        );
      });
    });
  });
});

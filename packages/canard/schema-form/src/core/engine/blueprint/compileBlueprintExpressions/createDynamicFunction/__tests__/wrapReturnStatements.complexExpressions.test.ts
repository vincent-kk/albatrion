import { expectBooleanBody } from './fixtures/expectBooleanBody';
import { describe, it } from 'vitest';

import { wrapReturnStatements } from '../utils/wrapReturnStatements';

describe('wrapReturnStatements', () => {
  describe('complex expressions', () => {
    it('should wrap object literal return', () => {
      expectBooleanBody('return { key: v };', wrapReturnStatements('return { key: v };'));
    });

    it('should wrap nested object literal', () => {
      expectBooleanBody('return { a: { b: c } };', wrapReturnStatements('return { a: { b: c } };'));
    });

    it('should wrap deeply nested object literal', () => {
      expectBooleanBody('return { a: { b: { c: { d: 1 } } } };', wrapReturnStatements('return { a: { b: { c: { d: 1 } } } };'));
    });

    it('should wrap array literal return', () => {
      expectBooleanBody('return [1, 2, 3];', wrapReturnStatements('return [1, 2, 3];'));
    });

    it('should wrap nested array literal', () => {
      expectBooleanBody('return [[1, 2], [3, 4]];', wrapReturnStatements('return [[1, 2], [3, 4]];'));
    });

    it('should wrap ternary expression', () => {
      expectBooleanBody('return a ? b : c;', wrapReturnStatements('return a ? b : c;'));
    });

    it('should wrap nested ternary expression', () => {
      expectBooleanBody('return a ? b ? c : d : e;', wrapReturnStatements('return a ? b ? c : d : e;'));
    });

    it('should wrap logical operators', () => {
      expectBooleanBody('return a && b || c;', wrapReturnStatements('return a && b || c;'));
    });

    it('should wrap function call', () => {
      expectBooleanBody('return func();', wrapReturnStatements('return func();'));
    });

    it('should wrap method chain', () => {
      expectBooleanBody('return obj.method().chain();', wrapReturnStatements('return obj.method().chain();'));
    });

    it('should wrap nullish coalescing', () => {
      expectBooleanBody('return a ?? b;', wrapReturnStatements('return a ?? b;'));
    });

    it('should wrap optional chaining', () => {
      expectBooleanBody('return obj?.prop;', wrapReturnStatements('return obj?.prop;'));
    });

    it('should wrap combined optional chaining and nullish coalescing', () => {
      expectBooleanBody('return obj?.prop ?? fallback;', wrapReturnStatements('return obj?.prop ?? fallback;'));
    });

    it('should wrap arithmetic expression', () => {
      expectBooleanBody('return a + b * c;', wrapReturnStatements('return a + b * c;'));
    });

    it('should wrap comparison expression', () => {
      expectBooleanBody('return a > b && c <= d;', wrapReturnStatements('return a > b && c <= d;'));
    });

    it('should wrap strict equality expression', () => {
      expectBooleanBody('return a === b;', wrapReturnStatements('return a === b;'));
    });

    it('should wrap template literal', () => {
      expectBooleanBody('return `hello ${name}`;', wrapReturnStatements('return `hello ${name}`;'));
    });

    it('should wrap arrow function expression', () => {
      expectBooleanBody('return () => true;', wrapReturnStatements('return () => true;'));
    });

    it('should wrap new expression', () => {
      expectBooleanBody('return new Error("test");', wrapReturnStatements('return new Error("test");'));
    });

    it('should wrap typeof expression', () => {
      expectBooleanBody('return typeof x === "string";', wrapReturnStatements('return typeof x === "string";'));
    });

    it('should wrap instanceof expression', () => {
      expectBooleanBody('return x instanceof Array;', wrapReturnStatements('return x instanceof Array;'));
    });
  });
});

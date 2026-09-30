import { describe, expect, it } from 'vitest';

import type { Dictionary } from '@aileron/declare';

import { shallowPatch } from '../shallowPatch';

describe('reconcile', () => {
  describe('normal mode (additive: false)', () => {
    it('should merge new values into state', () => {
      const state = { dirty: true };
      const result = shallowPatch<Dictionary>(state, { touched: true });

      expect(result).toEqual({ dirty: true, touched: true });
    });

    it('should overwrite existing values', () => {
      const state = { dirty: true, count: 1 };
      const result = shallowPatch(state, { dirty: false, count: 2 });

      expect(result).toEqual({ dirty: false, count: 2 });
    });

    it('should remove keys when value is undefined', () => {
      const state = { dirty: true, touched: true };
      const result = shallowPatch<Dictionary>(state, { dirty: undefined });

      expect(result).toEqual({ touched: true });
      expect('dirty' in result!).toBe(false);
    });

    it('should handle multiple undefined values', () => {
      const state = { dirty: true, touched: true, showError: true };
      const result = shallowPatch<Dictionary>(state, {
        dirty: undefined as unknown as boolean,
        touched: undefined as unknown as boolean,
      });

      expect(result).toEqual({ showError: true });
    });

    it('should allow setting falsy values (false, 0, empty string)', () => {
      const state = { active: true, count: 5, name: 'test' };
      const result = shallowPatch(state, {
        active: false,
        count: 0,
        name: '',
      });

      expect(result).toEqual({ active: false, count: 0, name: '' });
    });

    it('should return undefined when no changes occur', () => {
      const state = { dirty: true, touched: true };
      const result = shallowPatch(state, { dirty: true, touched: true });

      expect(result).toBeUndefined();
    });

    it('should return undefined when removing non-existent key', () => {
      const state = { dirty: true };
      const result = shallowPatch<Dictionary>(state, {
        nonExistent: undefined as unknown as boolean,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('additive mode (additive: true)', () => {
    it('should add truthy values', () => {
      const state = {};
      const result = shallowPatch<Dictionary>(
        state,
        { dirty: true, touched: true },
        true,
      );

      expect(result).toEqual({ dirty: true, touched: true });
    });

    it('should ignore falsy values (false)', () => {
      const state = { dirty: true };
      const result = shallowPatch<Dictionary>(
        state,
        { dirty: false, touched: true },
        true,
      );

      expect(result).toEqual({ dirty: true, touched: true });
    });

    it('should ignore falsy values (0, empty string, null)', () => {
      const state = { count: 5, name: 'test' };
      const result = shallowPatch<Dictionary>(
        state,
        { count: 0, name: '', active: null as unknown as boolean },
        true,
      );

      expect(result).toBeUndefined();
    });

    it('should not overwrite truthy with falsy', () => {
      const state = { dirty: true, count: 10 };
      const result = shallowPatch<Dictionary>(
        state,
        { dirty: false, count: 0 },
        true,
      );

      expect(result).toBeUndefined();
      expect(state).toEqual({ dirty: true, count: 10 });
    });

    it('should overwrite truthy with different truthy', () => {
      const state = { status: 'active', count: 1 };
      const result = shallowPatch<Dictionary>(
        state,
        { status: 'inactive', count: 2 },
        true,
      );

      expect(result).toEqual({ status: 'inactive', count: 2 });
    });

    it('should return undefined when all input values are falsy', () => {
      const state = { dirty: true };
      const result = shallowPatch<Dictionary>(
        state,
        { newFlag: false, anotherFlag: 0 },
        true,
      );

      expect(result).toBeUndefined();
    });

    it('should return undefined when truthy value equals existing', () => {
      const state = { dirty: true, count: 5 };
      const result = shallowPatch<Dictionary>(
        state,
        { dirty: true, count: 5 },
        true,
      );

      expect(result).toBeUndefined();
    });
  });

  describe('clearing state with undefined input', () => {
    it('should return empty object when state has values', () => {
      const state = { dirty: true, touched: true };
      const result = shallowPatch<Dictionary>(state, undefined);

      expect(result).toEqual({});
    });

    it('should return undefined when state is already empty', () => {
      const state = {};
      const result = shallowPatch<Dictionary>(state, undefined);

      expect(result).toBeUndefined();
    });

    it('should work in additive mode too', () => {
      const state = { dirty: true };
      const result = shallowPatch<Dictionary>(state, undefined, true);

      expect(result).toEqual({});
    });
  });

  describe('function input', () => {
    it('should call function with shallow copy of state', () => {
      const state = { dirty: true, count: 1 };
      const result = shallowPatch<Dictionary>(state, (prev) => ({
        ...prev,
        touched: true,
      }));

      expect(result).toEqual({ dirty: true, count: 1, touched: true });
    });

    it('should allow function to modify state', () => {
      const state = { count: 5 };
      const result = shallowPatch<Dictionary>(state, (prev) => ({
        count: prev.count + 1,
      }));

      expect(result).toEqual({ count: 6 });
    });

    it('should allow function to return partial update', () => {
      const state = { dirty: true, touched: true };
      const result = shallowPatch<Dictionary>(state, () => ({
        showError: true,
      }));

      expect(result).toEqual({ dirty: true, touched: true, showError: true });
    });

    it('should work with additive mode', () => {
      const state = { dirty: true };
      const result = shallowPatch(
        state,
        () => ({ dirty: false, touched: true }),
        true,
      );

      expect(result).toEqual({ dirty: true, touched: true });
    });

    it('should not mutate the prev argument in function', () => {
      const state = { dirty: true };
      let capturedPrev: Record<string, unknown> | null = null;

      shallowPatch<Dictionary>(state, (prev) => {
        capturedPrev = prev;
        return { touched: true };
      });

      expect(capturedPrev).not.toBe(state);
      expect(capturedPrev).toEqual({ dirty: true });
    });
  });

  describe('invalid input handling', () => {
    it('should return undefined for null input', () => {
      const state = { dirty: true };
      const result = shallowPatch(state, null as unknown as undefined);

      expect(result).toBeUndefined();
    });

    it('should return undefined for primitive input', () => {
      const state = { dirty: true };

      expect(
        shallowPatch(state, 'string' as unknown as undefined),
      ).toBeUndefined();
      expect(shallowPatch(state, 123 as unknown as undefined)).toBeUndefined();
      expect(shallowPatch(state, true as unknown as undefined)).toBeUndefined();
    });

    it('should handle empty object input with no changes', () => {
      const state = { dirty: true };
      const result = shallowPatch<Dictionary>(state, {});

      expect(result).toBeUndefined();
    });
  });

  describe('immutability and mutation', () => {
    it('should mutate original state object', () => {
      const state = { dirty: true };
      const result = shallowPatch<Dictionary>(state, { touched: true });

      expect(result).toEqual({ dirty: true, touched: true });
      expect(state).toEqual({ dirty: true });
    });

    it('should return new object reference when changes occur', () => {
      const state = { dirty: true };
      const result = shallowPatch<Dictionary>(state, { touched: true });

      expect(result).not.toBe(state);
      expect(result).toEqual({ dirty: true, touched: true });
    });

    it('should not return new reference when no changes', () => {
      const state = { dirty: true };
      const result = shallowPatch<Dictionary>(state, { dirty: true });

      expect(result).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle state with numeric keys', () => {
      const state = { 1: true, 2: false };
      const result = shallowPatch<Dictionary>(state, {
        1: false,
        3: true,
      });

      expect(result).toEqual({ 1: false, 2: false, 3: true });
    });

    it('should handle deeply nested values (reference comparison)', () => {
      const nested = { inner: true };
      const state = { nested };
      const result = shallowPatch<Dictionary>(state, { nested });

      expect(result).toBeUndefined();
    });

    it('should detect change when nested object reference changes', () => {
      const state = { nested: { inner: true } };
      const result = shallowPatch<Dictionary>(state, {
        nested: { inner: true },
      });

      expect(result).toEqual({ nested: { inner: true } });
    });

    it('should handle undefined value in input correctly in normal mode', () => {
      const state = { a: 1, b: 2 };
      const result = shallowPatch<Dictionary>(state, {
        a: undefined,
        c: 3,
      });

      expect(result).toEqual({ b: 2, c: 3 });
    });

    it('should handle mixed operations in single call', () => {
      const state = { keep: true, remove: true, update: 1 };
      const result = shallowPatch<Dictionary>(state, {
        remove: undefined,
        update: 2,
        add: true,
      });

      expect(result).toEqual({ keep: true, update: 2, add: true });
    });
  });
});

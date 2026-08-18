import { describe, expect, it } from 'vitest';

import { shallowClone } from '../shallowClone';

describe('shallowClone', () => {
  describe('Special objects (not cloned)', () => {
    it('should return functions as-is', () => {
      const func = () => 'test';
      expect(shallowClone(func)).toBe(func);
    });

    it('should return Date objects as-is', () => {
      const date = new Date();
      expect(shallowClone(date)).toBe(date);
    });

    it('should return RegExp objects as-is', () => {
      const regex = /test/gi;
      expect(shallowClone(regex)).toBe(regex);
    });

    it('should return Map objects as-is', () => {
      const map = new Map([['key', 'value']]);
      expect(shallowClone(map)).toBe(map);
    });

    it('should return Set objects as-is', () => {
      const set = new Set([1, 2, 3]);
      expect(shallowClone(set)).toBe(set);
    });

    it('should return WeakMap objects as-is', () => {
      const weakMap = new WeakMap();
      expect(shallowClone(weakMap)).toBe(weakMap);
    });

    it('should return WeakSet objects as-is', () => {
      const weakSet = new WeakSet();
      expect(shallowClone(weakSet)).toBe(weakSet);
    });

    it('should return Error objects as-is', () => {
      const error = new Error('test error');
      expect(shallowClone(error)).toBe(error);
    });

    it('should return ArrayBuffer as-is', () => {
      const buffer = new ArrayBuffer(8);
      expect(shallowClone(buffer)).toBe(buffer);
    });

    it('should return TypedArrays as-is', () => {
      const int32Array = new Int32Array([1, 2, 3]);
      const uint8Array = new Uint8Array([1, 2, 3]);
      const float32Array = new Float32Array([1.1, 2.2, 3.3]);

      expect(shallowClone(int32Array)).toBe(int32Array);
      expect(shallowClone(uint8Array)).toBe(uint8Array);
      expect(shallowClone(float32Array)).toBe(float32Array);
    });

    it('should return DataView as-is', () => {
      const buffer = new ArrayBuffer(8);
      const dataView = new DataView(buffer);
      expect(shallowClone(dataView)).toBe(dataView);
    });

    it('should return Promise as-is', () => {
      const promise = Promise.resolve(42);
      expect(shallowClone(promise)).toBe(promise);
    });
  });
});

import { describe, expect, it } from 'vitest';

import { getPathManager } from '../../getPathManager';
import { createDynamicFunction } from '../createDynamicFunction';

describe('createDynamicFunction', () => {
  describe('coerceToBoolean = true with block expressions', () => {
    it('should coerce block return value to boolean', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(
        pathManager,
        'test',
        '{ return /value; }',
        true,
      );
      expect(fn?.(['hello'])).toBe(true);
      expect(fn?.([''])).toBe(false);
      expect(fn?.([0])).toBe(false);
      expect(fn?.([1])).toBe(true);
    });

    it('should convert empty return to false', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(
        pathManager,
        'test',
        '{ if (dependencies[0]) return; return true; }',
        true,
      );
      expect(fn?.([true])).toBe(false);
      expect(fn?.([false])).toBe(true);
    });

    it('should handle multiple returns with coercion', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(
        pathManager,
        'test',
        '{ if (dependencies[0] > 100) return dependencies[0]; return 0; }',
        true,
      );
      expect(fn?.([150])).toBe(true);
      expect(fn?.([50])).toBe(false);
    });

    it('should handle guard clause pattern with coercion', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(
        pathManager,
        'test',
        '{ if (!/enabled) return; if (!/value) return; return /value > 10; }',
        true,
      );
      expect(fn?.([false, 20])).toBe(false);
      expect(fn?.([true, 0])).toBe(false);
      expect(fn?.([true, 20])).toBe(true);
      expect(fn?.([true, 5])).toBe(false);
    });

    it('should handle visibility check pattern', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(
        pathManager,
        'test',
        '{ if (/userType === "admin") return true; if (/credits > 100) return true; return false; }',
        true,
      );
      expect(fn?.(['admin', 0])).toBe(true);
      expect(fn?.(['user', 200])).toBe(true);
      expect(fn?.(['user', 50])).toBe(false);
    });

    it('should handle null check pattern with coercion', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(
        pathManager,
        'test',
        '{ if (dependencies[0] == null) return; return dependencies[0].active; }',
        true,
      );
      expect(fn?.([null])).toBe(false);
      expect(fn?.([{ active: true }])).toBe(true);
      expect(fn?.([{ active: false }])).toBe(false);
      expect(fn?.([{ active: 'yes' }])).toBe(true);
    });

    it('should handle object return with coercion', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(
        pathManager,
        'test',
        '{ return { key: dependencies[0] }; }',
        true,
      );
      expect(fn?.(['anything'])).toBe(true);
    });

    it('should handle array return with coercion', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(
        pathManager,
        'test',
        '{ return [dependencies[0]]; }',
        true,
      );
      expect(fn?.(['anything'])).toBe(true);
    });
  });
});

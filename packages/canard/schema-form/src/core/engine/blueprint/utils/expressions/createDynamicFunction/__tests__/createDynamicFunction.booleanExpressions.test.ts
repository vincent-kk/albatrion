import { describe, expect, it } from 'vitest';

import { getPathManager } from '../../getPathManager';
import { createDynamicFunction } from '../createDynamicFunction';

describe('createDynamicFunction', () => {
  describe('coerceToBoolean = true with simple expressions', () => {
    it('should coerce truthy value to true', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '"hello"', true);
      expect(fn?.([])).toBe(true);
    });

    it('should coerce falsy value to false', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '""', true);
      expect(fn?.([])).toBe(false);
    });

    it('should coerce number to boolean', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '/value', true);
      expect(fn?.([42])).toBe(true);
      expect(fn?.([0])).toBe(false);
      expect(fn?.([-1])).toBe(true);
    });

    it('should coerce null/undefined to false', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '/value', true);
      expect(fn?.([null])).toBe(false);
      expect(fn?.([undefined])).toBe(false);
    });

    it('should coerce object to true', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '/value', true);
      expect(fn?.([{}])).toBe(true);
      expect(fn?.([[]])).toBe(true);
    });

    it('should coerce comparison result to boolean', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(
        pathManager,
        'test',
        '/status === "active"',
        true,
      );
      expect(fn?.(['active'])).toBe(true);
      expect(fn?.(['inactive'])).toBe(false);
    });

    it('should coerce logical expression to boolean', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '/a && /b', true);
      expect(fn?.([true, true])).toBe(true);
      expect(fn?.([true, false])).toBe(false);
      expect(fn?.([false, true])).toBe(false);
    });
  });
});

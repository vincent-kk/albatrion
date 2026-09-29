import { describe, expect, it } from 'vitest';

import { getPathManager } from '../../getPathManager';
import { createDynamicFunction } from '../createDynamicFunction';

describe('createDynamicFunction', () => {
  describe('simple expressions without JSON pointers', () => {
    it('should execute simple literal expression', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', 'true');
      expect(fn?.([])).toBe(true);
    });

    it('should execute numeric expression', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '42');
      expect(fn?.([])).toBe(42);
    });

    it('should execute string expression', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '"hello"');
      expect(fn?.([])).toBe('hello');
    });

    it('should execute array expression', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '[1, 2, 3]');
      expect(fn?.([])).toEqual([1, 2, 3]);
    });

    it('should execute object expression', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(
        pathManager,
        'test',
        '({ key: "value" })',
      );
      expect(fn?.([])).toEqual({ key: 'value' });
    });

    it('should execute arithmetic expression', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '2 + 3 * 4');
      expect(fn?.([])).toBe(14);
    });
  });
});

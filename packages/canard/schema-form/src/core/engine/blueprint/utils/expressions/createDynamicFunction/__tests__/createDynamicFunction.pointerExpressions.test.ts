import { describe, expect, it } from 'vitest';

import { getPathManager } from '../../getPathManager';
import { createDynamicFunction } from '../createDynamicFunction';

describe('createDynamicFunction', () => {
  describe('expressions with JSON pointers', () => {
    it('should replace single JSON pointer with dependency reference', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '/name');
      // PathManager stores paths with leading slash for absolute paths
      expect(pathManager.get()).toEqual(['/name']);
      expect(fn?.(['Alice'])).toBe('Alice');
    });

    it('should replace multiple JSON pointers with dependency references', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(
        pathManager,
        'test',
        '/firstName + " " + /lastName',
      );
      expect(pathManager.get()).toEqual(['/firstName', '/lastName']);
      expect(fn?.(['John', 'Doe'])).toBe('John Doe');
    });

    it('should replace nested JSON pointer', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(
        pathManager,
        'test',
        '/user/profile/name',
      );
      expect(pathManager.get()).toEqual(['/user/profile/name']);
      expect(fn?.(['Alice'])).toBe('Alice');
    });

    it('should handle comparison with JSON pointer', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(
        pathManager,
        'test',
        '/status === "active"',
      );
      expect(pathManager.get()).toEqual(['/status']);
      expect(fn?.(['active'])).toBe(true);
      expect(fn?.(['inactive'])).toBe(false);
    });

    it('should handle logical expression with JSON pointers', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(
        pathManager,
        'test',
        '/enabled && /value > 0',
      );
      expect(pathManager.get()).toEqual(['/enabled', '/value']);
      expect(fn?.([true, 10])).toBe(true);
      expect(fn?.([true, 0])).toBe(false);
      expect(fn?.([false, 10])).toBe(false);
    });

    it('should handle relative JSON pointer (..)', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '../sibling');
      expect(pathManager.get()).toEqual(['../sibling']);
      expect(fn?.(['siblingValue'])).toBe('siblingValue');
    });

    it('should handle current node reference (.)', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', './child');
      expect(pathManager.get()).toEqual(['./child']);
      expect(fn?.(['childValue'])).toBe('childValue');
    });

    it('should deduplicate repeated JSON pointers', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '/value + /value');
      expect(pathManager.get()).toEqual(['/value']);
      expect(fn?.([5])).toBe(10);
    });
  });
});

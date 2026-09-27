import { describe, expect, it } from 'vitest';

import { getPathManager } from '../../getPathManager';
import { createDynamicFunction } from '../createDynamicFunction';

describe('createDynamicFunction', () => {
  describe('basic functionality', () => {
    it('should return undefined for non-string expression', () => {
      const pathManager = getPathManager();
      expect(
        createDynamicFunction(pathManager, 'test', undefined),
      ).toBeUndefined();
    });

    it('should return undefined for empty string expression', () => {
      const pathManager = getPathManager();
      expect(createDynamicFunction(pathManager, 'test', '')).toBeUndefined();
    });

    it('should return undefined for whitespace-only expression', () => {
      const pathManager = getPathManager();
      expect(createDynamicFunction(pathManager, 'test', '   ')).toBeUndefined();
    });

    it('should return undefined for semicolon-only expression', () => {
      const pathManager = getPathManager();
      expect(createDynamicFunction(pathManager, 'test', ';')).toBeUndefined();
    });

    it('should create a function for valid expression', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', 'true');
      expect(fn).toBeInstanceOf(Function);
    });
  });
});

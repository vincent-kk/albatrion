import { describe, expect, it } from 'vitest';

import { getPathManager } from '../../getPathManager';
import { createDynamicFunction } from '../createDynamicFunction';

describe('createDynamicFunction', () => {
  describe('expression trimming and semicolon removal', () => {
    it('should trim leading whitespace', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '   true');
      expect(fn?.([])).toBe(true);
    });

    it('should trim trailing whitespace', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', 'true   ');
      expect(fn?.([])).toBe(true);
    });

    it('should remove trailing semicolon', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', 'true;');
      expect(fn?.([])).toBe(true);
    });

    it('should handle both trimming and semicolon removal', () => {
      const pathManager = getPathManager();
      const fn = createDynamicFunction(pathManager, 'test', '  true ;  ');
      expect(fn?.([])).toBe(true);
    });
  });
});

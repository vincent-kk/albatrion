import { describe, expect, it } from 'vitest';

import { getPathManager } from '../../getPathManager';
import { createDynamicFunction } from '../createDynamicFunction';

describe('createDynamicFunction', () => {
  describe('error handling', () => {
    it('should throw JSONSchemaError for invalid syntax', () => {
      const pathManager = getPathManager();
      expect(() =>
        createDynamicFunction(pathManager, 'testField', 'return {'),
      ).toThrow('Failed to create dynamic function');
    });

    it('should include field name in error', () => {
      const pathManager = getPathManager();
      try {
        createDynamicFunction(pathManager, 'myField', '{ invalid syntax }}}');
      } catch (e: any) {
        expect(e.message).toContain('myField');
      }
    });

    it('should include original expression in error', () => {
      const pathManager = getPathManager();
      try {
        createDynamicFunction(pathManager, 'test', 'const const = 1');
      } catch (e: any) {
        expect(e.message).toContain('const const = 1');
      }
    });
  });
});

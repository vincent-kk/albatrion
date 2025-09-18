import { describe, expect, it } from 'vitest';

import { getScopedSegment } from '../getScopedSegment';

describe('getScopedSegment', () => {
  describe('empty scope fallback', () => {
    it('should return /name when scope is empty', () => {
      const result = getScopedSegment('field', '');
      expect(result).toBe('field');
    });

    it('should return /name when scope is empty string', () => {
      const result = getScopedSegment('test', '');
      expect(result).toBe('test');
    });
  });

  describe('oneOf/anyOf/allOf scope with switch statement', () => {
    it('should handle oneOf with object parent using switch', () => {
      const result = getScopedSegment('field', 'oneOf', 'object', 0);
      expect(result).toBe('oneOf/0/properties/field');
    });

    it('should handle anyOf with array parent using switch', () => {
      const result = getScopedSegment('field', 'anyOf', 'array', 1);
      expect(result).toBe('anyOf/1/items');
    });

    it('should handle allOf with default case', () => {
      const result = getScopedSegment('field', 'allOf', 'string', 2);
      expect(result).toBe('allOf/2/field');
    });

    it('should handle oneOf without variant', () => {
      const result = getScopedSegment('field', 'oneOf', 'object');
      expect(result).toBe('oneOf/properties/field');
    });

    it('should handle undefined parent type (default case)', () => {
      const result = getScopedSegment('field', 'oneOf', undefined, 0);
      expect(result).toBe('oneOf/0/field');
    });
  });

  describe('properties scope', () => {
    it('should handle properties scope', () => {
      const result = getScopedSegment('fieldName', 'properties');
      expect(result).toBe('properties/fieldName');
    });

    it('should handle properties scope with empty field name', () => {
      const result = getScopedSegment('', 'properties');
      expect(result).toBe('properties/');
    });
  });

  describe('items scope', () => {
    it('should handle items scope without variant', () => {
      const result = getScopedSegment('field', 'items');
      expect(result).toBe('items');
    });

    it('should handle items scope with variant', () => {
      const result = getScopedSegment('field', 'items', 'array', 0);
      expect(result).toBe('items/0');
    });

    it('should handle items scope with large variant number', () => {
      const result = getScopedSegment('field', 'items', 'array', 999);
      expect(result).toBe('items/999');
    });
  });

  describe('custom scope fallback', () => {
    it('should handle custom scope without variant', () => {
      const result = getScopedSegment('field', 'customScope');
      expect(result).toBe('customScope/field');
    });

    it('should handle custom scope with variant', () => {
      const result = getScopedSegment('field', 'customScope', 'object', 1);
      expect(result).toBe('customScope/1/field');
    });

    it('should handle unknown scope with variant', () => {
      const result = getScopedSegment('test', 'unknownType', 'string', 5);
      expect(result).toBe('unknownType/5/test');
    });
  });

  describe('edge cases', () => {
    it('should handle zero variant correctly', () => {
      const result = getScopedSegment('field', 'oneOf', 'object', 0);
      expect(result).toBe('oneOf/0/properties/field');
    });

    it('should handle undefined variant vs zero distinction', () => {
      const withZero = getScopedSegment('field', 'customScope', 'object', 0);
      const withUndefined = getScopedSegment(
        'field',
        'customScope',
        'object',
        undefined,
      );

      expect(withZero).toBe('customScope/0/field');
      expect(withUndefined).toBe('customScope/field');
      expect(withZero).not.toBe(withUndefined);
    });

    it('should handle negative variant numbers', () => {
      const result = getScopedSegment('field', 'oneOf', 'object', -1);
      expect(result).toBe('oneOf/-1/properties/field');
    });

    it('should handle special characters in field names', () => {
      const result = getScopedSegment('field/with/slashes', 'properties');
      expect(result).toBe('properties/field/with/slashes');
    });
  });

  describe('$S separator usage', () => {
    it('should use JSONPointer separator consistently', () => {
      const result = getScopedSegment('field', 'properties');
      expect(result.startsWith('/')).toBe(false);
      expect(result.split('/').length).toBe(2); // ['', 'properties', 'field']
    });
  });
});

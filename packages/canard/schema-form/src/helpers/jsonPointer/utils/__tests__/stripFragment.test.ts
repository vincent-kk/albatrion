import { describe, expect, it } from 'vitest';

import { stripFragment } from '../stripFragment';

describe('stripFragment', () => {
  describe('fragment paths (starting with #)', () => {
    it('should strip # and return the rest for "#/foo/bar"', () => {
      expect(stripFragment('#/foo/bar')).toBe('/foo/bar');
    });

    it('should strip # and return the rest for "#/foo"', () => {
      expect(stripFragment('#/foo')).toBe('/foo');
    });

    it('should return empty string for fragment-only "#" (root)', () => {
      expect(stripFragment('#')).toBe('');
    });

    it('should handle nested fragment paths', () => {
      expect(stripFragment('#/properties/user/name')).toBe(
        '/properties/user/name',
      );
    });

    it('should handle fragment paths with special characters', () => {
      expect(stripFragment('#/foo~0bar')).toBe('/foo~0bar');
      expect(stripFragment('#/foo~1bar')).toBe('/foo~1bar');
    });

    it('should handle fragment paths with array indices', () => {
      expect(stripFragment('#/items/0/name')).toBe('/items/0/name');
    });
  });

  describe('absolute paths (starting with /)', () => {
    it('should return as-is for "/foo/bar"', () => {
      expect(stripFragment('/foo/bar')).toBe('/foo/bar');
    });

    it('should return as-is for "/foo"', () => {
      expect(stripFragment('/foo')).toBe('/foo');
    });

    it('should return empty string for "/" (root)', () => {
      // "/" alone represents root in this context, should be normalized to ""
      expect(stripFragment('/')).toBe('');
    });

    it('should handle nested absolute paths', () => {
      expect(stripFragment('/properties/user/name')).toBe(
        '/properties/user/name',
      );
    });
  });

  describe('root paths', () => {
    it('should return empty string for "#" (fragment root)', () => {
      expect(stripFragment('#')).toBe('');
    });

    it('should return empty string for "#/" (fragment separator root)', () => {
      expect(stripFragment('#/')).toBe('');
    });

    it('should return empty string for "/" (separator root)', () => {
      expect(stripFragment('/')).toBe('');
    });

    it('should return empty string for "" (JSON Pointer root)', () => {
      expect(stripFragment('')).toBe('');
    });
  });

  describe('relative paths', () => {
    it('should return as-is for relative path "./foo"', () => {
      expect(stripFragment('./foo')).toBe('./foo');
    });

    it('should return as-is for parent relative path "../foo"', () => {
      expect(stripFragment('../foo')).toBe('../foo');
    });
  });

  describe('edge cases', () => {
    it('should return as-is for plain string without special prefix', () => {
      expect(stripFragment('foo')).toBe('foo');
      expect(stripFragment('foo/bar')).toBe('foo/bar');
    });

    it('should handle multiple # characters', () => {
      expect(stripFragment('##/foo')).toBe('#/foo');
    });
  });
});

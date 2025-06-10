import { describe, expect, it } from 'vitest';

import { isAbsolutePath } from '../../../../../../../canard/schema-form/src/helpers/jsonPointer/utils/isAbsolutePath';

describe('isAbsolutePath', () => {
  describe('absolute paths', () => {
    it('should return true for path starting with "/"', () => {
      expect(isAbsolutePath('/foo/bar')).toBe(true);
    });

    it('should return true for path starting with "#/"', () => {
      expect(isAbsolutePath('#/foo/bar')).toBe(true);
    });

    it('should return true for root path "/"', () => {
      expect(isAbsolutePath('/')).toBe(true);
    });

    it('should return true for fragment root path "#/"', () => {
      expect(isAbsolutePath('#/')).toBe(true);
    });

    it('should return true for nested absolute paths', () => {
      expect(isAbsolutePath('/foo/bar/baz')).toBe(true);
      expect(isAbsolutePath('#/foo/bar/baz')).toBe(true);
    });

    it('should return true for absolute paths with special characters', () => {
      expect(isAbsolutePath('/foo-bar/baz_qux')).toBe(true);
      expect(isAbsolutePath('#/foo-bar/baz_qux')).toBe(true);
    });
  });

  describe('relative paths', () => {
    it('should return false for current directory relative path', () => {
      expect(isAbsolutePath('./foo/bar')).toBe(false);
    });

    it('should return false for parent directory relative path', () => {
      expect(isAbsolutePath('../foo/bar')).toBe(false);
    });

    it('should return false for multiple parent directory relative path', () => {
      expect(isAbsolutePath('../../foo/bar')).toBe(false);
      expect(isAbsolutePath('../../foo/bar/baz')).toBe(false);
    });

    it('should return false for deeply nested relative paths', () => {
      expect(isAbsolutePath('../../../foo/bar/baz')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return false for empty string', () => {
      expect(isAbsolutePath('')).toBe(false);
    });

    it('should return false for string starting with only "#"', () => {
      expect(isAbsolutePath('#')).toBe(false);
    });

    it('should return false for string starting with only "."', () => {
      expect(isAbsolutePath('.')).toBe(false);
    });

    it('should return false for string starting with ".."', () => {
      expect(isAbsolutePath('..')).toBe(false);
    });

    it('should return false for paths not starting with "/" or "#/"', () => {
      expect(isAbsolutePath('foo/bar')).toBe(false);
      expect(isAbsolutePath('foo')).toBe(false);
    });

    it('should return false for paths starting with "#" but not followed by "/"', () => {
      expect(isAbsolutePath('#foo')).toBe(false);
      expect(isAbsolutePath('#foo/bar')).toBe(false);
    });
  });

  describe('malformed inputs', () => {
    it('should handle single character inputs', () => {
      expect(isAbsolutePath('/')).toBe(true);
      expect(isAbsolutePath('#')).toBe(false);
      expect(isAbsolutePath('.')).toBe(false);
      expect(isAbsolutePath('a')).toBe(false);
    });

    it('should handle two character inputs', () => {
      expect(isAbsolutePath('#/')).toBe(true);
      expect(isAbsolutePath('./')).toBe(false);
      expect(isAbsolutePath('..')).toBe(false);
    });
  });
});

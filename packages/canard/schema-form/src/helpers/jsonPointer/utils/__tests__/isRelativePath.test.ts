import { describe, expect, it } from 'vitest';

import { isRelativePath } from '../isRelativePath';

describe('isRelativePath', () => {
  describe('relative paths', () => {
    it('should return true for current directory relative path', () => {
      expect(isRelativePath('./foo/bar')).toBe(true);
    });

    it('should return true for parent directory relative path', () => {
      expect(isRelativePath('../foo/bar')).toBe(true);
    });

    it('should return true for deeply nested relative paths', () => {
      expect(isRelativePath('../foo/bar/baz')).toBe(true);
      expect(isRelativePath('../../foo/bar/baz/qux')).toBe(true);
      expect(isRelativePath('../../foo/bar/baz/qux/quux')).toBe(true);
      expect(isRelativePath('../../foo/bar/baz/qux/quux/corge')).toBe(true);
    });

    it('should return true for multiple parent directory traversals', () => {
      expect(isRelativePath('../../../foo')).toBe(true);
      expect(isRelativePath('../../../../foo/bar')).toBe(true);
    });

    it('should return true for relative paths with special characters', () => {
      expect(isRelativePath('./foo-bar/baz_qux')).toBe(true);
      expect(isRelativePath('../foo-bar/baz_qux')).toBe(true);
    });

    it('should return true for relative path to root', () => {
      expect(isRelativePath('./')).toBe(true);
      expect(isRelativePath('../')).toBe(true);
    });
  });

  describe('absolute paths', () => {
    it('should return false for absolute path starting with "/"', () => {
      expect(isRelativePath('/foo/bar')).toBe(false);
    });

    it('should return false for absolute path starting with "#/"', () => {
      expect(isRelativePath('#/foo/bar')).toBe(false);
    });

    it('should return false for root paths', () => {
      expect(isRelativePath('/')).toBe(false);
      expect(isRelativePath('#/')).toBe(false);
    });

    it('should return false for nested absolute paths', () => {
      expect(isRelativePath('/foo/bar/baz')).toBe(false);
      expect(isRelativePath('#/foo/bar/baz')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return false for empty string', () => {
      expect(isRelativePath('')).toBe(false);
    });

    it('should return false for string starting with only "."', () => {
      expect(isRelativePath('.')).toBe(false);
    });

    it('should return false for string starting with ".." but no "/"', () => {
      expect(isRelativePath('..')).toBe(false);
    });

    it('should return false for paths not starting with "./" or "../"', () => {
      expect(isRelativePath('foo/bar')).toBe(false);
      expect(isRelativePath('foo')).toBe(false);
    });

    it('should return false for paths starting with "#"', () => {
      expect(isRelativePath('#foo')).toBe(false);
      expect(isRelativePath('#foo/bar')).toBe(false);
    });
  });

  describe('malformed inputs', () => {
    it('should handle single character inputs', () => {
      expect(isRelativePath('/')).toBe(false);
      expect(isRelativePath('#')).toBe(false);
      expect(isRelativePath('.')).toBe(false);
      expect(isRelativePath('a')).toBe(false);
    });

    it('should handle two character inputs', () => {
      expect(isRelativePath('#/')).toBe(false);
      expect(isRelativePath('./')).toBe(true);
      expect(isRelativePath('..')).toBe(false);
    });

    it('should handle three character inputs', () => {
      expect(isRelativePath('../')).toBe(true);
      expect(isRelativePath('./a')).toBe(true);
      expect(isRelativePath('../a')).toBe(true);
    });
  });

  describe('boundary conditions', () => {
    it('should correctly identify the minimum valid relative paths', () => {
      expect(isRelativePath('./')).toBe(true);
      expect(isRelativePath('../')).toBe(true);
    });

    it('should return false for paths that start with "." but are not relative', () => {
      expect(isRelativePath('.foo')).toBe(false);
      expect(isRelativePath('..foo')).toBe(false);
      expect(isRelativePath('.foo/bar')).toBe(false);
    });
  });
});

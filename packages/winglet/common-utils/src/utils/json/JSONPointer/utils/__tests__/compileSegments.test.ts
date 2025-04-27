import { describe, expect, it } from 'vitest';

import { compilePointer } from '../compileSegments';
import { JSONPointerError } from '../error';

describe('compilePointer', () => {
  describe('string pointer handling', () => {
    it('should handle empty string', () => {
      expect(compilePointer('')).toEqual([]);
    });

    it('should handle root pointer', () => {
      expect(compilePointer('#')).toEqual([]);
    });

    it('should handle simple paths', () => {
      expect(compilePointer('/foo')).toEqual(['foo']);
      expect(compilePointer('/foo/bar')).toEqual(['foo', 'bar']);
    });

    it('should handle escaped characters', () => {
      expect(compilePointer('/foo/~0bar')).toEqual(['foo', '~bar']);
      expect(compilePointer('/foo/~1bar')).toEqual(['foo', '/bar']);
    });

    it('should throw error for invalid pointer format', () => {
      expect(() => compilePointer('foo')).toThrow(JSONPointerError);
      expect(() => compilePointer('foo/bar')).toThrow(JSONPointerError);
    });
  });

  describe('array pointer handling', () => {
    it('should handle string array', () => {
      expect(compilePointer(['foo', 'bar'])).toEqual(['foo', 'bar']);
    });

    it('should handle mixed string and number array', () => {
      expect(compilePointer(['foo', '0', 'bar'])).toEqual(['foo', '0', 'bar']);
    });

    it('should throw error for invalid array elements', () => {
      expect(() => compilePointer(['foo', {} as any])).toThrow(
        JSONPointerError,
      );
      expect(() => compilePointer(['foo', [] as any])).toThrow(
        JSONPointerError,
      );
      expect(() => compilePointer(['foo', null as any])).toThrow(
        JSONPointerError,
      );
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid pointer types', () => {
      expect(() => compilePointer({} as any)).toThrow(JSONPointerError);
      expect(() => compilePointer(null as any)).toThrow(JSONPointerError);
      expect(() => compilePointer(undefined as any)).toThrow(JSONPointerError);
      expect(() => compilePointer(42 as any)).toThrow(JSONPointerError);
    });
  });
});

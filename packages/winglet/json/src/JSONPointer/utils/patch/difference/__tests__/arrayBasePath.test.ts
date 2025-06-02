import { describe, expect, it } from 'vitest';

import { getArrayBasePath } from '../utils/getArrayBasePath';

describe('getArrayBasePath with escape characters', () => {
  describe('Basic array path detection', () => {
    it('should return null for non-array paths', () => {
      expect(getArrayBasePath('/simple')).toBe(null);
      expect(getArrayBasePath('/nested/object')).toBe(null);
      expect(getArrayBasePath('')).toBe(null);
    });

    it('should detect simple array paths', () => {
      expect(getArrayBasePath('/array/0')).toBe('/array');
      expect(getArrayBasePath('/array/1')).toBe('/array');
      expect(getArrayBasePath('/array/10')).toBe('/array');
    });
  });

  describe('Array paths with escape characters', () => {
    it('should handle array paths containing forward slash in key names', () => {
      // Key가 "path/to/array"인 배열의 인덱스 0
      expect(getArrayBasePath('/path~1to~1array/0')).toBe('/path~1to~1array');
      expect(getArrayBasePath('/path~1to~1array/5')).toBe('/path~1to~1array');

      // 실제 키 이름에 "/"가 있는 경우
      expect(getArrayBasePath('/src~1components~1Button.tsx/0')).toBe(
        '/src~1components~1Button.tsx',
      );
    });

    it('should handle array paths containing tilde in key names', () => {
      // Key가 "config~settings"인 배열의 인덱스 0
      expect(getArrayBasePath('/config~0settings/0')).toBe('/config~0settings');
      expect(getArrayBasePath('/config~0settings/3')).toBe('/config~0settings');

      // 여러 틸드가 있는 경우
      expect(getArrayBasePath('/key~0with~0multiple~0tildes/0')).toBe(
        '/key~0with~0multiple~0tildes',
      );
    });

    it('should handle array paths with both forward slash and tilde', () => {
      // Key가 "path/to~config"인 배열
      expect(getArrayBasePath('/path~1to~0config/0')).toBe('/path~1to~0config');
      expect(getArrayBasePath('/path~1to~0config/7')).toBe('/path~1to~0config');

      // 복잡한 이스케이프 조합
      expect(getArrayBasePath('/complex~1path~0with~1many~0escapes/0')).toBe(
        '/complex~1path~0with~1many~0escapes',
      );
    });

    it('should handle nested array paths with escape characters', () => {
      // Nested path: "parent/key" -> "child~array" -> index 0
      expect(getArrayBasePath('/parent~1key/child~0array/0')).toBe(
        '/parent~1key/child~0array',
      );

      // Deep nesting with escapes
      expect(getArrayBasePath('/level1~1key/level2~0key/level3~1array/0')).toBe(
        '/level1~1key/level2~0key/level3~1array',
      );
    });
  });

  describe('Edge cases with escape characters', () => {
    it('should handle array paths where the key is only escape characters', () => {
      // Key가 "/"인 배열
      expect(getArrayBasePath('/~1/0')).toBe('/~1');

      // Key가 "~"인 배열
      expect(getArrayBasePath('/~0/0')).toBe('/~0');

      // Key가 "/~"인 배열
      expect(getArrayBasePath('/~1~0/0')).toBe('/~1~0');

      // Key가 "~~"인 배열
      expect(getArrayBasePath('/~0~0/0')).toBe('/~0~0');
    });

    it('should handle root level arrays with escape character names', () => {
      // Root level array with escaped name
      expect(getArrayBasePath('/array~1name/0')).toBe('/array~1name');
      expect(getArrayBasePath('/array~0name/0')).toBe('/array~0name');
    });

    it('should handle multi-digit array indices with escape characters', () => {
      expect(getArrayBasePath('/path~1to~1array/123')).toBe('/path~1to~1array');
      expect(getArrayBasePath('/config~0settings/999')).toBe(
        '/config~0settings',
      );
    });

    it('should return null for invalid array paths with escape characters', () => {
      // 숫자가 아닌 경우
      expect(getArrayBasePath('/path~1to~1array/notanumber')).toBe(null);
      expect(getArrayBasePath('/config~0settings/abc')).toBe(null);

      // 빈 인덱스
      expect(getArrayBasePath('/path~1to~1array/')).toBe(null);

      // 음수 인덱스
      expect(getArrayBasePath('/path~1to~1array/-1')).toBe(null);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle file path-like array keys', () => {
      expect(getArrayBasePath('/src~1components~1files/0')).toBe(
        '/src~1components~1files',
      );
      expect(getArrayBasePath('/assets~1images~1gallery/5')).toBe(
        '/assets~1images~1gallery',
      );
    });

    it('should handle URL-like array keys', () => {
      expect(getArrayBasePath('/https:~1~1api.example.com~1users/0')).toBe(
        '/https:~1~1api.example.com~1users',
      );
      expect(getArrayBasePath('/api~1v1~1endpoints/2')).toBe(
        '/api~1v1~1endpoints',
      );
    });

    it('should handle configuration namespace array keys', () => {
      expect(getArrayBasePath('/database~1connections~0pool/0')).toBe(
        '/database~1connections~0pool',
      );
      expect(getArrayBasePath('/cache~0config~1redis~0settings/1')).toBe(
        '/cache~0config~1redis~0settings',
      );
    });

    it('should handle deeply nested arrays with multiple escape levels', () => {
      // Complex nested structure: app/config -> services~list -> endpoints/v1 -> array index
      expect(
        getArrayBasePath('/app~1config/services~0list/endpoints~1v1/0'),
      ).toBe('/app~1config/services~0list/endpoints~1v1');

      // Very deep nesting
      expect(getArrayBasePath('/a~1b/c~0d/e~1f/g~0h/array~1name/0')).toBe(
        '/a~1b/c~0d/e~1f/g~0h/array~1name',
      );
    });
  });

  describe('Performance considerations', () => {
    it('should handle very long paths with many escape characters efficiently', () => {
      const longPath =
        '/very~1long~0path~1with~0many~1segments~0and~1escapes~0throughout~1the~0entire~1path~0structure/0';
      const expectedBasePath =
        '/very~1long~0path~1with~0many~1segments~0and~1escapes~0throughout~1the~0entire~1path~0structure';

      expect(getArrayBasePath(longPath)).toBe(expectedBasePath);
    });

    it('should handle paths with consecutive escape sequences', () => {
      // Multiple consecutive escape sequences
      expect(getArrayBasePath('/key~1~0~1~0name/0')).toBe('/key~1~0~1~0name');
      expect(getArrayBasePath('/~1~0~1~0~1~0/0')).toBe('/~1~0~1~0~1~0');
    });
  });
});

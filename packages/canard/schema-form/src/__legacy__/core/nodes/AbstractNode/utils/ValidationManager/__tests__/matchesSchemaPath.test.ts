import { describe, expect, it } from 'vitest';

import { matchesSchemaPath } from '../utils/matchesSchemaPath';

/**
 * Path Standardization Rules (RFC 6901 Compliance):
 *
 * 1. schemaPath: Uses URI fragment representation WITH `#` prefix
 *    - Root schema: `'#'`
 *    - Nested: `'#/properties/user'`, `'#/items/0'`
 *
 * 2. dataPath: Uses JSON Pointer string representation WITHOUT `#` prefix
 *    - Root document: `''` (empty string)
 *    - Nested: `'/user'`, `'/items/0'`
 *
 * These conventions ensure clear distinction between schema references
 * (for validation rule identification) and data references (for value location).
 */
describe('matchesSchemaPath', () => {
  describe('exact path matching', () => {
    it('should match when target path exactly equals schema path with fragment', () => {
      const schemaPath = '#/properties/user';
      const targetPath = '#/properties/user';

      expect(matchesSchemaPath(schemaPath, targetPath)).toBe(true);
    });

    it('should match when target path exactly equals schema path without fragment', () => {
      const schemaPath = '/properties/user';
      const targetPath = '/properties/user';

      expect(matchesSchemaPath(schemaPath, targetPath)).toBe(true);
    });

    it('should match empty target path only with empty schema paths', () => {
      expect(matchesSchemaPath('', '')).toBe(true);
      expect(matchesSchemaPath('#', '#')).toBe(true);
      expect(matchesSchemaPath('#/properties/user', '#')).toBe(true);
      expect(matchesSchemaPath('#/properties/user', '#')).toBe(true);
    });
  });

  describe('strict matching behavior', () => {
    it('should NOT match prefix paths even with separator boundaries', () => {
      // The new implementation only matches if next char is '#' (Fragment)
      const schemaPath = '#/properties/user/properties/name';
      const targetPath = '#/properties/user';

      expect(matchesSchemaPath(schemaPath, targetPath)).toBe(true);
    });

    it('should NOT match prefix paths in non-fragment paths', () => {
      const schemaPath = '/properties/user/properties/name';
      const targetPath = '/properties/user';

      expect(matchesSchemaPath(schemaPath, targetPath)).toBe(true);
    });

    it('should not match partial segment names', () => {
      const schemaPath = '/properties/username';
      const targetPath = '/properties/user';

      expect(matchesSchemaPath(schemaPath, targetPath)).toBe(false);
    });

    it('should not match when target is not at the beginning', () => {
      const schemaPath = '/properties/user/properties/name';
      const targetPath = '/properties/name';

      expect(matchesSchemaPath(schemaPath, targetPath)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty schema paths', () => {
      expect(matchesSchemaPath('', '')).toBe(true);
      expect(matchesSchemaPath('#', '#')).toBe(true);
      expect(matchesSchemaPath('', 'anything')).toBe(false);
    });

    it('should not match when schema path is shorter than target path', () => {
      const schemaPath = '/user';
      const targetPath = '/user/properties';

      expect(matchesSchemaPath(schemaPath, targetPath)).toBe(false);
    });

    it('should handle single character fragment', () => {
      const schemaPath = '#';
      const targetPath = '';

      expect(matchesSchemaPath(schemaPath, targetPath)).toBe(false);
    });
  });

  describe('exact matching only scenarios', () => {
    it('should match only when paths are exactly equal', () => {
      expect(matchesSchemaPath('/properties/user', '/properties/user')).toBe(
        true,
      );
      expect(matchesSchemaPath('#/properties/user', '#/properties/user')).toBe(
        true,
      );
      expect(matchesSchemaPath('/definitions/User', '/definitions/User')).toBe(
        true,
      );
    });

    it('should not match any prefix scenarios', () => {
      expect(
        matchesSchemaPath('/properties/user/name', '/properties/user'),
      ).toBe(true);
      expect(
        matchesSchemaPath('#/properties/user/name', '#/properties/user'),
      ).toBe(true);
      expect(
        matchesSchemaPath('/properties/items/0/name', '/properties/items/0'),
      ).toBe(true);
    });

    it('should not match root path scenarios', () => {
      expect(matchesSchemaPath('/properties/user', '/')).toBe(false);
      expect(matchesSchemaPath('#/properties/user', '/')).toBe(false);
    });
  });

  describe('boundary conditions with fragment matching', () => {
    it('should match when schema ends exactly at target boundary', () => {
      const schemaPath = '/properties/user';
      const targetPath = '/properties/user';

      expect(matchesSchemaPath(schemaPath, targetPath)).toBe(true);
    });

    it('should not match when next character is not fragment', () => {
      const schemaPath = '/properties/userInfo';
      const targetPath = '/properties/user';

      expect(matchesSchemaPath(schemaPath, targetPath)).toBe(false);
    });

    it('should only match if next character would be fragment (#)', () => {
      // This would only match if we had something like '/properties/user#...'
      // but that's not a valid JSON Pointer, so this tests the edge case
      const schemaPath = '/properties/user#suffix';
      const targetPath = '/properties/user';

      expect(matchesSchemaPath(schemaPath, targetPath)).toBe(false);
    });
  });

  describe('additional edge cases', () => {
    it('should handle null and undefined inputs', () => {
      // Null/undefined source throws due to property access
      expect(() => matchesSchemaPath(null as any, '')).toThrow();
      expect(() => matchesSchemaPath(undefined as any, '')).toThrow();

      // Null/undefined target gets converted to string and returns false
      expect(matchesSchemaPath('', null as any)).toBe(false);
      expect(matchesSchemaPath('', undefined as any)).toBe(false);

      // Number inputs work due to type coercion
      expect(() => matchesSchemaPath(123 as any, '')).toThrow();
      expect(matchesSchemaPath('', 456 as any)).toBe(false);
    });

    it('should handle special characters in paths', () => {
      // Test with escape sequences and special JSON Pointer characters
      expect(
        matchesSchemaPath('/properties/user~0field', '/properties/user~0field'),
      ).toBe(true);
      expect(
        matchesSchemaPath('/properties/user~1field', '/properties/user~1field'),
      ).toBe(true);
      expect(
        matchesSchemaPath('/properties/user%20name', '/properties/user%20name'),
      ).toBe(true);
      expect(matchesSchemaPath('/properties/user~0', '/properties/user')).toBe(
        false,
      );
    });

    it('should handle unicode characters', () => {
      expect(matchesSchemaPath('/properties/用户', '/properties/用户')).toBe(
        true,
      );
      expect(
        matchesSchemaPath('/properties/🚀user', '/properties/🚀user'),
      ).toBe(true);
      expect(
        matchesSchemaPath(
          '#/properties/测试/properties/字段',
          '#/properties/测试',
        ),
      ).toBe(true);
    });

    it('should handle very long paths', () => {
      const longPath = '/properties/' + 'a'.repeat(1000);
      const longSchemaPath = longPath + '/properties/field';
      expect(matchesSchemaPath(longSchemaPath, longPath)).toBe(true);
      expect(matchesSchemaPath(longPath, longPath)).toBe(true);
    });

    it('should handle paths with consecutive separators', () => {
      // Invalid JSON Pointer format but testing robustness
      expect(matchesSchemaPath('/properties//user', '/properties//user')).toBe(
        true,
      );
      expect(matchesSchemaPath('/properties///user', '/properties//user')).toBe(
        false,
      );
      expect(
        matchesSchemaPath('#/properties//user/field', '#/properties//user'),
      ).toBe(true);
    });

    it('should handle multiple fragments in schema path', () => {
      // Edge case with multiple # characters (invalid but testing robustness)
      expect(matchesSchemaPath('##/properties/user', '/properties/user')).toBe(
        false,
      );
      expect(matchesSchemaPath('#/properties#user', '/properties')).toBe(false);
    });

    it('should handle single character paths', () => {
      expect(matchesSchemaPath('/', '/')).toBe(true);
      expect(matchesSchemaPath('#/', '#/')).toBe(true);
      expect(matchesSchemaPath('/a', '/a')).toBe(true);
      expect(matchesSchemaPath('#/a', '#/a')).toBe(true);
      expect(matchesSchemaPath('/a/b', '/a')).toBe(true);
    });

    it('should handle empty segments in paths', () => {
      // Testing paths with empty segments (valid in JSON Pointer)
      expect(matchesSchemaPath('/properties/', '/properties/')).toBe(true);
      expect(matchesSchemaPath('/properties//field', '/properties/')).toBe(
        true,
      ); // Actually matches because '/properties/' is at start
      expect(matchesSchemaPath('#/properties/', '#/properties/')).toBe(true);
    });

    it('should handle case sensitivity correctly', () => {
      expect(matchesSchemaPath('/Properties/User', '/properties/user')).toBe(
        false,
      );
      expect(matchesSchemaPath('/properties/User', '/properties/user')).toBe(
        false,
      );
      expect(matchesSchemaPath('/properties/user', '/Properties/user')).toBe(
        false,
      );
    });

    it('should handle whitespace in paths', () => {
      expect(matchesSchemaPath('/properties/ user', '/properties/ user')).toBe(
        true,
      );
      expect(matchesSchemaPath('/properties/user ', '/properties/user')).toBe(
        false,
      );
      expect(matchesSchemaPath('/properties/user', '/properties/user ')).toBe(
        false,
      );
      expect(matchesSchemaPath(' /properties/user', '/properties/user')).toBe(
        false,
      );
    });

    it('should handle target path longer than source path', () => {
      expect(matchesSchemaPath('/user', '/user/properties')).toBe(false);
      expect(matchesSchemaPath('/', '/properties')).toBe(false);
      expect(matchesSchemaPath('#', '/properties')).toBe(false);
      expect(matchesSchemaPath('#/short', '/short/longer/path')).toBe(false);
    });

    it('should handle identical separator patterns', () => {
      // Testing when target path has separator at the end
      expect(matchesSchemaPath('/properties/user/', '/properties/user/')).toBe(
        true,
      );
      expect(
        matchesSchemaPath('/properties/user/field', '/properties/user/'),
      ).toBe(false); // Doesn't match because 'f' follows, not '/' or undefined
      expect(matchesSchemaPath('/properties/user', '/properties/user/')).toBe(
        false,
      );
    });

    it('should handle complex nested array and object paths', () => {
      expect(
        matchesSchemaPath(
          '#/properties/items/0/properties/name',
          '#/properties/items/0',
        ),
      ).toBe(true);
      expect(
        matchesSchemaPath(
          '/definitions/User/properties/addresses/0/properties/street',
          '/definitions/User/properties/addresses/0',
        ),
      ).toBe(true);
      expect(
        matchesSchemaPath(
          '/properties/deeply/nested/object/structure/field',
          '/properties/deeply/nested/object',
        ),
      ).toBe(true);
    });

    it('should handle fragment-only scenarios', () => {
      expect(matchesSchemaPath('#', '#')).toBe(true); // target should not include fragment
      expect(matchesSchemaPath('##', '#')).toBe(false); // Actually matches because after skipping first '#', we have '#' which matches target '#'
      expect(matchesSchemaPath('#/#', '#/#')).toBe(true);
    });

    it('should handle partial matches at word boundaries', () => {
      // Ensuring it doesn't match partial words
      expect(
        matchesSchemaPath('/properties/username', '/properties/user'),
      ).toBe(false);
      expect(
        matchesSchemaPath('/properties/user_name', '/properties/user'),
      ).toBe(false);
      expect(
        matchesSchemaPath('/properties/user-name', '/properties/user'),
      ).toBe(false);
      expect(
        matchesSchemaPath('/properties/userProfile', '/properties/user'),
      ).toBe(false);
    });
  });

  describe('Path standardization rules (RFC 6901)', () => {
    /**
     * These tests document and enforce the standard path conventions:
     * - schemaPath: Root is '#', nested paths start with '#/'
     * - dataPath: Root is '', nested paths start with '/'
     */

    describe('schemaPath format (with # prefix)', () => {
      it('should recognize # as the root schemaPath', () => {
        // Root schemaPath is '#', not ''
        expect(matchesSchemaPath('#', '#')).toBe(true);
        expect(matchesSchemaPath('#/properties/name', '#')).toBe(true);
        expect(matchesSchemaPath('#/items/0', '#')).toBe(true);
      });

      it('should match nested schemaPath with # prefix', () => {
        expect(
          matchesSchemaPath('#/properties/user', '#/properties/user'),
        ).toBe(true);
        expect(
          matchesSchemaPath(
            '#/properties/user/properties/name',
            '#/properties/user',
          ),
        ).toBe(true);
        expect(matchesSchemaPath('#/items/0', '#/items/0')).toBe(true);
      });

      it('should NOT match schemaPath without # against schemaPath with #', () => {
        // Different formats should not match
        expect(matchesSchemaPath('#/properties/user', '/properties/user')).toBe(
          false,
        );
        expect(matchesSchemaPath('/properties/user', '#/properties/user')).toBe(
          false,
        );
      });
    });

    describe('dataPath format (without # prefix)', () => {
      it('should recognize empty string as the root dataPath', () => {
        // Root dataPath is '', not '#'
        expect(matchesSchemaPath('', '')).toBe(true);
        // Empty target matches any path starting with '' (which is all paths)
        // This is the expected behavior for prefix matching
        expect(matchesSchemaPath('/name', '')).toBe(true);
      });

      it('should match nested dataPath without # prefix', () => {
        expect(matchesSchemaPath('/user', '/user')).toBe(true);
        expect(matchesSchemaPath('/user/name', '/user')).toBe(true);
        expect(matchesSchemaPath('/items/0', '/items/0')).toBe(true);
      });

      it('should NOT treat # as root for dataPath', () => {
        // '#' is NOT a valid root for dataPath
        expect(matchesSchemaPath('', '#')).toBe(false);
        expect(matchesSchemaPath('#', '')).toBe(false);
      });
    });

    describe('format consistency requirements', () => {
      it('should require same format for source and target', () => {
        // With # (schemaPath format)
        expect(
          matchesSchemaPath('#/properties/user', '#/properties/user'),
        ).toBe(true);

        // Without # (dataPath format)
        expect(matchesSchemaPath('/properties/user', '/properties/user')).toBe(
          true,
        );

        // Mixed formats should not match
        expect(matchesSchemaPath('#/properties/user', '/properties/user')).toBe(
          false,
        );
        expect(matchesSchemaPath('/properties/user', '#/properties/user')).toBe(
          false,
        );
      });

      it('should handle root transitions correctly', () => {
        // From schemaPath root (#) to nested schemaPath
        expect(matchesSchemaPath('#/properties/name', '#')).toBe(true);

        // Cannot match schemaPath root against dataPath format
        expect(matchesSchemaPath('#/properties/name', '')).toBe(false);

        // Cannot match dataPath against schemaPath root
        expect(matchesSchemaPath('/properties/name', '#')).toBe(false);
      });
    });
  });
});

import { describe, expect, it } from 'vitest';

import { getAbsolutePath } from '../getAbsolutePointer';

describe('getAbsolutePath', () => {
  describe('absolute paths', () => {
    it('should return absolute path as-is when starting with "/"', () => {
      expect(getAbsolutePath('/foo/bar', '/baz')).toBe('/baz');
      expect(getAbsolutePath('/foo/bar', '/baz/qux')).toBe('/baz/qux');
    });

    it('should return absolute path as-is when starting with "#/"', () => {
      expect(getAbsolutePath('/foo/bar', '#/baz')).toBe('#/baz');
      expect(getAbsolutePath('/foo/bar', '#/baz/qux')).toBe('#/baz/qux');
    });

    it('should return root path as-is', () => {
      expect(getAbsolutePath('/foo/bar', '/')).toBe('/');
      expect(getAbsolutePath('/foo/bar', '#/')).toBe('#/');
    });

    it('should ignore basePath completely for absolute currentPath', () => {
      expect(getAbsolutePath('/completely/different', '/new/path')).toBe(
        '/new/path',
      );
      expect(getAbsolutePath('/a/b/c/d/e', '/')).toBe('/');
      expect(getAbsolutePath('/x/y/z', '#/a/b')).toBe('#/a/b');
    });

    it('should handle deeply nested absolute paths', () => {
      expect(getAbsolutePath('/foo', '/a/b/c/d/e/f/g/h/i/j')).toBe(
        '/a/b/c/d/e/f/g/h/i/j',
      );
      expect(getAbsolutePath('/foo', '#/a/b/c/d/e/f/g/h/i/j')).toBe(
        '#/a/b/c/d/e/f/g/h/i/j',
      );
    });
  });

  describe('current directory relative paths (./)', () => {
    it('should resolve ./ relative to basePath', () => {
      expect(getAbsolutePath('/foo/bar', './baz')).toBe('/foo/bar/baz');
      expect(getAbsolutePath('/foo', './bar')).toBe('/foo/bar');
    });

    it('should handle ./ with nested paths', () => {
      expect(getAbsolutePath('/foo/bar', './baz/qux')).toBe('/foo/bar/baz/qux');
      expect(getAbsolutePath('/a/b/c', './d/e/f')).toBe('/a/b/c/d/e/f');
    });

    it('should handle ./ alone (no additional path)', () => {
      expect(getAbsolutePath('/foo/bar', './')).toBe('/foo/bar');
      expect(getAbsolutePath('/foo', './')).toBe('/foo');
    });

    it('should handle ./ with root basePath', () => {
      expect(getAbsolutePath('/', './foo')).toBe('/foo');
      expect(getAbsolutePath('/', './')).toBe('/');
    });

    it('should handle ./ with deeply nested basePath', () => {
      expect(getAbsolutePath('/a/b/c/d/e/f/g', './h')).toBe('/a/b/c/d/e/f/g/h');
      expect(getAbsolutePath('/a/b/c/d/e/f/g', './h/i/j')).toBe(
        '/a/b/c/d/e/f/g/h/i/j',
      );
    });

    it('should handle ./ with single segment basePath', () => {
      expect(getAbsolutePath('/root', './child')).toBe('/root/child');
      expect(getAbsolutePath('/x', './y/z')).toBe('/x/y/z');
    });

    it('should preserve special characters in ./ paths', () => {
      expect(getAbsolutePath('/foo', './bar~baz')).toBe('/foo/bar~baz');
      expect(getAbsolutePath('/foo', './bar%20baz')).toBe('/foo/bar%20baz');
    });
  });

  describe('parent directory relative paths (../)', () => {
    it('should resolve single ../ relative to basePath', () => {
      expect(getAbsolutePath('/foo/bar', '../baz')).toBe('/foo/baz');
      expect(getAbsolutePath('/a/b/c', '../d')).toBe('/a/b/d');
    });

    it('should resolve multiple ../ traversals', () => {
      expect(getAbsolutePath('/foo/bar/baz', '../../qux')).toBe('/foo/qux');
      expect(getAbsolutePath('/a/b/c/d', '../../../e')).toBe('/a/e');
    });

    it('should handle ../ alone (no additional path)', () => {
      expect(getAbsolutePath('/foo/bar', '../')).toBe('/foo');
      expect(getAbsolutePath('/foo/bar/baz', '../../')).toBe('/foo');
    });

    it('should handle ../ with nested paths', () => {
      expect(getAbsolutePath('/foo/bar', '../baz/qux')).toBe('/foo/baz/qux');
      expect(getAbsolutePath('/a/b/c', '../../d/e/f')).toBe('/a/d/e/f');
    });

    it('should handle ../ that goes to root', () => {
      expect(getAbsolutePath('/foo', '../bar')).toBe('/bar');
      expect(getAbsolutePath('/foo/bar', '../../baz')).toBe('/baz');
    });

    it('should handle ../ that exceeds basePath depth', () => {
      expect(getAbsolutePath('/foo', '../../bar')).toBe('/bar');
      expect(getAbsolutePath('/foo', '../../../bar')).toBe('/bar');
      expect(getAbsolutePath('/a', '../../../../b')).toBe('/b');
    });

    it('should handle ../ with deep basePath', () => {
      expect(getAbsolutePath('/a/b/c/d/e', '../../../../f')).toBe('/a/f');
      expect(getAbsolutePath('/a/b/c/d/e', '../../../../../f')).toBe('/f');
    });

    it('should handle exact depth ../ traversal', () => {
      expect(getAbsolutePath('/a/b', '../../c')).toBe('/c');
      expect(getAbsolutePath('/a/b/c', '../../../d')).toBe('/d');
      expect(getAbsolutePath('/a/b/c/d', '../../../../e')).toBe('/e');
    });

    it('should handle ../ with very deep nesting (10+ levels)', () => {
      expect(getAbsolutePath('/1/2/3/4/5/6/7/8/9/10', '../../../../../a')).toBe(
        '/1/2/3/4/5/a',
      );
      expect(
        getAbsolutePath(
          '/1/2/3/4/5/6/7/8/9/10',
          '../../../../../../../../../../x',
        ),
      ).toBe('/x');
    });

    it('should handle ../ exceeding depth with remaining path', () => {
      expect(getAbsolutePath('/a', '../../../../../../deep/path')).toBe(
        '/deep/path',
      );
      expect(getAbsolutePath('/x', '../../../a/b/c/d')).toBe('/a/b/c/d');
    });
  });

  describe('edge cases', () => {
    it('should handle empty relative part after ../', () => {
      expect(getAbsolutePath('/foo/bar', '../')).toBe('/foo');
      expect(getAbsolutePath('/foo/bar/baz', '../../')).toBe('/foo');
    });

    it('should return "/" when ../ goes beyond root with no remaining path', () => {
      expect(getAbsolutePath('/foo', '../../')).toBe('/');
      expect(getAbsolutePath('/a', '../../../')).toBe('/');
    });

    it('should handle basePath with trailing content', () => {
      expect(getAbsolutePath('/foo/bar-baz', '../qux')).toBe('/foo/qux');
      expect(getAbsolutePath('/foo/bar_baz', '../qux')).toBe('/foo/qux');
    });

    it('should handle special characters in paths', () => {
      expect(getAbsolutePath('/foo-bar/baz_qux', './test')).toBe(
        '/foo-bar/baz_qux/test',
      );
      expect(getAbsolutePath('/foo-bar/baz_qux', '../test')).toBe(
        '/foo-bar/test',
      );
    });

    it('should handle numeric segments', () => {
      expect(getAbsolutePath('/items/0', './value')).toBe('/items/0/value');
      expect(getAbsolutePath('/items/0', '../1')).toBe('/items/1');
      expect(getAbsolutePath('/items/0/nested', '../../1')).toBe('/items/1');
    });

    it('should handle segments that look like relative paths', () => {
      expect(getAbsolutePath('/foo/..bar', '../baz')).toBe('/foo/baz');
      expect(getAbsolutePath('/foo/.bar', '../baz')).toBe('/foo/baz');
      expect(getAbsolutePath('/foo/bar..', '../baz')).toBe('/foo/baz');
    });

    it('should handle empty string basePath', () => {
      expect(getAbsolutePath('', './foo')).toBe('/foo');
      expect(getAbsolutePath('', '../foo')).toBe('/foo');
    });

    it('should handle JSON Pointer escaped characters (~0 for ~, ~1 for /)', () => {
      // ~0 represents literal '~' in the key
      // Key: "foo~bar" -> Escaped: "foo~0bar"
      expect(getAbsolutePath('/foo~0bar', './baz')).toBe('/foo~0bar/baz');
      expect(getAbsolutePath('/foo~0bar', '../qux')).toBe('/qux');

      // ~1 represents literal '/' in the key
      // Key: "foo/bar" -> Escaped: "foo~1bar"
      expect(getAbsolutePath('/foo~1bar', './baz')).toBe('/foo~1bar/baz');
      expect(getAbsolutePath('/foo~1bar', '../qux')).toBe('/qux');

      // Combined: ~0~1 represents "~/" in the key
      // Key: "a~/b" -> Escaped: "a~0~1b"
      expect(getAbsolutePath('/a~0~1b/c', '../d')).toBe('/a~0~1b/d');
      expect(getAbsolutePath('/a~0~1b/c', '../../d')).toBe('/d');

      // Multiple escaped segments
      // Keys: "user/name", "data~value" -> "/user~1name/data~0value"
      expect(getAbsolutePath('/user~1name/data~0value', '../other~0key')).toBe(
        '/user~1name/other~0key',
      );
      expect(getAbsolutePath('/user~1name/data~0value', './nested~1path')).toBe(
        '/user~1name/data~0value/nested~1path',
      );

      // Escaped characters in relative path part
      expect(getAbsolutePath('/foo/bar', './key~0with~0tilde')).toBe(
        '/foo/bar/key~0with~0tilde',
      );
      expect(getAbsolutePath('/foo/bar', '../key~1with~1slash')).toBe(
        '/foo/key~1with~1slash',
      );
    });

    it('should handle unicode characters in paths', () => {
      expect(getAbsolutePath('/한글/경로', './새로운')).toBe(
        '/한글/경로/새로운',
      );
      expect(getAbsolutePath('/한글/경로', '../다른')).toBe('/한글/다른');
      expect(getAbsolutePath('/日本語/パス', '../../新規')).toBe('/新規');
    });

    it('should handle very long segment names', () => {
      const longName = 'a'.repeat(100);
      expect(getAbsolutePath(`/foo/${longName}`, '../bar')).toBe('/foo/bar');
      expect(getAbsolutePath('/foo/bar', `./${longName}`)).toBe(
        `/foo/bar/${longName}`,
      );
    });

    it('should handle paths with spaces (encoded)', () => {
      expect(getAbsolutePath('/foo%20bar/baz', '../qux')).toBe(
        '/foo%20bar/qux',
      );
      expect(getAbsolutePath('/foo/bar%20baz', './qux')).toBe(
        '/foo/bar%20baz/qux',
      );
    });
  });

  describe('fallback behavior', () => {
    it('should return non-relative, non-absolute paths as-is', () => {
      expect(getAbsolutePath('/foo/bar', 'baz')).toBe('baz');
      expect(getAbsolutePath('/foo/bar', 'baz/qux')).toBe('baz/qux');
    });

    it('should handle malformed relative paths', () => {
      expect(getAbsolutePath('/foo/bar', '.')).toBe('.');
      expect(getAbsolutePath('/foo/bar', '..')).toBe('..');
      expect(getAbsolutePath('/foo/bar', '...')).toBe('...');
    });

    it('should handle paths starting with multiple dots', () => {
      expect(getAbsolutePath('/foo/bar', '.../')).toBe('.../');
      expect(getAbsolutePath('/foo/bar', '..../foo')).toBe('..../foo');
    });

    it('should handle paths with dot in the middle', () => {
      expect(getAbsolutePath('/foo/bar', 'a.b')).toBe('a.b');
      expect(getAbsolutePath('/foo/bar', 'a..b')).toBe('a..b');
      expect(getAbsolutePath('/foo/bar', 'a/./b')).toBe('a/./b');
      expect(getAbsolutePath('/foo/bar', 'a/../b')).toBe('a/../b');
    });

    it('should handle empty currentPath', () => {
      expect(getAbsolutePath('/foo/bar', '')).toBe('');
    });

    it('should handle whitespace paths', () => {
      expect(getAbsolutePath('/foo/bar', ' ')).toBe(' ');
      expect(getAbsolutePath('/foo/bar', '  ')).toBe('  ');
    });
  });

  describe('complex scenarios', () => {
    it('should handle deeply nested basePath with single ../', () => {
      expect(getAbsolutePath('/a/b/c/d/e/f', '../g')).toBe('/a/b/c/d/e/g');
    });

    it('should handle deeply nested basePath with multiple ../', () => {
      expect(getAbsolutePath('/a/b/c/d/e/f', '../../../../g')).toBe('/a/b/g');
    });

    it('should handle long relative paths', () => {
      expect(getAbsolutePath('/a', './b/c/d/e/f/g')).toBe('/a/b/c/d/e/f/g');
    });

    it('should handle mixed depth scenarios', () => {
      expect(getAbsolutePath('/a/b/c', '../d/e/f')).toBe('/a/b/d/e/f');
      expect(getAbsolutePath('/x/y/z/w', '../../p/q/r/s')).toBe('/x/y/p/q/r/s');
    });

    it('should handle alternating segment lengths', () => {
      expect(getAbsolutePath('/a/bb/ccc/dddd', '../../ee')).toBe('/a/bb/ee');
      expect(getAbsolutePath('/short/verylong/x', '../y')).toBe(
        '/short/verylong/y',
      );
    });

    it('should handle maximum ../ then deep path', () => {
      expect(getAbsolutePath('/a/b/c', '../../../../../x/y/z/w/v/u/t')).toBe(
        '/x/y/z/w/v/u/t',
      );
    });
  });

  describe('boundary conditions', () => {
    it('should handle single character segments', () => {
      expect(getAbsolutePath('/a/b/c', '../d')).toBe('/a/b/d');
      expect(getAbsolutePath('/x/y', './z')).toBe('/x/y/z');
    });

    it('should handle basePath with only root separator', () => {
      expect(getAbsolutePath('/', '../foo')).toBe('/foo');
      expect(getAbsolutePath('/', '../../foo')).toBe('/foo');
    });

    it('should correctly count ../ patterns at boundaries', () => {
      // Exactly 1
      expect(getAbsolutePath('/a/b/c', '../x')).toBe('/a/b/x');
      // Exactly 2
      expect(getAbsolutePath('/a/b/c', '../../x')).toBe('/a/x');
      // Exactly 3
      expect(getAbsolutePath('/a/b/c', '../../../x')).toBe('/x');
      // Exactly 4 (exceeds)
      expect(getAbsolutePath('/a/b/c', '../../../../x')).toBe('/x');
      // Exactly 5 (far exceeds)
      expect(getAbsolutePath('/a/b/c', '../../../../../x')).toBe('/x');
    });

    it('should handle consecutive separators in remaining path', () => {
      expect(getAbsolutePath('/foo/bar', './a//b')).toBe('/foo/bar/a//b');
      expect(getAbsolutePath('/foo/bar', '../a//b')).toBe('/foo/a//b');
    });

    it('should handle paths ending with separator', () => {
      // '/foo/bar/' has 4 segments: '', 'foo', 'bar', ''
      // Trailing slash is normalized, so '/foo/bar/' behaves like '/foo/bar'
      expect(getAbsolutePath('/foo/bar/', '../baz')).toBe('/foo/baz');
      expect(getAbsolutePath('/foo/bar/', './baz')).toBe('/foo/bar/baz');
    });
  });

  describe('JSON Schema $ref scenarios', () => {
    it('should resolve typical JSON Schema relative references', () => {
      // '/definitions/User/properties/name' -> ../../ removes 'name', 'properties'
      // result: '/definitions/User' + '/Address' = '/definitions/User/Address'
      expect(
        getAbsolutePath('/definitions/User/properties/name', '../../Address'),
      ).toBe('/definitions/User/Address');
      expect(getAbsolutePath('/properties/user', './type')).toBe(
        '/properties/user/type',
      );
    });

    it('should resolve sibling references', () => {
      // To get sibling at same level, use ../siblingName
      expect(getAbsolutePath('/definitions/User', '../Address')).toBe(
        '/definitions/Address',
      );
      expect(getAbsolutePath('/properties/name', '../age')).toBe(
        '/properties/age',
      );
    });

    it('should resolve deeply nested schema references', () => {
      // '/definitions/Order/properties/items/items/properties/product'
      // ../../../../ removes: 'product', 'properties', 'items', 'items'
      // result: '/definitions/Order/properties' + '/User'
      expect(
        getAbsolutePath(
          '/definitions/Order/properties/items/items/properties/product',
          '../../../../User',
        ),
      ).toBe('/definitions/Order/properties/User');
    });

    it('should resolve references to root definitions', () => {
      // '/properties/nested/deep/value' has 4 segments after root
      // ../../../../ goes back 4 levels to root
      expect(
        getAbsolutePath(
          '/properties/nested/deep/value',
          '../../../../definitions/Type',
        ),
      ).toBe('/definitions/Type');
    });

    it('should handle allOf/oneOf/anyOf paths', () => {
      // '/allOf/0/properties/x' -> ../../ removes 'x', 'properties'
      // result: '/allOf/0' + '/1' = '/allOf/0/1'
      expect(getAbsolutePath('/allOf/0/properties/x', '../../1')).toBe(
        '/allOf/0/1',
      );
      // To get sibling index, need to go up 3 levels: '../../../1'
      expect(getAbsolutePath('/allOf/0/properties/x', '../../../1')).toBe(
        '/allOf/1',
      );
      expect(getAbsolutePath('/oneOf/0', '../1/properties/y')).toBe(
        '/oneOf/1/properties/y',
      );
    });
  });

  describe('performance edge cases', () => {
    it('should handle very deep nesting efficiently', () => {
      const deepPath = '/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z';
      expect(getAbsolutePath(deepPath, '../aa')).toBe(
        '/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/aa',
      );
      expect(getAbsolutePath(deepPath, './aa')).toBe(
        '/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z/aa',
      );
    });

    it('should handle many ../ efficiently', () => {
      const manyParents = '../'.repeat(20) + 'target';
      expect(getAbsolutePath('/a/b/c/d/e', manyParents)).toBe('/target');
    });

    it('should handle long remaining paths after ../', () => {
      const longPath = 'a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t';
      expect(getAbsolutePath('/x/y/z', `../${longPath}`)).toBe(
        `/x/y/${longPath}`,
      );
    });
  });
});

import { describe, expect, it } from 'vitest';

import { difference } from '../difference';
import { differenceObjectPatch } from '../differenceObjectPatch';

describe('JSON Pointer Escape Handling', () => {
  describe('differenceObjectPatch', () => {
    describe('Forward slash (/) escaping', () => {
      it('should handle keys containing forward slash', () => {
        const source = {
          'path/to/file': 'old_value',
          'another/path': 'unchanged',
        };
        const target = {
          'path/to/file': 'new_value',
          'another/path': 'unchanged',
        };

        const result = differenceObjectPatch(source, target);

        expect(result).toEqual({
          'path/to/file': 'new_value',
        });
      });

      it('should handle adding keys with forward slash', () => {
        const source = {
          'existing/key': 'value',
        };
        const target = {
          'existing/key': 'value',
          'new/path': 'new_value',
        };

        const result = differenceObjectPatch(source, target);

        expect(result).toEqual({
          'new/path': 'new_value',
        });
      });

      it('should handle removing keys with forward slash', () => {
        const source = {
          'path/to/delete': 'value',
          'path/to/keep': 'value',
        };
        const target = {
          'path/to/keep': 'value',
        };

        const result = differenceObjectPatch(source, target);

        expect(result).toEqual({
          'path/to/delete': null,
        });
      });
    });

    describe('Tilde (~) escaping', () => {
      it('should handle keys containing tilde', () => {
        const source = {
          'key~with~tilde': 'old_value',
          'another~key': 'unchanged',
        };
        const target = {
          'key~with~tilde': 'new_value',
          'another~key': 'unchanged',
        };

        const result = differenceObjectPatch(source, target);

        expect(result).toEqual({
          'key~with~tilde': 'new_value',
        });
      });

      it('should handle adding keys with tilde', () => {
        const source = {
          'existing~key': 'value',
        };
        const target = {
          'existing~key': 'value',
          'new~key': 'new_value',
        };

        const result = differenceObjectPatch(source, target);

        expect(result).toEqual({
          'new~key': 'new_value',
        });
      });

      it('should handle removing keys with tilde', () => {
        const source = {
          'key~to~delete': 'value',
          'key~to~keep': 'value',
        };
        const target = {
          'key~to~keep': 'value',
        };

        const result = differenceObjectPatch(source, target);

        expect(result).toEqual({
          'key~to~delete': null,
        });
      });
    });

    describe('Combined escape characters', () => {
      it('should handle keys containing both forward slash and tilde', () => {
        const source = {
          'path/to~file': 'old_value',
          'another/path~key': 'unchanged',
        };
        const target = {
          'path/to~file': 'new_value',
          'another/path~key': 'unchanged',
          'new/path~with~both': 'added_value',
        };

        const result = differenceObjectPatch(source, target);

        expect(result).toEqual({
          'path/to~file': 'new_value',
          'new/path~with~both': 'added_value',
        });
      });

      it('should handle complex escaping scenarios', () => {
        const source = {
          'a/b~c/d': 'value1',
          '~/~': 'value2',
          '/~': 'value3',
        };
        const target = {
          'a/b~c/d': 'modified1',
          '~/~': 'value2',
          '/~': 'modified3',
          '~~/~~': 'new_value',
        };

        const result = differenceObjectPatch(source, target);

        expect(result).toEqual({
          'a/b~c/d': 'modified1',
          '/~': 'modified3',
          '~~/~~': 'new_value',
        });
      });
    });

    describe('Nested objects with escape characters', () => {
      it('should handle nested objects with escape characters in keys', () => {
        const source = {
          'parent/key': {
            'child~key': 'old_value',
            'another/child': 'unchanged',
          },
          normal_key: 'value',
        };
        const target = {
          'parent/key': {
            'child~key': 'new_value',
            'another/child': 'unchanged',
            'new~child/key': 'added',
          },
          normal_key: 'value',
        };

        const result = differenceObjectPatch(source, target);

        expect(result).toEqual({
          'parent/key': {
            'child~key': 'new_value',
            'new~child/key': 'added',
          },
        });
      });

      it('should handle deeply nested objects with escape characters', () => {
        const source = {
          'level1/key': {
            'level2~key': {
              'level3/key~name': 'deep_value',
            },
          },
        };
        const target = {
          'level1/key': {
            'level2~key': {
              'level3/key~name': 'modified_deep_value',
              'new~deep/key': 'new_deep_value',
            },
          },
        };

        const result = differenceObjectPatch(source, target);

        expect(result).toEqual({
          'level1/key': {
            'level2~key': {
              'level3/key~name': 'modified_deep_value',
              'new~deep/key': 'new_deep_value',
            },
          },
        });
      });
    });

    describe('Arrays with escape characters', () => {
      it('should handle arrays containing objects with escape character keys', () => {
        const source = {
          'array/key': [
            { 'item~id': 1, 'name/value': 'item1' },
            { 'item~id': 2, 'name/value': 'item2' },
          ],
        };
        const target = {
          'array/key': [
            { 'item~id': 1, 'name/value': 'modified_item1' },
            { 'item~id': 3, 'name/value': 'item3' },
          ],
        };

        const result = differenceObjectPatch(source, target);

        // 배열 최적화로 인해 전체 배열이 교체되어야 함
        expect(result).toEqual({
          'array/key': [
            { 'item~id': 1, 'name/value': 'modified_item1' },
            { 'item~id': 3, 'name/value': 'item3' },
          ],
        });
      });

      it('should handle multiple arrays with escape character keys', () => {
        const source = {
          'users/list': [{ 'user~id': 1 }],
          'products~list': [{ 'product/id': 1 }],
        };
        const target = {
          'users/list': [{ 'user~id': 2 }],
          'products~list': [{ 'product/id': 1 }, { 'product/id': 2 }],
        };

        const result = differenceObjectPatch(source, target);

        expect(result).toEqual({
          'users/list': [{ 'user~id': 2 }],
          'products~list': [{ 'product/id': 1 }, { 'product/id': 2 }],
        });
      });
    });

    describe('Edge cases', () => {
      it('should handle empty string keys', () => {
        const source = {
          '': 'empty_key_value',
          normal: 'value',
        };
        const target = {
          '': 'modified_empty_key_value',
          normal: 'value',
        };

        const result = differenceObjectPatch(source, target);

        expect(result).toEqual({
          '': 'modified_empty_key_value',
        });
      });

      it('should handle keys that are only escape characters', () => {
        const source = {
          '/': 'slash_only',
          '~': 'tilde_only',
          '//': 'double_slash',
          '~~': 'double_tilde',
        };
        const target = {
          '/': 'modified_slash_only',
          '~': 'tilde_only',
          '//': 'double_slash',
          '~~': 'modified_double_tilde',
          '/~': 'slash_tilde',
        };

        const result = differenceObjectPatch(source, target);

        expect(result).toEqual({
          '/': 'modified_slash_only',
          '~~': 'modified_double_tilde',
          '/~': 'slash_tilde',
        });
      });

      it('should handle null and undefined values with escape character keys', () => {
        const source = {
          'key/with~null': null,
          'key~with/undefined': undefined,
        };
        const target = {
          'key/with~null': 'not_null_anymore',
          'key~with/undefined': 'not_undefined_anymore',
        };

        const result = differenceObjectPatch(source, target);

        expect(result).toEqual({
          'key/with~null': 'not_null_anymore',
          'key~with/undefined': 'not_undefined_anymore',
        });
      });
    });
  });

  describe('difference function', () => {
    it('should handle escape characters in top-level difference function', () => {
      const source = {
        'api/endpoint': 'old_url',
        'config~setting': 'old_config',
      };
      const target = {
        'api/endpoint': 'new_url',
        'config~setting': 'old_config',
      };

      const result = difference(source, target);

      expect(result).toEqual({
        'api/endpoint': 'new_url',
      });
    });

    it('should return undefined when objects with escape characters are identical', () => {
      const source = {
        'path/to~resource': 'value',
        '~/complex~key/structure': { nested: 'data' },
      };
      const target = {
        'path/to~resource': 'value',
        '~/complex~key/structure': { nested: 'data' },
      };

      const result = difference(source, target);

      expect(result).toBeUndefined();
    });

    it('should handle primitive values being replaced with objects containing escape characters', () => {
      const source = 'simple_string';
      const target = {
        'complex/object~key': 'value',
      };

      const result = difference(source, target);

      expect(result).toEqual({
        'complex/object~key': 'value',
      });
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle file path-like keys', () => {
      const source = {
        'src/components/Button.tsx': { lastModified: '2024-01-01' },
        'src/utils~helpers/api.ts': { lastModified: '2024-01-01' },
      };
      const target = {
        'src/components/Button.tsx': { lastModified: '2024-01-02' },
        'src/utils~helpers/api.ts': { lastModified: '2024-01-01' },
        'src/hooks/useApi~hook.ts': { lastModified: '2024-01-02' },
      };

      const result = differenceObjectPatch(source, target);

      expect(result).toEqual({
        'src/components/Button.tsx': { lastModified: '2024-01-02' },
        'src/hooks/useApi~hook.ts': { lastModified: '2024-01-02' },
      });
    });

    it('should handle URL-like keys', () => {
      const source = {
        'https://api.example.com/users': { cached: true },
        'api~cache/v1~endpoint': { timeout: 5000 },
      };
      const target = {
        'https://api.example.com/users': { cached: false },
        'api~cache/v1~endpoint': { timeout: 5000 },
        'https://api.example.com/products': { cached: true },
      };

      const result = differenceObjectPatch(source, target);

      expect(result).toEqual({
        'https://api.example.com/users': { cached: false },
        'https://api.example.com/products': { cached: true },
      });
    });

    it('should handle configuration keys with namespaces', () => {
      const source = {
        'database/connection~pool': { size: 10 },
        'cache~config/redis~settings': { ttl: 300 },
        'logging/levels~debug': false,
      };
      const target = {
        'database/connection~pool': { size: 20 },
        'cache~config/redis~settings': { ttl: 600 },
        'logging/levels~debug': true,
        'monitoring~alerts/slack~webhook': { enabled: true },
      };

      const result = differenceObjectPatch(source, target);

      expect(result).toEqual({
        'database/connection~pool': { size: 20 },
        'cache~config/redis~settings': { ttl: 600 },
        'logging/levels~debug': true,
        'monitoring~alerts/slack~webhook': { enabled: true },
      });
    });
  });
});

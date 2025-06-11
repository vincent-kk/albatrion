import { describe, expect, it } from 'vitest';

import { getValue, setValue } from '@/json/JSONPointer/utils/manipulator';
import type { JsonObject } from '@/json/type';

describe('JSON Pointer manipulator escape handling integration', () => {
  describe('getValue with escape characters', () => {
    it('should correctly retrieve values with forward slash in keys', () => {
      const data: JsonObject = {
        'path/to/file': 'file_content',
        'config/settings': { debug: true },
        'api/v1/users': [{ id: 1, name: 'Alice' }],
      };

      expect(getValue(data, '/path~1to~1file')).toBe('file_content');
      expect(getValue(data, '/config~1settings')).toEqual({
        debug: true,
      });
      expect(getValue(data, '/api~1v1~1users')).toEqual([
        { id: 1, name: 'Alice' },
      ]);
      expect(getValue(data, '/api~1v1~1users/0')).toEqual({
        id: 1,
        name: 'Alice',
      });
      expect(getValue(data, '/api~1v1~1users/0/name')).toBe('Alice');
    });

    it('should correctly retrieve values with tilde in keys', () => {
      const data: JsonObject = {
        'config~debug': false,
        'cache~settings': { ttl: 300 },
        'users~active': [{ status: 'online' }],
      };

      expect(getValue(data, '/config~0debug')).toBe(false);
      expect(getValue(data, '/cache~0settings')).toEqual({ ttl: 300 });
      expect(getValue(data, '/users~0active')).toEqual([{ status: 'online' }]);
      expect(getValue(data, '/users~0active/0/status')).toBe('online');
    });

    it('should correctly retrieve values with both escape characters', () => {
      const data: JsonObject = {
        'app/config~dev': { enabled: true },
        'logs~system/errors': ['error1', 'error2'],
        'db/tables~temp': { count: 5 },
      };

      expect(getValue(data, '/app~1config~0dev')).toEqual({
        enabled: true,
      });
      expect(getValue(data, '/logs~0system~1errors')).toEqual([
        'error1',
        'error2',
      ]);
      expect(getValue(data, '/db~1tables~0temp')).toEqual({
        count: 5,
      });
      expect(getValue(data, '/logs~0system~1errors/1')).toBe('error2');
    });

    it('should handle nested objects with escape characters', () => {
      const data: JsonObject = {
        'parent/key': {
          'child~property': {
            'deep/nested~value': 'target',
          },
        },
      };

      expect(
        getValue(data, '/parent~1key/child~0property/deep~1nested~0value'),
      ).toBe('target');
    });

    it('should return undefined for non-existent paths with escape characters', () => {
      const data: JsonObject = {
        'existing/key': 'value',
      };

      expect(getValue(data, '/nonexistent~1key')).toBeUndefined();
      expect(
        getValue(data, '/existing~1key/nonexistent~0prop'),
      ).toBeUndefined();
    });
  });

  describe('setValue with escape characters', () => {
    it('should correctly set values with forward slash in keys', () => {
      const data: JsonObject = {};

      setValue(data, '/path~1to~1file', 'new_content');
      setValue(data, '/config~1settings', { debug: false });

      expect(data).toEqual({
        'path/to/file': 'new_content',
        'config/settings': { debug: false },
      });
    });

    it('should correctly set values with tilde in keys', () => {
      const data: JsonObject = {};

      setValue(data, '/config~0debug', true);
      setValue(data, '/cache~0settings', { ttl: 600 });

      expect(data).toEqual({
        'config~debug': true,
        'cache~settings': { ttl: 600 },
      });
    });

    it('should correctly set values with both escape characters', () => {
      const data: JsonObject = {};

      setValue(data, '/app~1config~0dev', { enabled: false });
      setValue(data, '/logs~0system~1errors', ['new_error']);

      expect(data).toEqual({
        'app/config~dev': { enabled: false },
        'logs~system/errors': ['new_error'],
      });
    });

    it('should correctly set nested values with escape characters', () => {
      const data: JsonObject = {};

      setValue(
        data,
        '/parent~1key/child~0property/deep~1nested~0value',
        'nested_value',
      );

      expect(data).toEqual({
        'parent/key': {
          'child~property': {
            'deep/nested~value': 'nested_value',
          },
        },
      });
    });

    it('should correctly update existing values with escape characters', () => {
      const data: JsonObject = {
        'existing/key~prop': 'old_value',
        'config~/setting': { old: true },
      };

      setValue(data, '/existing~1key~0prop', 'new_value');
      setValue(data, '/config~0~1setting', { new: true });

      expect(data).toEqual({
        'existing/key~prop': 'new_value',
        'config~/setting': { new: true },
      });
    });

    it('should correctly set array values with escape character keys', () => {
      const data: JsonObject = {};

      setValue(data, '/users~1list/0', { id: 1, name: 'Alice' });
      setValue(data, '/users~1list/1', { id: 2, name: 'Bob' });

      expect(data).toEqual({
        'users/list': [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
      });
    });

    it('should handle setting null values with escape characters', () => {
      const data: JsonObject = {
        'to~be/removed': 'value',
        'to~remain': 'value',
      };

      setValue(data, '/to~0be~1removed', null);

      expect(data).toEqual({
        'to~be/removed': null,
        'to~remain': 'value',
      });
    });
  });

  describe('Round-trip consistency with escape characters', () => {
    it('should maintain consistency in get/set operations', () => {
      const originalData: JsonObject = {
        'complex/path~with~escapes': {
          'nested/object~prop': ['item1', 'item2'],
          'another~key/value': 42,
        },
      };

      // Get values
      const nestedObject = getValue(
        originalData,
        '/complex~1path~0with~0escapes',
      );
      const arrayValue = getValue(
        originalData,
        '/complex~1path~0with~0escapes/nested~1object~0prop',
      );
      const numberValue = getValue(
        originalData,
        '/complex~1path~0with~0escapes/another~0key~1value',
      );

      // Create new object and set the same values
      const newData: JsonObject = {};
      setValue(newData, '/complex~1path~0with~0escapes', nestedObject);

      expect(newData).toEqual(originalData);
      expect(arrayValue).toEqual(['item1', 'item2']);
      expect(numberValue).toBe(42);
    });

    it('should handle complex real-world scenarios', () => {
      const data: JsonObject = {};

      // Simulate file system paths
      setValue(data, '/src~1components~1Button.tsx', {
        type: 'component',
      });
      setValue(data, '/src~1utils~1api~0helpers.ts', {
        type: 'utility',
      });

      // Simulate API endpoints
      setValue(data, '/api~1v1~1users/0', {
        id: 1,
        endpoint: '/users',
      });
      setValue(data, '/api~1v2~0beta~1products/0', {
        id: 1,
        endpoint: '/products',
      });

      // Simulate configuration keys
      setValue(data, '/config~1database~0connection~1pool', {
        size: 10,
      });
      setValue(data, '/config~0redis~1cache~0settings', { ttl: 300 });

      expect(data).toEqual({
        'src/components/Button.tsx': { type: 'component' },
        'src/utils/api~helpers.ts': { type: 'utility' },
        'api/v1/users': [{ id: 1, endpoint: '/users' }],
        'api/v2~beta/products': [{ id: 1, endpoint: '/products' }],
        'config/database~connection/pool': { size: 10 },
        'config~redis/cache~settings': { ttl: 300 },
      });

      // Verify we can retrieve all values correctly
      expect(getValue(data, '/src~1components~1Button.tsx')).toEqual({
        type: 'component',
      });
      expect(getValue(data, '/config~1database~0connection~1pool')).toEqual({
        size: 10,
      });
      expect(getValue(data, '/api~1v2~0beta~1products/0/endpoint')).toBe(
        '/products',
      );
    });
  });

  describe('Edge cases with escape handling', () => {
    it('should handle keys that are only escape characters', () => {
      const data: JsonObject = {};

      setValue(data, '/~1', 'slash_only');
      setValue(data, '/~0', 'tilde_only');
      setValue(data, '/~1~0', 'slash_tilde');
      setValue(data, '/~0~1', 'tilde_slash');

      expect(data).toEqual({
        '/': 'slash_only',
        '~': 'tilde_only',
        '/~': 'slash_tilde',
        '~/': 'tilde_slash',
      });

      expect(getValue(data, '/~1')).toBe('slash_only');
      expect(getValue(data, '/~0')).toBe('tilde_only');
      expect(getValue(data, '/~1~0')).toBe('slash_tilde');
      expect(getValue(data, '/~0~1')).toBe('tilde_slash');
    });

    it('should handle empty string keys with escape context', () => {
      const data: JsonObject = {};

      setValue(data, '/', 'empty_key');
      setValue(data, '/normal~1key', 'normal_with_escape');

      expect(data).toEqual({
        '': 'empty_key',
        'normal/key': 'normal_with_escape',
      });

      expect(getValue(data, '/')).toBe('empty_key');
      expect(getValue(data, '/normal~1key')).toBe('normal_with_escape');
    });

    it('should handle consecutive escape sequences', () => {
      const data: JsonObject = {};

      setValue(data, '/key~1~0~1~0name', 'consecutive_escapes');
      setValue(data, '/~1~0~1~0~1~0', 'only_escapes');

      expect(data).toEqual({
        'key/~/~name': 'consecutive_escapes',
        '/~/~/~': 'only_escapes',
      });

      expect(getValue(data, '/key~1~0~1~0name')).toBe('consecutive_escapes');
      expect(getValue(data, '/~1~0~1~0~1~0')).toBe('only_escapes');
    });
  });
});

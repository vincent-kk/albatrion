import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';

/**
 * Tests for checkDefinedValue integration with reset logic.
 *
 * This test suite validates the fix introduced in commit 1563dc08:
 * - Before: `if (options.checkDefaultValueFirst && this.__defaultValue__ !== undefined)`
 * - After: `if (options.checkDefaultValueFirst && this.__isDefinedDefaultValue__)`
 *
 * The key difference:
 * - Empty object `{}` or empty array `[]` should NOT be considered "defined" default values
 * - `checkDefinedValue({})` returns false, while `{} !== undefined` returns true
 *
 * This test directly calls `__reset__` with specific options to test the logic path
 * that would otherwise not be exercised through normal oneOf transitions.
 */
describe('ConditionalSchema - checkDefinedValue with Reset Logic', () => {
  describe('Direct __reset__ call with checkDefaultValueFirst', () => {
    /**
     * This test directly validates the reset logic with checkDefaultValueFirst option.
     * The key scenario:
     * 1. Node has empty object {} as defaultValue (no explicit default → getEmptyValue returns {})
     * 2. User sets a custom value
     * 3. __reset__ is called with { preferLatest: true, checkDefaultValueFirst: true, fallbackValue: ... }
     *
     * Previous code: {} !== undefined → true → empty object is used as value ❌
     * Current code: checkDefinedValue({}) → false → fallbackValue is used ✅
     */
    const createObjectSchema = (): JsonSchema => ({
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['A', 'B'],
          default: 'A',
        },
      },
      oneOf: [
        {
          '&if': "./selector === 'A'",
          properties: {
            // No explicit default → getEmptyValue('object') returns {}
            nestedData: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                count: { type: 'number' },
              },
            },
          },
        },
        {
          '&if': "./selector === 'B'",
          properties: {
            nestedData: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                count: { type: 'number' },
              },
            },
          },
        },
      ],
    });

    it('should use fallbackValue when defaultValue is empty object (direct __reset__ call)', async () => {
      const schema = createObjectSchema();
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      // Set initial value
      node.setValue({
        selector: 'A',
        nestedData: { value: 'custom-value', count: 42 },
      });

      await delay();

      // Find the nestedData node in oneOf branch
      const nestedDataNode = node.find('./nestedData') as ObjectNode;
      expect(nestedDataNode).not.toBeNull();

      // Verify defaultValue is empty object {}
      expect(nestedDataNode.defaultValue).toEqual({});

      // Verify current value
      expect(nestedDataNode.value).toEqual({
        value: 'custom-value',
        count: 42,
      });

      // Directly call __reset__ with the problematic options
      // This simulates the scenario where:
      // - preferLatest: true (would be triggered by isolation=true or terminal type match)
      // - checkDefaultValueFirst: true
      // - fallbackValue is provided
      // @ts-expect-error [internal] direct __reset__ call for testing
      nestedDataNode.__reset__({
        preferLatest: true,
        checkDefaultValueFirst: true,
        fallbackValue: { value: 'fallback-value', count: 100 },
      });

      await delay();

      // KEY ASSERTION:
      // - Previous code: {} !== undefined → true → empty object {} is used
      // - Current code: checkDefinedValue({}) → false → fallbackValue is used
      expect(nestedDataNode.value).toEqual({
        value: 'fallback-value',
        count: 100,
      });
    });

    it('should use defaultValue when it is explicitly defined (non-empty)', async () => {
      const schemaWithDefault: JsonSchema = {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            enum: ['A', 'B'],
            default: 'A',
          },
        },
        oneOf: [
          {
            '&if': "./selector === 'A'",
            properties: {
              // Explicit default with value → checkDefinedValue returns true
              nestedData: {
                type: 'object',
                default: { initial: true, count: 0 },
                properties: {
                  initial: { type: 'boolean' },
                  count: { type: 'number' },
                },
              },
            },
          },
          {
            '&if': "./selector === 'B'",
            properties: {
              nestedData: {
                type: 'object',
                properties: {
                  value: { type: 'string' },
                },
              },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schemaWithDefault,
      }) as ObjectNode;

      await delay();

      // Set custom value
      node.setValue({
        selector: 'A',
        nestedData: { initial: false, count: 999 },
      });

      await delay();

      const nestedDataNode = node.find('./nestedData') as ObjectNode;
      expect(nestedDataNode).not.toBeNull();

      // Verify defaultValue is the explicit non-empty object
      expect(nestedDataNode.defaultValue).toEqual({ initial: true, count: 0 });

      // Verify current value
      expect(nestedDataNode.value).toEqual({ initial: false, count: 999 });

      // Direct __reset__ call
      // @ts-expect-error [internal] direct __reset__ call for testing
      nestedDataNode.__reset__({
        preferLatest: true,
        checkDefaultValueFirst: true,
        fallbackValue: { initial: false, count: 123 },
      });

      await delay();

      // When defaultValue is defined (non-empty), it should be used instead of fallbackValue
      // Both previous and current code should return defaultValue here
      expect(nestedDataNode.value).toEqual({ initial: true, count: 0 });
    });

    it('should use fallbackValue when defaultValue is empty array', async () => {
      const schemaWithArray: JsonSchema = {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            enum: ['A', 'B'],
            default: 'A',
          },
        },
        oneOf: [
          {
            '&if': "./selector === 'A'",
            properties: {
              // No explicit default → getEmptyValue('array') returns []
              items: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
          {
            '&if': "./selector === 'B'",
            properties: {
              items: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schemaWithArray,
      }) as ObjectNode;

      await delay();

      // Set custom value
      node.setValue({
        selector: 'A',
        items: ['item1', 'item2', 'item3'],
      });

      await delay();

      const itemsNode = node.find('./items');
      expect(itemsNode).not.toBeNull();
      if (itemsNode?.type !== 'array') return;

      // Verify defaultValue is empty array []
      expect(itemsNode!.defaultValue).toEqual([]);

      // Verify current value
      expect(itemsNode!.value).toEqual(['item1', 'item2', 'item3']);

      // Direct __reset__ call
      // @ts-expect-error [internal] direct __reset__ call for testing
      itemsNode!.__reset__({
        preferLatest: true,
        checkDefaultValueFirst: true,
        fallbackValue: ['fallback1', 'fallback2'],
      });

      await delay();

      // KEY ASSERTION:
      // - Previous code: [] !== undefined → true → empty array [] is used
      // - Current code: checkDefinedValue([]) → false → fallbackValue is used
      expect(itemsNode!.value).toEqual(['fallback1', 'fallback2']);
    });

    it('should use null defaultValue when explicitly defined (null is defined)', async () => {
      const schemaWithNullDefault: JsonSchema = {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            enum: ['A', 'B'],
            default: 'A',
          },
        },
        oneOf: [
          {
            '&if': "./selector === 'A'",
            properties: {
              // Explicit null default → checkDefinedValue(null) returns true
              nestedData: {
                type: ['object', 'null'],
                default: null,
                properties: {
                  value: { type: 'string' },
                },
              },
            },
          },
          {
            '&if': "./selector === 'B'",
            properties: {
              nestedData: {
                type: ['object', 'null'],
                properties: {
                  value: { type: 'string' },
                },
              },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schemaWithNullDefault,
      }) as ObjectNode;

      await delay();

      // Set custom value
      node.setValue({
        selector: 'A',
        nestedData: { value: 'custom-value' },
      });

      await delay();

      const nestedDataNode = node.find('./nestedData') as ObjectNode;
      expect(nestedDataNode).not.toBeNull();

      // Verify defaultValue is null
      expect(nestedDataNode.defaultValue).toBeNull();

      // Verify current value
      expect(nestedDataNode.value).toEqual({ value: 'custom-value' });

      // Direct __reset__ call
      // @ts-expect-error [internal] direct __reset__ call for testing
      nestedDataNode.__reset__({
        preferLatest: true,
        checkDefaultValueFirst: true,
        fallbackValue: { value: 'fallback-value' },
      });

      await delay();

      // null is considered "defined" by checkDefinedValue(null) → true
      // So defaultValue (null) should be used instead of fallbackValue
      expect(nestedDataNode.value).toBeNull();
    });
  });

  describe('Contrast between empty object and explicit empty object default', () => {
    it('should handle explicit empty object default as undefined (not defined)', async () => {
      // Edge case: what if someone explicitly sets default: {}?
      const schemaWithExplicitEmpty: JsonSchema = {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            default: 'A',
          },
        },
        oneOf: [
          {
            '&if': "./selector === 'A'",
            properties: {
              // Explicit empty object default
              data: {
                type: 'object',
                default: {},
                properties: {
                  value: { type: 'string' },
                },
              },
            },
          },
          {
            '&if': "./selector === 'B'",
            properties: {
              data: {
                type: 'object',
                properties: {
                  value: { type: 'string' },
                },
              },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schemaWithExplicitEmpty,
      }) as ObjectNode;

      await delay();

      // Set custom value
      node.setValue({
        selector: 'A',
        data: { value: 'custom-value' },
      });

      await delay();

      const dataNode = node.find('./data') as ObjectNode;
      expect(dataNode).not.toBeNull();

      // defaultValue is explicit empty object {}
      expect(dataNode.defaultValue).toEqual({});

      // Direct __reset__ call
      // @ts-expect-error [internal] direct __reset__ call for testing
      dataNode.__reset__({
        preferLatest: true,
        checkDefaultValueFirst: true,
        fallbackValue: { value: 'fallback-value' },
      });

      await delay();

      // KEY ASSERTION:
      // Even though default: {} is explicit, checkDefinedValue({}) → false
      // So fallbackValue should be used
      // This is the key difference from previous code where {} !== undefined → true
      expect(dataNode.value).toEqual({ value: 'fallback-value' });
    });
  });
});

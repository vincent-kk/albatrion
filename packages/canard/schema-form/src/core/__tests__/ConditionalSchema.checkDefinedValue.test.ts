import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ArrayNode } from '../nodes/ArrayNode';
import { checkDefinedValue } from '../nodes/AbstractNode/utils';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

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

  /**
   * checkDefinedValue boundary value tests
   * Validates all edge cases for the checkDefinedValue utility function
   */
  describe('checkDefinedValue Boundary Tests', () => {
    it.each([
      [0, true, 'zero is defined'],
      ['', true, 'empty string is defined'],
      [false, true, 'false is defined'],
      [[], false, 'empty array is undefined'],
      [{}, false, 'empty object is undefined'],
      [null, true, 'null is defined'],
      [undefined, false, 'undefined is undefined'],
      [{ key: undefined }, true, 'object with undefined value is defined'],
      [[undefined], true, 'array with undefined item is defined'],
      [{ a: 1 }, true, 'non-empty object is defined'],
      [['a'], true, 'non-empty array is defined'],
      [{ nested: {} }, true, 'object with empty nested object is defined'],
      [[{}], true, 'array with empty object is defined'],
    ])(
      'checkDefinedValue(%p) should return %p (%s)',
      (value, expected, _desc) => {
        expect(checkDefinedValue(value)).toBe(expected);
      },
    );
  });

  /**
   * __reset__ Option Combinations
   * Tests various combinations of reset options
   */
  describe('__reset__ Option Combinations', () => {
    const createTestSchema = (): JsonSchema => ({
      type: 'object',
      properties: {
        selector: { type: 'string', enum: ['A', 'B'], default: 'A' },
      },
      oneOf: [
        {
          '&if': "./selector === 'A'",
          properties: {
            data: {
              type: 'object',
              properties: { value: { type: 'string' } },
            },
          },
        },
        {
          '&if': "./selector === 'B'",
          properties: {
            data: {
              type: 'object',
              properties: { value: { type: 'string' } },
            },
          },
        },
      ],
    });

    it('should handle preferLatest=true with checkDefaultValueFirst=false', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: createTestSchema(),
      }) as ObjectNode;

      await delay();

      node.setValue({
        selector: 'A',
        data: { value: 'current-value' },
      });
      await delay();

      const dataNode = node.find('./data') as ObjectNode;

      // @ts-expect-error [internal] direct __reset__ call for testing
      dataNode.__reset__({
        preferLatest: true,
        checkDefaultValueFirst: false,
        fallbackValue: { value: 'fallback' },
      });
      await delay();

      // When preferLatest=true and checkDefaultValueFirst=false:
      // Priority: fallbackValue > current value > defaultValue
      // Since fallbackValue is provided, it should be used
      expect(dataNode.value).toEqual({ value: 'fallback' });
    });

    it('should handle preferLatest=false (always uses defaultValue regardless of other options)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: createTestSchema(),
      }) as ObjectNode;

      await delay();

      node.setValue({
        selector: 'A',
        data: { value: 'current-value' },
      });
      await delay();

      const dataNode = node.find('./data') as ObjectNode;

      // defaultValue is {} (empty)
      expect(dataNode.defaultValue).toEqual({});

      // @ts-expect-error [internal] direct __reset__ call for testing
      dataNode.__reset__({
        preferLatest: false,
        checkDefaultValueFirst: true, // This is ignored when preferLatest=false
        fallbackValue: { value: 'fallback' }, // This is also ignored
      });
      await delay();

      // When preferLatest=false, always uses defaultValue (regardless of checkDefaultValueFirst)
      expect(dataNode.value).toEqual({});
    });

    it('should handle preferLatest=false with checkDefaultValueFirst=false (still uses defaultValue)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: createTestSchema(),
      }) as ObjectNode;

      await delay();

      node.setValue({
        selector: 'A',
        data: { value: 'current-value' },
      });
      await delay();

      const dataNode = node.find('./data') as ObjectNode;

      // @ts-expect-error [internal] direct __reset__ call for testing
      dataNode.__reset__({
        preferLatest: false,
        checkDefaultValueFirst: false,
        fallbackValue: { value: 'fallback' },
      });
      await delay();

      // preferLatest=false → always use defaultValue (ignores all other options)
      expect(dataNode.value).toEqual({});
    });

    it('should handle all options true with defined defaultValue', async () => {
      const schemaWithDefault: JsonSchema = {
        type: 'object',
        properties: {
          selector: { type: 'string', default: 'A' },
        },
        oneOf: [
          {
            '&if': "./selector === 'A'",
            properties: {
              data: {
                type: 'object',
                default: { value: 'schema-default' },
                properties: { value: { type: 'string' } },
              },
            },
          },
          {
            '&if': "./selector === 'B'",
            properties: {
              data: { type: 'object', properties: { value: { type: 'string' } } },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schemaWithDefault,
      }) as ObjectNode;

      await delay();

      node.setValue({
        selector: 'A',
        data: { value: 'current-value' },
      });
      await delay();

      const dataNode = node.find('./data') as ObjectNode;
      expect(dataNode.defaultValue).toEqual({ value: 'schema-default' });

      // @ts-expect-error [internal] direct __reset__ call for testing
      dataNode.__reset__({
        preferLatest: true,
        checkDefaultValueFirst: true,
        fallbackValue: { value: 'fallback' },
      });
      await delay();

      // checkDefaultValueFirst=true and defaultValue is defined → use defaultValue
      expect(dataNode.value).toEqual({ value: 'schema-default' });
    });
  });

  /**
   * Sequential Reset Calls
   * Tests state consistency after multiple reset operations
   */
  describe('Sequential Reset Calls', () => {
    it('should maintain state consistency after multiple reset calls with preferLatest=true', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          selector: { type: 'string', default: 'A' },
        },
        oneOf: [
          {
            '&if': "./selector === 'A'",
            properties: {
              data: { type: 'string' },
            },
          },
          {
            '&if': "./selector === 'B'",
            properties: {
              data: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      node.setValue({ selector: 'A', data: 'value1' });
      await delay();

      const dataNode = node.find('./data') as StringNode;

      // First reset with preferLatest=true to use fallbackValue
      // @ts-expect-error [internal] direct __reset__ call for testing
      dataNode.__reset__({
        preferLatest: true,
        checkDefaultValueFirst: true,
        fallbackValue: 'reset1',
      });
      await delay();
      expect(dataNode.value).toBe('reset1');

      // Second reset with different fallback
      // @ts-expect-error [internal] direct __reset__ call for testing
      dataNode.__reset__({
        preferLatest: true,
        checkDefaultValueFirst: true,
        fallbackValue: 'reset2',
      });
      await delay();
      expect(dataNode.value).toBe('reset2');

      // Third reset
      // @ts-expect-error [internal] direct __reset__ call for testing
      dataNode.__reset__({
        preferLatest: true,
        checkDefaultValueFirst: true,
        fallbackValue: 'reset3',
      });
      await delay();
      expect(dataNode.value).toBe('reset3');

      // DefaultValue should remain unchanged throughout
      expect(dataNode.defaultValue).toBeUndefined();
    });

    it('should handle reset after setValue operations', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          data: { type: 'string', default: 'initial' },
        },
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      const dataNode = node.find('/data') as StringNode;
      expect(dataNode.value).toBe('initial');
      expect(dataNode.defaultValue).toBe('initial');

      // setValue then reset
      dataNode.setValue('modified');
      await delay();
      expect(dataNode.value).toBe('modified');

      // @ts-expect-error [internal] direct __reset__ call for testing
      dataNode.__reset__({
        preferLatest: false,
        checkDefaultValueFirst: true,
        fallbackValue: 'fallback',
      });
      await delay();

      // defaultValue is 'initial' which is defined → use defaultValue
      expect(dataNode.value).toBe('initial');

      // setValue again
      dataNode.setValue('modified-again');
      await delay();
      expect(dataNode.value).toBe('modified-again');

      // defaultValue still unchanged
      expect(dataNode.defaultValue).toBe('initial');
    });
  });

  /**
   * Nested oneOf/anyOf Scenarios
   * Tests reset behavior in complex conditional schema structures
   */
  describe('Nested Conditional Schema', () => {
    it('should handle nested oneOf reset at deepest level', async () => {
      const nestedSchema: JsonSchema = {
        type: 'object',
        properties: {
          level1: { type: 'string', enum: ['A', 'B'], default: 'A' },
        },
        oneOf: [
          {
            '&if': "./level1 === 'A'",
            properties: {
              deepData: { type: 'string' },
            },
          },
          {
            '&if': "./level1 === 'B'",
            properties: {
              other: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: nestedSchema,
      }) as ObjectNode;

      await delay();

      node.setValue({
        level1: 'A',
        deepData: 'deep-value',
      });
      await delay();

      const deepDataNode = node.find('./deepData') as StringNode;
      expect(deepDataNode).not.toBeNull();
      expect(deepDataNode.value).toBe('deep-value');

      // Reset - preferLatest=false means use defaultValue
      // @ts-expect-error [internal] direct __reset__ call for testing
      deepDataNode.__reset__({
        preferLatest: false,
        checkDefaultValueFirst: true,
        fallbackValue: 'reset-deep',
      });
      await delay();

      // preferLatest=false → use defaultValue (undefined)
      expect(deepDataNode.value).toBeUndefined();
    });

    it('should handle parent level reset using defaultValue', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          selector: { type: 'string', default: 'A' },
        },
        oneOf: [
          {
            '&if': "./selector === 'A'",
            properties: {
              parent: {
                type: 'object',
                properties: {
                  child: { type: 'string', default: 'child-default' },
                },
              },
            },
          },
          {
            '&if': "./selector === 'B'",
            properties: {
              parent: { type: 'object', properties: { child: { type: 'string' } } },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      node.setValue({
        selector: 'A',
        parent: { child: 'modified-child' },
      });
      await delay();

      const parentNode = node.find('./parent') as ObjectNode;
      const childNode = node.find('./parent/child') as StringNode;

      expect(childNode.value).toBe('modified-child');
      expect(childNode.defaultValue).toBe('child-default');

      // Reset parent level with preferLatest=false
      // @ts-expect-error [internal] direct __reset__ call for testing
      parentNode.__reset__({
        preferLatest: false,
        checkDefaultValueFirst: true,
        fallbackValue: { child: 'parent-reset-child' },
      });
      await delay();

      // preferLatest=false → always use defaultValue
      // parent's defaultValue is { child: 'child-default' } (assembled from children defaults)
      expect(parentNode.value).toEqual({ child: 'child-default' });
    });
  });

  /**
   * anyOf Behavior Tests
   * Tests reset behavior specifically for anyOf schemas
   */
  describe('anyOf Reset Behavior', () => {
    it('should handle anyOf with multiple active branches', async () => {
      const anyOfSchema: JsonSchema = {
        type: 'object',
        properties: {
          flag1: { type: 'boolean', default: true },
          flag2: { type: 'boolean', default: true },
        },
        anyOf: [
          {
            '&if': './flag1 === true',
            properties: {
              field1: { type: 'string' },
            },
          },
          {
            '&if': './flag2 === true',
            properties: {
              field2: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: anyOfSchema,
      }) as ObjectNode;

      await delay();

      // Both flags are true, so both fields should exist
      node.setValue({
        flag1: true,
        flag2: true,
        field1: 'value1',
        field2: 'value2',
      });
      await delay();

      const field1Node = node.find('./field1') as StringNode;
      const field2Node = node.find('./field2') as StringNode;

      expect(field1Node).not.toBeNull();
      expect(field2Node).not.toBeNull();
      expect(field1Node.value).toBe('value1');
      expect(field2Node.value).toBe('value2');

      // Reset field1 with preferLatest=true (to use fallbackValue)
      // @ts-expect-error [internal] direct __reset__ call for testing
      field1Node.__reset__({
        preferLatest: true, // Changed to true to allow fallbackValue usage
        checkDefaultValueFirst: true,
        fallbackValue: 'reset1',
      });
      await delay();

      // preferLatest=true, checkDefaultValueFirst=true but isDefinedDefaultValue=false
      // → use fallbackValue
      expect(field1Node.value).toBe('reset1');
      // field2 should be unaffected
      expect(field2Node.value).toBe('value2');
    });

    it('should handle anyOf field appearing and disappearing', async () => {
      const anyOfSchema: JsonSchema = {
        type: 'object',
        properties: {
          toggle: { type: 'boolean', default: false },
        },
        anyOf: [
          {
            '&if': './toggle === true',
            properties: {
              conditionalField: { type: 'string', default: 'default-cond' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: anyOfSchema,
      }) as ObjectNode;

      await delay();

      // Initially toggle is false, conditionalField should not exist in value
      expect(node.value).toEqual({ toggle: false });

      // Enable toggle
      node.setValue({ toggle: true, conditionalField: 'custom-value' });
      await delay();

      const condNode = node.find('./conditionalField') as StringNode;
      expect(condNode).not.toBeNull();
      expect(condNode.value).toBe('custom-value');
      expect(condNode.defaultValue).toBe('default-cond');

      // Reset with checkDefaultValueFirst
      // @ts-expect-error [internal] direct __reset__ call for testing
      condNode.__reset__({
        preferLatest: false,
        checkDefaultValueFirst: true,
        fallbackValue: 'fallback',
      });
      await delay();

      // defaultValue is 'default-cond' which is defined → use defaultValue
      expect(condNode.value).toBe('default-cond');
    });
  });

  /**
   * Array-specific Reset Tests
   */
  describe('Array Reset with checkDefinedValue', () => {
    it('should use fallbackValue for array with empty default when preferLatest=true', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      node.setValue({ items: ['a', 'b', 'c'] });
      await delay();

      const itemsNode = node.find('/items') as ArrayNode;
      expect(itemsNode.defaultValue).toEqual([]);
      expect(itemsNode.value).toEqual(['a', 'b', 'c']);

      // @ts-expect-error [internal] direct __reset__ call for testing
      itemsNode.__reset__({
        preferLatest: true, // Must be true to use fallbackValue
        checkDefaultValueFirst: true,
        fallbackValue: ['fallback1', 'fallback2'],
      });
      await delay();

      // preferLatest=true, checkDefaultValueFirst=true, but [] is not defined
      // → use fallbackValue
      expect(itemsNode.value).toEqual(['fallback1', 'fallback2']);
    });

    it('should use defaultValue for array with non-empty default when preferLatest=true', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            default: ['default1', 'default2'],
            items: { type: 'string' },
          },
        },
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      node.setValue({ items: ['a', 'b', 'c'] });
      await delay();

      const itemsNode = node.find('/items') as ArrayNode;
      expect(itemsNode.defaultValue).toEqual(['default1', 'default2']);

      // @ts-expect-error [internal] direct __reset__ call for testing
      itemsNode.__reset__({
        preferLatest: true,
        checkDefaultValueFirst: true,
        fallbackValue: ['fallback'],
      });
      await delay();

      // preferLatest=true, checkDefaultValueFirst=true, and ['default1', 'default2'] is defined
      // → use defaultValue
      expect(itemsNode.value).toEqual(['default1', 'default2']);
    });

    it('should use defaultValue when preferLatest=false (regardless of fallback)', async () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      };

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      }) as ObjectNode;

      await delay();

      node.setValue({ items: ['a', 'b', 'c'] });
      await delay();

      const itemsNode = node.find('/items') as ArrayNode;
      expect(itemsNode.defaultValue).toEqual([]);

      // @ts-expect-error [internal] direct __reset__ call for testing
      itemsNode.__reset__({
        preferLatest: false,
        checkDefaultValueFirst: true,
        fallbackValue: ['fallback1', 'fallback2'],
      });
      await delay();

      // preferLatest=false → always use defaultValue
      expect(itemsNode.value).toEqual([]);
    });
  });
});

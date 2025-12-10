import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

/**
 * ArrayNode Default Value Initialization Tests
 *
 * This test suite verifies the behavior changes from commit 1ed54c09:
 * - When defaultValue or schema.default is provided → use that value, do NOT auto-fill minItems
 * - When no default is provided → auto-fill empty items up to minItems count
 *
 * The key change: hasDefault flag controls whether minItems auto-initialization occurs
 */
describe('ArrayNode Default Value Initialization', () => {
  /**
   * Case 1: ArrayNode as root node
   */
  describe('ArrayNode as root node', () => {
    it('should NOT auto-fill minItems when defaultValue is provided (empty array)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'string', default: 'hello' },
          minItems: 3,
        },
        defaultValue: [],
      });

      await delay();

      // With defaultValue=[], hasDefault is true → minItems auto-fill is skipped
      expect(node.value).toEqual([]);
      expect(node.value?.length).toBe(0);
    });

    it('should NOT auto-fill minItems when defaultValue is provided (partial array)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'string', default: 'hello' },
          minItems: 5,
        },
        defaultValue: ['one', 'two'],
      });

      await delay();

      // With defaultValue=['one', 'two'], hasDefault is true → minItems auto-fill is skipped
      expect(node.value).toEqual(['one', 'two']);
      expect(node.value?.length).toBe(2);
    });

    it('should use defaultValue when it exceeds minItems', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'string' },
          minItems: 2,
        },
        defaultValue: ['a', 'b', 'c', 'd', 'e'],
      });

      await delay();

      expect(node.value).toEqual(['a', 'b', 'c', 'd', 'e']);
      expect(node.value?.length).toBe(5);
    });

    it('should NOT auto-fill minItems when schema.default is provided (empty array)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'string', default: 'hello' },
          minItems: 3,
          default: [],
        },
      });

      await delay();

      // With schema.default=[], hasDefault is true → minItems auto-fill is skipped
      expect(node.value).toEqual([]);
      expect(node.value?.length).toBe(0);
    });

    it('should NOT auto-fill minItems when schema.default is provided (partial array)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'string', default: 'hello' },
          minItems: 5,
          default: ['default1', 'default2'],
        },
      });

      await delay();

      // With schema.default=['default1', 'default2'], hasDefault is true
      expect(node.value).toEqual(['default1', 'default2']);
      expect(node.value?.length).toBe(2);
    });

    it('should auto-fill minItems when NO default is provided', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'string', default: 'hello' },
          minItems: 3,
        },
      });

      await delay();

      // No defaultValue, no schema.default → hasDefault is false → auto-fill minItems
      expect(node.value).toEqual(['hello', 'hello', 'hello']);
      expect(node.value?.length).toBe(3);
    });

    it('should handle minItems=0 correctly without default', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'string', default: 'hello' },
          minItems: 0,
        },
      });

      await delay();

      // minItems=0 means no auto-fill needed
      expect(node.value).toEqual([]);
    });

    it('should handle null defaultValue correctly', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: ['array', 'null'] as const,
          items: { type: 'string', default: 'hello' },
          minItems: 3,
        },
        defaultValue: null,
      });

      await delay();

      // null is a valid defaultValue, hasDefault is true
      expect(node.value).toBeNull();
    });
  });

  /**
   * Case 2: ArrayNode under ObjectNode
   */
  describe('ArrayNode under ObjectNode', () => {
    it('should NOT auto-fill minItems when parent defaultValue provides array value (empty)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { type: 'number', default: 0 },
              minItems: 3,
            },
          },
        },
        defaultValue: {
          items: [],
        },
      });

      await delay();

      // Parent defaultValue provides items=[], so array's hasDefault is true
      expect(node.value).toEqual({});
      expect(node.value?.items).toEqual(undefined);
    });

    it('should NOT auto-fill minItems when parent defaultValue provides partial array', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { type: 'number', default: 0 },
              minItems: 5,
            },
          },
        },
        defaultValue: {
          items: [1, 2],
        },
      });

      await delay();

      // Parent defaultValue provides items=[1,2], so hasDefault is true
      expect(node.value?.items).toEqual([1, 2]);
      expect(node.value?.items?.length).toBe(2);
    });

    it('should NOT auto-fill minItems when schema.default on array is provided', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { type: 'number', default: 0 },
              minItems: 3,
              default: [10],
            },
          },
        },
      });

      await delay();

      // Array schema has default=[10], so hasDefault is true
      expect(node.value?.items).toEqual([10]);
      expect(node.value?.items?.length).toBe(1);
    });

    it('should auto-fill minItems when NO default is provided for array', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { type: 'number', default: 0 },
              minItems: 3,
            },
          },
        },
      });

      await delay();

      // No defaultValue, no schema.default → auto-fill minItems
      expect(node.value?.items).toEqual([0, 0, 0]);
      expect(node.value?.items?.length).toBe(3);
    });

    it('should handle multiple arrays with mixed default configurations', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            arrayWithDefault: {
              type: 'array',
              items: { type: 'string', default: 'x' },
              minItems: 3,
              default: ['a'],
            },
            arrayWithoutDefault: {
              type: 'array',
              items: { type: 'string', default: 'y' },
              minItems: 2,
            },
          },
        },
      });

      await delay();

      // arrayWithDefault has schema.default → no auto-fill
      expect(node.value?.arrayWithDefault).toEqual(['a']);
      // arrayWithoutDefault has no default → auto-fill minItems
      expect(node.value?.arrayWithoutDefault).toEqual(['y', 'y']);
    });

    it('should handle partial parent defaultValue (only some arrays have values)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            array1: {
              type: 'array',
              items: { type: 'string', default: 'default' },
              minItems: 2,
            },
            array2: {
              type: 'array',
              items: { type: 'string', default: 'default' },
              minItems: 2,
            },
          },
        },
        defaultValue: {
          array1: ['provided'],
        },
      });

      await delay();

      // array1 has defaultValue → no auto-fill
      expect(node.value?.array1).toEqual(['provided']);
      // array2 has no defaultValue → auto-fill minItems
      expect(node.value?.array2).toEqual(['default', 'default']);
    });
  });

  /**
   * Case 3: ArrayNode under ArrayNode (nested arrays)
   */
  describe('ArrayNode under ArrayNode (nested)', () => {
    it('should NOT auto-fill inner array minItems when defaultValue is provided', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'string', default: 'inner' },
            minItems: 3,
          },
          minItems: 2,
        },
        defaultValue: [['a'], ['b', 'c']],
      });

      await delay();

      // Outer array has defaultValue, so hasDefault is true for outer
      // Inner arrays come from defaultValue, not auto-filled
      expect(node.value).toEqual([['a'], ['b', 'c']]);
      expect(node.value?.[0]?.length).toBe(1);
      expect(node.value?.[1]?.length).toBe(2);
    });

    it('should auto-fill both outer and inner minItems when NO default is provided', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'string', default: 'inner' },
            minItems: 2,
          },
          minItems: 2,
        },
      });

      await delay();

      // No default → outer array auto-fills to minItems=2
      // Each inner array also auto-fills to minItems=2
      expect(node.value?.length).toBe(2);
      expect(node.value?.[0]).toEqual(['inner', 'inner']);
      expect(node.value?.[1]).toEqual(['inner', 'inner']);
    });

    it('should handle nested array with schema.default on inner array', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number', default: 0 },
            minItems: 3,
            default: [99],
          },
          minItems: 2,
        },
      });

      await delay();

      // Outer array has no default → auto-fill minItems=2
      // Each inner array has schema.default=[99] → use that, no auto-fill
      expect(node.value?.length).toBe(2);
      expect(node.value?.[0]).toEqual([99]);
      expect(node.value?.[1]).toEqual([99]);
    });

    it('should handle 3-level deep nested arrays', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: 'array',
              items: { type: 'number', default: 1 },
              minItems: 2,
            },
            minItems: 2,
          },
          minItems: 2,
        },
      });

      await delay();

      // All levels auto-fill to minItems=2
      expect(node.value?.length).toBe(2);
      expect(node.value?.[0]?.length).toBe(2);
      expect(node.value?.[0]?.[0]).toEqual([1, 1]);
      expect(node.value?.[0]?.[1]).toEqual([1, 1]);
      expect(node.value?.[1]?.[0]).toEqual([1, 1]);
      expect(node.value?.[1]?.[1]).toEqual([1, 1]);
    });

    it('should handle 3-level deep with mixed defaults', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: 'array',
              items: { type: 'number', default: 1 },
              minItems: 3,
              default: [42], // Inner-most has default
            },
            minItems: 2,
          },
          minItems: 2,
        },
      });

      await delay();

      // Outer and middle auto-fill, inner-most uses schema.default
      expect(node.value?.length).toBe(2);
      expect(node.value?.[0]?.length).toBe(2);
      expect(node.value?.[0]?.[0]).toEqual([42]);
      expect(node.value?.[0]?.[1]).toEqual([42]);
    });
  });

  /**
   * Case 4: ArrayNode with object items (BranchStrategy)
   */
  describe('ArrayNode with object items (BranchStrategy)', () => {
    it('should NOT auto-fill minItems when defaultValue is provided (empty array)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', default: 'anonymous' },
              age: { type: 'number', default: 0 },
            },
          },
          minItems: 3,
        },
        defaultValue: [],
      });

      await delay();

      // defaultValue=[] provided → no auto-fill
      expect(node.value).toEqual([]);
    });

    it('should NOT auto-fill minItems when defaultValue is provided (partial)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', default: 'anonymous' },
              age: { type: 'number', default: 0 },
            },
          },
          minItems: 5,
        },
        defaultValue: [{ name: 'Alice', age: 30 }],
      });

      await delay();

      expect(node.value).toEqual([{ name: 'Alice', age: 30 }]);
      expect(node.value?.length).toBe(1);
    });

    it('should auto-fill minItems with object defaults when NO default is provided', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', default: 'anonymous' },
              age: { type: 'number', default: 0 },
            },
          },
          minItems: 2,
        },
      });

      await delay();

      // No default → auto-fill minItems with objects using property defaults
      expect(node.value?.length).toBe(2);
      expect(node.value?.[0]).toEqual({ name: 'anonymous', age: 0 });
      expect(node.value?.[1]).toEqual({ name: 'anonymous', age: 0 });
    });

    it('should use items.default for object when provided', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', default: 'anonymous' },
              age: { type: 'number', default: 0 },
            },
            default: { name: 'preset', age: 99 },
          },
          minItems: 2,
        },
      });

      await delay();

      // No array default → auto-fill, but each item uses items.default
      expect(node.value?.length).toBe(2);
      expect(node.value?.[0]).toEqual({ name: 'preset', age: 99 });
      expect(node.value?.[1]).toEqual({ name: 'preset', age: 99 });
    });
  });

  /**
   * Case 5: ArrayNode with primitive items (TerminalStrategy)
   */
  describe('ArrayNode with primitive items (TerminalStrategy)', () => {
    it('should NOT auto-fill minItems when defaultValue is provided (empty array)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number', default: 100 },
          minItems: 3,
        },
        defaultValue: [],
      });

      await delay();

      expect(node.value).toEqual([]);
    });

    it('should auto-fill minItems with primitive defaults when NO default is provided', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number', default: 100 },
          minItems: 3,
        },
      });

      await delay();

      expect(node.value).toEqual([100, 100, 100]);
    });

    it('should handle boolean array with defaults', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'boolean', default: true },
          minItems: 3,
        },
      });

      await delay();

      expect(node.value).toEqual([true, true, true]);
    });

    it('should handle boolean array with explicit defaultValue', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'boolean', default: true },
          minItems: 5,
        },
        defaultValue: [false],
      });

      await delay();

      expect(node.value).toEqual([false]);
    });
  });

  /**
   * Case 6: Complex nested structures (Object → Array → Object → Array)
   */
  describe('Complex nested structures', () => {
    it('should handle Object → Array → Object → Array with various defaults', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', default: 'user' },
                tags: {
                  type: 'array',
                  items: { type: 'string', default: 'tag' },
                  minItems: 2,
                },
              },
            },
            minItems: 2,
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema,
      });

      await delay();

      // users array auto-fills to minItems=2
      // each user's tags array auto-fills to minItems=2
      expect(node.value?.users?.length).toBe(2);
      expect(node.value?.users?.[0]?.name).toBe('user');
      expect(node.value?.users?.[0]?.tags).toEqual(['tag', 'tag']);
      expect(node.value?.users?.[1]?.tags).toEqual(['tag', 'tag']);
    });

    it('should handle Object → Array → Object → Array with partial defaultValue', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', default: 'user' },
                tags: {
                  type: 'array',
                  items: { type: 'string', default: 'tag' },
                  minItems: 2,
                },
              },
            },
            minItems: 2,
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema,
        defaultValue: {
          users: [{ name: 'Alice', tags: ['custom'] }],
        },
      });

      await delay();

      // users array has defaultValue → no auto-fill for outer array
      // Alice's tags has value → no auto-fill for inner array
      expect(node.value?.users?.length).toBe(1);
      expect(node.value?.users?.[0]?.name).toBe('Alice');
      expect(node.value?.users?.[0]?.tags).toEqual(['custom']);
    });
  });

  /**
   * Case 7: Edge cases
   */
  describe('Edge cases', () => {
    it('should handle undefined defaultValue (auto-fill)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'string', default: 'x' },
          minItems: 2,
        },
        defaultValue: undefined,
      });

      await delay();

      // undefined defaultValue → hasDefault is false → auto-fill
      expect(node.value).toEqual(['x', 'x']);
    });

    it('should handle items without default (auto-fill with undefined)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'string' }, // No default on items
          minItems: 2,
        },
      });

      await delay();

      // Items pushed without default value
      expect(node.value?.length).toBe(2);
      expect(node.value?.[0]).toBeUndefined();
      expect(node.value?.[1]).toBeUndefined();
    });

    it('should ignore maxItems during minItems auto-fill (unlimited=true)', async () => {
      // After commit 446a022c: minItems auto-fill uses unlimited=true,
      // so maxItems constraint is bypassed during initialization.
      // This ensures minItems requirement is always satisfied regardless of maxItems.
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number', default: 0 },
          minItems: 5,
          maxItems: 3,
        },
      });

      await delay();

      // minItems auto-fill ignores maxItems constraint
      expect(node.value?.length).toBe(5);
      expect(node.value).toEqual([0, 0, 0, 0, 0]);
    });

    it('should handle schema.default taking precedence over items.default', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number', default: 999 },
          minItems: 3,
          default: [1, 2],
        },
      });

      await delay();

      // schema.default exists → use it, don't auto-fill
      expect(node.value).toEqual([1, 2]);
    });

    it('should handle defaultValue taking precedence over schema.default', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number', default: 999 },
          minItems: 5,
          default: [1, 2, 3],
        },
        defaultValue: [100],
      });

      await delay();

      // defaultValue takes precedence over schema.default
      expect(node.value).toEqual([100]);
    });
  });
});

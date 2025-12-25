import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import type { ArrayNode } from '../nodes/ArrayNode';

/**
 * ArrayNode maxItems unlimited Tests
 *
 * This test suite verifies the behavior introduced in commit 446a022c:
 * The `push()` method now accepts an optional `unlimited` parameter that
 * allows bypassing the `maxItems` constraint in specific scenarios:
 *
 * 1. Initial value population (defaultValue)
 * 2. setValue() operations
 * 3. minItems auto-fill during initialization
 * 4. External push() with explicit unlimited=true
 *
 * When `unlimited` is NOT provided (undefined) or false, maxItems
 * constraint is respected - this is the normal user interaction behavior.
 */
describe('ArrayNode maxItems unlimited', () => {
  /**
   * Scenario 1: Default value initialization
   * When defaultValue is provided, it should be fully applied
   * regardless of maxItems constraint.
   */
  describe('defaultValue initialization (unlimited=true)', () => {
    it('TerminalStrategy: should accept defaultValue exceeding maxItems', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number' },
          maxItems: 3,
        },
        defaultValue: [1, 2, 3, 4, 5], // 5 items, maxItems is 3
      });

      await delay();

      // defaultValue should be fully applied (unlimited=true during init)
      expect(node.value).toEqual([1, 2, 3, 4, 5]);
      expect(node.value?.length).toBe(5);
    });

    it('BranchStrategy: should accept defaultValue exceeding maxItems', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
          maxItems: 2,
        },
        defaultValue: [
          { name: 'A' },
          { name: 'B' },
          { name: 'C' },
          { name: 'D' },
        ], // 4 items, maxItems is 2
      });

      await delay();

      // defaultValue should be fully applied
      expect(node.value?.length).toBe(4);
      expect(node.value).toEqual([
        { name: 'A' },
        { name: 'B' },
        { name: 'C' },
        { name: 'D' },
      ]);
    });

    it('should accept schema.default exceeding maxItems', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'string' },
          maxItems: 2,
          default: ['a', 'b', 'c', 'd'], // 4 items, maxItems is 2
        },
      });

      await delay();

      // schema.default should be fully applied
      expect(node.value).toEqual(['a', 'b', 'c', 'd']);
      expect(node.value?.length).toBe(4);
    });
  });

  /**
   * Scenario 2: setValue() operations
   * When setValue() is called, the provided value should be fully applied
   * regardless of maxItems constraint.
   */
  describe('setValue operations (unlimited=true)', () => {
    it('TerminalStrategy: setValue should bypass maxItems constraint', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number' },
          maxItems: 3,
        },
      });

      await delay();
      expect(node.value).toEqual([]);

      // setValue should fully apply the value regardless of maxItems
      node.setValue([10, 20, 30, 40, 50, 60]);
      await delay();

      expect(node.value).toEqual([10, 20, 30, 40, 50, 60]);
      expect(node.value?.length).toBe(6);
    });

    it('BranchStrategy: setValue should bypass maxItems constraint', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
            },
          },
          maxItems: 2,
        },
      });

      await delay();
      expect(node.value).toEqual([]);

      // setValue should fully apply the value
      node.setValue([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
      await delay();

      expect(node.value?.length).toBe(4);
    });

    it('nested ArrayNode: setValue should bypass maxItems in parent', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 2,
            },
          },
        },
      });

      await delay();

      const arrayNode = node.find('./items') as ArrayNode;
      expect(arrayNode.value).toEqual([]);

      // setValue on child ArrayNode should bypass maxItems
      arrayNode.setValue(['a', 'b', 'c', 'd', 'e']);
      await delay();

      expect(arrayNode.value).toEqual(['a', 'b', 'c', 'd', 'e']);
      expect(arrayNode.length).toBe(5);
    });

    it('parent setValue should set array values bypassing maxItems', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            tags: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 3,
            },
          },
        },
      });

      await delay();

      // Parent setValue should apply full array to child
      node.setValue({ tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'] });
      await delay();

      expect(node.value?.tags).toEqual([
        'tag1',
        'tag2',
        'tag3',
        'tag4',
        'tag5',
      ]);
      expect(node.value?.tags?.length).toBe(5);
    });
  });

  /**
   * Scenario 3: minItems auto-fill
   * When no default is provided, array should auto-fill up to minItems
   * regardless of maxItems constraint.
   */
  describe('minItems auto-fill (unlimited=true)', () => {
    it('TerminalStrategy: minItems auto-fill should ignore maxItems', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number', default: 42 },
          minItems: 5,
          maxItems: 3, // Contradictory constraint: minItems > maxItems
        },
      });

      await delay();

      // minItems auto-fill should ignore maxItems
      expect(node.value?.length).toBe(5);
      expect(node.value).toEqual([42, 42, 42, 42, 42]);
    });

    it('BranchStrategy: minItems auto-fill should ignore maxItems', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'number', default: 0 },
            },
          },
          minItems: 4,
          maxItems: 2, // Contradictory constraint
        },
      });

      await delay();

      // minItems auto-fill should ignore maxItems
      expect(node.value?.length).toBe(4);
      expect(node.value).toEqual([
        { value: 0 },
        { value: 0 },
        { value: 0 },
        { value: 0 },
      ]);
    });
  });

  /**
   * Scenario 4: External push() without unlimited
   * Normal user interaction via push() should respect maxItems constraint.
   */
  describe('push() respects maxItems (unlimited=undefined)', () => {
    it('TerminalStrategy: push should be blocked when maxItems reached', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number', default: 0 },
          maxItems: 3,
        },
        defaultValue: [1, 2, 3], // Already at maxItems
      });

      await delay();
      expect(node.value?.length).toBe(3);

      // push() without unlimited should be blocked
      await node.push(4);
      await delay();

      // Value should remain unchanged
      expect(node.value).toEqual([1, 2, 3]);
      expect(node.value?.length).toBe(3);
    });

    it('BranchStrategy: push should be blocked when maxItems reached', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', default: 'item' },
            },
          },
          maxItems: 2,
        },
        defaultValue: [{ name: 'A' }, { name: 'B' }], // Already at maxItems
      });

      await delay();
      expect(node.value?.length).toBe(2);

      // push() without unlimited should be blocked
      await node.push({ name: 'C' });
      await delay();

      // Value should remain unchanged
      expect(node.value?.length).toBe(2);
      expect(node.value).toEqual([{ name: 'A' }, { name: 'B' }]);
    });

    it('push should work when under maxItems limit', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number', default: 0 },
          maxItems: 5,
        },
        defaultValue: [1, 2], // 2 items, maxItems is 5
      });

      await delay();
      expect(node.value?.length).toBe(2);

      // push() should work when under limit
      await node.push(3);
      await delay();

      expect(node.value).toEqual([1, 2, 3]);
      expect(node.value?.length).toBe(3);
    });

    it('push should return current length when blocked', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number' },
          maxItems: 2,
        },
        defaultValue: [1, 2],
      });

      await delay();

      // push() should return current length when blocked
      const result = await node.push(999);
      expect(result).toBe(2);
      expect(node.value).toEqual([1, 2]);
    });
  });

  /**
   * Scenario 5: push() with explicit unlimited=true
   * External code can bypass maxItems by passing unlimited=true.
   */
  describe('push() with unlimited=true', () => {
    it('TerminalStrategy: push with unlimited=true should bypass maxItems', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number', default: 0 },
          maxItems: 3,
        },
        defaultValue: [1, 2, 3], // Already at maxItems
      });

      await delay();
      expect(node.value?.length).toBe(3);

      // push() with unlimited=true should bypass maxItems
      await node.push(4, true);
      await delay();

      expect(node.value).toEqual([1, 2, 3, 4]);
      expect(node.value?.length).toBe(4);
    });

    it('BranchStrategy: push with unlimited=true should bypass maxItems', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', default: 0 },
            },
          },
          maxItems: 2,
        },
        defaultValue: [{ id: 1 }, { id: 2 }], // Already at maxItems
      });

      await delay();
      expect(node.value?.length).toBe(2);

      // push() with unlimited=true should bypass maxItems
      await node.push({ id: 3 }, true);
      await delay();

      expect(node.value?.length).toBe(3);
      expect(node.value).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('push with unlimited=true should return new length', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number' },
          maxItems: 2,
        },
        defaultValue: [1, 2],
      });

      await delay();

      // push() with unlimited=true should return new length
      const result = await node.push(3, true);
      expect(result).toBe(3);
      expect(node.value).toEqual([1, 2, 3]);
    });

    it('multiple pushes with unlimited=true should all succeed', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'string', default: 'x' },
          maxItems: 2,
        },
        defaultValue: ['a', 'b'],
      });

      await delay();
      expect(node.value?.length).toBe(2);

      // Multiple pushes with unlimited=true
      await node.push('c', true);
      await node.push('d', true);
      await node.push('e', true);
      await delay();

      expect(node.value).toEqual(['a', 'b', 'c', 'd', 'e']);
      expect(node.value?.length).toBe(5);
    });
  });

  /**
   * Scenario 6: Edge cases
   */
  describe('Edge cases', () => {
    it('maxItems=1 should block push when array has one item', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number' },
          maxItems: 1,
        },
        defaultValue: [1],
      });

      await delay();
      expect(node.value).toEqual([1]);

      // push() without unlimited should be blocked
      await node.push(2);
      await delay();

      expect(node.value).toEqual([1]);
    });

    it('maxItems=1 should allow push with unlimited=true', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number' },
          maxItems: 1,
        },
        defaultValue: [1],
      });

      await delay();
      expect(node.value).toEqual([1]);

      // push() with unlimited=true should work
      await node.push(2, true);
      await delay();

      expect(node.value).toEqual([1, 2]);
    });

    /**
     * maxItems=0 correctly prevents adding any items.
     * Using nullish coalescing (`??`) instead of logical OR (`||`)
     * ensures that 0 is treated as a valid limit, not as falsy.
     */
    it('maxItems=0 prevents adding any items (correct JSON Schema behavior)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number' },
          maxItems: 0, // Only empty array is allowed
        },
      });

      await delay();

      // maxItems=0 means no items allowed - push should be blocked
      await node.push(1);
      await node.push(2);
      await delay();

      expect(node.value).toEqual([]);
    });

    it('no maxItems defined should always allow push', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number' },
          // No maxItems defined
        },
      });

      await delay();

      // Push many items - should all succeed
      for (let i = 0; i < 100; i++) {
        await node.push(i);
      }
      await delay();

      expect(node.value?.length).toBe(100);
    });

    it('setValue after push should fully replace value', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number' },
          maxItems: 3,
        },
        defaultValue: [1, 2, 3],
      });

      await delay();

      // Try push (should be blocked)
      await node.push(4);
      await delay();
      expect(node.value?.length).toBe(3);

      // setValue should replace entire value
      node.setValue([10, 20, 30, 40, 50]);
      await delay();

      expect(node.value).toEqual([10, 20, 30, 40, 50]);
      expect(node.value?.length).toBe(5);
    });

    it('clear then push should respect maxItems', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'number', default: 0 },
          maxItems: 2,
        },
        defaultValue: [1, 2, 3, 4, 5], // 5 items via defaultValue
      });

      await delay();
      expect(node.value?.length).toBe(5);

      // Clear the array
      await node.clear();
      await delay();
      expect(node.value).toEqual([]);

      // Push should now respect maxItems
      await node.push(10);
      await node.push(20);
      await node.push(30); // Should be blocked
      await delay();

      expect(node.value).toEqual([10, 20]);
      expect(node.value?.length).toBe(2);
    });
  });

  /**
   * Scenario 7: Nested array scenarios
   */
  describe('Nested arrays', () => {
    it('nested array defaultValue should bypass inner maxItems', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number' },
            maxItems: 2,
          },
        },
        defaultValue: [
          [1, 2, 3, 4], // Inner array exceeds maxItems
          [5, 6, 7], // Inner array exceeds maxItems
        ],
      });

      await delay();

      expect(node.value).toEqual([
        [1, 2, 3, 4],
        [5, 6, 7],
      ]);
    });

    it('object with multiple arrays should each bypass maxItems for defaultValue', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            arr1: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 2,
            },
            arr2: {
              type: 'array',
              items: { type: 'number' },
              maxItems: 3,
            },
          },
        },
        defaultValue: {
          arr1: ['a', 'b', 'c', 'd'], // Exceeds maxItems=2
          arr2: [1, 2, 3, 4, 5], // Exceeds maxItems=3
        },
      });

      await delay();

      expect(node.value?.arr1).toEqual(['a', 'b', 'c', 'd']);
      expect(node.value?.arr2).toEqual([1, 2, 3, 4, 5]);
    });
  });
});

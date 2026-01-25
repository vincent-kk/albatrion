/**
 * ArrayNode Item Shift - UpdatePath Event Tests
 *
 * These tests verify that when array items are removed, the remaining items'
 * paths are updated correctly and UpdatePath events are emitted.
 *
 * Key scenarios:
 * 1. Removing first item causes subsequent items to shift indices
 * 2. UpdatePath event is emitted for shifted items
 * 3. Path payload contains correct previous and current values
 * 4. Deeply nested children also receive path updates
 */
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import { NodeEventType, ValidationMode } from '../nodes/type';

describe('ArrayNode - Item Shift and UpdatePath', () => {
  describe('remove() operation', () => {
    it('should update remaining items paths when first item is removed', async () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
            default: ['A', 'B', 'C'],
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
        validationMode: ValidationMode.None,
      });

      await delay();

      const arrayNode = node.find('/items') as ArrayNode;
      expect(arrayNode.children?.length).toBe(3);

      // Get references to items before removal
      const itemB = arrayNode.children?.[1]?.node;
      const itemC = arrayNode.children?.[2]?.node;

      expect(itemB?.path).toBe('/items/1');
      expect(itemC?.path).toBe('/items/2');

      // Remove first item
      await arrayNode.remove(0);
      await delay();

      // After removing index 0, B moves to index 0, C moves to index 1
      // Note: The same node objects now have updated paths
      expect(arrayNode.children?.length).toBe(2);
      expect(arrayNode.children?.[0]?.node.path).toBe('/items/0');
      expect(arrayNode.children?.[1]?.node.path).toBe('/items/1');

      // Verify values are correct (B and C remain)
      expect(arrayNode.value).toEqual(['B', 'C']);
    });

    it('should emit UpdatePath event for shifted items', async () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
            default: ['A', 'B', 'C'],
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
        validationMode: ValidationMode.None,
      });

      await delay();

      const arrayNode = node.find('/items') as ArrayNode;

      // Subscribe to item B (index 1) before removal
      const itemBListener = vi.fn();
      const itemB = arrayNode.children?.[1]?.node;
      itemB?.subscribe(itemBListener);

      // Subscribe to item C (index 2) before removal
      const itemCListener = vi.fn();
      const itemC = arrayNode.children?.[2]?.node;
      itemC?.subscribe(itemCListener);

      // Remove first item
      await arrayNode.remove(0);
      await delay();

      // Check that item B received UpdatePath event
      const itemBUpdatePathCalls = itemBListener.mock.calls.filter(
        (call) => (call[0].type & NodeEventType.UpdatePath) > 0,
      );
      expect(itemBUpdatePathCalls.length).toBeGreaterThan(0);

      // Check that item C received UpdatePath event
      const itemCUpdatePathCalls = itemCListener.mock.calls.filter(
        (call) => (call[0].type & NodeEventType.UpdatePath) > 0,
      );
      expect(itemCUpdatePathCalls.length).toBeGreaterThan(0);
    });

    it('should update path payload correctly with previous and current values', async () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
            default: ['A', 'B', 'C'],
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
        validationMode: ValidationMode.None,
      });

      await delay();

      const arrayNode = node.find('/items') as ArrayNode;

      // Subscribe to item B (index 1) before removal
      const itemBListener = vi.fn();
      const itemB = arrayNode.children?.[1]?.node;
      itemB?.subscribe(itemBListener);

      // Remove first item
      await arrayNode.remove(0);
      await delay();

      // Check UpdatePath payload
      const updatePathCall = itemBListener.mock.calls.find(
        (call) => (call[0].type & NodeEventType.UpdatePath) > 0,
      );

      expect(updatePathCall).toBeDefined();
      if (updatePathCall) {
        const payload = updatePathCall[0].payload;
        const options = updatePathCall[0].options;

        // Payload should contain the new path
        expect(payload[NodeEventType.UpdatePath]).toBe('/items/0');

        // Options should contain previous and current
        expect(options[NodeEventType.UpdatePath]).toEqual({
          previous: '/items/1',
          current: '/items/0',
        });
      }
    });

    it('should not emit UpdatePath for the removed item', async () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
            default: ['A', 'B', 'C'],
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
        validationMode: ValidationMode.None,
      });

      await delay();

      const arrayNode = node.find('/items') as ArrayNode;

      // Subscribe to item A (index 0) - the one to be removed
      const itemAListener = vi.fn();
      const itemA = arrayNode.children?.[0]?.node;
      itemA?.subscribe(itemAListener);

      // Remove first item (item A)
      await arrayNode.remove(0);
      await delay();

      // Item A should NOT receive UpdatePath event since it was removed
      const updatePathCalls = itemAListener.mock.calls.filter(
        (call) => (call[0].type & NodeEventType.UpdatePath) > 0,
      );
      expect(updatePathCalls.length).toBe(0);
    });
  });

  describe('multiple removals', () => {
    it('should correctly update paths after consecutive removals', async () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
            default: ['A', 'B', 'C', 'D', 'E'],
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
        validationMode: ValidationMode.None,
      });

      await delay();

      const arrayNode = node.find('/items') as ArrayNode;
      expect(arrayNode.children?.length).toBe(5);

      // Remove index 0 (A)
      await arrayNode.remove(0);
      await delay();

      // Now: [B, C, D, E] at indices [0, 1, 2, 3]
      expect(arrayNode.children?.length).toBe(4);
      expect(arrayNode.value).toEqual(['B', 'C', 'D', 'E']);
      expect(arrayNode.children?.[0]?.node.path).toBe('/items/0');
      expect(arrayNode.children?.[3]?.node.path).toBe('/items/3');

      // Remove index 1 (C)
      await arrayNode.remove(1);
      await delay();

      // Now: [B, D, E] at indices [0, 1, 2]
      expect(arrayNode.children?.length).toBe(3);
      expect(arrayNode.value).toEqual(['B', 'D', 'E']);
      expect(arrayNode.children?.[0]?.node.path).toBe('/items/0');
      expect(arrayNode.children?.[1]?.node.path).toBe('/items/1');
      expect(arrayNode.children?.[2]?.node.path).toBe('/items/2');
    });

    it('should handle removal from middle of array', async () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
            default: ['A', 'B', 'C', 'D'],
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
        validationMode: ValidationMode.None,
      });

      await delay();

      const arrayNode = node.find('/items') as ArrayNode;

      // Subscribe to item D (index 3) - only this should shift
      const itemDListener = vi.fn();
      const itemD = arrayNode.children?.[3]?.node;
      itemD?.subscribe(itemDListener);

      // Subscribe to item A (index 0) - should NOT shift
      const itemAListener = vi.fn();
      const itemA = arrayNode.children?.[0]?.node;
      itemA?.subscribe(itemAListener);

      // Remove index 1 (B)
      await arrayNode.remove(1);
      await delay();

      // Now: [A, C, D] at indices [0, 1, 2]
      expect(arrayNode.value).toEqual(['A', 'C', 'D']);

      // Item D should receive UpdatePath (was 3, now 2)
      const itemDUpdatePathCalls = itemDListener.mock.calls.filter(
        (call) => (call[0].type & NodeEventType.UpdatePath) > 0,
      );
      expect(itemDUpdatePathCalls.length).toBeGreaterThan(0);

      // Item A should NOT receive UpdatePath (still at index 0)
      const itemAUpdatePathCalls = itemAListener.mock.calls.filter(
        (call) => (call[0].type & NodeEventType.UpdatePath) > 0,
      );
      expect(itemAUpdatePathCalls.length).toBe(0);
    });
  });

  describe('nested object arrays', () => {
    it('should propagate path updates to deeply nested children', async () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                details: {
                  type: 'object',
                  properties: {
                    description: { type: 'string' },
                  },
                },
              },
            },
            default: [
              { name: 'Item A', details: { description: 'Desc A' } },
              { name: 'Item B', details: { description: 'Desc B' } },
              { name: 'Item C', details: { description: 'Desc C' } },
            ],
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
        validationMode: ValidationMode.None,
      });

      await delay();

      const arrayNode = node.find('/items') as ArrayNode;

      // Get deeply nested node from item B
      const itemB = arrayNode.children?.[1]?.node as ObjectNode;
      const itemBDescription = itemB.find(
        './details/description',
      ) as StringNode;

      expect(itemBDescription?.path).toBe('/items/1/details/description');

      // Subscribe to deeply nested node
      const descriptionListener = vi.fn();
      itemBDescription?.subscribe(descriptionListener);

      // Remove first item
      await arrayNode.remove(0);
      await delay();

      // Verify deeply nested path was updated
      expect(itemBDescription?.path).toBe('/items/0/details/description');

      // Verify UpdatePath event was emitted for deeply nested node
      const updatePathCalls = descriptionListener.mock.calls.filter(
        (call) => (call[0].type & NodeEventType.UpdatePath) > 0,
      );
      expect(updatePathCalls.length).toBeGreaterThan(0);

      // Verify payload
      const updatePathCall = updatePathCalls[0];
      if (updatePathCall) {
        const options = updatePathCall[0].options;
        expect(options[NodeEventType.UpdatePath]).toEqual({
          previous: '/items/1/details/description',
          current: '/items/0/details/description',
        });
      }
    });

    it('should update all child nodes paths in object array items', async () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' },
              },
            },
            default: [
              { name: 'Alice', age: 25 },
              { name: 'Bob', age: 30 },
            ],
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
        validationMode: ValidationMode.None,
      });

      await delay();

      const arrayNode = node.find('/items') as ArrayNode;

      // Get both child nodes from item B (index 1)
      const itemB = arrayNode.children?.[1]?.node as ObjectNode;
      const nameNode = itemB.find('./name');
      const ageNode = itemB.find('./age');

      expect(nameNode?.path).toBe('/items/1/name');
      expect(ageNode?.path).toBe('/items/1/age');

      // Remove first item
      await arrayNode.remove(0);
      await delay();

      // Both child nodes should have updated paths
      expect(nameNode?.path).toBe('/items/0/name');
      expect(ageNode?.path).toBe('/items/0/age');
    });
  });
});

/**
 * Propagate Batch Validation Tests for ObjectNode
 *
 * These tests verify that the Batch option properly prevents infinite loops
 * when propagating value changes from parent to children and back to parent.
 *
 * Background:
 * - When parent.setValue() is called, it propagates to children
 * - Children call parent's handleChange callback
 * - Without Batch option, this could create infinite loop
 * - Commit 2699130511d9abeafe4f53e71814748cce2ef6ca added forced Batch option
 *
 * Key scenarios:
 * 1. Count emitChange calls to ensure bounded execution
 * 2. Measure recursion depth to prevent stack overflow
 * 3. Test edge cases where early return fails
 * 4. Test async setValue after __locked__ release
 */
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { BooleanNode } from '../nodes/BooleanNode';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

describe('ObjectNode Propagate Batch Protection', () => {
  describe('emitChange call frequency', () => {
    it('should limit emitChange calls when parent setValue triggers propagate', async () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          email: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;

      // Spy on the private __emitChange__ method via subscription
      const emitChangeCounter = vi.fn();
      objectNode.subscribe(emitChangeCounter);

      // Parent setValue should propagate to children with Batch option
      objectNode.setValue({
        name: 'Alice',
        age: 25,
        email: 'alice@example.com',
      });
      await delay();

      // Count how many times events were emitted
      const callCount = emitChangeCounter.mock.calls.length;

      // Should be bounded (not thousands of calls indicating infinite loop)
      // Typical expectation: < 20 calls for simple structure
      expect(callCount).toBeLessThan(20);

      // Verify final value is correct despite batching
      expect(objectNode.value).toEqual({
        name: 'Alice',
        age: 25,
        email: 'alice@example.com',
      });
    });

    it('should prevent multiple RequestEmitChange events in same sync stack', async () => {
      const schema = {
        type: 'object',
        properties: {
          field1: { type: 'string' },
          field2: { type: 'string' },
          field3: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;

      const listener = vi.fn();
      objectNode.subscribe(listener);

      // Multiple child updates in same sync stack
      const field1 = objectNode.find('./field1') as StringNode;
      const field2 = objectNode.find('./field2') as StringNode;
      const field3 = objectNode.find('./field3') as StringNode;

      field1.setValue('value1');
      field2.setValue('value2');
      field3.setValue('value3');

      await delay();

      // Should batch events efficiently
      const callCount = listener.mock.calls.length;
      expect(callCount).toBeLessThan(30);

      expect(objectNode.value).toEqual({
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
      });
    });
  });

  describe('recursion depth measurement', () => {
    it('should not create deep recursion when propagating values', async () => {
      const schema = {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
          c: { type: 'string' },
          d: { type: 'string' },
          e: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;

      // Track maximum call stack depth
      let maxDepth = 0;
      let currentDepth = 0;

      const trackingListener = vi.fn(() => {
        currentDepth++;
        if (currentDepth > maxDepth) maxDepth = currentDepth;
        // Simulate some processing
        Promise.resolve().then(() => currentDepth--);
      });

      objectNode.subscribe(trackingListener);

      // setValue should not create deep recursion
      objectNode.setValue({ a: '1', b: '2', c: '3', d: '4', e: '5' });
      await delay();
      await delay(); // Extra delay for all promises to resolve

      // Max depth should be reasonable (not hundreds indicating recursion)
      // Typical expectation: < 10 for simple propagation
      expect(maxDepth).toBeLessThan(10);
    });

    it('should handle nested objects without stack overflow', async () => {
      const schema = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'object',
                properties: {
                  level3: {
                    type: 'object',
                    properties: {
                      deep: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const rootNode = node as ObjectNode;

      // This should not cause stack overflow
      expect(() => {
        rootNode.setValue({
          level1: {
            level2: {
              level3: {
                deep: 'value',
              },
            },
          },
        });
      }).not.toThrow();

      await delay();

      expect(rootNode.value).toEqual({
        level1: {
          level2: {
            level3: {
              deep: 'value',
            },
          },
        },
      });
    });
  });

  describe('early return edge cases', () => {
    it('should handle case where draft[property] === input check fails', async () => {
      const schema = {
        type: 'object',
        properties: {
          counter: { type: 'number', default: 0 },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;
      const counterNode = objectNode.find('./counter') as NumberNode;

      const listener = vi.fn();
      objectNode.subscribe(listener);

      // Rapidly change same value multiple times
      // This might bypass the early return check
      counterNode.setValue(1);
      counterNode.setValue(1);
      counterNode.setValue(1);
      counterNode.setValue(1);
      counterNode.setValue(1);

      await delay();

      // Should still be bounded
      const callCount = listener.mock.calls.length;
      expect(callCount).toBeLessThan(50);

      expect(objectNode.value).toEqual({ counter: 1 });
    });

    it('should handle alternating values that bypass early return', async () => {
      const schema = {
        type: 'object',
        properties: {
          toggle: { type: 'boolean', default: false },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;
      const toggleNode = objectNode.find('./toggle');

      const listener = vi.fn();
      objectNode.subscribe(listener);

      // Rapidly alternate values in same sync stack
      (toggleNode as BooleanNode)?.setValue(true);
      (toggleNode as BooleanNode)?.setValue(false);
      (toggleNode as BooleanNode)?.setValue(true);
      (toggleNode as BooleanNode)?.setValue(false);
      (toggleNode as BooleanNode)?.setValue(true);

      await delay();

      const callCount = listener.mock.calls.length;
      expect(callCount).toBeLessThan(50);

      expect(objectNode.value).toEqual({ toggle: true });
    });
  });

  describe('async setValue after locked release', () => {
    it('should handle async setValue calls after propagate completes', async () => {
      const schema = {
        type: 'object',
        properties: {
          field: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;
      const fieldNode = objectNode.find('./field') as StringNode;

      const listener = vi.fn();
      objectNode.subscribe(listener);

      // Initial setValue
      objectNode.setValue({ field: 'initial' });
      await delay();

      // Async setValue after __locked__ is released
      setTimeout(() => {
        fieldNode.setValue('async-value');
      }, 10);

      await delay(20);

      const callCount = listener.mock.calls.length;
      expect(callCount).toBeLessThan(50);

      expect(objectNode.value).toEqual({ field: 'async-value' });
    });

    it('should handle Promise-based async updates', async () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          status: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;
      const nameNode = objectNode.find('./name') as StringNode;
      const statusNode = objectNode.find('./status') as StringNode;

      const listener = vi.fn();
      objectNode.subscribe(listener);

      // Simulate async operation
      await Promise.resolve().then(() => {
        nameNode.setValue('Async Name');
      });

      await delay();

      await Promise.resolve().then(() => {
        statusNode.setValue('Async Status');
      });

      await delay();

      const callCount = listener.mock.calls.length;
      expect(callCount).toBeLessThan(50);

      expect(objectNode.value).toEqual({
        name: 'Async Name',
        status: 'Async Status',
      });
    });
  });

  describe('complex scenarios', () => {
    it('should handle computed properties during propagate', async () => {
      const schema = {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['basic', 'premium'] },
          price: { type: 'number' },
          premiumFeature: {
            type: 'string',
            computed: {
              visible: '../category === "premium"',
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;

      const listener = vi.fn();
      objectNode.subscribe(listener);

      // Parent setValue with computed properties involved
      objectNode.setValue({ category: 'premium', price: 100 });
      await delay();

      const callCount = listener.mock.calls.length;
      expect(callCount).toBeLessThan(50);

      const premiumFeatureNode = objectNode.find('./premiumFeature');
      expect(premiumFeatureNode?.visible).toBe(true);
    });

    it('should handle multiple nested objects with computed properties', async () => {
      const schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['admin', 'user'] },
              permissions: {
                type: 'object',
                properties: {
                  canEdit: {
                    type: 'boolean',
                    computed: {
                      active: '../../type === "admin"',
                    },
                  },
                },
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const rootNode = node as ObjectNode;

      const listener = vi.fn();
      rootNode.subscribe(listener);

      // Complex nested setValue
      rootNode.setValue({
        user: {
          type: 'admin',
          permissions: {},
        },
      });
      await delay();

      const callCount = listener.mock.calls.length;
      expect(callCount).toBeLessThan(100);

      const userNode = rootNode.find('./user') as ObjectNode;
      const permissionsNode = userNode.find('./permissions') as ObjectNode;
      const canEditNode = permissionsNode.find('./canEdit');

      expect(canEditNode?.active).toBe(true);
    });
  });

  describe('performance bounds', () => {
    it('should complete propagation within reasonable time', async () => {
      const schema = {
        type: 'object',
        properties: {
          f1: { type: 'string' },
          f2: { type: 'string' },
          f3: { type: 'string' },
          f4: { type: 'string' },
          f5: { type: 'string' },
          f6: { type: 'string' },
          f7: { type: 'string' },
          f8: { type: 'string' },
          f9: { type: 'string' },
          f10: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;

      const startTime = performance.now();

      objectNode.setValue({
        f1: 'v1',
        f2: 'v2',
        f3: 'v3',
        f4: 'v4',
        f5: 'v5',
        f6: 'v6',
        f7: 'v7',
        f8: 'v8',
        f9: 'v9',
        f10: 'v10',
      });

      await delay();

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (< 50ms for simple case)
      expect(duration).toBeLessThan(50);

      expect(objectNode.value).toEqual({
        f1: 'v1',
        f2: 'v2',
        f3: 'v3',
        f4: 'v4',
        f5: 'v5',
        f6: 'v6',
        f7: 'v7',
        f8: 'v8',
        f9: 'v9',
        f10: 'v10',
      });
    });
  });
});

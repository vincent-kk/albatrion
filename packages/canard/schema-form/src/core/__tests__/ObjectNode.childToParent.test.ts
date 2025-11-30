/**
 * Child-to-Parent Update Tests for ObjectNode
 *
 * These tests verify real user scenarios where child nodes are modified
 * and parent nodes receive update notifications. This is different from
 * directly calling setValue() on the parent node.
 *
 * Key scenarios:
 * 1. Child node value change triggers parent UpdateValue event
 * 2. Parent's settled flag should be true (no Isolate option)
 * 3. Multiple child changes batch correctly
 * 4. Computed properties in siblings react to child changes
 */
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { BooleanNode } from '../nodes/BooleanNode';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import { NodeEventType } from '../nodes/type';

describe('ObjectNode Child-to-Parent Updates', () => {
  describe('single child value change', () => {
    it('should update parent when child node value changes', async () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;
      const nameNode = objectNode.find('./name') as StringNode;

      const parentListener = vi.fn();
      objectNode.subscribe(parentListener);

      // Real user scenario: child node changes
      nameNode.setValue('Alice');
      await delay();

      // Verify parent received UpdateValue event
      expect(parentListener).toHaveBeenCalled();
      const updateValueCall = parentListener.mock.calls.find(
        (call) => call[0].type & NodeEventType.UpdateValue,
      );
      expect(updateValueCall).toBeDefined();

      // Verify parent value updated
      expect(objectNode.value).toEqual({ name: 'Alice' });
    });

    it('should set settled=true when child triggers parent update (no Isolate)', async () => {
      const schema = {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;
      const titleNode = objectNode.find('./title') as StringNode;

      const parentListener = vi.fn();
      objectNode.subscribe(parentListener);

      titleNode.setValue('My Title');
      await delay();

      // Find UpdateValue event
      const updateValueCall = parentListener.mock.calls.find(
        (call) => call[0].type & NodeEventType.UpdateValue,
      );

      expect(updateValueCall).toBeDefined();
      const options = updateValueCall![0].options[NodeEventType.UpdateValue];

      // settled should be true when child triggers update (no Isolate option)
      expect(options.settled).toBe(true);
      expect(options.current).toEqual({ title: 'My Title' });
    });
  });

  describe('multiple child changes', () => {
    it('should batch multiple child changes in same synchronous stack', async () => {
      const schema = {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;
      const firstNameNode = objectNode.find('./firstName') as StringNode;
      const lastNameNode = objectNode.find('./lastName') as StringNode;
      const emailNode = objectNode.find('./email') as StringNode;

      const parentListener = vi.fn();
      objectNode.subscribe(parentListener);

      // Multiple child changes in same synchronous stack
      firstNameNode.setValue('John');
      lastNameNode.setValue('Doe');
      emailNode.setValue('john@example.com');

      await delay();

      // Parent should receive updates
      expect(parentListener).toHaveBeenCalled();

      // Final value should include all changes
      expect(objectNode.value).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });
    });

    it('should trigger separate events for sequential child changes', async () => {
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

      const parentListener = vi.fn();
      objectNode.subscribe(parentListener);

      // Sequential changes with delay
      counterNode?.setValue(1);
      await delay();

      counterNode?.setValue(2);
      await delay();

      counterNode?.setValue(3);
      await delay();

      // Should have received multiple update events
      const updateValueCalls = parentListener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateValue,
      );

      expect(updateValueCalls.length).toBeGreaterThanOrEqual(3);
      expect(objectNode.value).toEqual({ counter: 3 });
    });
  });

  describe('computed properties with child changes', () => {
    it('should update sibling computed properties when child changes', async () => {
      const schema = {
        type: 'object',
        properties: {
          price: { type: 'number', default: 0 },
          discount: { type: 'number', default: 0 },
          finalPrice: {
            type: 'number',
            computed: {
              active: '../price > 0',
              visible: '../discount > 0',
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
      const priceNode = objectNode.find('./price') as NumberNode;
      const discountNode = objectNode.find('./discount') as NumberNode;
      const finalPriceNode = objectNode.find('./finalPrice') as NumberNode;

      // Initially finalPrice should be inactive and invisible
      expect(finalPriceNode?.active).toBe(false);
      expect(finalPriceNode?.visible).toBe(false);

      // Change price - should activate finalPrice
      priceNode?.setValue(100);
      await delay();

      expect(finalPriceNode?.active).toBe(true);
      expect(finalPriceNode?.visible).toBe(false);

      // Change discount - should make finalPrice visible
      discountNode?.setValue(10);
      await delay();

      expect(finalPriceNode?.active).toBe(true);
      expect(finalPriceNode?.visible).toBe(true);
    });

    it('should update sibling visibility when child triggers dependency', async () => {
      const schema = {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['basic', 'premium'] },
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
      const categoryNode = objectNode.find('./category') as StringNode;
      const premiumFeatureNode = objectNode.find('./premiumFeature');

      const parentListener = vi.fn();
      objectNode.subscribe(parentListener);

      categoryNode.setValue('premium');
      await delay();

      // Parent should receive events
      expect(parentListener).toHaveBeenCalled();
      expect(premiumFeatureNode?.visible).toBe(true);
    });
  });

  describe('nested object child changes', () => {
    it('should propagate child changes through multiple levels', async () => {
      const schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
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
      const userNode = rootNode.find('./user') as ObjectNode;
      const profileNode = userNode.find('./profile') as ObjectNode;
      const nameNode = profileNode.find('./name') as StringNode;

      const rootListener = vi.fn();
      const userListener = vi.fn();
      const profileListener = vi.fn();

      rootNode.subscribe(rootListener);
      userNode.subscribe(userListener);
      profileNode.subscribe(profileListener);

      // Deepest child changes
      nameNode.setValue('Bob');
      await delay();

      // All ancestor nodes should receive UpdateValue events
      expect(profileListener).toHaveBeenCalled();
      expect(userListener).toHaveBeenCalled();
      expect(rootListener).toHaveBeenCalled();

      // Verify final structure
      expect(rootNode.value).toEqual({
        user: {
          profile: {
            name: 'Bob',
          },
        },
      });
    });
  });

  describe('event flag verification', () => {
    it('should emit UpdateValue event when child changes', async () => {
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

      const parentListener = vi.fn();
      objectNode.subscribe(parentListener);

      fieldNode.setValue('test');
      await delay();

      // Check that UpdateValue event was fired
      const allEvents = parentListener.mock.calls.map((call) => call[0]);

      const hasUpdateValue = allEvents.some(
        (event) => event.type & NodeEventType.UpdateValue,
      );

      expect(hasUpdateValue).toBe(true);
      expect(objectNode.value).toEqual({ field: 'test' });
    });

    it('should update dependent visibility when child changes', async () => {
      const schema = {
        type: 'object',
        properties: {
          toggle: { type: 'boolean', default: false },
          dependent: {
            type: 'string',
            computed: {
              visible: '../toggle === true',
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
      const toggleNode = objectNode.find('./toggle') as BooleanNode;
      const dependentNode = objectNode.find('./dependent');

      // Initially invisible
      expect(dependentNode?.visible).toBe(false);

      const parentListener = vi.fn();
      objectNode.subscribe(parentListener);

      toggleNode?.setValue(true);
      await delay();

      // Should update dependent visibility
      expect(dependentNode?.visible).toBe(true);
      expect(parentListener).toHaveBeenCalled();
    });
  });
});

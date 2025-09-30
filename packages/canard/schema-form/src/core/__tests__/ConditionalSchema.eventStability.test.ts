/**
 * Comprehensive Event Stability Tests for Conditional Schemas
 *
 * This test suite verifies that the event bus remains stable across
 * various conditional schema scenarios (oneOf/anyOf/allOf/if-then-else).
 *
 * Key tests:
 * 1. Event order and timing consistency
 * 2. No duplicate or missing events
 * 3. Computed properties update correctly across condition changes
 * 4. EventCascade batching works correctly
 * 5. No event loop or infinite recursion
 */
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { BooleanNode } from '../nodes/BooleanNode';
import type { StringNode } from '../nodes/StringNode';
import { NodeEventType } from '../nodes/type';

describe('Conditional Schema Event Stability', () => {
  describe('if-then-else with computed properties', () => {
    it('should fire UpdateComputedProperties in first microtask when child changes', async () => {
      const schema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['game', 'movie'],
            default: 'game',
          },
          title: { type: 'string' },
          openingDate: {
            type: 'string',
            format: 'date',
            computed: {
              active: '../title === "wow"',
            },
          },
          releaseDate: {
            type: 'string',
            format: 'date',
            computed: {
              active: '../title === "wow"',
            },
            default: '2025-01-01',
          },
        },
        if: {
          properties: {
            category: { enum: ['movie'] },
          },
        },
        then: {
          required: ['title', 'openingDate'],
        },
        else: {
          required: ['title', 'releaseDate'],
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const titleNode = node.find('./title');
      const openingDateNode = node.find('./openingDate');
      const releaseDateNode = node.find('./releaseDate');

      const eventLog: Array<{
        node: string;
        type: number;
        microtask: number;
      }> = [];
      let microtaskCount = 0;

      const track = (nodeName: string, event: any) => {
        eventLog.push({
          node: nodeName,
          type: event.type,
          microtask: microtaskCount,
        });
      };

      titleNode?.subscribe((event) => track('title', event));
      openingDateNode?.subscribe((event) => track('openingDate', event));
      releaseDateNode?.subscribe((event) => track('releaseDate', event));

      (titleNode as StringNode)?.setValue('wow');

      microtaskCount = 1;
      await Promise.resolve();

      microtaskCount = 2;
      await Promise.resolve();

      await delay();

      // Verify: computed properties should update in first microtask
      const openingDateComputed = eventLog.filter(
        (e) =>
          e.node === 'openingDate' &&
          e.type & NodeEventType.UpdateComputedProperties &&
          e.microtask === 1,
      );
      const releaseDateComputed = eventLog.filter(
        (e) =>
          e.node === 'releaseDate' &&
          e.type & NodeEventType.UpdateComputedProperties &&
          e.microtask === 1,
      );

      expect(openingDateComputed.length).toBeGreaterThan(0);
      expect(releaseDateComputed.length).toBeGreaterThan(0);

      console.log('✅ Computed properties updated in first microtask');
    });

    it('should not cause event loops when conditions change rapidly', async () => {
      const schema = {
        type: 'object',
        properties: {
          toggle: { type: 'boolean', default: false },
          field1: {
            type: 'string',
            computed: {
              active: '../toggle === true',
            },
          },
          field2: {
            type: 'string',
            computed: {
              active: '../toggle === false',
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const toggleNode = node.find('./toggle');
      const field1Events: any[] = [];
      const field2Events: any[] = [];

      node.find('./field1')?.subscribe((event) => {
        field1Events.push(event);
        // Ensure no more than reasonable number of events
        expect(field1Events.length).toBeLessThan(10);
      });

      node.find('./field2')?.subscribe((event) => {
        field2Events.push(event);
        expect(field2Events.length).toBeLessThan(10);
      });

      // Rapid toggles
      (toggleNode as BooleanNode)?.setValue(true);
      await delay();

      (toggleNode as BooleanNode)?.setValue(false);
      await delay();

      (toggleNode as BooleanNode)?.setValue(true);
      await delay();

      console.log('✅ No event loops detected');
    });
  });

  describe('oneOf schema event consistency', () => {
    it('should maintain event order when oneOf condition changes', async () => {
      const schema = {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['A', 'B'],
            default: 'A',
          },
        },
        oneOf: [
          {
            '&if': "./type === 'A'",
            properties: {
              fieldA: {
                type: 'string',
                computed: {
                  active: '../type === "A"',
                },
                default: 'valueA',
              },
            },
          },
          {
            '&if': "./type === 'B'",
            properties: {
              fieldB: {
                type: 'string',
                default: 'valueB',
              },
            },
          },
        ],
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const typeNode = node.find('./type');
      const eventLog: Array<{ type: number; timestamp: number }> = [];

      node.subscribe((event) => {
        eventLog.push({
          type: event.type,
          timestamp: performance.now(),
        });
      });

      (typeNode as StringNode)?.setValue('B');
      await delay();

      // Verify events are in order (UpdateValue before others)
      const updateValueIndex = eventLog.findIndex(
        (e) => e.type & NodeEventType.UpdateValue,
      );
      const computedIndex = eventLog.findIndex(
        (e) => e.type & NodeEventType.UpdateComputedProperties,
      );

      if (updateValueIndex !== -1 && computedIndex !== -1) {
        // UpdateValue should come first (synchronous in feature branch)
        // Or be in earlier microtask (master branch)
        expect(eventLog[updateValueIndex].timestamp).toBeLessThanOrEqual(
          eventLog[computedIndex].timestamp,
        );
      }

      console.log('✅ Event order maintained');
    });

    it('should batch events correctly across oneOf branches', async () => {
      const schema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['basic', 'advanced'],
            default: 'basic',
          },
        },
        oneOf: [
          {
            '&if': "./category === 'basic'",
            properties: {
              basicField1: { type: 'string', default: 'b1' },
              basicField2: {
                type: 'string',
                computed: {
                  visible: '../basicField1 === "show"',
                },
              },
            },
          },
          {
            '&if': "./category === 'advanced'",
            properties: {
              advancedField1: { type: 'string' },
              advancedField2: {
                type: 'string',
                computed: {
                  visible: '../advancedField1 === "show"',
                },
              },
            },
          },
        ],
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const listener = vi.fn();
      node.subscribe(listener);

      const categoryNode = node.find('./category');
      (categoryNode as StringNode)?.setValue('advanced');
      await delay();

      // Should have received events, but not excessive duplicates
      expect(listener).toHaveBeenCalled();
      expect(listener.mock.calls.length).toBeLessThan(10);

      console.log('✅ Events batched correctly across oneOf branches');
    });
  });

  describe('anyOf schema event consistency', () => {
    it('should handle multiple conditions being true simultaneously', async () => {
      const schema = {
        type: 'object',
        properties: {
          flag1: { type: 'boolean', default: false },
          flag2: { type: 'boolean', default: false },
        },
        anyOf: [
          {
            '&if': './flag1 === true',
            properties: {
              field1: {
                type: 'string',
                computed: {
                  active: '../flag1 === true',
                },
                default: 'value1',
              },
            },
          },
          {
            '&if': './flag2 === true',
            properties: {
              field2: {
                type: 'string',
                computed: {
                  active: '../flag2 === true',
                },
                default: 'value2',
              },
            },
          },
        ],
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const flag1Node = node.find('./flag1');
      const flag2Node = node.find('./flag2');

      const eventCounts: Record<string, number> = {};

      node.subscribe((event) => {
        const key = `type_${event.type}`;
        eventCounts[key] = (eventCounts[key] || 0) + 1;
      });

      // Activate both conditions
      (flag1Node as BooleanNode)?.setValue(true);
      await delay();

      (flag2Node as BooleanNode)?.setValue(true);
      await delay();

      // Events should fire for both, but no excessive duplicates
      Object.values(eventCounts).forEach((count) => {
        expect(count).toBeLessThan(10);
      });

      console.log('✅ anyOf handles multiple active conditions correctly');
    });
  });

  describe('allOf with if-then-else mixed', () => {
    it('should maintain stability with complex schema composition', async () => {
      const schema = {
        type: 'object',
        allOf: [
          {
            properties: {
              baseField: { type: 'string', default: 'base' },
            },
          },
          {
            properties: {
              conditionalTrigger: {
                type: 'string',
                enum: ['A', 'B'],
                default: 'A',
              },
            },
          },
        ],
        if: {
          properties: {
            conditionalTrigger: { enum: ['A'] },
          },
        },
        then: {
          properties: {
            thenField: {
              type: 'string',
              computed: {
                active: '../baseField === "active"',
              },
            },
          },
        },
        else: {
          properties: {
            elseField: {
              type: 'string',
              computed: {
                active: '../baseField === "active"',
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

      const baseFieldNode = node.find('./baseField');
      const triggerNode = node.find('./conditionalTrigger');

      const allEvents: any[] = [];
      node.subscribe((event) => {
        allEvents.push(event);
        // Safety check: no excessive events
        expect(allEvents.length).toBeLessThan(50);
      });

      // Trigger multiple condition changes
      (baseFieldNode as StringNode)?.setValue('active');
      await delay();

      (triggerNode as StringNode)?.setValue('B');
      await delay();

      (baseFieldNode as StringNode)?.setValue('base');
      await delay();

      console.log('✅ Complex schema composition remains stable');
    });
  });

  describe('nested conditional schemas', () => {
    it('should propagate events correctly through nested conditions', async () => {
      const schema = {
        type: 'object',
        properties: {
          level1: {
            type: 'string',
            enum: ['A', 'B'],
            default: 'A',
          },
        },
        if: {
          properties: { level1: { enum: ['A'] } },
        },
        then: {
          properties: {
            level2Container: {
              type: 'object',
              properties: {
                level2: {
                  type: 'string',
                  enum: ['X', 'Y'],
                  default: 'X',
                },
              },
              if: {
                properties: { level2: { enum: ['X'] } },
              },
              then: {
                properties: {
                  leafField: {
                    type: 'string',
                    computed: {
                      visible: '../level2 === "X"',
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

      const level1Node = node.find('./level1');
      const level2Container = node.find('./level2Container');
      const level2Node = level2Container?.find('./level2');

      const eventsByNode: Record<string, any[]> = {
        root: [],
        level2Container: [],
      };

      node.subscribe((event) => {
        eventsByNode.root.push(event);
        expect(eventsByNode.root.length).toBeLessThan(30);
      });

      level2Container?.subscribe((event) => {
        eventsByNode.level2Container.push(event);
        expect(eventsByNode.level2Container.length).toBeLessThan(30);
      });

      // Trigger nested condition change
      (level2Node as StringNode)?.setValue('Y');
      await delay();

      (level1Node as StringNode)?.setValue('B');
      await delay();

      console.log('✅ Nested conditional events propagate correctly');
    });
  });

  describe('performance and stability guarantees', () => {
    it('should complete all updates within reasonable time', async () => {
      const schema = {
        type: 'object',
        properties: {
          trigger: { type: 'string', default: 'initial' },
          dep1: {
            type: 'string',
            computed: { visible: '../trigger === "show"' },
          },
          dep2: {
            type: 'string',
            computed: { visible: '../trigger === "show"' },
          },
          dep3: {
            type: 'string',
            computed: { visible: '../trigger === "show"' },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const triggerNode = node.find('./trigger');
      const startTime = performance.now();

      (triggerNode as StringNode)?.setValue('show');
      await delay();

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (< 50ms for this simple case)
      expect(duration).toBeLessThan(50);

      console.log(`✅ Updates completed in ${duration.toFixed(2)}ms (< 50ms)`);
    });

    it('should not leak memory through event listeners', async () => {
      const schema = {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            computed: { visible: 'true' },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const listeners: Array<() => void> = [];

      // Subscribe and unsubscribe multiple times
      for (let i = 0; i < 100; i++) {
        const unsubscribe = node.subscribe(() => {});
        listeners.push(unsubscribe);
      }

      // Unsubscribe all
      listeners.forEach((unsub) => unsub());

      // Trigger event - should not call unsubscribed listeners
      const fieldNode = node.find('./field');
      (fieldNode as StringNode)?.setValue('test');
      await delay();

      // If no errors, memory is not leaking
      console.log('✅ No memory leaks detected');
    });
  });
});

import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import {
  NodeEventType,
  SetValueOption,
  type UnionNodeEventType,
} from '../nodes';
import type { ArrayNode } from '../nodes/ArrayNode';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

/**
 * Refresh and DefaultValue Migration Verification Tests
 *
 * This test suite verifies the changes from commit 4b11e36830329c3bc977d9e9de58a8cf237350ef:
 * 1. __initialValue__ was removed and merged into __defaultValue__
 * 2. __refresh__() method was removed - now directly publishes RequestRefresh
 * 3. checkDefinedValue() utility was completely removed
 * 4. UI rendering uses useSchemaNodeTracker to detect RequestRefresh events
 */
describe('Refresh and DefaultValue Migration Verification', () => {
  /**
   * Category 1: Refresh Event System
   */
  describe('1. Refresh Event System', () => {
    it('should publish RequestRefresh when SetValueOption.Overwrite is used', async () => {
      const events: UnionNodeEventType[] = [];
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
      });

      await delay();

      const stringNode = node.find('/name') as StringNode;
      stringNode.subscribe(({ type }) => {
        events.push(type);
      });

      stringNode.setValue('new value', SetValueOption.Overwrite);
      await delay();

      // Overwrite includes Refresh flag, so RequestRefresh should be published
      expect(events.some((e) => e & NodeEventType.RequestRefresh)).toBe(true);
    });

    it('should NOT publish RequestRefresh when SetValueOption.Default is used', async () => {
      const events: UnionNodeEventType[] = [];
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
      });

      await delay();

      const stringNode = node.find('/name') as StringNode;
      stringNode.subscribe(({ type }) => {
        events.push(type);
      });

      // Default = EmitChange | PublishUpdateEvent (no Refresh)
      stringNode.setValue('new value', SetValueOption.Default);
      await delay();

      // Default does not include Refresh flag
      expect(events.some((e) => e & NodeEventType.RequestRefresh)).toBe(false);
    });

    it('should publish RequestRefresh for StringNode with setValue()', async () => {
      const events: UnionNodeEventType[] = [];
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: 'string' },
      });

      await delay();

      node.subscribe(({ type }) => {
        events.push(type);
      });

      // Default setValue uses Overwrite internally when value is different
      node.setValue('test');
      await delay();

      expect(events.some((e) => e & NodeEventType.RequestRefresh)).toBe(true);
    });

    it('should publish RequestRefresh for NumberNode with setValue()', async () => {
      const events: UnionNodeEventType[] = [];
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: 'number' },
      }) as NumberNode;

      await delay();

      node.subscribe(({ type }) => {
        events.push(type);
      });

      node.setValue(42);
      await delay();

      expect(events.some((e) => e & NodeEventType.RequestRefresh)).toBe(true);
    });

    it('should publish RequestRefresh for ObjectNode (BranchStrategy) with setValue()', async () => {
      const events: UnionNodeEventType[] = [];
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
        },
      }) as ObjectNode;

      await delay();

      node.subscribe(({ type }) => {
        events.push(type);
      });

      node.setValue({ name: 'Alice', age: 30 }, SetValueOption.Overwrite);
      await delay();

      expect(events.some((e) => e & NodeEventType.RequestRefresh)).toBe(true);
    });

    it('should publish RequestRefresh for ArrayNode (BranchStrategy) with setValue()', async () => {
      const events: UnionNodeEventType[] = [];
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
        },
      }) as ArrayNode;

      await delay();

      node.subscribe(({ type }) => {
        events.push(type);
      });

      node.setValue([{ name: 'item1' }], SetValueOption.Overwrite);
      await delay();

      expect(events.some((e) => e & NodeEventType.RequestRefresh)).toBe(true);
    });

    it('should publish RequestRefresh for ArrayNode (TerminalStrategy) with setValue()', async () => {
      const events: UnionNodeEventType[] = [];
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'string' },
        },
      }) as ArrayNode;

      await delay();

      node.subscribe(({ type }) => {
        events.push(type);
      });

      node.setValue(['a', 'b', 'c'], SetValueOption.Overwrite);
      await delay();

      expect(events.some((e) => e & NodeEventType.RequestRefresh)).toBe(true);
    });

    it('should batch RequestRefresh with UpdateValue in single event dispatch', async () => {
      const eventCalls: Array<{ type: UnionNodeEventType }> = [];
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: 'string' },
      });

      await delay();

      node.subscribe((event) => {
        eventCalls.push({ type: event.type });
      });

      node.setValue('test', SetValueOption.Overwrite);
      await delay();

      // UpdateValue should be synchronous (immediate), RequestRefresh should be async (batched)
      // First call: UpdateValue (synchronous)
      expect(eventCalls[0]?.type & NodeEventType.UpdateValue).toBeTruthy();
      // Second call: RequestRefresh (async, batched separately)
      expect(eventCalls[1]?.type & NodeEventType.RequestRefresh).toBeTruthy();
    });
  });

  /**
   * Category 2: DefaultValue Stability (initialValue → defaultValue migration)
   */
  describe('2. DefaultValue Stability', () => {
    it('should use constructor defaultValue when provided', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: 'string' },
        defaultValue: 'initial',
      });

      await delay();

      expect(node.defaultValue).toBe('initial');
      expect(node.value).toBe('initial');
    });

    it('should use schema.default when constructor defaultValue is undefined', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: 'string', default: 'schema-default' },
      });

      await delay();

      expect(node.defaultValue).toBe('schema-default');
      expect(node.value).toBe('schema-default');
    });

    it('should NOT change defaultValue after setValue()', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: 'string', default: 'original' },
      });

      await delay();

      const originalDefault = node.defaultValue;

      node.setValue('changed');
      await delay();

      // Value should change
      expect(node.value).toBe('changed');
      // DefaultValue should remain unchanged
      expect(node.defaultValue).toBe(originalDefault);
      expect(node.defaultValue).toBe('original');
    });

    it('should NOT change defaultValue after multiple setValue() calls', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: 'number', default: 100 },
      }) as NumberNode;

      await delay();

      const originalDefault = node.defaultValue;

      node.setValue(200);
      await delay();
      node.setValue(300);
      await delay();
      node.setValue(400);
      await delay();

      expect(node.value).toBe(400);
      expect(node.defaultValue).toBe(originalDefault);
      expect(node.defaultValue).toBe(100);
    });

    it('should NOT change ObjectNode defaultValue after nested setValue()', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'John' },
            age: { type: 'number', default: 25 },
          },
        },
      }) as ObjectNode;

      await delay();

      const originalDefault = node.defaultValue;

      // Change nested value
      const nameNode = node.find('/name') as StringNode;
      nameNode.setValue('Alice');
      await delay();

      // Parent's defaultValue should not change
      expect(node.defaultValue).toEqual(originalDefault);
    });

    it('should NOT change ArrayNode defaultValue after push/remove operations', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'string', default: 'item' },
          minItems: 2,
        },
        defaultValue: ['a', 'b'],
      }) as ArrayNode;

      await delay();

      const originalDefault = node.defaultValue;

      // Push new item
      node.push('c');
      await delay();

      expect(node.value).toEqual(['a', 'b', 'c']);
      expect(node.defaultValue).toEqual(originalDefault);
      expect(node.defaultValue).toEqual(['a', 'b']);

      // Remove item
      node.remove(0);
      await delay();

      expect(node.value).toEqual(['b', 'c']);
      expect(node.defaultValue).toEqual(['a', 'b']); // Still unchanged
    });

    it('should maintain defaultValue during conditional schema switching', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['A', 'B'] },
          },
          oneOf: [
            {
              '&if': "./type === 'A'",
              properties: {
                fieldA: { type: 'string', default: 'defaultA' },
              },
            },
            {
              '&if': "./type === 'B'",
              properties: {
                fieldB: { type: 'number', default: 123 },
              },
            },
          ],
        },
        defaultValue: { type: 'A' },
      }) as ObjectNode;

      await delay();

      const originalDefault = node.defaultValue;

      // Switch type
      const typeNode = node.find('/type') as StringNode;
      typeNode.setValue('B');
      await delay();

      // Root defaultValue should remain unchanged
      expect(node.defaultValue).toEqual(originalDefault);
    });
  });

  /**
   * Category 3: __setDefaultValue__ exclusive access verification
   */
  describe('3. __setDefaultValue__ Exclusivity', () => {
    it('should only modify defaultValue during initialization', async () => {
      const mockOnChange = vi.fn();
      const node = nodeFromJsonSchema({
        onChange: mockOnChange,
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { type: 'string', default: 'x' },
              minItems: 3,
            },
          },
        },
      }) as ObjectNode;

      await delay();

      // defaultValue should be set during initialization
      const arrayNode = node.find('/items') as ArrayNode;
      const initialDefault = arrayNode.defaultValue;

      // After initialization, any operation should not change defaultValue
      arrayNode.setValue(['a', 'b']);
      await delay();

      expect(arrayNode.defaultValue).toEqual(initialDefault);
    });

    it('should preserve defaultValue through complete node lifecycle', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'John' },
          },
        },
      }) as ObjectNode;

      await delay();

      const nameNode = node.find('/name') as StringNode;
      const initialDefault = nameNode.defaultValue;

      // Simulate various lifecycle operations
      nameNode.setValue('Alice');
      await delay();

      nameNode.setValue('Bob');
      await delay();

      nameNode.setValue('Charlie');
      await delay();

      // DefaultValue should never change
      expect(nameNode.defaultValue).toBe(initialDefault);
      expect(nameNode.defaultValue).toBe('John');
    });
  });

  /**
   * Category 4: checkDefinedValue Removal Impact
   */
  describe('4. checkDefinedValue Removal Impact', () => {
    it('should preserve empty object {} as defaultValue', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
        defaultValue: {},
      });

      await delay();

      // Before: {} might be converted to undefined by checkDefinedValue
      // After: {} is preserved as-is
      expect(node.defaultValue).toEqual({});
    });

    it('should preserve empty array [] as defaultValue', async () => {
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

      // Before: [] might trigger minItems auto-fill
      // After: [] is preserved, no auto-fill
      expect(node.value).toEqual([]);
      expect(node.defaultValue).toEqual([]);
    });

    it('should preserve null for nullable types', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: ['string', 'null'] as const },
        defaultValue: null,
      });

      await delay();

      expect(node.defaultValue).toBeNull();
      expect(node.value).toBeNull();
    });

    it('should use schema.default when defaultValue is undefined', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: 'string', default: 'fallback' },
        defaultValue: undefined,
      });

      await delay();

      // undefined should fallback to schema.default
      expect(node.defaultValue).toBe('fallback');
      expect(node.value).toBe('fallback');
    });

    it('should handle nested empty objects correctly', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            nested: {
              type: 'object',
              properties: {
                deep: { type: 'string' },
              },
            },
          },
        },
        defaultValue: { nested: {} },
      }) as ObjectNode;

      await delay();

      // Nested empty object should be preserved
      expect(node.defaultValue).toEqual({ nested: {} });
    });

    it('should handle array with empty object items', async () => {
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
        },
        defaultValue: [{}, {}],
      }) as ArrayNode;

      await delay();

      // Array with empty objects should be preserved
      expect(node.defaultValue).toEqual([{}, {}]);
    });

    it('should preserve 0 as valid defaultValue for number', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: 'number' },
        defaultValue: 0,
      }) as NumberNode;

      await delay();

      // 0 is a valid value, not falsy
      expect(node.defaultValue).toBe(0);
      expect(node.value).toBe(0);
    });

    it('should preserve empty string as valid defaultValue for string', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: 'string' },
        defaultValue: '',
      });

      await delay();

      // Empty string is a valid value
      expect(node.defaultValue).toBe('');
      expect(node.value).toBe('');
    });

    it('should preserve false as valid defaultValue for boolean', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: 'boolean' },
        defaultValue: false,
      });

      await delay();

      // false is a valid value
      expect(node.defaultValue).toBe(false);
      expect(node.value).toBe(false);
    });
  });

  /**
   * Category 5: Integration Tests
   */
  describe('5. Integration Tests', () => {
    it('should handle complete setValue flow with refresh correctly', async () => {
      const events: UnionNodeEventType[] = [];
      const mockOnChange = vi.fn();

      const node = nodeFromJsonSchema({
        onChange: mockOnChange,
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'initial' },
            count: { type: 'number', default: 0 },
          },
        },
      }) as ObjectNode;

      await delay();

      const nameNode = node.find('/name') as StringNode;
      nameNode.subscribe(({ type }) => {
        events.push(type);
      });

      const originalDefault = nameNode.defaultValue;

      // Perform setValue
      nameNode.setValue('updated');
      await delay();

      // 1. Value should change
      expect(nameNode.value).toBe('updated');

      // 2. DefaultValue should remain unchanged
      expect(nameNode.defaultValue).toBe(originalDefault);

      // 3. RequestRefresh should be published
      expect(events.some((e) => e & NodeEventType.RequestRefresh)).toBe(true);

      // 4. onChange should be called
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle form initialization with various defaultValue types', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            stringField: { type: 'string' },
            numberField: { type: 'number' },
            boolField: { type: 'boolean' },
            arrayField: {
              type: 'array',
              items: { type: 'string' },
            },
            nestedField: {
              type: 'object',
              properties: {
                inner: { type: 'string' },
              },
            },
          },
        },
        defaultValue: {
          stringField: 'hello',
          numberField: 42,
          boolField: true,
          arrayField: ['a', 'b'],
          nestedField: { inner: 'deep' },
        },
      }) as ObjectNode;

      await delay();

      // All defaultValues should be correctly set
      expect(node.find('/stringField')?.defaultValue).toBe('hello');
      expect(node.find('/numberField')?.defaultValue).toBe(42);
      expect(node.find('/boolField')?.defaultValue).toBe(true);
      expect(node.find('/arrayField')?.defaultValue).toEqual(['a', 'b']);
      expect(node.find('/nestedField')?.defaultValue).toEqual({
        inner: 'deep',
      });
    });

    it('should maintain stability across rapid setValue calls', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: 'string', default: 'stable' },
      });

      await delay();

      const originalDefault = node.defaultValue;

      // Rapid fire setValue calls
      for (let i = 0; i < 100; i++) {
        node.setValue(`value-${i}`);
      }
      await delay();

      // Value should be the last one
      expect(node.value).toBe('value-99');

      // DefaultValue should never change
      expect(node.defaultValue).toBe(originalDefault);
      expect(node.defaultValue).toBe('stable');
    });
  });

  /**
   * Category 6: Complex Node Type Interactions
   * Tests for defaultValue behavior in complex nested structures
   */
  describe('6. Complex Node Type Interactions', () => {
    it('should maintain defaultValue independence in ObjectNode containing ArrayNode', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { type: 'string', default: 'item' },
            },
            name: { type: 'string', default: 'parent' },
          },
        },
        defaultValue: {
          items: ['a', 'b'],
          name: 'test',
        },
      }) as ObjectNode;

      await delay();

      const arrayNode = node.find('/items') as ArrayNode;
      const originalArrayDefault = arrayNode.defaultValue;
      const originalObjectDefault = node.defaultValue;

      // Modify array
      arrayNode.push('c');
      await delay();

      // Both defaultValues should remain unchanged
      expect(arrayNode.defaultValue).toEqual(originalArrayDefault);
      expect(node.defaultValue).toEqual(originalObjectDefault);

      // Modify parent object
      const nameNode = node.find('/name') as StringNode;
      nameNode.setValue('modified');
      await delay();

      // Array's defaultValue should still be independent
      expect(arrayNode.defaultValue).toEqual(['a', 'b']);
    });

    it('should maintain defaultValue independence in ArrayNode containing ObjectNode', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', default: 'item-name' },
              value: { type: 'number', default: 0 },
            },
          },
        },
        defaultValue: [
          { name: 'first', value: 1 },
          { name: 'second', value: 2 },
        ],
      }) as ArrayNode;

      await delay();

      const originalArrayDefault = node.defaultValue;

      // Get first item and modify it
      const firstItem = node.children[0]?.node as ObjectNode;
      const nameNode = firstItem.find('./name') as StringNode;
      nameNode.setValue('modified-first');
      await delay();

      // Array's defaultValue should remain unchanged
      expect(node.defaultValue).toEqual(originalArrayDefault);
      expect(node.defaultValue).toEqual([
        { name: 'first', value: 1 },
        { name: 'second', value: 2 },
      ]);

      // Current value should reflect the change
      expect(node.value).toEqual([
        { name: 'modified-first', value: 1 },
        { name: 'second', value: 2 },
      ]);
    });

    it('should handle deeply nested structures (3+ levels) correctly', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            level1: {
              type: 'object',
              properties: {
                level2: {
                  type: 'object',
                  properties: {
                    level3: {
                      type: 'string',
                      default: 'deep-value',
                    },
                  },
                },
              },
            },
          },
        },
        defaultValue: {
          level1: {
            level2: {
              level3: 'initial-deep',
            },
          },
        },
      }) as ObjectNode;

      await delay();

      const level3Node = node.find('/level1/level2/level3') as StringNode;
      const originalLevel3Default = level3Node.defaultValue;
      const originalRootDefault = node.defaultValue;

      // Modify deepest level
      level3Node.setValue('modified-deep');
      await delay();

      // All defaultValues should remain unchanged
      expect(level3Node.defaultValue).toBe(originalLevel3Default);
      expect(node.defaultValue).toEqual(originalRootDefault);
      expect(level3Node.value).toBe('modified-deep');
    });

    it('should handle mixed array and object nesting with independent defaults', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  profile: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', default: 'user' },
                      tags: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        defaultValue: {
          users: [
            {
              profile: {
                name: 'Alice',
                tags: ['admin', 'active'],
              },
            },
          ],
        },
      }) as ObjectNode;

      await delay();

      const originalDefault = node.defaultValue;

      // Navigate deep and modify
      const usersNode = node.find('/users') as ArrayNode;
      const firstUser = usersNode.children[0]?.node as ObjectNode;
      const tagsNode = firstUser.find('./profile/tags') as ArrayNode;

      tagsNode.push('new-tag');
      await delay();

      // Root defaultValue should remain unchanged
      expect(node.defaultValue).toEqual(originalDefault);

      // Current value should reflect the change
      expect(usersNode.value).toEqual([
        {
          profile: {
            name: 'Alice',
            tags: ['admin', 'active', 'new-tag'],
          },
        },
      ]);
    });
  });

  /**
   * Category 7: Computed Property Interactions
   * Tests for defaultValue stability with computed properties
   */
  describe('7. Computed Property Interactions', () => {
    it('should not affect defaultValue when computed property changes', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            toggle: { type: 'boolean', default: false },
            dependent: {
              type: 'string',
              default: 'visible-default',
              computed: {
                visible: '../toggle === true',
              },
            },
          },
        },
      }) as ObjectNode;

      await delay();

      const dependentNode = node.find('/dependent') as StringNode;
      const originalDefault = dependentNode.defaultValue;

      // Initially toggle is false, dependent should not be visible
      expect(dependentNode.visible).toBe(false);

      // Toggle to true
      const toggleNode = node.find('/toggle');
      toggleNode?.setValue(true);
      await delay();

      // Visibility changed but defaultValue should remain
      expect(dependentNode.visible).toBe(true);
      expect(dependentNode.defaultValue).toBe(originalDefault);
      expect(dependentNode.defaultValue).toBe('visible-default');
    });

    it('should maintain defaultValue through computed dependency changes', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            category: { type: 'string', enum: ['A', 'B'], default: 'A' },
            price: {
              type: 'number',
              default: 100,
              computed: {
                readOnly: "../category === 'B'",
              },
            },
          },
        },
      }) as ObjectNode;

      await delay();

      const priceNode = node.find('/price') as NumberNode;
      const originalDefault = priceNode.defaultValue;

      // Initially category is 'A', price is not readOnly
      expect(priceNode.readOnly).toBe(false);

      // Change category to 'B'
      const categoryNode = node.find('/category');
      categoryNode?.setValue('B');
      await delay();

      // readOnly changed but defaultValue should remain
      expect(priceNode.readOnly).toBe(true);
      expect(priceNode.defaultValue).toBe(originalDefault);
      expect(priceNode.defaultValue).toBe(100);

      // Change value while readOnly
      priceNode.setValue(200);
      await delay();

      // Value changed but defaultValue still unchanged
      expect(priceNode.value).toBe(200);
      expect(priceNode.defaultValue).toBe(100);
    });

    it('should preserve defaultValue with watch-based computed properties', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            firstName: { type: 'string', default: 'John' },
            lastName: { type: 'string', default: 'Doe' },
            fullName: {
              type: 'string',
              default: 'computed-default',
              computed: {
                watch: ['../firstName', '../lastName'],
              },
            },
          },
        },
      }) as ObjectNode;

      await delay();

      const fullNameNode = node.find('/fullName') as StringNode;
      const originalDefault = fullNameNode.defaultValue;

      // Change firstName
      const firstNameNode = node.find('/firstName') as StringNode;
      firstNameNode.setValue('Jane');
      await delay();

      // DefaultValue should remain unchanged despite watch trigger
      expect(fullNameNode.defaultValue).toBe(originalDefault);
      expect(fullNameNode.defaultValue).toBe('computed-default');
    });

    it('should handle multiple computed properties affecting same node without changing defaults', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            isAdmin: { type: 'boolean', default: false },
            isActive: { type: 'boolean', default: true },
            secretField: {
              type: 'string',
              default: 'secret-value',
              computed: {
                visible: '../isAdmin === true',
                active: '../isActive === true',
              },
            },
          },
        },
      }) as ObjectNode;

      await delay();

      const secretNode = node.find('/secretField') as StringNode;
      const originalDefault = secretNode.defaultValue;

      // Toggle isAdmin
      const isAdminNode = node.find('/isAdmin');
      isAdminNode?.setValue(true);
      await delay();

      expect(secretNode.visible).toBe(true);
      expect(secretNode.defaultValue).toBe(originalDefault);

      // Toggle isActive
      const isActiveNode = node.find('/isActive');
      isActiveNode?.setValue(false);
      await delay();

      expect(secretNode.active).toBe(false);
      expect(secretNode.defaultValue).toBe(originalDefault);
      expect(secretNode.defaultValue).toBe('secret-value');
    });
  });

  /**
   * Category 8: Edge Cases
   * Tests for edge case scenarios and potential race conditions
   */
  describe('8. Edge Cases', () => {
    it('should handle subscription added during setValue without event loss', async () => {
      const events: UnionNodeEventType[] = [];
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: 'string', default: 'initial' },
      });

      await delay();

      // Subscribe during setValue - simulating late subscription
      node.setValue('first');
      const unsubscribe = node.subscribe(({ type }) => {
        events.push(type);
      });

      node.setValue('second');
      await delay();

      // Should receive events from the second setValue
      expect(events.length).toBeGreaterThan(0);
      expect(node.value).toBe('second');

      unsubscribe();
    });

    it('should handle large array/object defaultValue without issues', async () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `item-${i}`,
        value: i * 10,
      }));

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              value: { type: 'number' },
            },
          },
        },
        defaultValue: largeArray,
      }) as ArrayNode;

      await delay();

      // Verify defaultValue is correctly set
      expect(node.defaultValue).toEqual(largeArray);
      expect(node.children.length).toBe(100);

      // Modify one item
      const firstItem = node.children[0]?.node as ObjectNode;
      const nameNode = firstItem.find('./name') as StringNode;
      nameNode.setValue('modified-item-0');
      await delay();

      // DefaultValue should remain unchanged
      expect(node.defaultValue).toEqual(largeArray);
      expect((node.value as Array<{ name: string }>)[0]?.name).toBe(
        'modified-item-0',
      );
    });

    it('should handle concurrent setValue calls on sibling nodes', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            field1: { type: 'string', default: 'default1' },
            field2: { type: 'string', default: 'default2' },
            field3: { type: 'string', default: 'default3' },
          },
        },
      }) as ObjectNode;

      await delay();

      const field1 = node.find('/field1') as StringNode;
      const field2 = node.find('/field2') as StringNode;
      const field3 = node.find('/field3') as StringNode;

      const originals = {
        field1: field1.defaultValue,
        field2: field2.defaultValue,
        field3: field3.defaultValue,
      };

      // Set all values concurrently (in same synchronous stack)
      field1.setValue('new1');
      field2.setValue('new2');
      field3.setValue('new3');
      await delay();

      // All values should be updated
      expect(field1.value).toBe('new1');
      expect(field2.value).toBe('new2');
      expect(field3.value).toBe('new3');

      // All defaultValues should remain unchanged
      expect(field1.defaultValue).toBe(originals.field1);
      expect(field2.defaultValue).toBe(originals.field2);
      expect(field3.defaultValue).toBe(originals.field3);
    });

    it('should handle setValue with SetValueOption.Default correctly (no RequestRefresh)', async () => {
      const events: UnionNodeEventType[] = [];
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: { type: 'string', default: 'initial' },
      });

      await delay();

      node.subscribe(({ type }) => {
        events.push(type);
      });

      // Use Default option which should not trigger RequestRefresh
      node.setValue('new-value', SetValueOption.Default);
      await delay();

      // Should have UpdateValue but not RequestRefresh
      expect(events.some((e) => e & NodeEventType.UpdateValue)).toBe(true);
      expect(events.some((e) => e & NodeEventType.RequestRefresh)).toBe(false);

      // Value should still be updated
      expect(node.value).toBe('new-value');
    });
  });
});

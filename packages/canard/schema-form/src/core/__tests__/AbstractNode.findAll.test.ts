import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { contextNodeFactory, nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

describe('AbstractNode.findAll', () => {
  describe('basic behavior', () => {
    it('should return array with single node for simple property', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'test' },
          age: { type: 'number', default: 25 },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const nameNodes = node.findAll('name');
      expect(nameNodes).toHaveLength(1);
      expect(nameNodes[0].type).toBe('string');
      expect((nameNodes[0] as StringNode).value).toBe('test');

      const ageNodes = node.findAll('age');
      expect(ageNodes).toHaveLength(1);
      expect(ageNodes[0].type).toBe('number');
      expect((ageNodes[0] as NumberNode).value).toBe(25);
    });

    it('should return itself when no pointer provided', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const result = node.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(node);
    });

    it('should return nested node via path', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                properties: {
                  email: { type: 'string', default: 'test@example.com' },
                },
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const emailNodes = node.findAll('user/profile/email');
      expect(emailNodes).toHaveLength(1);
      expect(emailNodes[0].type).toBe('string');
      expect((emailNodes[0] as StringNode).value).toBe('test@example.com');
    });

    it('should return empty array for non-existent path', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const result = node.findAll('nonexistent');
      expect(result).toEqual([]);
    });

    it('should return empty array for partial non-existent path', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const result = node.findAll('user/profile/email');
      expect(result).toEqual([]);
    });
  });

  describe('oneOf scenarios - multiple nodes with same name', () => {
    it('should return all nodes from different oneOf branches with same property name', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['person', 'company'],
            default: 'person',
          },
        },
        oneOf: [
          {
            '&if': "(./type) === 'person'",
            properties: {
              name: { type: 'string', default: 'John Doe' },
              age: { type: 'number', default: 30 },
            },
          },
          {
            '&if': "(./type) === 'company'",
            properties: {
              name: { type: 'string', default: 'Acme Corp' },
              employees: { type: 'number', default: 100 },
            },
          },
        ],
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Both branches have 'name' property - findAll should return both
      const nameNodes = node.findAll('name');
      expect(nameNodes).toHaveLength(2);

      // Verify both are string nodes with different schema paths
      const schemaPaths = nameNodes.map((n) => n.schemaPath);
      expect(schemaPaths).toContain('#/oneOf/0/properties/name');
      expect(schemaPaths).toContain('#/oneOf/1/properties/name');
    });

    it('should return nodes from all branches regardless of active oneOf index', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['A', 'B', 'C'],
            default: 'A',
          },
        },
        oneOf: [
          {
            '&if': "(./category) === 'A'",
            properties: {
              value: { type: 'number', default: 1 },
            },
          },
          {
            '&if': "(./category) === 'B'",
            properties: {
              value: { type: 'string', default: 'two' },
            },
          },
          {
            '&if': "(./category) === 'C'",
            properties: {
              value: { type: 'boolean', default: true },
            },
          },
        ],
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // All three branches have 'value' - should return all 3
      const valueNodes = node.findAll('value');
      expect(valueNodes).toHaveLength(3);

      const types = valueNodes.map((n) => n.type);
      expect(types).toContain('number');
      expect(types).toContain('string');
      expect(types).toContain('boolean');
    });

    it('should return multiple nodes even after switching oneOf branch', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['simple', 'advanced'],
            default: 'simple',
          },
        },
        oneOf: [
          {
            '&if': "(./mode) === 'simple'",
            properties: {
              setting: { type: 'string', default: 'basic' },
            },
          },
          {
            '&if': "(./mode) === 'advanced'",
            properties: {
              setting: {
                type: 'object',
                properties: { key: { type: 'string' } },
              },
            },
          },
        ],
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Initial state - simple mode active
      expect(node.oneOfIndex).toBe(0);

      let settingNodes = node.findAll('setting');
      expect(settingNodes).toHaveLength(2);

      // Switch to advanced mode
      const modeNode = node.find('mode') as StringNode;
      modeNode.setValue('advanced');
      await delay();

      expect(node.oneOfIndex).toBe(1);

      // findAll should still return both nodes
      settingNodes = node.findAll('setting');
      expect(settingNodes).toHaveLength(2);
    });
  });

  describe('nested oneOf structures', () => {
    it('should return all nodes from nested oneOf branches', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          outer: {
            type: 'object',
            properties: {
              selector: {
                type: 'string',
                enum: ['X', 'Y'],
                default: 'X',
              },
            },
            oneOf: [
              {
                '&if': "(./selector) === 'X'",
                properties: {
                  data: { type: 'string', default: 'x-data' },
                },
              },
              {
                '&if': "(./selector) === 'Y'",
                properties: {
                  data: { type: 'number', default: 42 },
                },
              },
            ],
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Navigate to outer and find all 'data' nodes
      const outer = node.find('outer') as ObjectNode;
      const dataNodes = outer.findAll('data');

      expect(dataNodes).toHaveLength(2);

      const types = dataNodes.map((n) => n.type);
      expect(types).toContain('string');
      expect(types).toContain('number');
    });

    it('should handle deeply nested oneOf with multiple levels', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              type1: { type: 'string', enum: ['a', 'b'], default: 'a' },
            },
            oneOf: [
              {
                '&if': "(./type1) === 'a'",
                properties: {
                  level2: {
                    type: 'object',
                    properties: {
                      type2: { type: 'string', enum: ['x', 'y'], default: 'x' },
                    },
                    oneOf: [
                      {
                        '&if': "(./type2) === 'x'",
                        properties: {
                          value: { type: 'string', default: 'ax' },
                        },
                      },
                      {
                        '&if': "(./type2) === 'y'",
                        properties: {
                          value: { type: 'string', default: 'ay' },
                        },
                      },
                    ],
                  },
                },
              },
              {
                '&if': "(./type1) === 'b'",
                properties: {
                  level2: {
                    type: 'object',
                    properties: {
                      type2: { type: 'string', enum: ['x', 'y'], default: 'x' },
                    },
                    oneOf: [
                      {
                        '&if': "(./type2) === 'x'",
                        properties: {
                          value: { type: 'string', default: 'bx' },
                        },
                      },
                      {
                        '&if': "(./type2) === 'y'",
                        properties: {
                          value: { type: 'string', default: 'by' },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Find all level2 nodes (should be 2 - one from each level1 branch)
      const level2Nodes = node.findAll('level1/level2');
      expect(level2Nodes).toHaveLength(2);

      // Find all 'value' nodes through level2
      // Each level2 has 2 oneOf branches with 'value', and there are 2 level2 nodes
      // So total should be 4
      const level1 = node.find('level1') as ObjectNode;
      const allLevel2s = level1.findAll('level2') as ObjectNode[];

      let allValueNodes: any[] = [];
      for (const l2 of allLevel2s) {
        const valueNodes = l2.findAll('value');
        allValueNodes = allValueNodes.concat(valueNodes);
      }
      expect(allValueNodes).toHaveLength(4);
    });
  });

  describe('special path segments', () => {
    it('should handle # (root) navigation', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          parent: {
            type: 'object',
            properties: {
              child: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                },
              },
            },
          },
          sibling: { type: 'string', default: 'sibling-value' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const child = node.find('parent/child') as ObjectNode;
      const siblingNodes = child.findAll('#/sibling');

      expect(siblingNodes).toHaveLength(1);
      expect((siblingNodes[0] as StringNode).value).toBe('sibling-value');
    });

    it('should handle .. (parent) navigation', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          container: {
            type: 'object',
            properties: {
              first: { type: 'string', default: 'first-value' },
              second: { type: 'string', default: 'second-value' },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const first = node.find('container/first') as StringNode;
      const secondNodes = first.findAll('../second');

      expect(secondNodes).toHaveLength(1);
      expect((secondNodes[0] as StringNode).value).toBe('second-value');
    });

    it('should handle . (current) navigation', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              value: { type: 'number', default: 42 },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const data = node.find('data') as ObjectNode;
      const valueNodes = data.findAll('./value');

      expect(valueNodes).toHaveLength(1);
      expect((valueNodes[0] as NumberNode).value).toBe(42);
    });

    it('should handle special segments with multiple oneOf branches', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['a', 'b'], default: 'a' },
          shared: { type: 'string', default: 'shared-value' },
        },
        oneOf: [
          {
            '&if': "(./type) === 'a'",
            properties: {
              branch: {
                type: 'object',
                properties: {
                  nested: { type: 'string' },
                },
              },
            },
          },
          {
            '&if': "(./type) === 'b'",
            properties: {
              branch: {
                type: 'object',
                properties: {
                  nested: { type: 'number' },
                },
              },
            },
          },
        ],
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Find all 'branch' nodes and navigate to root's 'shared' from each
      const branchNodes = node.findAll('branch') as ObjectNode[];
      expect(branchNodes).toHaveLength(2);

      // From each branch, navigate to #/shared
      for (const branch of branchNodes) {
        const sharedNodes = branch.findAll('#/shared');
        expect(sharedNodes).toHaveLength(1);
        expect((sharedNodes[0] as StringNode).value).toBe('shared-value');
      }
    });
  });

  describe('array scenarios', () => {
    it('should find nodes within array items', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                value: { type: 'number' },
              },
            },
            default: [
              { name: 'first', value: 1 },
              { name: 'second', value: 2 },
            ],
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const items = node.find('items') as ArrayNode;

      // Find all 'name' nodes within array items
      const allNames = items.findAll('0/name');
      expect(allNames).toHaveLength(1);
      expect((allNames[0] as StringNode).value).toBe('first');

      // Each array item has its own 'name' - accessing via index
      const firstName = items.findAll('0/name');
      const secondName = items.findAll('1/name');

      expect(firstName).toHaveLength(1);
      expect(secondName).toHaveLength(1);
    });

    it('should handle array items with oneOf', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          list: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['text', 'number'],
                  default: 'text',
                },
              },
              oneOf: [
                {
                  '&if': "(./type) === 'text'",
                  properties: {
                    content: { type: 'string', default: 'hello' },
                  },
                },
                {
                  '&if': "(./type) === 'number'",
                  properties: {
                    content: { type: 'number', default: 123 },
                  },
                },
              ],
            },
            default: [{ type: 'text' }],
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const list = node.find('list') as ArrayNode;
      const firstItem = list.find('0') as ObjectNode;

      // First item has both oneOf branches
      const contentNodes = firstItem.findAll('content');
      expect(contentNodes).toHaveLength(2);

      const types = contentNodes.map((n) => n.type);
      expect(types).toContain('string');
      expect(types).toContain('number');
    });
  });

  describe('practical use cases', () => {
    it('should support bulk field update scenario', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          variant: {
            type: 'string',
            enum: ['simple', 'detailed'],
            default: 'simple',
          },
        },
        oneOf: [
          {
            '&if': "(./variant) === 'simple'",
            properties: {
              description: { type: 'string', default: '' },
            },
          },
          {
            '&if': "(./variant) === 'detailed'",
            properties: {
              description: { type: 'string', default: '' },
              notes: { type: 'string', default: '' },
            },
          },
        ],
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Find all 'description' fields across all branches
      const descriptionNodes = node.findAll('description') as StringNode[];
      expect(descriptionNodes).toHaveLength(2);

      // Bulk update all description fields
      for (const descNode of descriptionNodes) {
        descNode.setValue('Updated description');
      }

      // Verify all were updated
      for (const descNode of descriptionNodes) {
        expect(descNode.value).toBe('Updated description');
      }
    });

    it('should support subscription to multiple nodes', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: ['a', 'b'], default: 'a' },
        },
        oneOf: [
          {
            '&if': "(./mode) === 'a'",
            properties: {
              counter: { type: 'number', default: 0 },
            },
          },
          {
            '&if': "(./mode) === 'b'",
            properties: {
              counter: { type: 'number', default: 100 },
            },
          },
        ],
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const counterNodes = node.findAll('counter') as NumberNode[];
      expect(counterNodes).toHaveLength(2);

      // Subscribe to all counter nodes and track subscription count
      const unsubscribes: Array<() => void> = [];
      let callCount = 0;

      for (const counter of counterNodes) {
        const unsubscribe = counter.subscribe(() => {
          callCount++;
        });
        unsubscribes.push(unsubscribe);
      }

      // Verify subscriptions were created for both nodes
      expect(unsubscribes).toHaveLength(2);

      // Update the active counter node
      const activeCounter = node.find('counter') as NumberNode;
      activeCounter.setValue(10);

      // Wait for microtask to process the event
      await delay();

      // Verify event was received
      expect(callCount).toBeGreaterThanOrEqual(1);

      // Clean up subscriptions
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
    });

    it('should find and compare values across all branches', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          productType: {
            type: 'string',
            enum: ['digital', 'physical'],
            default: 'digital',
          },
        },
        oneOf: [
          {
            '&if': "(./productType) === 'digital'",
            properties: {
              price: { type: 'number', default: 9.99 },
              downloadUrl: { type: 'string' },
            },
          },
          {
            '&if': "(./productType) === 'physical'",
            properties: {
              price: { type: 'number', default: 29.99 },
              weight: { type: 'number' },
              dimensions: { type: 'string' },
            },
          },
        ],
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Get all price nodes
      const priceNodes = node.findAll('price') as NumberNode[];
      expect(priceNodes).toHaveLength(2);

      // Get all prices and calculate stats
      const prices = priceNodes.map((p) => p.value as number);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      expect(minPrice).toBe(9.99);
      expect(maxPrice).toBe(29.99);
    });
  });

  describe('context node handling', () => {
    it('should return context node when pointer is @', async () => {
      const contextNode = contextNodeFactory({
        setting: 'context-setting',
      });

      const jsonSchema = {
        type: 'object',
        properties: {
          data: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
        context: contextNode,
      }) as ObjectNode;

      await delay();

      const contextResults = node.findAll('@');
      expect(contextResults).toHaveLength(1);
      expect(contextResults[0]).toBe(contextNode);
    });

    it('should return empty array when no context and pointer is @', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          data: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const contextResults = node.findAll('@');
      expect(contextResults).toEqual([]);
    });
  });

  describe('root node handling', () => {
    it('should return root node when pointer is #', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          nested: {
            type: 'object',
            properties: {
              deep: { type: 'string' },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const deep = node.find('nested/deep');
      const rootResults = deep?.findAll('#');

      expect(rootResults).toHaveLength(1);
      expect(rootResults?.[0]).toBe(node);
    });

    it('should return root node for absolute path with single #', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          data: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const rootResults = node.findAll('#');
      expect(rootResults).toHaveLength(1);
      expect(rootResults[0]).toBe(node);
    });
  });

  describe('edge cases', () => {
    it('should handle escaped property names', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          'special/name': { type: 'string', default: 'escaped' },
          'another~name': { type: 'number', default: 42 },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // JSON Pointer escaping: / -> ~1, ~ -> ~0
      const specialNodes = node.findAll('special~1name');
      expect(specialNodes).toHaveLength(1);
      expect((specialNodes[0] as StringNode).value).toBe('escaped');

      const anotherNodes = node.findAll('another~0name');
      expect(anotherNodes).toHaveLength(1);
      expect((anotherNodes[0] as NumberNode).value).toBe(42);
    });

    it('should handle numeric property names', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          '123': { type: 'string', default: 'numeric-key' },
          '0': { type: 'number', default: 0 },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const numericNodes = node.findAll('123');
      expect(numericNodes).toHaveLength(1);
      expect((numericNodes[0] as StringNode).value).toBe('numeric-key');

      const zeroNodes = node.findAll('0');
      expect(zeroNodes).toHaveLength(1);
      expect((zeroNodes[0] as NumberNode).value).toBe(0);
    });

    it('should handle empty object', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {},
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const result = node.findAll('anything');
      expect(result).toEqual([]);
    });

    it('should handle deeply nested structure with mixed types', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    level3: {
                      type: 'object',
                      properties: {
                        value: { type: 'string', default: 'deep' },
                      },
                    },
                  },
                },
                default: [{}],
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const valueNodes = node.findAll('level1/level2/0/level3/value');
      expect(valueNodes).toHaveLength(1);
      expect((valueNodes[0] as StringNode).value).toBe('deep');
    });
  });

  describe('comparison with find method', () => {
    it('should return all nodes while find returns variant-filtered single node', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['x', 'y'], default: 'x' },
        },
        oneOf: [
          {
            '&if': "(./type) === 'x'",
            properties: {
              field: { type: 'string', default: 'x-value' },
            },
          },
          {
            '&if': "(./type) === 'y'",
            properties: {
              field: { type: 'number', default: 100 },
            },
          },
        ],
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // find returns single node based on active oneOf index
      const singleField = node.find('field');
      expect(singleField).not.toBeNull();
      expect(singleField?.schemaPath).toBe('#/oneOf/0/properties/field');
      expect(singleField?.type).toBe('string');

      // findAll returns all matching nodes regardless of variant
      const allFields = node.findAll('field');
      expect(allFields).toHaveLength(2);

      const fieldTypes = allFields.map((f) => f.type);
      expect(fieldTypes).toContain('string');
      expect(fieldTypes).toContain('number');
    });

    it('should verify findAll does not filter by scoped state', async () => {
      const jsonSchema = {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            enum: ['active', 'inactive'],
            default: 'active',
          },
        },
        oneOf: [
          {
            '&if': "(./selector) === 'active'",
            properties: {
              status: { type: 'string', default: 'active-status' },
            },
          },
          {
            '&if': "(./selector) === 'inactive'",
            properties: {
              status: { type: 'string', default: 'inactive-status' },
            },
          },
        ],
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Only first oneOf branch is active
      expect(node.oneOfIndex).toBe(0);

      // findAll should still return both status nodes
      const statusNodes = node.findAll('status') as StringNode[];
      expect(statusNodes).toHaveLength(2);

      // Verify we have both values
      const values = statusNodes.map((s) => s.defaultValue);
      expect(values).toContain('active-status');
      expect(values).toContain('inactive-status');
    });
  });
});

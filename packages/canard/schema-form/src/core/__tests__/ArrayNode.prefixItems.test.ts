import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import { JsonSchemaError } from '@/schema-form/errors';

import { ValidationMode } from '../nodes';
import type { ArrayNode } from '../nodes/ArrayNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

describe('ArrayNode prefixItems', () => {
  describe('BranchStrategy', () => {
    describe('prefixItems only (open tuple)', () => {
      it('should create child nodes with correct prefixItems schema', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},

          jsonSchema: {
            type: 'object',
            properties: {
              tuple: {
                type: 'array',
                prefixItems: [
                  {
                    type: 'object',
                    properties: { name: { type: 'string', default: 'user1' } },
                  },
                  {
                    type: 'object',
                    properties: { age: { type: 'number', default: 25 } },
                  },
                ],
                minItems: 2,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/tuple') as ArrayNode;
        expect(arrayNode).toBeDefined();
        expect(arrayNode.children?.length).toBe(2);

        // First child should have 'name' property with default value
        const firstChild = arrayNode.children?.[0]?.node as ObjectNode;
        expect(firstChild.value).toEqual({ name: 'user1' });

        // Second child should have 'age' property with default value
        const secondChild = arrayNode.children?.[1]?.node as ObjectNode;
        expect(secondChild.value).toEqual({ age: 25 });
      });

      it('should use prefixItems schema when pushing new items', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},

          jsonSchema: {
            type: 'object',
            properties: {
              tuple: {
                type: 'array',
                prefixItems: [
                  {
                    type: 'object',
                    properties: { first: { type: 'string', default: 'a' } },
                  },
                  {
                    type: 'object',
                    properties: { second: { type: 'number', default: 1 } },
                  },
                  {
                    type: 'object',
                    properties: { third: { type: 'boolean', default: true } },
                  },
                ],
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/tuple') as ArrayNode;
        expect(arrayNode.children?.length).toBe(0);

        // Push first item - should use prefixItems[0] schema
        await arrayNode.push();
        await delay();
        expect(arrayNode.children?.length).toBe(1);
        expect((arrayNode.children?.[0]?.node as ObjectNode).value).toEqual({
          first: 'a',
        });

        // Push second item - should use prefixItems[1] schema
        await arrayNode.push();
        await delay();
        expect(arrayNode.children?.length).toBe(2);
        expect((arrayNode.children?.[1]?.node as ObjectNode).value).toEqual({
          second: 1,
        });

        // Push third item - should use prefixItems[2] schema
        await arrayNode.push();
        await delay();
        expect(arrayNode.children?.length).toBe(3);
        expect((arrayNode.children?.[2]?.node as ObjectNode).value).toEqual({
          third: true,
        });
      });
    });

    describe('prefixItems + items=false (fixed-length tuple)', () => {
      it('should limit push to prefixItems length', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              fixedTuple: {
                type: 'array',
                prefixItems: [
                  {
                    type: 'object',
                    properties: { a: { type: 'string', default: 'x' } },
                  },
                  {
                    type: 'object',
                    properties: { b: { type: 'number', default: 0 } },
                  },
                ],
                items: false,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/fixedTuple') as ArrayNode;

        // Push first two items - should succeed
        await arrayNode.push();
        await arrayNode.push();
        await delay();
        expect(arrayNode.children?.length).toBe(2);

        // Try to push third item - should be rejected (maxItems = prefixItems.length)
        await arrayNode.push();
        await delay();
        expect(arrayNode.children?.length).toBe(2); // Still 2
      });

      it('should create child nodes with correct prefixItems schema for fixed tuple', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              fixedTuple: {
                type: 'array',
                prefixItems: [
                  {
                    type: 'object',
                    properties: { id: { type: 'string', default: 'id1' } },
                  },
                  {
                    type: 'object',
                    properties: { count: { type: 'number', default: 100 } },
                  },
                ],
                items: false,
                minItems: 2,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/fixedTuple') as ArrayNode;
        expect(arrayNode.children?.length).toBe(2);

        // Verify each child uses correct prefixItems schema
        expect((arrayNode.children?.[0]?.node as ObjectNode).value).toEqual({
          id: 'id1',
        });
        expect((arrayNode.children?.[1]?.node as ObjectNode).value).toEqual({
          count: 100,
        });
      });
    });

    describe('prefixItems + items (open tuple)', () => {
      it('should use prefixItems for initial indices and items for remaining', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              openTuple: {
                type: 'array',
                prefixItems: [
                  {
                    type: 'object',
                    properties: { prefix1: { type: 'string', default: 'p1' } },
                  },
                  {
                    type: 'object',
                    properties: { prefix2: { type: 'number', default: 2 } },
                  },
                ],
                items: {
                  type: 'object',
                  properties: { extra: { type: 'boolean', default: false } },
                },
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/openTuple') as ArrayNode;

        // Push items to fill prefixItems and go beyond
        await arrayNode.push(); // index 0 - prefixItems[0]
        await arrayNode.push(); // index 1 - prefixItems[1]
        await arrayNode.push(); // index 2 - items
        await arrayNode.push(); // index 3 - items
        await delay();

        expect(arrayNode.children?.length).toBe(4);

        // First two use prefixItems schemas
        expect((arrayNode.children?.[0]?.node as ObjectNode).value).toEqual({
          prefix1: 'p1',
        });
        expect((arrayNode.children?.[1]?.node as ObjectNode).value).toEqual({
          prefix2: 2,
        });

        // Remaining use items schema
        expect((arrayNode.children?.[2]?.node as ObjectNode).value).toEqual({
          extra: false,
        });
        expect((arrayNode.children?.[3]?.node as ObjectNode).value).toEqual({
          extra: false,
        });
      });

      it('should allow unlimited push when items is defined', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              openTuple: {
                type: 'array',
                prefixItems: [
                  { type: 'object', properties: { a: { type: 'string' } } },
                ],
                items: {
                  type: 'object',
                  properties: { b: { type: 'number' } },
                },
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/openTuple') as ArrayNode;

        // Push many items - should all succeed
        for (let i = 0; i < 10; i++) {
          await arrayNode.push();
        }
        await delay();

        expect(arrayNode.children?.length).toBe(10);
      });
    });
  });

  describe('TerminalStrategy', () => {
    describe('prefixItems only', () => {
      it('should use prefixItems default values when pushing', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},

          jsonSchema: {
            type: 'object',
            properties: {
              tuple: {
                type: 'array',
                terminal: true,
                prefixItems: [
                  { type: 'string', default: 'hello' },
                  { type: 'number', default: 42 },
                  { type: 'boolean', default: true },
                ],
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/tuple') as ArrayNode;
        expect(arrayNode.children).toBeNull();

        // Push items - should use prefixItems defaults
        await arrayNode.push();
        await delay();
        expect(arrayNode.value).toEqual(['hello']);

        await arrayNode.push();
        await delay();
        expect(arrayNode.value).toEqual(['hello', 42]);

        await arrayNode.push();
        await delay();
        expect(arrayNode.value).toEqual(['hello', 42, true]);
      });

      it('should auto-fill minItems with prefixItems defaults', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},

          jsonSchema: {
            type: 'object',
            properties: {
              tuple: {
                type: 'array',
                terminal: true,
                prefixItems: [
                  { type: 'string', default: 'str' },
                  { type: 'number', default: 99 },
                ],
                minItems: 2,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/tuple') as ArrayNode;
        expect(arrayNode.value).toEqual(['str', 99]);
      });
    });

    describe('prefixItems + items=false (fixed-length tuple)', () => {
      it('should limit push to prefixItems length', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              fixedTuple: {
                type: 'array',
                terminal: true,
                prefixItems: [
                  { type: 'string', default: 'a' },
                  { type: 'number', default: 1 },
                ],
                items: false,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/fixedTuple') as ArrayNode;

        // Push first two items - should succeed
        await arrayNode.push();
        await arrayNode.push();
        await delay();
        expect(arrayNode.value).toEqual(['a', 1]);

        // Try to push third item - should be rejected
        const lengthBefore = arrayNode.value?.length;
        await arrayNode.push();
        await delay();
        expect(arrayNode.value?.length).toBe(lengthBefore); // Still 2
      });

      it('should allow setValue to bypass maxItems limit', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              fixedTuple: {
                type: 'array',
                terminal: true,
                prefixItems: [
                  { type: 'string', default: 'a' },
                  { type: 'number', default: 1 },
                ],
                items: false,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/fixedTuple') as ArrayNode;

        // setValue bypasses maxItems limit (unlimited=true internally)
        arrayNode.setValue(['x', 'y', 'z', 'w']);
        await delay();

        expect(arrayNode.value).toEqual(['x', 'y', 'z', 'w']);
      });
    });

    describe('prefixItems + items (open tuple)', () => {
      it('should use prefixItems defaults then items default', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              openTuple: {
                type: 'array',
                terminal: true,
                prefixItems: [
                  { type: 'string', default: 'first' },
                  { type: 'number', default: 100 },
                ],
                items: { type: 'boolean', default: false },
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/openTuple') as ArrayNode;

        // Push items
        await arrayNode.push(); // prefixItems[0]
        await arrayNode.push(); // prefixItems[1]
        await arrayNode.push(); // items
        await arrayNode.push(); // items
        await delay();

        expect(arrayNode.value).toEqual(['first', 100, false, false]);
      });

      it('should allow unlimited push when items is defined', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              openTuple: {
                type: 'array',
                terminal: true,
                prefixItems: [{ type: 'string', default: 'prefix' }],
                items: { type: 'number', default: 0 },
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/openTuple') as ArrayNode;

        // Push many items - should all succeed
        for (let i = 0; i < 10; i++) {
          await arrayNode.push();
        }
        await delay();

        expect(arrayNode.value?.length).toBe(10);
        expect(arrayNode.value?.[0]).toBe('prefix');
        expect(arrayNode.value?.[1]).toBe(0);
      });
    });
  });

  describe('Default Value Handling', () => {
    describe('BranchStrategy default values', () => {
      it('should use prefixItems schema default when pushing', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},

          jsonSchema: {
            type: 'object',
            properties: {
              tuple: {
                type: 'array',
                prefixItems: [
                  {
                    type: 'object',
                    properties: {
                      name: { type: 'string', default: 'defaultName' },
                      active: { type: 'boolean', default: true },
                    },
                  },
                  {
                    type: 'object',
                    properties: {
                      count: { type: 'number', default: 50 },
                    },
                  },
                ],
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/tuple') as ArrayNode;

        await arrayNode.push();
        await delay();

        const firstChild = arrayNode.children?.[0]?.node as ObjectNode;
        expect(firstChild.value).toEqual({ name: 'defaultName', active: true });

        await arrayNode.push();
        await delay();

        const secondChild = arrayNode.children?.[1]?.node as ObjectNode;
        expect(secondChild.value).toEqual({ count: 50 });
      });

      it('should respect explicit defaultValue over schema defaults', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},

          jsonSchema: {
            type: 'object',
            properties: {
              tuple: {
                type: 'array',
                prefixItems: [
                  {
                    type: 'object',
                    properties: { val: { type: 'string', default: 'schema' } },
                  },
                ],
                minItems: 1,
              },
            },
          },
          defaultValue: {
            tuple: [{ val: 'explicit' }],
          },
        });

        await delay();

        const arrayNode = node?.find('/tuple') as ArrayNode;
        expect((arrayNode.children?.[0]?.node as ObjectNode).value).toEqual({
          val: 'explicit',
        });
      });
    });

    describe('TerminalStrategy default values', () => {
      it('should use each prefixItems default value correctly', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},

          jsonSchema: {
            type: 'object',
            properties: {
              tuple: {
                type: 'array',
                terminal: true,
                prefixItems: [
                  { type: 'string', default: 'str_default' },
                  { type: 'number', default: 999 },
                  { type: 'boolean', default: false },
                ],
                minItems: 3,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/tuple') as ArrayNode;
        expect(arrayNode.value).toEqual(['str_default', 999, false]);
      });

      it('should handle prefixItems without default values', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},

          jsonSchema: {
            type: 'object',
            properties: {
              tuple: {
                type: 'array',
                terminal: true,
                prefixItems: [
                  { type: 'string' }, // no default
                  { type: 'number', default: 10 },
                ],
                minItems: 2,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/tuple') as ArrayNode;
        // First item has no default, second has default 10
        expect(arrayNode.value).toEqual([undefined, 10]);
      });
    });
  });

  describe('Validation', () => {
    it('should validate array level constraints with prefixItems', async () => {
      const validatorFactory = createValidatorFactory(
        new Ajv({
          allErrors: true,
          strictSchema: false,
          validateFormats: false,
        }),
      );

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            tuple: {
              type: 'array',
              prefixItems: [
                { type: 'string' },
                { type: 'number' },
                { type: 'boolean' },
              ],
              items: false,
              minItems: 2,
            },
          },
        },
        validationMode: ValidationMode.OnChange,
        validatorFactory,
      });

      await delay();

      const arrayNode = node?.find('/tuple') as ArrayNode;

      // Set valid values meeting minItems
      arrayNode.setValue(['abc', 50, true]);
      await delay();
      expect(arrayNode.errors).toEqual([]);

      // Set invalid - not meeting minItems
      arrayNode.setValue(['ab']);
      await delay();
      expect(arrayNode.errors.length).toBeGreaterThan(0);
      expect(arrayNode.errors.some((e) => e.keyword === 'minItems')).toBe(true);

      // Set valid again
      arrayNode.setValue(['xyz', 100]);
      await delay();
      expect(arrayNode.errors).toEqual([]);
    });

    it('should validate open tuple with items schema', async () => {
      const validatorFactory = createValidatorFactory(
        new Ajv({
          allErrors: true,
          strictSchema: false,
          validateFormats: false,
        }),
      );

      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            openTuple: {
              type: 'array',
              prefixItems: [{ type: 'string' }, { type: 'number' }],
              items: { type: 'boolean' },
              minItems: 2,
              maxItems: 5,
            },
          },
        },
        validationMode: ValidationMode.OnChange,
        validatorFactory,
      });

      await delay();

      const arrayNode = node?.find('/openTuple') as ArrayNode;

      // Valid values
      arrayNode.setValue(['ABC', 15, true, false]);
      await delay();
      expect(arrayNode.errors).toEqual([]);

      // Invalid - not meeting minItems
      arrayNode.setValue(['abc']);
      await delay();
      expect(arrayNode.errors.some((e) => e.keyword === 'minItems')).toBe(true);

      // Valid again
      arrayNode.setValue(['test', 42, true]);
      await delay();
      expect(arrayNode.errors).toEqual([]);
    });
  });

  describe('Error Cases', () => {
    it('should throw error when items=false without prefixItems', () => {
      expect(() =>
        nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              invalid: {
                type: 'array',
                items: false,
              },
            },
          },
        }),
      ).toThrow(JsonSchemaError);

      expect(() =>
        nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              invalid: {
                type: 'array',
                items: false,
              },
            },
          },
        }),
      ).toThrow(
        "Array schema with 'items: false' must have 'prefixItems' defined",
      );
    });

    it('should throw error when neither items nor prefixItems is defined', () => {
      expect(() =>
        nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              invalid: {
                type: 'array',
              },
            },
          },
        }),
      ).toThrow(JsonSchemaError);

      expect(() =>
        nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              invalid: {
                type: 'array',
              },
            },
          },
        }),
      ).toThrow(
        "Array schema must have at least one of 'items' or 'prefixItems' defined",
      );
    });
  });
});

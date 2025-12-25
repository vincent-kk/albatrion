import Ajv from 'ajv/dist/2020';
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

  describe('prefixItems with $ref', () => {
    describe('BranchStrategy with $ref', () => {
      it('should resolve prefixItems with primitive type $ref definitions', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            $defs: {
              StringField: {
                type: 'string',
                minLength: 1,
                default: 'default_string',
              },
              NumberField: {
                type: 'number',
                minimum: 0,
                default: 42,
              },
              BooleanField: {
                type: 'boolean',
                default: true,
              },
            },
            properties: {
              contact_tuple: {
                type: 'array',
                prefixItems: [
                  { $ref: '#/$defs/StringField', title: 'Name' },
                  { $ref: '#/$defs/NumberField', title: 'Age' },
                  { $ref: '#/$defs/BooleanField', title: 'Active' },
                ],
                items: false,
                minItems: 3,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/contact_tuple') as ArrayNode;
        expect(arrayNode).toBeDefined();
        expect(arrayNode.children?.length).toBe(3);

        // Each child should have the resolved default value from $ref
        expect(arrayNode.value).toEqual(['default_string', 42, true]);
      });

      it('should resolve prefixItems with object type $ref definitions', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            $defs: {
              PersonInfo: {
                type: 'object',
                properties: {
                  name: { type: 'string', default: 'John' },
                  age: { type: 'number', minimum: 0, default: 25 },
                },
              },
              AddressInfo: {
                type: 'object',
                properties: {
                  street: { type: 'string', default: 'Main St' },
                  city: { type: 'string', default: 'Seoul' },
                },
              },
              ContactInfo: {
                type: 'object',
                properties: {
                  email: { type: 'string', default: 'test@test.com' },
                  phone: { type: 'string', default: '123-456-7890' },
                },
              },
            },
            properties: {
              user_record: {
                type: 'array',
                prefixItems: [
                  { $ref: '#/$defs/PersonInfo', title: 'Personal Information' },
                  { $ref: '#/$defs/AddressInfo', title: 'Address' },
                  { $ref: '#/$defs/ContactInfo', title: 'Contact Details' },
                ],
                items: false,
                minItems: 3,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/user_record') as ArrayNode;
        expect(arrayNode).toBeDefined();
        expect(arrayNode.children?.length).toBe(3);

        // First child should have PersonInfo schema with defaults
        const firstChild = arrayNode.children?.[0]?.node as ObjectNode;
        expect(firstChild.value).toEqual({ name: 'John', age: 25 });

        // Second child should have AddressInfo schema with defaults
        const secondChild = arrayNode.children?.[1]?.node as ObjectNode;
        expect(secondChild.value).toEqual({ street: 'Main St', city: 'Seoul' });

        // Third child should have ContactInfo schema with defaults
        const thirdChild = arrayNode.children?.[2]?.node as ObjectNode;
        expect(thirdChild.value).toEqual({
          email: 'test@test.com',
          phone: '123-456-7890',
        });
      });

      it('should resolve prefixItems $ref with items $ref for open tuple', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            $defs: {
              Header: {
                type: 'object',
                properties: {
                  title: { type: 'string', default: 'Untitled' },
                  version: { type: 'number', default: 1 },
                },
              },
              Summary: {
                type: 'object',
                properties: {
                  description: { type: 'string', default: 'No description' },
                },
              },
              DataRow: {
                type: 'object',
                properties: {
                  id: { type: 'number', default: 0 },
                  active: { type: 'boolean', default: true },
                },
              },
            },
            properties: {
              document: {
                type: 'array',
                prefixItems: [
                  { $ref: '#/$defs/Header', title: 'Document Header' },
                  { $ref: '#/$defs/Summary', title: 'Document Summary' },
                ],
                items: { $ref: '#/$defs/DataRow', title: 'Data Row' },
                minItems: 2,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/document') as ArrayNode;
        expect(arrayNode).toBeDefined();
        expect(arrayNode.children?.length).toBe(2);

        // First child should have Header schema with defaults
        const firstChild = arrayNode.children?.[0]?.node as ObjectNode;
        expect(firstChild.value).toEqual({ title: 'Untitled', version: 1 });

        // Second child should have Summary schema with defaults
        const secondChild = arrayNode.children?.[1]?.node as ObjectNode;
        expect(secondChild.value).toEqual({ description: 'No description' });

        // Push additional items - should use items $ref (DataRow)
        await arrayNode.push();
        await delay();

        expect(arrayNode.children?.length).toBe(3);
        const thirdChild = arrayNode.children?.[2]?.node as ObjectNode;
        expect(thirdChild.value).toEqual({ id: 0, active: true });

        // Push another DataRow
        await arrayNode.push();
        await delay();

        expect(arrayNode.children?.length).toBe(4);
        const fourthChild = arrayNode.children?.[3]?.node as ObjectNode;
        expect(fourthChild.value).toEqual({ id: 0, active: true });
      });

      it('should resolve nested $ref within prefixItems object schemas', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            $defs: {
              Money: {
                type: 'object',
                properties: {
                  amount: { type: 'number', minimum: 0, default: 100 },
                  currency: {
                    type: 'string',
                    enum: ['USD', 'EUR', 'KRW'],
                    default: 'USD',
                  },
                },
              },
              OrderHeader: {
                type: 'object',
                properties: {
                  orderId: { type: 'string', default: 'ORD-001' },
                  status: {
                    type: 'string',
                    enum: ['pending', 'confirmed', 'shipped'],
                    default: 'pending',
                  },
                },
              },
              OrderPayment: {
                type: 'object',
                properties: {
                  subtotal: { $ref: '#/$defs/Money' },
                  tax: { $ref: '#/$defs/Money' },
                },
              },
              OrderShipping: {
                type: 'object',
                properties: {
                  address: { type: 'string', default: '123 Main St' },
                  shippingCost: { $ref: '#/$defs/Money' },
                },
              },
            },
            properties: {
              order: {
                type: 'array',
                prefixItems: [
                  { $ref: '#/$defs/OrderHeader', title: 'Order Information' },
                  { $ref: '#/$defs/OrderPayment', title: 'Payment Details' },
                  {
                    $ref: '#/$defs/OrderShipping',
                    title: 'Shipping Information',
                  },
                ],
                items: false,
                minItems: 3,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/order') as ArrayNode;
        expect(arrayNode).toBeDefined();
        expect(arrayNode.children?.length).toBe(3);

        // First child should have OrderHeader schema with defaults
        const headerChild = arrayNode.children?.[0]?.node as ObjectNode;
        expect(headerChild.value).toEqual({
          orderId: 'ORD-001',
          status: 'pending',
        });

        // Second child should have OrderPayment with nested Money refs
        const paymentChild = arrayNode.children?.[1]?.node as ObjectNode;
        expect(paymentChild.value).toEqual({
          subtotal: { amount: 100, currency: 'USD' },
          tax: { amount: 100, currency: 'USD' },
        });

        // Third child should have OrderShipping with nested Money ref
        const shippingChild = arrayNode.children?.[2]?.node as ObjectNode;
        expect(shippingChild.value).toEqual({
          address: '123 Main St',
          shippingCost: { amount: 100, currency: 'USD' },
        });
      });

      it('should resolve self-referencing $ref within prefixItems', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            $defs: {
              TreeNode: {
                type: 'object',
                properties: {
                  id: { type: 'string', default: 'node-1' },
                  label: { type: 'string', default: 'Root' },
                  children: {
                    type: 'array',
                    items: { $ref: '#/$defs/TreeNode' },
                  },
                },
              },
              Metadata: {
                type: 'object',
                properties: {
                  version: { type: 'string', default: '1.0' },
                  author: { type: 'string', default: 'Anonymous' },
                },
              },
            },
            properties: {
              tree_document: {
                type: 'array',
                prefixItems: [
                  { $ref: '#/$defs/Metadata', title: 'Document Metadata' },
                  { $ref: '#/$defs/TreeNode', title: 'Root Node' },
                ],
                items: false,
                minItems: 2,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/tree_document') as ArrayNode;
        expect(arrayNode).toBeDefined();
        expect(arrayNode.children?.length).toBe(2);

        // First child should have Metadata schema with defaults
        const metadataChild = arrayNode.children?.[0]?.node as ObjectNode;
        expect(metadataChild.value).toEqual({
          version: '1.0',
          author: 'Anonymous',
        });

        // Second child should have TreeNode schema
        // Note: Empty children array is not included in value by default
        const treeNodeChild = arrayNode.children?.[1]?.node as ObjectNode;
        expect(treeNodeChild.value).toEqual({
          id: 'node-1',
          label: 'Root',
        });

        // Verify we can access the children array node
        const childrenNode = treeNodeChild.find('./children') as ArrayNode;
        expect(childrenNode).toBeDefined();

        // Push a child node - should use self-referencing TreeNode schema
        await childrenNode.push();
        await delay();

        expect(childrenNode.children?.length).toBe(1);
        const nestedTreeNode = childrenNode.children?.[0]?.node as ObjectNode;
        // Nested TreeNode also has same default values
        expect(nestedTreeNode.value).toEqual({
          id: 'node-1',
          label: 'Root',
        });

        // After pushing, the parent value should now include children
        expect(treeNodeChild.value).toEqual({
          id: 'node-1',
          label: 'Root',
          children: [{ id: 'node-1', label: 'Root' }],
        });
      });

      it('should push with correct $ref schema for each prefixItems position', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            $defs: {
              FirstType: {
                type: 'object',
                properties: {
                  firstProp: { type: 'string', default: 'first_value' },
                },
              },
              SecondType: {
                type: 'object',
                properties: {
                  secondProp: { type: 'number', default: 100 },
                },
              },
              ThirdType: {
                type: 'object',
                properties: {
                  thirdProp: { type: 'boolean', default: true },
                },
              },
            },
            properties: {
              refTuple: {
                type: 'array',
                prefixItems: [
                  { $ref: '#/$defs/FirstType' },
                  { $ref: '#/$defs/SecondType' },
                  { $ref: '#/$defs/ThirdType' },
                ],
                items: false,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/refTuple') as ArrayNode;
        expect(arrayNode.children?.length).toBe(0);

        // Push first item - should use FirstType
        await arrayNode.push();
        await delay();
        expect(arrayNode.children?.length).toBe(1);
        expect((arrayNode.children?.[0]?.node as ObjectNode).value).toEqual({
          firstProp: 'first_value',
        });

        // Push second item - should use SecondType
        await arrayNode.push();
        await delay();
        expect(arrayNode.children?.length).toBe(2);
        expect((arrayNode.children?.[1]?.node as ObjectNode).value).toEqual({
          secondProp: 100,
        });

        // Push third item - should use ThirdType
        await arrayNode.push();
        await delay();
        expect(arrayNode.children?.length).toBe(3);
        expect((arrayNode.children?.[2]?.node as ObjectNode).value).toEqual({
          thirdProp: true,
        });

        // Try to push fourth item - should be rejected (items: false)
        await arrayNode.push();
        await delay();
        expect(arrayNode.children?.length).toBe(3);
      });
    });

    describe('TerminalStrategy with $ref', () => {
      it('should resolve prefixItems with primitive type $ref for terminal array', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            $defs: {
              StringDefault: {
                type: 'string',
                default: 'ref_string',
              },
              NumberDefault: {
                type: 'number',
                default: 99,
              },
              BooleanDefault: {
                type: 'boolean',
                default: false,
              },
            },
            properties: {
              terminalTuple: {
                type: 'array',
                terminal: true,
                prefixItems: [
                  { $ref: '#/$defs/StringDefault' },
                  { $ref: '#/$defs/NumberDefault' },
                  { $ref: '#/$defs/BooleanDefault' },
                ],
                items: false,
                minItems: 3,
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/terminalTuple') as ArrayNode;
        expect(arrayNode.children).toBeNull();
        expect(arrayNode.value).toEqual(['ref_string', 99, false]);
      });

      it('should push with correct $ref default values for terminal array', async () => {
        const node = nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            $defs: {
              Val1: { type: 'string', default: 'A' },
              Val2: { type: 'string', default: 'B' },
              Val3: { type: 'string', default: 'C' },
              ExtraVal: { type: 'string', default: 'X' },
            },
            properties: {
              openTerminalTuple: {
                type: 'array',
                terminal: true,
                prefixItems: [
                  { $ref: '#/$defs/Val1' },
                  { $ref: '#/$defs/Val2' },
                  { $ref: '#/$defs/Val3' },
                ],
                items: { $ref: '#/$defs/ExtraVal' },
              },
            },
          },
        });

        await delay();

        const arrayNode = node?.find('/openTerminalTuple') as ArrayNode;
        expect(arrayNode.value).toEqual([]);

        // Push items in sequence
        await arrayNode.push();
        await delay();
        expect(arrayNode.value).toEqual(['A']);

        await arrayNode.push();
        await delay();
        expect(arrayNode.value).toEqual(['A', 'B']);

        await arrayNode.push();
        await delay();
        expect(arrayNode.value).toEqual(['A', 'B', 'C']);

        // Beyond prefixItems - should use items $ref
        await arrayNode.push();
        await delay();
        expect(arrayNode.value).toEqual(['A', 'B', 'C', 'X']);

        await arrayNode.push();
        await delay();
        expect(arrayNode.value).toEqual(['A', 'B', 'C', 'X', 'X']);
      });
    });

    describe('Validation with $ref prefixItems', () => {
      it('should validate object type $ref in prefixItems with minItems constraint', async () => {
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
            $defs: {
              Item: {
                type: 'object',
                properties: {
                  value: { type: 'number', default: 0 },
                },
              },
            },
            properties: {
              items: {
                type: 'array',
                prefixItems: [
                  { $ref: '#/$defs/Item', title: 'First' },
                  { $ref: '#/$defs/Item', title: 'Second' },
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

        const arrayNode = node?.find('/items') as ArrayNode;
        expect(arrayNode.children?.length).toBe(2);

        // Verify minItems is satisfied with defaults
        expect(arrayNode.errors).toEqual([]);

        // Verify children have correct default values from $ref
        expect((arrayNode.children?.[0]?.node as ObjectNode).value).toEqual({
          value: 0,
        });
        expect((arrayNode.children?.[1]?.node as ObjectNode).value).toEqual({
          value: 0,
        });
      });

      it('should validate nested $ref schemas in prefixItems', async () => {
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
            $defs: {
              Person: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1, default: 'John' },
                  age: {
                    type: 'number',
                    minimum: 0,
                    maximum: 120,
                    default: 25,
                  },
                },
                required: ['name', 'age'],
              },
            },
            properties: {
              people: {
                type: 'array',
                prefixItems: [
                  { $ref: '#/$defs/Person', title: 'First Person' },
                  { $ref: '#/$defs/Person', title: 'Second Person' },
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

        const arrayNode = node?.find('/people') as ArrayNode;
        expect(arrayNode.children?.length).toBe(2);

        // Verify initial valid state - defaults satisfy constraints
        expect(arrayNode.errors).toEqual([]);

        // Verify children have correct structure from $ref
        const firstPerson = arrayNode.children?.[0]?.node as ObjectNode;
        expect(firstPerson.value).toEqual({ name: 'John', age: 25 });

        const secondPerson = arrayNode.children?.[1]?.node as ObjectNode;
        expect(secondPerson.value).toEqual({ name: 'John', age: 25 });

        // Modify values and verify they are properly applied
        const firstNameNode = firstPerson.find('./name');
        if (firstNameNode?.type === 'string') firstNameNode.setValue('Alice');
        await delay();

        expect(firstPerson.value).toEqual({ name: 'Alice', age: 25 });
        expect(arrayNode.value).toEqual([
          { name: 'Alice', age: 25 },
          { name: 'John', age: 25 },
        ]);
      });
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

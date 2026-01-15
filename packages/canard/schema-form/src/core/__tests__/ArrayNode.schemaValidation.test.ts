import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import { JsonSchemaError } from '@/schema-form/errors';
import type { JsonSchema } from '@/schema-form/types';

import { validateArraySchema } from '../nodes/ArrayNode';

describe('ArrayNode Schema Validation', () => {
  describe('validateArraySchema function', () => {
    it('should pass when items is a schema object', () => {
      const schema = {
        type: 'array',
        items: { type: 'string' },
      } as const;

      expect(() => validateArraySchema(schema)).not.toThrow();
      expect(validateArraySchema(schema)).toBe(true);
    });

    it('should pass when only prefixItems is defined', () => {
      const schema = {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
      } as const;

      // @ts-expect-error - Testing schema without items (valid per JSON Schema spec)
      expect(() => validateArraySchema(schema)).not.toThrow();
      // @ts-expect-error - Testing schema without items (valid per JSON Schema spec)
      expect(validateArraySchema(schema)).toBe(true);
    });

    it('should pass when prefixItems is defined with items: false (fixed-length tuple)', () => {
      const schema = {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        items: false,
      } as const;

      // @ts-expect-error - Testing tuple schema with items: false
      expect(() => validateArraySchema(schema)).not.toThrow();
      // @ts-expect-error - Testing tuple schema with items: false
      expect(validateArraySchema(schema)).toBe(true);
    });

    it('should pass when both prefixItems and items schema are defined', () => {
      const schema = {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        items: { type: 'boolean' },
      } as const;

      // @ts-expect-error - Testing open tuple schema
      expect(() => validateArraySchema(schema)).not.toThrow();
      // @ts-expect-error - Testing open tuple schema
      expect(validateArraySchema(schema)).toBe(true);
    });

    it('should throw error when neither items nor prefixItems is defined', () => {
      const schema = {
        type: 'array',
      } as const;

      expect(() => validateArraySchema(schema)).toThrow(JsonSchemaError);
      expect(() => validateArraySchema(schema)).toThrow(
        "Invalid array schema: Array must have 'items' or 'prefixItems' defined.",
      );
    });

    it('should throw error when items is false without prefixItems', () => {
      const schema = {
        type: 'array',
        items: false,
      } as const;

      expect(() => validateArraySchema(schema)).toThrow(JsonSchemaError);
      expect(() => validateArraySchema(schema)).toThrow(
        "Invalid array schema: 'items: false' requires 'prefixItems' to be defined.",
      );
    });

    it('should throw error when prefixItems only and maxItems exceeds prefixItems length', () => {
      const schema = {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        maxItems: 5, // prefixItems.length = 2, maxItems = 5
      } as const;

      // @ts-expect-error - Testing invalid schema configuration
      expect(() => validateArraySchema(schema)).toThrow(JsonSchemaError);
      // @ts-expect-error - Testing invalid schema configuration
      expect(() => validateArraySchema(schema)).toThrow(
        "Invalid array schema: 'maxItems' exceeds 'prefixItems' length without 'items' schema.",
      );
    });

    it('should throw error when prefixItems only and minItems exceeds prefixItems length', () => {
      const schema = {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        minItems: 4, // prefixItems.length = 2, minItems = 4
      } as const;

      // @ts-expect-error - Testing invalid schema configuration
      expect(() => validateArraySchema(schema)).toThrow(JsonSchemaError);
      // @ts-expect-error - Testing invalid schema configuration
      expect(() => validateArraySchema(schema)).toThrow(
        "Invalid array schema: 'minItems' exceeds 'prefixItems' length without 'items' schema.",
      );
    });

    it('should pass when prefixItems only and maxItems equals prefixItems length', () => {
      const schema = {
        type: 'array',
        prefixItems: [
          { type: 'string' },
          { type: 'number' },
          { type: 'boolean' },
        ],
        maxItems: 3, // prefixItems.length = 3, maxItems = 3 (equal is OK)
      } as const;

      // @ts-expect-error - Testing valid schema configuration
      expect(() => validateArraySchema(schema)).not.toThrow();
      // @ts-expect-error - Testing valid schema configuration
      expect(validateArraySchema(schema)).toBe(true);
    });

    it('should pass when prefixItems only and minItems equals prefixItems length', () => {
      const schema = {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        minItems: 2, // prefixItems.length = 2, minItems = 2 (equal is OK)
      } as const;

      // @ts-expect-error - Testing valid schema configuration
      expect(() => validateArraySchema(schema)).not.toThrow();
      // @ts-expect-error - Testing valid schema configuration
      expect(validateArraySchema(schema)).toBe(true);
    });

    it('should pass when prefixItems only and maxItems is less than prefixItems length', () => {
      const schema = {
        type: 'array',
        prefixItems: [
          { type: 'string' },
          { type: 'number' },
          { type: 'boolean' },
        ],
        maxItems: 2, // prefixItems.length = 3, maxItems = 2 (less is OK)
      } as const;

      // @ts-expect-error - Testing valid schema configuration
      expect(() => validateArraySchema(schema)).not.toThrow();
      // @ts-expect-error - Testing valid schema configuration
      expect(validateArraySchema(schema)).toBe(true);
    });

    it('should pass when prefixItems with items schema and minItems exceeds prefixItems length', () => {
      // With items schema defined, minItems can exceed prefixItems length
      const schema = {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        items: { type: 'boolean' }, // items schema defined for additional elements
        minItems: 5, // OK because items schema handles indices beyond prefixItems
      } as const;

      // @ts-expect-error - Testing valid open tuple schema
      expect(() => validateArraySchema(schema)).not.toThrow();
      // @ts-expect-error - Testing valid open tuple schema
      expect(validateArraySchema(schema)).toBe(true);
    });

    it('should pass when prefixItems with items schema and maxItems exceeds prefixItems length', () => {
      // With items schema defined, maxItems can exceed prefixItems length
      const schema = {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        items: { type: 'boolean' }, // items schema defined for additional elements
        maxItems: 10, // OK because items schema handles indices beyond prefixItems
      } as const;

      // @ts-expect-error - Testing valid open tuple schema
      expect(() => validateArraySchema(schema)).not.toThrow();
      // @ts-expect-error - Testing valid open tuple schema
      expect(validateArraySchema(schema)).toBe(true);
    });
  });

  describe('nodeFromJsonSchema integration', () => {
    it('should create ArrayNode with items schema', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            arr: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      });

      await delay();

      expect(node).toBeDefined();
      expect(node?.find('/arr')).toBeDefined();
    });

    it('should create ArrayNode with prefixItems only', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            tuple: {
              type: 'array',
              prefixItems: [
                { type: 'string', default: 'hello' },
                { type: 'number', default: 42 },
              ],
            },
          },
        },
      });

      await delay();

      expect(node).toBeDefined();
      expect(node?.find('/tuple')).toBeDefined();
    });

    it('should create ArrayNode with prefixItems and items: false (fixed-length tuple)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            fixedTuple: {
              type: 'array',
              prefixItems: [
                { type: 'string', default: 'a' },
                { type: 'number', default: 1 },
                { type: 'boolean', default: true },
              ],
              items: false,
            },
          },
        },
      });

      await delay();

      expect(node).toBeDefined();
      expect(node?.find('/fixedTuple')).toBeDefined();
    });

    it('should create ArrayNode with prefixItems and items schema (open tuple)', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            openTuple: {
              type: 'array',
              prefixItems: [{ type: 'string' }, { type: 'number' }],
              items: { type: 'boolean' },
            },
          },
        },
      });

      await delay();

      expect(node).toBeDefined();
      expect(node?.find('/openTuple')).toBeDefined();
    });

    it('should throw error when array schema has no items or prefixItems', () => {
      expect(() =>
        nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              invalidArr: {
                type: 'array',
              } as JsonSchema,
            },
          },
        }),
      ).toThrow(JsonSchemaError);
    });

    it('should throw error when array schema has items: false without prefixItems', () => {
      expect(() =>
        nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              invalidArr: {
                type: 'array',
                items: false,
              } as JsonSchema,
            },
          },
        }),
      ).toThrow(JsonSchemaError);
    });

    it('should throw specific error message for items: false without prefixItems', () => {
      expect(() =>
        nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              invalidArr: {
                type: 'array',
                items: false,
              } as JsonSchema,
            },
          },
        }),
      ).toThrow(
        "Invalid array schema: 'items: false' requires 'prefixItems' to be defined.",
      );
    });

    it('should throw specific error message for missing items and prefixItems', () => {
      expect(() =>
        nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'object',
            properties: {
              invalidArr: {
                type: 'array',
              } as JsonSchema,
            },
          },
        }),
      ).toThrow(
        "Invalid array schema: Array must have 'items' or 'prefixItems' defined.",
      );
    });
  });

  describe('root level array schema', () => {
    it('should create root ArrayNode with items schema', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          items: { type: 'string' },
        },
      });

      await delay();

      expect(node).toBeDefined();
    });

    it('should create root ArrayNode with prefixItems only', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'array',
          prefixItems: [{ type: 'string' }, { type: 'number' }],
        },
      });

      await delay();

      expect(node).toBeDefined();
    });

    it('should throw error for root array with no items or prefixItems', () => {
      expect(() =>
        nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'array',
          } as JsonSchema,
        }),
      ).toThrow(JsonSchemaError);
    });

    it('should throw error for root array with items: false and no prefixItems', () => {
      expect(() =>
        nodeFromJsonSchema({
          onChange: () => {},
          jsonSchema: {
            type: 'array',
            items: false,
          } as JsonSchema,
        }),
      ).toThrow(JsonSchemaError);
    });
  });

  describe('nested array schema validation', () => {
    it('should validate nested array schemas', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            matrix: {
              type: 'array',
              items: {
                type: 'array',
                items: { type: 'number' },
              },
            },
          },
        },
      });

      await delay();

      expect(node).toBeDefined();
      expect(node?.find('/matrix')).toBeDefined();
    });

    it('should throw error for invalid nested array schema when items is processed', async () => {
      // Note: Nested array validation happens when items schema is processed,
      // which occurs during node creation
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            matrix: {
              type: 'array',
              items: {
                type: 'array',
              } as JsonSchema,
            },
          },
        },
      });

      await delay();

      // The inner array should be created but validation happens at processSchema time
      // Since the inner array lacks items/prefixItems, pushing to outer array should fail
      const matrixNode = node?.find(
        '/matrix',
      ) as import('../nodes/ArrayNode').ArrayNode;
      expect(matrixNode).toBeDefined();

      // When trying to push an item, the inner array node will be created
      // and validation will be triggered (synchronously throws)
      let thrownError: Error | undefined;
      try {
        await matrixNode.push();
      } catch (error) {
        thrownError = error as Error;
      }

      expect(thrownError).toBeInstanceOf(JsonSchemaError);
      expect(thrownError?.message).toContain(
        "Invalid array schema: Array must have 'items' or 'prefixItems' defined.",
      );
    });

    it('should validate deeply nested array with prefixItems', async () => {
      const node = nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'array',
                prefixItems: [{ type: 'string' }, { type: 'number' }],
                items: false,
              },
            },
          },
        },
      });

      await delay();

      expect(node).toBeDefined();
      expect(node?.find('/data')).toBeDefined();
    });
  });
});

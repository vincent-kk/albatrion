/**
 * omitTrailing Option Tests for ArrayNode
 *
 * These tests verify that `options.omitTrailing` strips consecutive trailing
 * `undefined` items from the array's outgoing value only — parent propagation
 * and root emission — while child nodes and the raw `value` getter keep the
 * full array. Leading/middle `undefined` items are preserved so error paths
 * and validation indices stay aligned.
 */
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { ObjectNode } from '../nodes/ObjectNode';

const objectSchemaWith = (options?: {
  omitTrailing?: boolean;
  omitEmpty?: boolean;
}) =>
  ({
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        items: { type: 'number' },
        ...(options !== undefined ? { options } : {}),
      },
    },
  }) satisfies JsonSchema;

const setup = async (options?: {
  omitTrailing?: boolean;
  omitEmpty?: boolean;
}) => {
  const onChange = vi.fn();
  const node = nodeFromJsonSchema({
    jsonSchema: objectSchemaWith(options),
    onChange,
  }) as ObjectNode;
  await delay();
  const arrayNode = node.find('/arr') as ArrayNode;
  return { node, arrayNode, onChange };
};

describe('ArrayNode omitTrailing', () => {
  describe('parent propagation (branch strategy)', () => {
    it('should strip trailing undefined items from the value passed to the parent', async () => {
      const { node, arrayNode, onChange } = await setup({
        omitTrailing: true,
      });
      arrayNode.setValue([1, 2, 3, undefined, undefined]);
      await delay();
      expect(node.value?.arr).toEqual([1, 2, 3]);
      expect(onChange.mock.lastCall?.[0]).toEqual({ arr: [1, 2, 3] });
    });

    it('should keep child nodes and the raw value getter untouched', async () => {
      const { arrayNode } = await setup({ omitTrailing: true });
      arrayNode.setValue([1, 2, 3, undefined, undefined]);
      await delay();
      expect(arrayNode.value).toEqual([1, 2, 3, undefined, undefined]);
      expect(arrayNode.length).toBe(5);
      expect(arrayNode.children?.length).toBe(5);
    });

    it('should preserve leading undefined items', async () => {
      const { node, arrayNode } = await setup({ omitTrailing: true });
      arrayNode.setValue([undefined, 1, 2]);
      await delay();
      expect(node.value?.arr).toEqual([undefined, 1, 2]);
    });

    it('should preserve middle undefined items', async () => {
      const { node, arrayNode } = await setup({ omitTrailing: true });
      arrayNode.setValue([1, undefined, 2]);
      await delay();
      expect(node.value?.arr).toEqual([1, undefined, 2]);
    });

    it('should remove only the trailing run after a middle undefined', async () => {
      const { node, arrayNode } = await setup({ omitTrailing: true });
      arrayNode.setValue([1, undefined, 2, undefined, undefined]);
      await delay();
      expect(node.value?.arr).toEqual([1, undefined, 2]);
    });

    it('should chain into omitEmpty when every item is undefined', async () => {
      const { node, arrayNode } = await setup({ omitTrailing: true });
      arrayNode.setValue([undefined, undefined]);
      await delay();
      expect(node.value?.arr).toBeUndefined();
    });

    it('should keep the emptied array when omitEmpty is disabled', async () => {
      const { node, arrayNode } = await setup({
        omitTrailing: true,
        omitEmpty: false,
      });
      arrayNode.setValue([undefined, undefined]);
      await delay();
      expect(node.value?.arr).toEqual([]);
    });

    it('should not trim when omitTrailing is not enabled (opt-in)', async () => {
      const { node, arrayNode } = await setup();
      arrayNode.setValue([1, undefined, undefined]);
      await delay();
      expect(node.value?.arr).toEqual([1, undefined, undefined]);
    });

    it('should trim empty items appended through push()', async () => {
      const { node, arrayNode } = await setup({ omitTrailing: true });
      arrayNode.setValue([1, 2]);
      await delay();
      arrayNode.push();
      arrayNode.push();
      await delay();
      expect(node.value?.arr).toEqual([1, 2]);
      expect(arrayNode.children?.length).toBe(4);
    });
  });

  describe('root-level ArrayNode', () => {
    it('should emit the trimmed value through root onChange', async () => {
      const onChange = vi.fn();
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'array',
          items: { type: 'number' },
          options: { omitTrailing: true },
        } satisfies JsonSchema,
        onChange,
      }) as ArrayNode;
      await delay();
      node.setValue([1, 2, undefined]);
      await delay();
      expect(onChange.mock.lastCall?.[0]).toEqual([1, 2]);
      expect(node.value).toEqual([1, 2, undefined]);
    });

    it('should emit a safe empty array when every item is undefined', async () => {
      const onChange = vi.fn();
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'array',
          items: { type: 'number' },
          options: { omitTrailing: true },
        } satisfies JsonSchema,
        onChange,
      }) as ArrayNode;
      await delay();
      node.setValue([undefined, undefined]);
      await delay();
      expect(onChange.mock.lastCall?.[0]).toEqual([]);
      expect(node.value).toEqual([undefined, undefined]);
    });
  });

  describe('nested arrays (hydration)', () => {
    it('should trim inner arrays hydrated through defaultValue', async () => {
      const onChange = vi.fn();
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number' },
            options: { omitTrailing: true },
          },
          default: [[1, undefined]],
        } satisfies JsonSchema,
        onChange,
      }) as ArrayNode;
      await delay();
      expect(onChange.mock.lastCall?.[0]).toEqual([[1]]);
      const inner = node.find('/0') as ArrayNode;
      expect(inner.value).toEqual([1, undefined]);
    });

    it('should trim inner arrays hydrated through setValue', async () => {
      const onChange = vi.fn();
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number' },
            options: { omitTrailing: true },
          },
        } satisfies JsonSchema,
        onChange,
      }) as ArrayNode;
      await delay();
      node.setValue([[2, undefined]]);
      await delay();
      expect(onChange.mock.lastCall?.[0]).toEqual([[2]]);
    });
  });

  describe('terminal strategy', () => {
    it('should strip trailing undefined items from a terminal array', async () => {
      const onChange = vi.fn();
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            arr: {
              type: 'array',
              items: { type: 'number' },
              terminal: true,
              options: { omitTrailing: true },
            },
          },
        } satisfies JsonSchema,
        onChange,
      }) as ObjectNode;
      await delay();
      const arrayNode = node.find('/arr') as ArrayNode;
      arrayNode.setValue([1, undefined]);
      await delay();
      expect(node.value?.arr).toEqual([1]);
      expect(arrayNode.value).toEqual([1, undefined]);
    });
  });
});

import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

type CompositionScope = 'oneOf' | 'anyOf';

const createNestedSchema = (innerScope: CompositionScope): JsonSchema => ({
  type: 'object',
  properties: {
    variant: {
      type: 'string',
      enum: ['primary', 'secondary'],
      default: 'primary',
    },
  },
  oneOf: [
    {
      '&if': "./variant === 'primary'",
      properties: {
        config: {
          type: 'object',
          properties: {
            mode: { type: 'string', default: 'standard' },
          },
          [innerScope]: [
            {
              '&if': "./mode === 'standard'",
              properties: {
                cost: { type: 'number', default: 5.99 },
                days: { type: 'number', default: 7 },
              },
            },
          ],
        },
      },
    },
    {
      '&if': "./variant === 'secondary'",
      properties: {
        note: { type: 'string', default: 'secondary' },
      },
    },
  ],
});

const expectedValue = {
  variant: 'primary',
  config: { mode: 'standard', cost: 5.99, days: 7 },
};

describe('BranchStrategy oneOf - nested defaults', () => {
  it.each<CompositionScope>(['oneOf', 'anyOf'])(
    'preserves defaults from a nested %s during initial activation',
    async (innerScope) => {
      const node = nodeFromJsonSchema({
        jsonSchema: createNestedSchema(innerScope),
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      expect(node.value).toEqual(expectedValue);
    },
  );

  it.each<CompositionScope>(['oneOf', 'anyOf'])(
    'restores nested %s defaults after reactivation',
    async (innerScope) => {
      const node = nodeFromJsonSchema({
        jsonSchema: createNestedSchema(innerScope),
        onChange: () => {},
      }) as ObjectNode;

      await delay();
      node.find('config/cost')?.setValue(99);
      await delay();
      expect(node.value?.config?.cost).toBe(99);

      const variantNode = node.find('variant') as StringNode;
      variantNode.setValue('secondary');
      await delay();
      expect(node.value).toEqual({
        variant: 'secondary',
        note: 'secondary',
      });

      variantNode.setValue('primary');
      await delay();

      expect(node.value).toEqual(expectedValue);
    },
  );
});

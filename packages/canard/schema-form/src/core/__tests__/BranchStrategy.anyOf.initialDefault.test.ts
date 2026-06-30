import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { BooleanNode } from '../nodes/BooleanNode';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';

type CompositionScope = 'oneOf' | 'anyOf';

const createNestedSchema = (innerScope: CompositionScope): JsonSchema => ({
  type: 'object',
  properties: {
    enabled: { type: 'boolean', default: true },
  },
  anyOf: [
    {
      '&if': './enabled === true',
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
  ],
});

const expectedValue = {
  enabled: true,
  config: { mode: 'standard', cost: 5.99, days: 7 },
};

describe('BranchStrategy anyOf - nested defaults', () => {
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
      (node.find('config/cost') as NumberNode | null)?.setValue(99);
      await delay();
      expect(node.value?.config?.cost).toBe(99);

      const enabledNode = node.find('enabled') as BooleanNode;
      enabledNode.setValue(false);
      await delay();
      expect(node.value).toEqual({ enabled: false });

      enabledNode.setValue(true);
      await delay();

      expect(node.value).toEqual(expectedValue);
    },
  );

  it('preserves nested defaults for multiple initially active anyOf branches', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        shippingEnabled: { type: 'boolean', default: true },
        pickupEnabled: { type: 'boolean', default: true },
      },
      anyOf: [
        {
          '&if': './shippingEnabled === true',
          properties: {
            shipping: {
              type: 'object',
              properties: {
                mode: { type: 'string', default: 'standard' },
              },
              anyOf: [
                {
                  '&if': "./mode === 'standard'",
                  properties: {
                    cost: { type: 'number', default: 5.99 },
                  },
                },
              ],
            },
          },
        },
        {
          '&if': './pickupEnabled === true',
          properties: {
            pickup: {
              type: 'object',
              properties: {
                method: { type: 'string', default: 'counter' },
              },
              oneOf: [
                {
                  '&if': "./method === 'counter'",
                  properties: {
                    location: { type: 'string', default: 'lobby' },
                  },
                },
              ],
            },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      jsonSchema: schema,
      onChange: () => {},
    }) as ObjectNode;

    await delay();

    expect(node.value).toEqual({
      shippingEnabled: true,
      pickupEnabled: true,
      shipping: { mode: 'standard', cost: 5.99 },
      pickup: { method: 'counter', location: 'lobby' },
    });
  });
});

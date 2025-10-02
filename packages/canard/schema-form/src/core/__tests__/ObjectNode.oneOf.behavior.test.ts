import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';

describe('ObjectNode OneOf Behavior Test - Understanding actual behavior', () => {
  const schema: JsonSchema = {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['A', 'B'],
        default: 'A',
      },
    },
    oneOf: [
      {
        '&if': "./mode === 'A'",
        properties: {
          fieldA: { type: 'string' },
        },
      },
      {
        '&if': "./mode === 'B'",
        properties: {
          fieldB: { type: 'string' },
        },
      },
    ],
  };

  it('should understand how setValue behaves without Normalize flag', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    await delay();

    // Test 1: Set mode A with both fields
    node.setValue({
      mode: 'A',
      fieldA: 'valueA',
      fieldB: 'valueB',
    });

    await delay();

    console.log('Test 1 - Mode A with both fields:', node.value);
    expect(node.value).toEqual({ mode: 'A', fieldA: 'valueA' });

    // Test 2: Set mode B with both fields
    node.setValue({
      mode: 'B',
      fieldA: 'valueA',
      fieldB: 'valueB',
    });

    await delay();

    console.log('Test 2 - Mode B with both fields:', node.value);
    expect(node.value).toEqual({ mode: 'B', fieldB: 'valueB' });
  });

  it('should understand nested object behavior', async () => {
    const nestedSchema: JsonSchema = {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['A', 'B'],
          default: 'A',
        },
      },
      oneOf: [
        {
          '&if': "./mode === 'A'",
          properties: {
            nested: {
              type: 'object',
              properties: {
                A_field: { type: 'string' },
              },
            },
          },
        },
        {
          '&if': "./mode === 'B'",
          properties: {
            nested: {
              type: 'object',
              properties: {
                B_field: { type: 'string' },
              },
            },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: nestedSchema,
    }) as ObjectNode;

    await delay();

    // Test: Set mode A with both A and B nested fields
    node.setValue({
      mode: 'A',
      nested: {
        A_field: 'valueA',
        B_field: 'valueB',
      },
    });

    await delay();

    console.log('Nested test - Mode A with both nested fields:', node.value);

    // Check if nested B_field is removed automatically by oneOf
    expect(node.value).toHaveProperty('mode', 'A');
    expect(node.value).toHaveProperty('nested');
    expect((node.value as any).nested).toEqual({ A_field: 'valueA' });
  });

  it('should handle OneOfPreservation story scenario - BranchStrategy object normalization', async () => {
    // This tests the scenario from OneOfPreservation story
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['A', 'B'],
          default: 'A',
        },
      },
      oneOf: [
        {
          '&if': "./mode === 'A'",
          properties: {
            config: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                A_value: { type: 'string' },
                A_value2: { type: 'number' },
              },
            },
          },
        },
        {
          '&if': "./mode === 'B'",
          properties: {
            config: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                B_value: { type: 'string' },
                B_value2: { type: 'number' },
              },
            },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    await delay();

    // Set mode A with both A and B fields
    node.setValue({
      mode: 'A',
      config: {
        value: 'common',
        A_value: 'valueA',
        A_value2: 100,
        B_value: 'valueB',
        B_value2: 200,
      },
    });

    await delay();

    console.log('OneOfPreservation - Mode A with both fields:', node.value);

    // B fields should be automatically removed by oneOf
    expect(node.value).toEqual({
      mode: 'A',
      config: {
        value: 'common',
        A_value: 'valueA',
        A_value2: 100,
      },
    });

    // Now switch to mode B
    node.setValue({
      mode: 'B',
      config: {
        value: 'common',
        A_value: 'valueA',
        A_value2: 100,
        B_value: 'valueB',
        B_value2: 200,
      },
    });

    await delay();

    console.log('OneOfPreservation - Mode B with both fields:', node.value);

    // A fields should be automatically removed by oneOf
    expect(node.value).toEqual({
      mode: 'B',
      config: {
        value: 'common',
        B_value: 'valueB',
        B_value2: 200,
      },
    });
  });
});

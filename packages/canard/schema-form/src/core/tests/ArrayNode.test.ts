import { describe, expect, it } from 'vitest';

import { nodeFromJsonSchema } from '@/schema-form/core';
import { JsonSchema } from '@/schema-form/types';

import { ArrayNode } from '../nodes/ArrayNode/ArrayNode';

describe('ArrayNode', () => {
  it('automatically add items up to minItems', () => {
    const MIN_ITEMS = 5;
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            items: {
              type: 'string',
              default: 'hello',
            },
            minItems: MIN_ITEMS,
          },
        },
      },
    });

    expect(node?.value?.arr.length).toBe(MIN_ITEMS);
  });

  it('add / remove / clear items', () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            items: {
              type: 'string',
              default: 'hello',
            },
          },
        },
      },
    });

    expect(node?.value?.arr).toMatchObject([]);
    (node?.findNode('arr') as ArrayNode)?.push();
    expect(node?.value?.arr).toMatchObject(['hello']);
    (node?.findNode('arr') as ArrayNode)?.push('world');
    expect(node?.value?.arr).toMatchObject(['hello', 'world']);
    (node?.findNode('arr') as ArrayNode)?.remove(0);
    expect(node?.value?.arr).toMatchObject(['world']);
    (node?.findNode('arr') as ArrayNode)?.clear();
    expect(node?.value?.arr).toMatchObject([]);
  });

  it('cannot exceed maxItems', () => {
    const MAX_ITEMS = 3;
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            items: {
              type: 'string',
              default: 'hello',
            },
            maxItems: MAX_ITEMS,
          },
        },
      },
    });
    expect(node?.value?.arr).toMatchObject([]);
    Array(MAX_ITEMS + 10)
      .fill(true)
      .forEach(() => {
        (node?.findNode('arr') as ArrayNode)?.push();
      });
    expect(node?.value?.arr.length).toBe(MAX_ITEMS);
  });

  it('array.getValue', () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      defaultValue: {
        tags: ['harry', 'ron'],
      },
    });
    expect(node?.findNode('$.tags')?.value).toMatchObject(['harry', 'ron']);

    const found = node?.findNode('$.tags');
    if (found?.type === 'array') {
      found.setValue(['Hermione', 'ron', 'harry']);
    }
    expect(node?.findNode('$.tags')?.value).toMatchObject([
      'Hermione',
      'ron',
      'harry',
    ]);
  });

  it('ArrayNode with defaultValue', () => {
    const jsonSchema = {
      type: 'object',
      properties: {
        array: {
          type: 'array',
          items: { type: 'number' },
          minItems: 2,
        },
        objectArray: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          },
          minItems: 3,
        },
      },
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      jsonSchema,
      defaultValue: {
        array: [0, 0],
        objectArray: [
          {
            name: 'anonymous',
            age: 0,
          },
          {
            name: 'anonymous',
            age: 0,
          },
          {
            name: 'anonymous',
            age: 0,
          },
        ],
      },
    });

    expect(node.value).toEqual({
      array: [0, 0],
      objectArray: [
        {
          name: 'anonymous',
          age: 0,
        },
        {
          name: 'anonymous',
          age: 0,
        },
        {
          name: 'anonymous',
          age: 0,
        },
      ],
    });
  });

  it('ArrayNode with default in schema', () => {
    const jsonSchema = {
      type: 'object',
      properties: {
        array: {
          type: 'array',
          items: { type: 'number', default: 0 },
          minItems: 2,
        },
        objectArray: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', default: 'anonymous' },
              age: { type: 'number', default: 0 },
            },
          },
          minItems: 3,
        },
      },
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      jsonSchema,
    });

    expect(node.value).toEqual({
      array: [0, 0],
      objectArray: [
        {
          name: 'anonymous',
          age: 0,
        },
        {
          name: 'anonymous',
          age: 0,
        },
        {
          name: 'anonymous',
          age: 0,
        },
      ],
    });
  });
});

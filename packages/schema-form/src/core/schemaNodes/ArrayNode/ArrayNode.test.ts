import { expect, test } from 'vitest';

import { schemaNodeFromSchema } from '../../schemaNodeFromSchema';
import { ArrayNode } from './ArrayNode';

test('automatically add items up to minItems', () => {
  const MIN_ITEMS = 5;
  const node = schemaNodeFromSchema({
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

test('add / remove / clear items', () => {
  const node = schemaNodeFromSchema({
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

  console.log(node?.value?.arr);

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

test('cannot exceed maxItems', () => {
  const MAX_ITEMS = 3;
  const node = schemaNodeFromSchema({
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

test('array.getValue', () => {
  const node = schemaNodeFromSchema({
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
  expect(node?.findNode('$/tags')?.value).toMatchObject(['harry', 'ron']);

  const found = node?.findNode('$/tags');
  if (found?.type === 'array') {
    found.setValue(['Hermione', 'ron', 'harry']);
  }
  expect(node?.findNode('$/tags')?.value).toMatchObject([
    'Hermione',
    'ron',
    'harry',
  ]);
});

import { expect, test } from 'vitest';

import { ObjectSchema } from '@lumy/schema-form/types';

import { schemaNodeFromSchema } from '../../schemaNodeFromSchema';

test('default value', () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      character: {
        type: 'object',
        properties: {
          spell: {
            type: 'string',
            default: 'expecto patronum',
          },
        },
      },
    },
  } satisfies ObjectSchema;

  const node = schemaNodeFromSchema({ jsonSchema });
  expect(node?.value?.character.spell).toBe('expecto patronum');
});

test('anyOf', () => {
  const schema = {
    type: 'object',
    anyOf: [
      {
        properties: { category: { enum: ['movie'] } },
        required: ['title', 'openingDate'],
      },
      {
        properties: { category: { enum: ['game'] } },
        required: ['title', 'releaseDate', 'numOfPlayers'],
      },
    ],
    properties: {
      category: { type: 'string', enum: ['game', 'movie'], default: 'game' },
      title: { type: 'string' },
      openingDate: { type: 'string' },
      releaseDate: { type: 'string' },
      numOfPlayers: {
        type: 'number',
        ui: {
          show: '$.title==="multi"',
        },
      },
    },
  } satisfies ObjectSchema;
  const node = schemaNodeFromSchema({ jsonSchema: schema });

  expect(node?.findNode('title')?.jsonSchema?.ui?.show).toBe(
    '("movie"===@.category)||("game"===@.category)',
  );
  expect(node?.findNode('openingDate')?.jsonSchema.ui?.show).toBe(
    '"movie"===@.category',
  );
  expect(node?.findNode('releaseDate')?.jsonSchema.ui?.show).toBe(
    '"game"===@.category',
  );
  expect(node?.findNode('numOfPlayers')?.jsonSchema.ui?.show).toBe(
    '($.title==="multi")&&("game"===@.category)',
  );
});

test('sorted key order', () => {
  const schema = {
    type: 'object',
    properties: {
      category: { type: 'string' },
      title: { type: 'string' },
    },
  } satisfies ObjectSchema;
  const node = schemaNodeFromSchema({ jsonSchema: schema });
  expect(JSON.stringify(node.value)).toBe(JSON.stringify({}));

  const found = node?.findNode('title');
  if (found?.type === 'string') {
    found.setValue('Harry Potter');
  }

  expect(JSON.stringify(node.value)).toBe(
    JSON.stringify({
      title: 'Harry Potter',
    }),
  );

  const foundCategory = node?.findNode('category');
  if (foundCategory?.type === 'string') {
    foundCategory.setValue('movie');
  }
  expect(JSON.stringify(node.value)).toBe(
    JSON.stringify({
      category: 'movie',
      title: 'Harry Potter',
    }),
  );
});

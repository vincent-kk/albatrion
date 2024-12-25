import { describe, expect, it } from 'vitest';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { ObjectSchema } from '@/schema-form/types';

describe('ObjectNode', () => {
  it('default value', () => {
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

    const node = nodeFromJsonSchema({ jsonSchema });
    expect(node?.value?.character.spell).toBe('expecto patronum');
  });

  it('oneOf', () => {
    const schema = {
      type: 'object',
      oneOf: [
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
          renderOptions: {
            visible: '$.title==="multi"',
          },
        },
      },
    } satisfies ObjectSchema;
    const node = nodeFromJsonSchema({ jsonSchema: schema });

    expect(node?.findNode('title')?.jsonSchema?.renderOptions?.visible).toBe(
      '("movie"===@.category)||("game"===@.category)',
    );
    expect(
      node?.findNode('openingDate')?.jsonSchema?.renderOptions?.visible,
    ).toBe('"movie"===@.category');
    expect(
      node?.findNode('releaseDate')?.jsonSchema?.renderOptions?.visible,
    ).toBe('"game"===@.category');
    expect(
      node?.findNode('numOfPlayers')?.jsonSchema?.renderOptions?.visible,
    ).toBe('($.title==="multi")&&("game"===@.category)');
  });

  it('sorted key order', () => {
    const schema = {
      type: 'object',
      properties: {
        category: { type: 'string' },
        title: { type: 'string' },
      },
    } satisfies ObjectSchema;
    const node = nodeFromJsonSchema({ jsonSchema: schema });
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
});

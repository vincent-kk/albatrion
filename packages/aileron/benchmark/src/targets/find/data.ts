import type { JsonSchema } from '@winglet/json-schema';

import { nodeFromJsonSchema } from '@/schema-form/core';

const schema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['game', 'movie'],
      default: 'game',
    },
    title: { type: 'string' },
    details: {
      type: 'object',
      oneOf: [
        {
          '&if': "_.type==='game'",
          properties: {
            stages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'number' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                },
                default: {
                  label: 1,
                  name: 'stage 1',
                  description: 'stage 1 description',
                },
              },
            },
            platforms: {
              type: 'array',
              formType: 'checkbox',
              items: {
                type: 'string',
                enum: ['pc', 'console', 'mobile'],
              },
              default: ['pc', 'console'],
            },
            specs: {
              type: 'object',
              properties: {
                cpu: { type: 'string', default: 'Intel Core i5' },
                gpu: {
                  type: 'string',
                  default: 'NVIDIA GeForce GTX 1660 Ti',
                },
                memory: { type: 'string', default: '16GB' },
                storage: { type: 'string', default: '1TB' },
              },
            },
          },
        },
        {
          '&if': "_.type==='movie'",
          properties: {
            genres: {
              type: 'array',
              items: {
                type: 'string',
              },
              enum: [
                'action',
                'comedy',
                'drama',
                'horror',
                'romance',
                'sci-fi',
                'thriller',
              ],
            },
            platforms: {
              type: 'array',
              formType: 'checkbox',
              items: {
                type: 'string',
                enum: ['theater', 'streaming'],
              },
              default: ['theater'],
            },
            actors: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
      ],
    },
  },
  oneOf: [
    {
      '&if': "@.type==='game'",
      properties: {
        owner: { type: 'string', placeholder: 'developer of the game' },
      },
    },
    {
      '&if': "@.type==='movie'",
      properties: {
        owner: { type: 'string', placeholder: 'director of the movie' },
      },
    },
  ],
} satisfies JsonSchema;

export const node = nodeFromJsonSchema({
  jsonSchema: schema,
});

export const targetPath = '$.user.profile.preferences.notifications';

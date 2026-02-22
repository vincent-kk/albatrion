import React, { useState } from 'react';

import { Form, registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd6-plugin';

import DemoWrapper from '../DemoWrapper';

registerPlugin(plugin);

const schema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      title: 'Media Type',
      enum: ['game', 'movie'],
      default: 'game',
      description: 'Different detail fields appear based on media type',
    },
    title: {
      type: 'string',
      title: 'Title',
      placeholder: 'e.g. Epic Adventure',
      default: 'Stellar Odyssey',
    },
    details: {
      type: 'object',
      title: 'Details',
      oneOf: [
        {
          '&if': "../type === 'game'",
          properties: {
            stages: {
              type: 'array',
              title: 'Game Stages',
              description: 'Define levels or chapters of the game',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'number', title: 'Stage #' },
                  name: { type: 'string', title: 'Stage Name' },
                  description: { type: 'string', title: 'Description' },
                },
                default: {
                  label: 1,
                  name: 'Prologue',
                  description: 'The journey begins...',
                },
              },
            },
            platforms: {
              type: 'array',
              title: 'Platforms',
              formType: 'checkbox',
              items: {
                type: 'string',
                enum: ['pc', 'console', 'mobile'],
              },
              default: ['pc', 'console'],
            },
            specs: {
              type: 'object',
              title: 'System Requirements',
              description: 'Minimum hardware specifications to run the game',
              properties: {
                cpu: {
                  type: 'string',
                  title: 'CPU',
                  default: 'Intel Core i5-12400',
                },
                gpu: {
                  type: 'string',
                  title: 'GPU',
                  default: 'NVIDIA GeForce RTX 3060',
                },
                memory: {
                  type: 'string',
                  title: 'Memory',
                  default: '16GB DDR4',
                },
                storage: {
                  type: 'string',
                  title: 'Storage',
                  default: '50GB SSD',
                },
              },
            },
          },
        },
        {
          '&if': "../type === 'movie'",
          properties: {
            genres: {
              type: 'array',
              title: 'Genres',
              description: 'Select one or more genres',
              items: {
                type: 'string',
                enum: [
                  'action',
                  'comedy',
                  'drama',
                  'horror',
                  'romance',
                  'sci-fi',
                  'thriller',
                ],
                default: 'sci-fi',
              },
            },
            platforms: {
              type: 'array',
              title: 'Release Platforms',
              formType: 'checkbox',
              items: {
                type: 'string',
                enum: ['theater', 'streaming'],
              },
              default: ['theater', 'streaming'],
            },
            actors: {
              type: 'array',
              title: 'Main Actors',
              description: 'Add main cast members',
              items: { type: 'string', placeholder: 'Actor name' },
            },
          },
        },
      ],
    },
  },
  oneOf: [
    {
      '&if': "./type === 'game'",
      properties: {
        owner: {
          type: 'string',
          title: 'Developer',
          placeholder: 'e.g. Studio Name',
          default: 'Nova Interactive',
        },
      },
    },
    {
      '&if': "./type === 'movie'",
      properties: {
        owner: {
          type: 'string',
          title: 'Director',
          placeholder: 'e.g. Director Name',
          default: 'Alex Morgan',
        },
      },
    },
  ],
};

export default function MediaRegistrationDemo() {
  const [values, setValues] = useState<unknown>({});

  return (
    <DemoWrapper schema={schema} values={values}>
      <Form jsonSchema={schema as any} onChange={setValues} />
    </DemoWrapper>
  );
}

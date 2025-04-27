import React, { useState } from 'react';

import { Form, type JsonSchema } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/16. RefSchemaUsecase',
};

export const SimpleRefSchema = () => {
  const jsonSchema = {
    type: 'object',
    $defs: {
      Name: {
        type: 'string',
        minLength: 1,
      },
    },
    properties: {
      name: {
        $ref: '#/$defs/Name',
      },
    },
    required: ['name'],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

export const NestedRefSchema = () => {
  const jsonSchema = {
    type: 'object',
    $defs: {
      Person: {
        type: 'object',
        $defs: {
          Name: {
            type: 'string',
            minLength: 1,
          },
        },
        properties: {
          firstName: { $ref: '#/$defs/Person/$defs/Name' },
          lastName: { $ref: '#/$defs/Person/$defs/Name' },
        },
      },
    },
    properties: {
      person: { $ref: '#/$defs/Person' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

export const ArrayRefSchema = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      children: {
        type: 'array',
        items: { $ref: '#' },
      },
    },
    required: ['id'],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

export const TreeSchema = () => {
  const jsonSchema = {
    title: 'Tree Schema with $defs',
    type: 'object',
    properties: {
      root: {
        $ref: '#/$defs/TreeNode',
      },
    },
    required: ['root'],
    $defs: {
      TreeNode: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          children: {
            type: 'array',
            items: {
              $ref: '#/$defs/TreeNode',
            },
          },
          address: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                city: { type: 'string' },
                country: { type: 'string' },
              },
            },
            minItems: 3,
          },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

import React, { useState } from 'react';

import { Form, type JsonSchema } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/11. Computed Props',
};

export const Common = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      prepared: {
        type: 'boolean',
      },
      name: {
        type: 'string',
        placeholder: 'enter your name',
        computed: {
          readOnly: '!_.prepared',
        },
      },
      age: {
        type: 'number',
        placeholder: 'enter your age',
        computed: {
          disabled: '_.name===undefined||(_.name).length<5',
        },
      },
      nationality: {
        type: 'string',
        enum: ['', 'US', 'UK', 'JP', 'KR'],
        computed: {
          disabled: '_.age===undefined||_.age<10',
        },
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

export const GlobalReadOnly = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      prepared: {
        type: 'boolean',
      },
      name: {
        type: 'string',
        placeholder: 'enter your name',
      },
      age: {
        type: 'number',
        placeholder: 'enter your age',
      },
      nationality: {
        type: 'string',
        enum: ['', 'US', 'UK', 'JP', 'KR'],
        computed: {
          disabled: '_.age===undefined||_.age<10',
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} readOnly />
    </StoryLayout>
  );
};

export const GlobalDisabled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      prepared: {
        type: 'boolean',
      },
      name: {
        type: 'string',
        placeholder: 'enter your name',
      },
      age: {
        type: 'number',
        placeholder: 'enter your age',
      },
      nationality: {
        type: 'string',
        enum: ['', 'US', 'UK', 'JP', 'KR'],
        computed: {
          disabled: '_.age===undefined||_.age<10',
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} disabled />
    </StoryLayout>
  );
};

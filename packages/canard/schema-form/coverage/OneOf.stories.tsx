import React, { useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type JsonSchema,
  type JsonSchemaError,
} from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/15. OneOf',
};

export const OneOf = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        computed: {
          if: "@.category==='movie'",
        },
        properties: {
          date: {
            type: 'string',
            format: 'date',
            '&visible': '@.title === "wow"',
          },
          price: {
            type: 'number',
            minimum: 50,
          },
        },
      },
      {
        computed: {
          if: "@.category==='game'",
        },
        properties: {
          date: {
            type: 'string',
            format: 'date',
            '&visible': '@.title === "wow"',
          },
          price: { type: 'number' },
        },
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const OneOfAlias = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        '&if': "@.category==='movie'",
        properties: {
          date: {
            type: 'string',
            format: 'date',
            '&visible': '@.title === "wow"',
          },
          price: {
            type: 'number',
            minimum: 50,
          },
        },
      },
      {
        '&if': "@.category==='game'",
        properties: {
          date: {
            type: 'string',
            format: 'date',
            '&visible': '@.title === "wow"',
          },
          price: { type: 'number' },
        },
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

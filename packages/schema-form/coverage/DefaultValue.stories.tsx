import React, { useState } from 'react';

import {
  Form,
  type JsonSchema,
  type JsonSchemaError,
} from '@lumy-pack/schema-form/src';

import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/10. DefaultValue',
};

export const DefaultValueBySchema = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      string: {
        type: 'string',
        default: 'default value',
      },
      number: {
        type: 'number',
        default: 10,
      },
      boolean: {
        type: 'boolean',
        default: true,
      },
      array: {
        type: 'array',
        items: { type: 'number' },
        default: [1, 2, 3],
      },
      object: {
        type: 'object',
        properties: {
          a: { type: 'number' },
          b: { type: 'number' },
        },
        default: { a: 1, b: 2 },
      },
      null: {
        type: 'null',
        nullable: true,
        default: null,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={jsonSchema} errors={errors} value={value}>
      <Form
        jsonSchema={jsonSchema}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};
export const DefaultValueByValue = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      string: {
        type: 'string',
      },
      number: {
        type: 'number',
      },
      boolean: {
        type: 'boolean',
      },
      array: {
        type: 'array',
        items: { type: 'number' },
      },
      object: {
        type: 'object',
        properties: {
          a: { type: 'number' },
          b: { type: 'number' },
        },
      },
      null: {
        type: 'null',
        nullable: true,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={jsonSchema} errors={errors} value={value}>
      <Form
        jsonSchema={jsonSchema}
        defaultValue={{
          string: 'default value',
          number: 10,
          boolean: true,
          array: [1, 2, 3],
          object: { a: 1, b: 2 },
          null: null,
        }}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};

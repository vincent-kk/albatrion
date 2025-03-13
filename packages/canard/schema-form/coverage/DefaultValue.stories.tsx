import React, { useState } from 'react';

import {
  Form,
  type JsonSchema,
  type JsonSchemaError,
} from '@canard/schema-form/src';

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
        items: { type: 'number', default: 0 },
        minItems: 2,
      },
      object: {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'adult' },
          age: { type: 'number', default: 19 },
        },
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
        minItems: 2,
      },
      object: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
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
          array: [0, 0],
          object: { name: 'adult', age: 19 },
          objectArray: [
            { name: 'anonymous', age: 0 },
            { name: 'anonymous', age: 0 },
            { name: 'anonymous', age: 0 },
          ],
          null: null,
        }}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};

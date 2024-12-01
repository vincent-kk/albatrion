import React, { useState } from 'react';

import {
  Form,
  type JsonSchema,
  type JsonSchemaError,
} from '@lumy-pack/schema-form/src';

import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/09. NullSchema',
};

export const NullSchema = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      string: {
        type: 'string',
      },
      null: {
        type: 'null',
        nullable: true,
      },
      defaultNull: {
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
        defaultValue={{ null: null }}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};

import React, { useState } from 'react';

import {
  Form,
  type JsonSchema,
  type JsonSchemaError,
} from '@canard/schema-form/src';

import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/08. VirtualSchema',
};

export const VirtualSchema = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      startDate: {
        type: 'string',
        format: 'date',
      },
      endDate: {
        type: 'string',
        format: 'date',
      },
    },
    virtual: {
      period: {
        fields: ['startDate', 'endDate'],
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={jsonSchema} errors={errors} value={value}>
      <Form
        jsonSchema={jsonSchema}
        defaultValue={{}}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};

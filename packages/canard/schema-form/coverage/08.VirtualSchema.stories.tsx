import { useState } from 'react';

import { Form, type JsonSchema, type JsonSchemaError } from '../src';
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

export const VirtualSchemaControlWithVisible = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      control: {
        type: 'string',
        enum: ['A', 'B', 'C'],
        default: 'A',
      },
      alwaysVisible: {
        type: 'string',
      },
      virtualFiled_A1: {
        type: 'string',
        format: 'date',
        default: '2025-01-01',
      },
      virtualFiled_A2: {
        type: 'string',
        format: 'date',
      },
      virtualField_B1: {
        type: 'string',
        format: 'week',
        default: '2025-W28',
      },
      virtualField_B2: {
        type: 'string',
        format: 'week',
      },
    },
    virtual: {
      virtualField_A: {
        fields: ['virtualFiled_A1', 'virtualFiled_A2'],
        computed: {
          visible: '../control === "A"',
        },
      },
      virtualField_B: {
        fields: ['virtualField_B1', 'virtualField_B2'],
        '&visible': '../control === "B"',
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

export const VirtualSchemaControlWithIfElse = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      control: {
        type: 'string',
        enum: ['A', 'B', 'C'],
        default: 'A',
      },
      alwaysVisible: {
        type: 'string',
      },
      virtualFiled_A1: {
        type: 'string',
        format: 'date',
        default: '2025-01-01',
      },
      virtualFiled_A2: {
        type: 'string',
        format: 'date',
      },
      virtualField_B1: {
        type: 'string',
        format: 'week',
        default: '2025-W28',
      },
      virtualField_B2: {
        type: 'string',
        format: 'week',
      },
    },
    virtual: {
      virtualField_A: {
        fields: ['virtualFiled_A1', 'virtualFiled_A2'],
      },
      virtualField_B: {
        fields: ['virtualField_B1', 'virtualField_B2'],
      },
    },
    if: {
      properties: {
        control: {
          enum: ['A'],
        },
      },
    },
    then: {
      required: ['virtualField_A'],
    },
    else: {
      if: {
        properties: {
          control: {
            enum: ['B'],
          },
        },
      },
      then: {
        required: ['virtualField_B'],
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

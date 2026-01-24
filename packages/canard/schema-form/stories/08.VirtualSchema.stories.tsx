import { useState } from 'react';

import {
  Form,
  type FormTypeInputProps,
  type JsonSchema,
  type JsonSchemaError,
  SetValueOption,
} from '../src';
import StoryLayout from './components/StoryLayout';
import { plugin } from './components/validator';

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

export const VirtualSchemaForNormalInput = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'number',
      },
    },
    virtual: {
      user: {
        fields: ['name', 'age'],
        FormTypeInput: ({ value, onChange }) => {
          return (
            <div>
              <input
                type="text"
                value={value?.[0]}
                onChange={(e) => onChange([e.target.value, value?.[1]])}
              />
              <input
                type="number"
                value={value?.[1]}
                onChange={(e) => onChange([value?.[0], e.target.value])}
              />
            </div>
          );
        },
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

export const VirtualSchemaRequired = () => {
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
    // 'virtualField_A'->['virtualFiled_A1', 'virtualFiled_A2'], 'virtualFiled_A1' will be duplicated
    required: ['control', 'virtualField_A', 'virtualFiled_A1'],
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
        validatorFactory={plugin.validator.compile}
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
          active: '../control === "A"',
        },
      },
      virtualField_B: {
        fields: ['virtualField_B1', 'virtualField_B2'],
        '&active': '../control === "B"',
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
        validatorFactory={plugin.validator.compile}
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
        validatorFactory={plugin.validator.compile}
      />
    </StoryLayout>
  );
};

export const VirtualSchemaControlWithIfElse2 = () => {
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
      required: ['virtualFiled_A1'],
      // virtualRequired is not for external use, this is for internal use only
      // Just for testing purpose
      virtualRequired: ['virtualField_A'],
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
        required: ['virtualField_B1'],
        // virtualRequired is not for external use, this is for internal use only
        // Just for testing purpose
        virtualRequired: ['virtualField_B'],
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
        validatorFactory={plugin.validator.compile}
      />
    </StoryLayout>
  );
};

export const VirtualSchemaInline = () => {
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
        FormTypeInput: ({
          defaultValue,
          onChange,
        }: FormTypeInputProps<string[] | undefined>) => {
          return (
            <div>
              <div>
                <button
                  onClick={() =>
                    onChange(
                      ['2025-01-01', '2026-01-01'],
                      SetValueOption.Overwrite,
                    )
                  }
                >
                  Set [2025-01-01, 2026-01-01]
                </button>
                {/* @ts-expect-error */}
                <button onClick={() => onChange(100, SetValueOption.Overwrite)}>
                  Invalid value: 100
                </button>
                <button
                  //@ts-expect-error
                  onClick={() => onChange('hello', SetValueOption.Overwrite)}
                >
                  Invalid value: hello
                </button>
                <button
                  // @ts-expect-error
                  onClick={() => onChange(null, SetValueOption.Overwrite)}
                >
                  Invalid value: null
                </button>
                {/* @ts-expect-error */}
                <button onClick={() => onChange({}, SetValueOption.Overwrite)}>
                  Invalid value: {'{}'}
                </button>
                <button onClick={() => onChange([], SetValueOption.Overwrite)}>
                  Invalid value: {'[]'}
                </button>
                <button
                  onClick={() => onChange(undefined, SetValueOption.Overwrite)}
                >
                  Clear
                </button>
              </div>
              <input
                type="date"
                defaultValue={defaultValue?.[0]}
                onChange={(e) =>
                  onChange((prev) => [e.target.value, prev?.[1] || ''])
                }
              />
              <input
                type="date"
                defaultValue={defaultValue?.[1]}
                onChange={(e) =>
                  onChange((prev) => [prev?.[0] || '', e.target.value])
                }
              />
            </div>
          );
        },
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

export const VirtualSchemaInlineWithIfElse = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      control: {
        type: 'string',
        enum: ['A', 'B', 'C'],
        default: 'A',
      },
      startDate: {
        type: 'string',
        format: 'date',
      },
      endDate: {
        type: 'string',
        format: 'date',
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
      required: ['period'],
    },
    virtual: {
      period: {
        FormTypeInput: ({
          defaultValue,
          onChange,
        }: FormTypeInputProps<string[] | undefined>) => {
          return (
            <div style={{ outline: '2px solid red' }}>
              <div>
                <button
                  onClick={() =>
                    onChange(
                      ['2025-01-01', '2026-01-01'],
                      SetValueOption.Overwrite,
                    )
                  }
                >
                  Set [2025-01-01, 2026-01-01]
                </button>
                <button
                  onClick={() => onChange(undefined, SetValueOption.Overwrite)}
                >
                  Clear
                </button>
              </div>
              <input
                type="date"
                defaultValue={defaultValue?.[0]}
                onChange={(e) =>
                  onChange((prev) => [e.target.value, prev?.[1] || ''])
                }
              />
              <input
                type="date"
                defaultValue={defaultValue?.[1]}
                onChange={(e) =>
                  onChange((prev) => [prev?.[0] || '', e.target.value])
                }
              />
            </div>
          );
        },
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

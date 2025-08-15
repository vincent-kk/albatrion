import { useRef, useState } from 'react';

import type { FormHandle } from '../src';
import { Form, type JsonSchema } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/01. NormalUsecase',
};

export const Common = () => {
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
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

export const String = () => {
  const jsonSchema = {
    type: 'string',
  } satisfies JsonSchema;

  const [value, setValue] = useState<string>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

export const DateFormat = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      date: {
        type: 'string',
        format: 'date',
      },
      dateTime: {
        type: 'string',
        format: 'datetime-local',
      },
      time: {
        type: 'string',
        format: 'time',
      },
      month: {
        type: 'string',
        format: 'month',
      },
      week: {
        type: 'string',
        format: 'week',
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

export const StringEnum = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      radio: {
        type: 'string',
        enum: ['a', 'b', 'c'],
        formType: 'radio',
        options: {
          alias: {
            a: 'a label',
            b: 'b label',
            c: 'c label',
          },
        },
      },
      radioGroup: {
        type: 'string',
        enum: ['one', 'two', 'three'],
        formType: 'radiogroup',
        options: {
          alias: {
            unset: 'OFF',
            one: 'one label',
            two: 'two label',
            three: 'three label',
          },
        },
      },
      checkbox: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['d', 'e', 'f'],
        },
        formType: 'checkbox',
        options: {
          alias: {
            d: 'd label',
            e: 'e label',
            f: 'f label',
          },
        },
      },
      enum: {
        type: 'string',
        enum: ['', 'g', 'h', 'i'],
        formType: 'enum',
        options: {
          alias: {
            g: 'g label',
            h: 'h label',
            i: 'i label',
          },
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

export const ReadOnly = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        format: 'uri',
        default: 'https://www.google.com',
        readOnly: true,
      },
      age: {
        type: 'number',
        default: 10,
        disabled: true,
      },
      nationality: {
        type: 'string',
        visible: false,
      },
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={jsonSchema}>
      <Form jsonSchema={jsonSchema} />
    </StoryLayout>
  );
};

export const ReadOnlyProps = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        format: 'uri',
        default: 'https://www.google.com',
      },
      age: {
        type: 'number',
        default: 10,
      },
      nationality: {
        type: 'string',
      },
    },
  } satisfies JsonSchema;

  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);

  return (
    <StoryLayout jsonSchema={jsonSchema}>
      <button onClick={() => setReadOnly((prev) => !prev)}>
        {readOnly ? 'readOnly' : 'readOnly: false'}
      </button>
      <button onClick={() => setDisabled((prev) => !prev)}>
        {disabled ? 'disabled' : 'disabled: false'}
      </button>
      <Form jsonSchema={jsonSchema} readOnly={readOnly} disabled={disabled} />
    </StoryLayout>
  );
};
export const Array = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['real world', 'internet'],
        default: 'real world',
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          oneOf: [
            {
              '&if': '(/type)==="real world"',
              properties: {
                name: {
                  type: 'string',
                  default: 'John Doe',
                },
                age: {
                  type: 'number',
                  default: 30,
                },
                nationality: {
                  type: 'string',
                  default: 'United States',
                },
              },
            },
            {
              '&if': '(/type)==="internet"',
              properties: {
                ip: {
                  type: 'string',
                  default: '192.168.0.1',
                },
                port: {
                  type: 'number',
                  default: 80,
                },
                domainName: {
                  type: 'string',
                  default: 'example.com',
                },
              },
            },
          ],
        },
        minItems: 3,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>[]>([]);
  const ref = useRef<FormHandle<typeof jsonSchema, typeof value>>(null);

  return (
    <div>
      <button
        onClick={() => {
          const node = ref.current?.node?.find('/items');
          if (node?.type === 'array') {
            node.setValue(undefined);
          }
        }}
      >
        remove items filed
      </button>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form jsonSchema={jsonSchema} onChange={setValue} ref={ref} />
      </StoryLayout>
    </div>
  );
};

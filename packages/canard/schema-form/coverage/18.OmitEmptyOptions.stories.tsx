import { useRef, useState } from 'react';

import { Form, FormHandle, type JsonSchema } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/18. OmitEmptyOptions',
};

export const Common = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        options: {
          omitEmpty: false,
        },
      },
      age: {
        type: 'number',
        options: {
          omitEmpty: false,
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

export const String = () => {
  const jsonSchema = {
    type: 'string',
    options: {
      omitEmpty: false,
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<string>();

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
          omitEmpty: false,
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
          omitEmpty: false,
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
              '&if': '$.type==="real world"',
              properties: {
                name: {
                  type: 'string',
                  default: 'John Doe',
                  options: {
                    omitEmpty: false,
                  },
                },
                age: {
                  type: 'number',
                  default: 30,
                  options: {
                    omitEmpty: false,
                  },
                },
                nationality: {
                  type: 'string',
                  default: 'United States',
                  options: {
                    omitEmpty: false,
                  },
                },
              },
            },
            {
              '&if': '$.type==="internet"',
              properties: {
                ip: {
                  type: 'string',
                  default: '192.168.0.1',
                  options: {
                    omitEmpty: false,
                  },
                },
                port: {
                  type: 'number',
                  default: 80,
                  options: {
                    omitEmpty: false,
                  },
                },
                domainName: {
                  type: 'string',
                  default: 'example.com',
                  options: {
                    omitEmpty: false,
                  },
                },
              },
            },
          ],
          options: {
            omitEmpty: false,
          },
        },
        minItems: 3,
        options: {
          omitEmpty: false,
        },
      },
    },
    options: {
      omitEmpty: false,
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>[]>([]);
  const ref = useRef<FormHandle<typeof jsonSchema, typeof value>>(null);

  return (
    <div>
      <button
        onClick={() => ref.current?.node?.find('items')?.setValue(undefined)}
      >
        remove items filed
      </button>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form jsonSchema={jsonSchema} onChange={setValue} ref={ref} />
      </StoryLayout>
    </div>
  );
};

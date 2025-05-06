import React, { useMemo, useRef, useState } from 'react';

import {
  Form,
  type FormChildrenProps,
  type FormHandle,
  type FormTypeInputDefinition,
  type FormTypeInputMap,
  type FormTypeInputProps,
  type JsonSchema,
  type JsonSchemaError,
  SetValueOption,
  registerPlugin,
} from '@canard/schema-form';

import { plugin } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'RegisterPlugin',
};

registerPlugin(plugin);

export const Common = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        maxLength: 5,
      },
      age: {
        type: 'number',
        maximum: 20,
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
        placeholder: 'select one of item',
        options: {
          alias: {
            g: 'g label',
            h: 'h label',
            i: 'i label',
          },
        },
      },
      multiple: {
        type: 'array',
        placeholder: 'select one of item',
        items: {
          type: 'string',
          enum: ['', 'g', 'h', 'i'],
          formType: 'enum',
        },
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
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={jsonSchema}>
      <Form jsonSchema={jsonSchema} />
    </StoryLayout>
  );
};

export const OneOf = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        properties: { category: { enum: ['movie'] } },
        required: ['title', 'openingDate'],
      },
      {
        properties: { category: { enum: ['game'] } },
        required: ['title', 'releaseDate', 'numOfPlayers'],
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
      openingDate: {
        type: 'string',
        format: 'date',
        computed: {
          visible: '@.title === "wow"',
        },
      },
      releaseDate: {
        type: 'string',
        format: 'date',
        computed: {
          visible: '@.title === "wow"',
        },
      },
      numOfPlayers: { type: 'number' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const formHandle = useRef<FormHandle<typeof schema, typeof value>>(null);

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} ref={formHandle} />
    </StoryLayout>
  );
};

export const ComplexOneOf = () => {
  const schema = {
    type: 'object',
    properties: {
      user: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            maxLength: 50,
            default: 'Anonymous',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          profile: {
            type: 'object',
            oneOf: [
              {
                properties: { type: { enum: ['adult', 'child'] } },
                required: ['age', 'gender', 'preferences'],
              },
              {
                properties: { type: { enum: ['none'] } },
                required: [],
              },
            ],
            properties: {
              type: {
                type: 'string',
                enum: ['adult', 'child', 'none'],
                default: 'adult',
              },
              age: {
                type: 'integer',
                minimum: 0,
                default: 18,
              },
              gender: {
                type: 'string',
                enum: ['male', 'female', 'other'],
                computed: {
                  visible: '@.age >= 18',
                },
              },
              preferences: {
                type: 'object',
                properties: {
                  theme: {
                    type: 'string',
                    enum: ['light', 'dark'],
                    default: 'light',
                  },
                  notifications: {
                    type: 'object',
                    properties: {
                      email: {
                        type: 'boolean',
                        default: true,
                      },
                      sms: {
                        type: 'boolean',
                        default: false,
                      },
                    },
                    required: ['email', 'sms'],
                  },
                },
                required: ['theme', 'notifications'],
              },
            },
            required: ['type'],
          },
        },
        required: ['name'],
      },
      settings: {
        type: 'object',
        properties: {
          privacy: {
            type: 'string',
            oneOf: [
              { const: 'public', title: 'Public' },
              { const: 'private', title: 'Private' },
              { const: 'custom', title: 'Custom' },
            ],
            default: 'public',
          },
          language: {
            type: 'string',
            enum: ['en', 'kr', 'jp'],
            default: 'en',
          },
          security: {
            type: 'object',
            properties: {
              '2FA': {
                type: 'boolean',
                default: true,
              },
              backupCodes: {
                type: 'array',
                items: {
                  type: 'string',
                  pattern: '^[A-Z0-9]{8}$',
                },
                minItems: 5,
                maxItems: 10,
              },
            },
            required: ['2FA'],
          },
        },
        required: ['privacy', 'language'],
      },
    },
    required: ['user', 'settings'],
  } satisfies JsonSchema;

  const [value, setValue] = useState({});

  const refHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form ref={refHandle} jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FunctionalChildren = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      allowed: {
        type: 'boolean',
      },
      name: {
        type: 'string',
      },
      age: {
        type: 'number',
      },
      gender: {
        type: 'string',
        enum: ['male', 'female'],
        placeholder: 'select gender',
      },
    },
  } satisfies JsonSchema;

  const defaultValue = useRef<Record<string, any>>({
    allowed: false,
  });

  const [data, setData] = useState<{
    allowed?: boolean;
    name?: string;
    age?: number;
    gender?: string;
  }>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={data}>
      <Form
        jsonSchema={jsonSchema}
        defaultValue={defaultValue.current}
        onChange={setData}
      >
        {({
          defaultValue,
          value,
        }: FormChildrenProps<typeof jsonSchema, typeof data>) => (
          <>
            <div>
              {!defaultValue?.allowed && <Form.Input path=".allowed" />}
            </div>
            <div>
              <Form.Label path=".name" />
              {value?.allowed && <Form.Input path=".name" />}
            </div>
            <div>
              <Form.Label path=".age" />
              {value?.name?.length && <Form.Input path=".age" />}
            </div>
            <div>
              <Form.Label path=".gender" />
              {typeof value?.age === 'number' && <Form.Input path=".gender" />}
            </div>
          </>
        )}
      </Form>
    </StoryLayout>
  );
};

export const IterableChildren = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      allowed: {
        type: 'boolean',
      },
      name: {
        type: 'string',
        maxLength: 3,
      },
      age: {
        type: 'number',
      },
      gender: {
        type: 'string',
        enum: ['male', 'female'],
        placeholder: 'select gender',
      },
    },
  } satisfies JsonSchema;

  const defaultValue = useRef({
    allowed: false,
  });

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form
        jsonSchema={jsonSchema}
        defaultValue={defaultValue.current}
        onChange={setValue}
      >
        <div>
          <Form.Input path=".allowed" />
        </div>
        <div>
          <Form.Label path=".name" />
          <Form.Input path=".name" />
        </div>
        <div>
          <Form.Render path=".age">
            {({ Input, path }) => {
              return (
                <div>
                  <label htmlFor={path}>{path}</label>
                  <Input />
                </div>
              );
            }}
          </Form.Render>
        </div>
        <div>
          <Form.Group path=".gender" />
        </div>
        <div>
          name error:
          <Form.Error path=".name" style={{ display: 'inline' }} />
        </div>
      </Form>
    </StoryLayout>
  );
};

export const Watch = () => {
  const schema = {
    type: 'object',
    properties: {
      profile: {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'harry' },
          age: { type: 'number', default: 10 },
        },
      },
      greeting: {
        type: 'string',
        formType: 'greeting',
        computed: {
          watch: ['$.profile.name', '$.profile.age', '$.profile'],
        },
      },
    },
  } satisfies JsonSchema;
  const formTypes = useMemo<FormTypeInputDefinition[]>(
    () => [
      {
        test: {
          type: 'string',
          formType: 'greeting',
        },
        Component: ({ watchValues }: FormTypeInputProps) => {
          return (
            <>
              <strong>
                hello '{watchValues[0]}', {watchValues[1]} years old
              </strong>
              <pre>{JSON.stringify(watchValues, null, 2)}</pre>
            </>
          );
        },
      },
    ],
    [],
  );
  const [value, setValue] = useState({});
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form
        jsonSchema={schema}
        formTypeInputDefinitions={formTypes}
        onChange={setValue}
      />
    </StoryLayout>
  );
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

export const FormRefHandle = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      number: {
        type: 'number',
      },
      objectNode: {
        type: 'object',
        properties: {
          test: { type: 'string' },
        },
      },
      textNode: {
        type: 'string',
      },
      arrayNode: {
        type: 'array',
        items: { type: 'string' },
        minItems: 3,
      },
    },
  } satisfies JsonSchema;
  const defaultValue = useRef({
    name: 'ron',
    number: 10,
  });

  const formTypeMap = useMemo<FormTypeInputMap>(() => {
    return {
      '$.objectNode': ({ onChange }: FormTypeInputProps<{ test?: string }>) => {
        const handleClick = () => {
          onChange({ test: 'wow' });
        };
        const handleUnsetClick = () => {
          onChange({}, SetValueOption.Replace);
        };
        return (
          <div>
            <button onClick={handleClick}>object set</button>
            <button onClick={handleUnsetClick}>object unset</button>
          </div>
        );
      },
      '$.textNode': ({ onChange }: FormTypeInputProps) => {
        const handleClick = () => {
          onChange('wow');
        };
        return <button onClick={handleClick}>text set</button>;
      },
      '$.arrayNode.#': () => {
        return <div>i am array item</div>;
      },
    };
  }, []);

  const formHandle = useRef<
    FormHandle<
      typeof schema,
      {
        name?: string;
        number?: number;
      }
    >
  >(null);

  const handleChange = (val: any) => {
    setValue(val);
  };

  return (
    <div>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            name: 'harry',
          })
        }
      >
        set name
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue((prev) => {
            return {
              number: (prev?.number || 0) + 1,
            };
          })
        }
      >
        increase number
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue(
            {
              number: 100,
            },
            SetValueOption.Replace,
          )
        }
      >
        overwrite number
      </button>
      <button onClick={() => formHandle.current?.reset()}>reset</button>
      <button
        onClick={() => {
          formHandle.current?.setValue({ name: 'hermione', number: 12 });
        }}
      >
        change defaultValue
      </button>
      <hr />
      <StoryLayout jsonSchema={schema} value={value}>
        <Form
          ref={formHandle}
          jsonSchema={schema}
          defaultValue={defaultValue.current}
          formTypeInputMap={formTypeMap}
          onChange={handleChange}
        />
      </StoryLayout>
    </div>
  );
};

export const ComputedProps = () => {
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
          readOnly: '!@.prepared',
        },
      },
      age: {
        type: 'number',
        placeholder: 'enter your age',
        computed: {
          disabled: '@.name===undefined||(@.name).length<5',
        },
      },
      nationality: {
        type: 'string',
        enum: ['', 'US', 'UK', 'JP', 'KR'],
        placeholder: 'select your nationality',
        computed: {
          disabled: '@.age===undefined||@.age<10',
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

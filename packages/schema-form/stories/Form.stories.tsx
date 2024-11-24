import React, { useMemo, useRef, useState } from 'react';

import Form, {
  type FormHandle,
  type FormTypeInputDefinition,
  type FormTypeInputMap,
  type FormTypeInputProps,
  type JsonSchema,
  JsonSchemaError,
  type SchemaNodeRendererProps,
} from '../src';

export default {
  title: 'Form/Common',
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
    <div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};

export const String = () => {
  const jsonSchema = {
    type: 'string',
  } satisfies JsonSchema;

  const [value, setValue] = useState<string>();

  return (
    <div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
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
    <div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
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
        },
        enum: ['d', 'e', 'f'],
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
    <div>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};

export const Grid = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      email: { type: 'string' },
      password: { type: 'string', formType: 'password' },
      address: { type: 'string' },
      address2: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string' },
      zip: { type: 'string' },
    },
  } satisfies JsonSchema;
  const grid = [
    ['email', 'password'],
    [
      {
        element: (
          <div style={{ background: 'yellow', textAlign: 'center' }}>
            - divider -
          </div>
        ),
        grid: 3,
      },
      <div style={{ background: 'orange', textAlign: 'center' }}>
        - - - divider - - -
      </div>,
    ],
    [<h1>address</h1>],
    'address',
    ['address2'],
    [{ name: 'city' }, { name: 'state', grid: 4 }, { name: 'zip', grid: 2 }],
    [
      { name: 'city', grid: 6 },
      { name: 'state', grid: 4 },
      { name: 'zip', grid: 2 },
    ],
    [{ name: 'city', grid: 6 }, { name: 'state', grid: 4 }, { name: 'zip' }],
    [{ name: 'city', grid: 6 }, { name: 'state' }, { name: 'zip' }],
  ];

  return <Form jsonSchema={jsonSchema} gridFrom={grid} />;
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
        ui: {
          show: '@.title === "wow"',
        },
      },
      releaseDate: {
        type: 'string',
        format: 'date',
        ui: {
          show: '@.title === "wow"',
        },
      },
      numOfPlayers: { type: 'number' },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <div>
      <Form jsonSchema={schema} onChange={setValue} ref={formHandle} />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
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
        options: {
          watch: ['$.profile.name', '$.profile.age', '$.profile'],
        },
      },
    },
  } satisfies JsonSchema;
  const formTypes = [
    {
      test: {
        type: 'string',
        formType: 'greeting',
      },
      Component: ({ watchValues }: FormTypeInputProps) => {
        return (
          <>
            <strong>hello '{watchValues[0]}'</strong>
            <pre>{JSON.stringify(watchValues, null, 2)}</pre>
          </>
        );
      },
    },
  ] as FormTypeInputDefinition[];
  return (
    <div>
      <Form jsonSchema={schema} formTypeInputDefinitions={formTypes} />
    </div>
  );
};

export const FormTypeMap = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
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
        items: {
          type: 'string',
        },
        minItems: 5,
      },
    },
  } satisfies JsonSchema;

  const formTypeMap = useMemo<FormTypeInputMap>(() => {
    return {
      '$.objectNode': ({ onChange }: FormTypeInputProps<{ test?: string }>) => {
        const handleClick = () => {
          onChange({ test: 'wow' });
        };
        const handleUnsetClick = () => {
          onChange({}, { replace: true });
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

  const handleChange = (val: any) => {
    setValue(val);
  };
  return (
    <div>
      <Form
        jsonSchema={schema}
        formTypeInputMap={formTypeMap}
        onChange={handleChange}
      />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
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
          onChange({}, { replace: true });
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
              number: (prev?.number ?? 0) + 1,
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
            { replace: true },
          )
        }
      >
        overwrite number
      </button>
      <button onClick={() => formHandle.current?.reset()}>reset</button>
      <button
        onClick={() => {
          formHandle.current?.reset({ name: 'hermione', number: 12 });
        }}
      >
        change defaultValue
      </button>
      <Form
        ref={formHandle}
        jsonSchema={schema}
        defaultValue={defaultValue.current}
        formTypeInputMap={formTypeMap}
        onChange={handleChange}
      />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
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
    },
  } satisfies JsonSchema;

  return <Form jsonSchema={jsonSchema} />;
};

export const DirtyTouched = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['Y', 'N'],
      },
      name: {
        type: 'string',
        minLength: 5,
        default: 'TEST',
      },
      email: {
        type: 'string',
        maxLength: 10,
      },
    },
  } satisfies JsonSchema;

  const Renderer = ({
    depth,
    name,
    node,
    Input,
    errorMessage,
  }: SchemaNodeRendererProps) => {
    return depth === 0 ? (
      <Input />
    ) : (
      <div>
        <label>
          <span>{name}</span>
          <Input />
        </label>
        <pre>{JSON.stringify(node.state || {})}</pre>
        <pre>{JSON.stringify(node.errors || [])}</pre>
        {errorMessage}
      </div>
    );
  };

  return <Form jsonSchema={jsonSchema} CustomSchemaNodeRenderer={Renderer} />;
};

export const Errors = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', maxLength: 3, default: 'exceed max length' },
      message: { type: 'string', minLength: 3, default: '1' },
    },
  } satisfies JsonSchema;

  const handleChange = (val: any) => {
    setValue(val);
  };

  const [errors, setErrors] = useState<JsonSchemaError[]>([
    {
      keyword: 'maxLength',
      dataPath: '.message',
      instancePath: '/message',
      schemaPath: '#/properties/message/maxLength',
      params: {
        limit: 20,
      },
      message: 'should NOT be longer than 20 characters',
    },
  ]);

  const clearErrors = () => {
    setErrors([]);
  };

  const [_errors, _setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <div>
      <Form
        jsonSchema={schema}
        onChange={handleChange}
        onValidate={(errors) => _setErrors(errors ?? [])}
        errors={errors}
        showError={true}
      />
      <button onClick={clearErrors}>clear received errors</button>
      <hr />
      <pre>{JSON.stringify(_errors, null, 2)}</pre>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};

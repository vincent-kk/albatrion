import React, { useMemo, useState } from 'react';

import Form, {
  FormTypeInputDefinition,
  FormTypeInputMap,
  FormTypeInputProps,
  type JsonSchema,
} from '../src';

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

export const AnyOf = () => {
  const schema = {
    type: 'object',
    anyOf: [
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
  return (
    <div>
      <Form jsonSchema={schema} />
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

export default {
  title: 'Form/Common',
};

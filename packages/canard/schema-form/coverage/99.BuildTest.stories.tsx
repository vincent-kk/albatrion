import { useState } from 'react';

import { Form, type JsonSchema } from '@canard/schema-form';

import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/99. BuildTest',
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
        active: false,
      },
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={jsonSchema}>
      <Form jsonSchema={jsonSchema} />
    </StoryLayout>
  );
};

export const IfThenElse = () => {
  const schema = {
    type: 'object',

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
          active: '../title === "wow"',
        },
      },
      releaseDate: {
        type: 'string',
        format: 'date',
        computed: {
          active: '../title === "wow"',
        },
        default: '2025-01-01',
      },
      numOfPlayers: { type: 'number' },
      price: {
        type: 'number',
        minimum: 50,
        default: 100,
      },
    },
    if: {
      properties: {
        category: {
          enum: ['movie'],
        },
      },
    },
    then: {
      required: ['title', 'openingDate', 'price'],
    },
    else: {
      if: {
        properties: {
          category: {
            enum: ['game'],
          },
        },
      },
      then: {
        required: ['title', 'releaseDate', 'numOfPlayers'],
      },
      else: {
        required: ['title'],
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

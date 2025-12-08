import { useState } from 'react';

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
        FormTypeInputProps: {
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
        FormTypeInputProps: {
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
        FormTypeInputProps: {
          alias: {
            d: 'd label',
            e: 'e label',
            f: 'f label',
          },
        },
      },
      enum: {
        type: 'string',
        enum: ['g', 'h', 'i'],
        formType: 'enum',
        FormTypeInputProps: {
          alias: {
            g: 'g label',
            h: 'h label',
            i: 'i label',
          },
        },
      },
      nullableEnum: {
        type: ['string', 'null'],
        enum: [null, 'j', 'k', 'l'],
        formType: 'select',
        FormTypeInputProps: {
          placeholder: 'select one of item',
          alias: {
            null: 'null label',
            j: 'j label',
            k: 'k label',
            l: 'l label',
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

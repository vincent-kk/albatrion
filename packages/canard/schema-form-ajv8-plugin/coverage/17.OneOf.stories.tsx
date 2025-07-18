import { useRef, useState } from 'react';

import type {
  FormHandle} from '@canard/schema-form';
import {
  Form,
  type JsonSchema,
  type JsonSchemaError,
  registerPlugin,
} from '@canard/schema-form';

import { plugin } from '../src';
import StoryLayout from './components/StoryLayout';

registerPlugin(plugin);

export default {
  title: 'Form/17. OneOf',
};

export const OneOf = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        computed: {
          if: "./category==='game'",
        },
        properties: {
          date: {
            type: 'string',
            format: 'date',
            '&visible': '../title === "wow"',
          },
          price: { type: 'number' },
        },
      },
      {
        computed: {
          if: "./category==='movie'",
        },
        properties: {
          date: {
            type: 'string',
            format: 'date',
            '&visible': '../title === "wow"',
          },
          price: {
            type: 'number',
            minimum: 50,
          },
        },
      },
      {
        computed: {
          if: "./category==='console'",
        },
        properties: {
          date: {
            type: 'string',
            format: 'date',
            '&visible': '../title === "wow"',
          },
          price: {
            type: 'number',
            minimum: 50,
          },
        },
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie', 'console'],
        default: 'game',
      },
      title: { type: 'string' },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const OneOfAlias = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        '&if': "./category==='movie'",
        properties: {
          date1: {
            type: 'string',
            format: 'date',
            '&visible': '../title === "wow"',
          },
          price1: {
            type: 'number',
            minimum: 50,
          },
        },
      },
      {
        '&if': "./category==='game'",
        properties: {
          date2: {
            type: 'string',
            format: 'date',
            '&visible': '../title === "wow"',
          },
          price2: { type: 'number' },
        },
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const OneOfAliasWithKeyOrder = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        '&if': "./category==='movie'",
        properties: {
          date1: {
            type: 'string',
            format: 'date',
            '&visible': '../title === "wow"',
          },
          price1: {
            type: 'number',
            minimum: 50,
          },
        },
      },
      {
        '&if': "./category==='game'",
        properties: {
          date2: {
            type: 'string',
            format: 'date',
            '&visible': '../title === "wow"',
          },
          price2: { type: 'number' },
        },
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
    },
    propertyKeys: ['title', 'price1', 'price2', 'date1', 'date2'],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const ComplexOneOf = () => {
  const schema = {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
      details: {
        type: 'object',
        oneOf: [
          {
            '&if': "../type==='game'",
            properties: {
              stages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'number' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                  },
                  default: {
                    label: 1,
                    name: 'stage 1',
                    description: 'stage 1 description',
                  },
                },
              },
              platforms: {
                type: 'array',
                formType: 'checkbox',
                items: {
                  type: 'string',
                  enum: ['pc', 'console', 'mobile'],
                },
                default: ['pc', 'console'],
              },
              specs: {
                type: 'object',
                properties: {
                  cpu: { type: 'string', default: 'Intel Core i5' },
                  gpu: {
                    type: 'string',
                    default: 'NVIDIA GeForce GTX 1660 Ti',
                  },
                  memory: { type: 'string', default: '16GB' },
                  storage: { type: 'string', default: '1TB' },
                },
              },
            },
          },
          {
            '&if': "../type==='movie'",
            properties: {
              genres: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: [
                    'action',
                    'comedy',
                    'drama',
                    'horror',
                    'romance',
                    'sci-fi',
                    'thriller',
                  ],
                  default: 'romance',
                },
              },
              platforms: {
                type: 'array',
                formType: 'checkbox',
                items: {
                  type: 'string',
                  enum: ['theater', 'streaming'],
                },
                default: ['theater'],
              },
              actors: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        ],
      },
    },
    oneOf: [
      {
        '&if': "../type==='game'",
        properties: {
          owner: { type: 'string', placeholder: 'developer of the game' },
        },
      },
      {
        '&if': "../type==='movie'",
        properties: {
          owner: { type: 'string', placeholder: 'director of the movie' },
        },
      },
    ],
  } satisfies JsonSchema;

  const [value, setValue] = useState({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  const refHandle =
    useRef<FormHandle<typeof schema, Record<string, unknown>>>(null);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        onChange={setValue}
        onValidate={(errors) => setErrors(errors || [])}
      />
    </StoryLayout>
  );
};

export const ComplexOneOfSmall = () => {
  const schema = {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      details: {
        type: 'object',
        oneOf: [
          {
            '&if': "../type==='game'",
            properties: {
              stages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'number' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                  },
                  default: {
                    label: 1,
                    name: 'stage 1',
                    description: 'stage 1 description',
                  },
                },
              },
              platforms: {
                type: 'array',
                formType: 'checkbox',
                items: {
                  type: 'string',
                  enum: ['pc', 'console', 'mobile'],
                },
                default: ['pc', 'console'],
              },
              specs: {
                type: 'object',
                properties: {
                  cpu: { type: 'string', default: 'Intel Core i5' },
                  gpu: {
                    type: 'string',
                    default: 'NVIDIA GeForce GTX 1660 Ti',
                  },
                  memory: { type: 'string', default: '16GB' },
                  storage: { type: 'string', default: '1TB' },
                },
              },
            },
          },
          {
            '&if': "../type==='movie'",
            properties: {
              genres: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: [
                    'action',
                    'comedy',
                    'drama',
                    'horror',
                    'romance',
                    'sci-fi',
                    'thriller',
                  ],
                  default: 'romance',
                },
              },
              platforms: {
                type: 'array',
                formType: 'checkbox',
                items: {
                  type: 'string',
                  enum: ['theater', 'streaming'],
                },
                default: ['theater'],
              },
              actors: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        ],
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  const refHandle =
    useRef<FormHandle<typeof schema, Record<string, unknown>>>(null);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        onChange={setValue}
        onValidate={(errors) => setErrors(errors || [])}
      />
    </StoryLayout>
  );
};

export const ErrorCase1 = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        '&if': "./category==='movie'",
        properties: {
          category: {
            type: 'string',
            format: 'date',
            '&visible': '../title === "wow"',
          },
          title: {
            type: 'number',
            minimum: 50,
          },
        },
      },
      {
        '&if': "./category==='game'",
        properties: {
          date2: {
            type: 'string',
            format: 'date',
            '&visible': '../title === "wow"',
          },
          price2: { type: 'number' },
        },
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const ErrorCase2 = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        '&if': "./category==='movie'",
        type: 'object', // 부모와 같은 타입은 허용됨
        properties: {
          date1: {
            type: 'string',
            format: 'date',
            '&visible': '../title === "wow"',
          },
          price1: {
            type: 'number',
            minimum: 50,
          },
        },
      },
      {
        '&if': "./category==='game'",
        type: 'string', // 부모와 다른 타입은 허용되지 않음
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

import { useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type JsonSchema,
  type JsonSchemaError,
  registerPlugin,
} from '../src';
import StoryLayout from './components/StoryLayout';
import { plugin } from './components/validator';

registerPlugin(plugin);

export default {
  title: 'Form/06. IfThenElse',
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

export const IfThenElseConst = () => {
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
        '&active': '../title === "wow"',
      },
      releaseDate: {
        type: 'string',
        format: 'date',
        '&active': '../title === "wow"',
      },
      numOfPlayers: { type: 'number' },
      price: {
        type: 'number',
        minimum: 50,
      },
    },
    if: {
      properties: {
        category: {
          const: 'movie',
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
            const: 'game',
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

export const AdditionalProperties = () => {
  const schema = {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: {
          type: 'object',
          FormTypeInput: ({ onChange }) => {
            return (
              <div>
                <button
                  onClick={() =>
                    onChange({
                      name: 'test',
                      email: 'test@test.com',
                      extra: 'extra',
                    })
                  }
                >
                  Set Value
                </button>
              </div>
            );
          },
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
          },
          additionalProperties: false,
        },
        minItems: 3,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form jsonSchema={schema} onChange={setValue} onValidate={setErrors} />
    </StoryLayout>
  );
};

export const IfThenElseComplex1 = () => {
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
            if: {
              properties: {
                type: { enum: ['adult', 'child'] },
              },
            },
            then: {
              required: ['age', 'gender', 'preferences'],
            },
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
                  active: '../age >= 18',
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
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  const refHandle = useRef<FormHandle<typeof schema>>(null);

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

export const IfThenElseComplex2 = () => {
  const schema = {
    type: 'object',
    if: {
      properties: {
        type: { enum: ['adult', 'child'] },
      },
    },
    then: {
      required: ['age', 'gender', 'preferences'],
    },
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
          active: '../age >= 18',
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
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} ref={formHandle} />
    </StoryLayout>
  );
};

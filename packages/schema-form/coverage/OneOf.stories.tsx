import React, { useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type JsonSchema,
  type JsonSchemaError,
} from '@lumy-pack/schema-form/src';

import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/06. OneOf',
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
        renderOptions: {
          visible: '@.title === "wow"',
        },
      },
      releaseDate: {
        type: 'string',
        format: 'date',
        renderOptions: {
          visible: '@.title === "wow"',
        },
      },
      numOfPlayers: { type: 'number' },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
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
                renderOptions: {
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

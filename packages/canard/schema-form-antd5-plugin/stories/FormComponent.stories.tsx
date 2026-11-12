import { ErrorVisibility } from '@canard/schema-form';
import {
  Form,
  FormProvider,
  type JSONSchema,
  registerPlugin,
} from '@canard/schema-form';
import { plugin as ajv8Plugin } from '@canard/schema-form-ajv8-plugin';

import { ErrorMessageRenderer } from '../src/components/ErrorMessageRenderer';
import { FieldRenderer } from '../src/components/FieldRenderer';
import { LabelRenderer } from '../src/components/LabelRenderer';
import { fieldInputDefinitions } from '../src/fieldInputs';

registerPlugin(ajv8Plugin);

export default {
  title: 'FormComponent',
};
const jsonSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 5,
      default: 'TEST',
    },
  },
} satisfies JSONSchema;

const bigSchema = {
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
            properties: { type: { enum: ['adult', 'child'] } },
          },
          then: {
            required: ['age', 'gender', 'preferences'],
          },
          else: {
            if: {
              properties: { type: { enum: ['none'] } },
            },
            then: {
              required: [],
            },
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
              controls: {
                active: '../age >= 18',
              },
              presentation: {
                FieldInputProps: {
                  placeholder: 'Select gender',
                },
              },
            },
            preferences: {
              type: 'object',
              properties: {
                theme: {
                  type: 'string',
                  enum: ['light', 'dark'],
                  default: 'light',
                  presentation: {
                    inputType: 'switch',
                  },
                },
                notifications: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'boolean',
                      default: true,
                      presentation: {
                        inputType: 'switch',
                      },
                    },
                    sms: {
                      type: 'boolean',
                      default: false,
                      presentation: {
                        inputType: 'switch',
                      },
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
              presentation: {
                inputType: 'switch',
              },
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
} satisfies JSONSchema;
export const FormErrorMessageComponent = () => {
  return (
    <FormProvider
      ErrorMessageRenderer={ErrorMessageRenderer}
      fieldInputDefinitions={fieldInputDefinitions}
    >
      <Form jsonSchema={jsonSchema} errorVisibility={ErrorVisibility.Always}>
        <Form.ErrorMessage path="username" />
      </Form>
    </FormProvider>
  );
};

export const FormInputComponent = () => {
  return (
    <FormProvider fieldInputDefinitions={fieldInputDefinitions}>
      <Form jsonSchema={jsonSchema} errorVisibility={ErrorVisibility.Always}>
        <Form.Input path="username" />
      </Form>
    </FormProvider>
  );
};

export const FormLabelComponent = () => {
  return (
    <FormProvider
      LabelRenderer={LabelRenderer}
      fieldInputDefinitions={fieldInputDefinitions}
    >
      <Form jsonSchema={jsonSchema} errorVisibility={ErrorVisibility.Always}>
        <Form.Label path="username" />
      </Form>
    </FormProvider>
  );
};

export const FieldRendererComponent = () => {
  return (
    <FormProvider
      FieldRenderer={FieldRenderer}
      fieldInputDefinitions={fieldInputDefinitions}
    >
      <Form
        jsonSchema={bigSchema}
        errorVisibility={ErrorVisibility.Always}
        context={{}}
      />
    </FormProvider>
  );
};

import { useCallback, useState } from 'react';

import type { FormatError, JsonSchemaError } from '../src';
import { Form, type JsonSchema, registerPlugin } from '../src';
import StoryLayout from './components/StoryLayout';
import { plugin } from './components/validator';

registerPlugin(plugin);

export default {
  title: 'Form/21. Validation',
};

export const UseSubmitHandler = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 10,
        options: {
          validationMessage: {
            minLength:
              'name must be at least {limit} characters: (value: {value})',
            maxLength:
              'name must be at most {limit} characters: (value: {value})',
          },
        },
      },
      email: {
        type: 'string',
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        options: {
          validationMessage: {
            minLength:
              'email must be at least {limit} characters: (value: {value})',
            maxLength:
              'email must be at most {limit} characters: (value: {value})',
            pattern: 'email must be a valid email address',
          },
        },
      },
      password: {
        type: 'string',
        format: 'password',
        minLength: 8,
        maxLength: 16,
        options: {
          validationMessage: {
            minLength:
              'password must be at least {limit} characters: (value: {value})',
            maxLength:
              'password must be at most {limit} characters: (value: {value})',
          },
        },
      },
      age: {
        type: 'number',
      },
    },
    required: ['email', 'password'],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>();
  const formatError = useCallback<FormatError>((error, node) => {
    const schema = node.jsonSchema;
    const options = schema.options?.validationMessage;
    if (!options) return error.message;
    let message = error.keyword ? options[error.keyword] : undefined;
    if (!message) return error.message;
    if (error.details) {
      Object.entries(error.details).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, '' + value);
      });
    }
    message = message.replace('{value}', '' + node.value);
    return message;
  }, []);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <Form
        jsonSchema={jsonSchema}
        onChange={setValue}
        onValidate={setErrors}
        formatError={formatError}
      />
    </StoryLayout>
  );
};

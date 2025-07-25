import { useCallback, useState } from 'react';

import type { FormatError, JsonSchemaError } from '../src';
import {
  Form,
  type JsonSchema,
  registerPlugin,
  useVirtualNodeError,
} from '../src';
import StoryLayout from './components/StoryLayout';
import { plugin } from './components/validator';

registerPlugin(plugin);

export default {
  title: 'Form/21. Validation',
};

export const InlineErrorMessage = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 10,
        errorMessages: {
          minLength:
            'name must be at least {limit} characters: (value: {value})',
          maxLength:
            'name must be at most {limit} characters: (value: {value})',
        },
      },
      email: {
        type: 'string',
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        errorMessages: {
          minLength:
            'email must be at least {limit} characters: (value: {value})',
          maxLength:
            'email must be at most {limit} characters: (value: {value})',
          pattern: 'email must be a valid email address',
        },
      },
      password: {
        type: 'string',
        format: 'password',
        minLength: 8,
        maxLength: 16,
        errorMessages: {
          minLength:
            'password must be at least {limit} characters: (value: {value})',
          maxLength:
            'password must be at most {limit} characters: (value: {value})',
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
    const options = schema.errorMessages;
    if (!options || !error.keyword) return error.message;
    let errorMessage = options[error.keyword];
    if (typeof errorMessage === 'string') {
      let message = errorMessage;
      if (error.details) {
        Object.entries(error.details).forEach(([key, value]) => {
          message = message.replace(`{${key}}`, '' + value);
        });
      }
      message = message.replace('{value}', '' + node.value);
      return message;
    }
    return error.message;
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

export const UseDefaultErrorFormatter = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 10,
        errorMessages: {
          minLength:
            'name must be at least {limit} characters: (value: {value})',
          maxLength:
            'name must be at most {limit} characters: (value: {value})',
        },
      },
      email: {
        type: 'string',
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        errorMessages: {
          minLength:
            'email must be at least {limit} characters: (value: {value})',
          maxLength:
            'email must be at most {limit} characters: (value: {value})',
          pattern: 'email must be a valid email address',
        },
      },
      password: {
        type: 'string',
        format: 'password',
        minLength: 8,
        maxLength: 16,
        errorMessages: {
          minLength:
            'password must be at least {limit} characters: (value: {value})',
          maxLength:
            'password must be at most {limit} characters: (value: {value})',
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

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <Form
        jsonSchema={jsonSchema}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};

export const UseDefaultErrorFormatterWithLocal = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 10,
        errorMessages: {
          minLength: {
            ko_KR:
              '이름은 최소 {limit} 글자 이상이어야 합니다. 현재 값: {value}',
            en_US:
              'Name must be at least {limit} characters long. Current value: {value}',
          },
          maxLength: {
            ko_KR: '이름은 최대 {limit} 글자 이하여야 합니다. 현재 값: {value}',
            en_US:
              'Name must be at most {limit} characters long. Current value: {value}',
          },
        },
      },
      email: {
        type: 'string',
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        errorMessages: {
          minLength: {
            ko_KR:
              '이메일은 최소 {limit} 글자 이상이어야 합니다. 현재 값: {value}',
            en_US:
              'Email must be at least {limit} characters long. Current value: {value}',
          },
          maxLength: {
            ko_KR:
              '이메일은 최대 {limit} 글자 이하여야 합니다. 현재 값: {value}',
            en_US:
              'Email must be at most {limit} characters long. Current value: {value}',
          },
          pattern: {
            ko_KR: '이메일 형식이 올바르지 않습니다.',
            en_US: 'Email must be a valid email address',
          },
        },
      },
      password: {
        type: 'string',
        format: 'password',
        minLength: 8,
        maxLength: 16,
        errorMessages: {
          minLength: {
            ko_KR:
              '비밀번호는 최소 {limit} 글자 이상이어야 합니다. 현재 값: {value}',
            en_US:
              'Password must be at least {limit} characters long. Current value: {value}',
          },
          maxLength: {
            ko_KR:
              '비밀번호는 최대 {limit} 글자 이하여야 합니다. 현재 값: {value}',
            en_US:
              'Password must be at most {limit} characters long. Current value: {value}',
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

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <Form
        jsonSchema={jsonSchema}
        onChange={setValue}
        onValidate={setErrors}
        context={{
          locale: 'ko_KR',
        }}
      />
    </StoryLayout>
  );
};

export const UseDefaultErrorFormatterDefaultKey = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 10,
        errorMessages: {
          default: 'invalid value',
        },
      },
      email: {
        type: 'string',
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        errorMessages: {
          default: 'invalid value',
        },
      },
      password: {
        type: 'string',
        format: 'password',
        minLength: 8,
        maxLength: 16,
        errorMessages: {
          default: 'invalid value',
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

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <Form
        jsonSchema={jsonSchema}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};

export const UseVirtualNodeError = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 10,
      },
      email: {
        type: 'string',
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      },
      zipCode: {
        type: 'string',
        pattern: '^[0-9]{5}$',
      },
      city: {
        type: 'string',
        minLength: 2,
      },
      roadAddress: {
        type: 'string',
        minLength: 2,
      },
    },
    virtual: {
      address: {
        fields: ['zipCode', 'city', 'roadAddress'],
      },
    },
    required: ['name', 'email', 'address'],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <Form
        showError
        jsonSchema={jsonSchema}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};

export const UseVirtualNodeErrorWithVirtualNodeHook = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 10,
      },
      email: {
        type: 'string',
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      },
      zipCode: {
        type: 'string',
        pattern: '^[0-9]{5}$',
      },
      city: {
        type: 'string',
        minLength: 2,
      },
      roadAddress: {
        type: 'string',
        minLength: 2,
      },
    },
    virtual: {
      address: {
        fields: ['zipCode', 'city', 'roadAddress'],
        FormType: ({ node, value, onChange }) => {
          const { errorMatrix, errorMessages } = useVirtualNodeError(node);
          return (
            <div>
              <div>
                <div>
                  <label>Zip Code</label>
                  <input
                    type="text"
                    value={value?.[0]}
                    onChange={(e) =>
                      onChange([e.target.value, value?.[1], value?.[2]])
                    }
                  />
                </div>
                <div>
                  <label>City</label>
                  <input
                    type="text"
                    value={value?.[1]}
                    onChange={(e) =>
                      onChange([value?.[0], e.target.value, value?.[2]])
                    }
                  />
                </div>
                <div>
                  <label>Road Address</label>
                  <input
                    type="text"
                    value={value?.[2]}
                    onChange={(e) =>
                      onChange([value?.[0], value?.[1], e.target.value])
                    }
                  />
                </div>
              </div>
              <div>
                <div>
                  {errorMessages.map((error, index) => (
                    <div key={index}>{error || ''}</div>
                  ))}
                </div>
                <pre>{JSON.stringify(errorMatrix, null, 2)}</pre>{' '}
              </div>
            </div>
          );
        },
      },
    },
    required: ['name', 'email', 'address'],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <Form
        showError
        jsonSchema={jsonSchema}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};

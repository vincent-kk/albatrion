import { useCallback, useRef, useState } from 'react';

import type { FormHandle, FormatError, JsonSchemaError } from '../src';
import {
  Form,
  type JsonSchema,
  registerPlugin,
  useChildNodeErrors,
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
    let formattedError = options[error.keyword];
    if (typeof formattedError === 'string') {
      let message = formattedError;
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
        errorMessages: {
          required: 'name is required',
        },
      },
      email: {
        type: 'string',
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        errorMessages: {
          pattern: 'email must be a valid email address',
          required: 'email is required',
        },
      },
      zipCode: {
        type: 'string',
        pattern: '^[0-9]{5}$',
        errorMessages: {
          required: 'zipCode is required',
          pattern: 'zipCode must be a valid zip code',
        },
      },
      city: {
        type: 'string',
        minLength: 2,
        errorMessages: {
          required: 'city is required',
        },
      },
      roadAddress: {
        type: 'string',
        minLength: 2,
        errorMessages: {
          required: 'roadAddress is required',
        },
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

export const UseVirtualNodeErrorWithChildNodeErrorsHook = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 10,
        errorMessages: {
          required: 'name is required',
        },
      },
      email: {
        type: 'string',
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        errorMessages: {
          pattern: 'email must be a valid email address',
          required: 'email is required',
        },
      },
      zipCode: {
        type: 'string',
        pattern: '^[0-9]{5}$',
        errorMessages: {
          required: 'zipCode is required',
          pattern: 'zipCode must be a valid zip code',
        },
      },
      city: {
        type: 'string',
        minLength: 2,
        errorMessages: {
          required: 'city is required',
          minLength: 'city must be at least {limit} characters',
        },
      },
      roadAddress: {
        type: 'string',
        minLength: 2,
        errorMessages: {
          required: 'roadAddress is required',
          minLength: 'roadAddress must be at least {limit} characters',
        },
      },
    },
    virtual: {
      address: {
        fields: ['zipCode', 'city', 'roadAddress'],
        FormTypeInput: ({ node, value, onChange }) => {
          const {
            errorMessage,
            showError,
            showErrors,
            formattedError,
            formattedErrors,
            errorMatrix,
          } = useChildNodeErrors(node);
          return (
            <div>
              <div>
                <div>
                  <label>Zip Code</label>
                  <input
                    type="text"
                    value={value?.[0] || ''}
                    onChange={(e) =>
                      onChange([e.target.value, value?.[1], value?.[2]])
                    }
                  />
                </div>
                <div>
                  <label>City</label>
                  <input
                    type="text"
                    value={value?.[1] || ''}
                    onChange={(e) =>
                      onChange([value?.[0], e.target.value, value?.[2]])
                    }
                  />
                </div>
                <div>
                  <label>Road Address</label>
                  <input
                    type="text"
                    value={value?.[2] || ''}
                    onChange={(e) =>
                      onChange([value?.[0], value?.[1], e.target.value])
                    }
                  />
                </div>
              </div>
              <div>
                <div>
                  <strong>Error Display (showErrors & errorMessages):</strong>
                  <div>
                    errorMessage:{' '}
                    {errorMessage ? (
                      <span style={{ color: 'red' }}>{errorMessage}</span>
                    ) : (
                      <span style={{ color: 'gray' }}>No error to show</span>
                    )}
                  </div>
                  <div>
                    Field Virtual:{' '}
                    {formattedError ? (
                      <span style={{ color: 'red' }}>{formattedError}</span>
                    ) : (
                      <span style={{ color: 'gray' }}>No error to show</span>
                    )}
                  </div>
                  {showErrors.map((show, index) => (
                    <div key={index}>
                      Field {index + 1}:{' '}
                      {show && formattedErrors[index] ? (
                        <span style={{ color: 'red' }}>
                          {formattedErrors[index]}
                        </span>
                      ) : (
                        <span style={{ color: 'gray' }}>No error to show</span>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '10px' }}>
                  <strong>showError:</strong> {showError ? 'true' : 'false'} |
                  <strong> showErrors:</strong> [
                  {showErrors.map((s) => (s ? 'T' : 'F')).join(', ')}]
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
        jsonSchema={jsonSchema}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};

export const UseChildNodeErrorsWithDisabled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        errorMessages: {
          required: 'name is required',
          minLength: 'name must be at least {limit} characters',
        },
      },
      email: {
        type: 'string',
        format: 'email',
        errorMessages: {
          required: 'email is required',
          format: 'email must be a valid email address',
        },
      },
      age: {
        type: 'number',
        minimum: 18,
        errorMessages: {
          required: 'age is required',
          minimum: 'age must be at least {limit}',
        },
      },
      phone: {
        type: 'string',
        pattern: '^[0-9]{3}-[0-9]{4}-[0-9]{4}$',
        errorMessages: {
          required: 'phone is required',
          pattern: 'phone must be in format XXX-XXXX-XXXX',
        },
      },
    },
    virtual: {
      personalInfoGroup: {
        fields: ['age', 'phone'],
        FormTypeInput: ({ node, value, onChange }) => {
          const [isDisabled, setIsDisabled] = useState(false);
          const {
            errorMatrix,
            formattedErrors,
            formattedError,
            showError,
            showErrors,
            errorMessage,
          } = useChildNodeErrors(node, isDisabled);

          const handleFieldChange = (index: number, newValue: any) => {
            const newValues = [...(value || [])];
            newValues[index] = newValue;
            onChange(newValues);
          };

          return (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={isDisabled}
                    onChange={(e) => setIsDisabled(e.target.checked)}
                  />
                  Disable error handling
                </label>
              </div>
              <div>
                <h4>Personal Information</h4>
                <div>
                  <label>Age (min 18)</label>
                  <input
                    type="number"
                    value={value?.[0] || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        0,
                        parseInt(e.target.value) || undefined,
                      )
                    }
                    placeholder="Enter age (minimum 18)"
                  />
                  {showErrors[0] && formattedErrors[0] && (
                    <span
                      style={{
                        color: 'red',
                        fontSize: '12px',
                        display: 'block',
                      }}
                    >
                      {formattedErrors[0]}
                    </span>
                  )}
                </div>
                <div>
                  <label>Phone (XXX-XXXX-XXXX format)</label>
                  <input
                    type="text"
                    value={value?.[1] || ''}
                    onChange={(e) => handleFieldChange(1, e.target.value)}
                    placeholder="Enter phone in XXX-XXXX-XXXX format"
                  />
                  {showErrors[1] && formattedErrors[1] && (
                    <span
                      style={{
                        color: 'red',
                        fontSize: '12px',
                        display: 'block',
                      }}
                    >
                      {formattedErrors[1]}
                    </span>
                  )}
                </div>
              </div>
              <div
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  marginTop: '10px',
                }}
              >
                <h5>
                  Error Information (disabled: {isDisabled ? 'true' : 'false'})
                </h5>
                <div>
                  <strong>errorMessage:</strong>{' '}
                  {errorMessage ? errorMessage : 'No error to show'}
                </div>
                <div>
                  <strong>First Error (showError && formattedError):</strong>{' '}
                  {formattedError ? formattedError : 'No error to show'}
                </div>
                <div>
                  <strong>showError:</strong> {showError ? 'true' : 'false'} |
                  <strong> showErrors:</strong> [
                  {showErrors.map((s) => (s ? 'T' : 'F')).join(', ')}]
                </div>
                <div>
                  <strong>Error Messages:</strong>
                  {formattedErrors.map((error: any, index: number) => (
                    <div key={index}>
                      [{index}]: {error || 'No error'}
                    </div>
                  ))}
                </div>
                <div>
                  <strong>Error Matrix:</strong>
                  <pre>{JSON.stringify(errorMatrix, null, 2)}</pre>
                </div>
                <div>
                  <strong>Status:</strong> When disabled=true, errors are
                  cleared. When disabled=false, errors are collected from direct
                  children.
                </div>
              </div>
            </div>
          );
        },
      },
    },
    required: ['name', 'email', 'personalInfoGroup'],
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

export const UseChildNodeErrorsWithDirectChildren = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      field1: {
        type: 'string',
        minLength: 2,
        errorMessages: {
          required: 'field1 is required',
          minLength: 'field1 must be at least {limit} characters',
        },
      },
      field2: {
        type: 'string',
        pattern: '^[A-Z][a-z]+$',
        errorMessages: {
          required: 'field2 is required',
          pattern: 'field2 must start with uppercase letter',
        },
      },
      field3: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        errorMessages: {
          required: 'field3 is required',
          minimum: 'field3 must be at least {limit}',
          maximum: 'field3 must be at most {limit}',
        },
      },
      field4: {
        type: 'string',
        maxLength: 10,
        errorMessages: {
          required: 'field4 is required',
          maxLength: 'field4 must be at most {limit} characters',
        },
      },
    },
    virtual: {
      directChildrenGroup: {
        fields: ['field1', 'field2', 'field3', 'field4'],
        FormTypeInput: ({ node, value, onChange }) => {
          const {
            errorMatrix,
            formattedErrors,
            formattedError,
            showError,
            showErrors,
            errorMessage,
          } = useChildNodeErrors(node);

          const handleFieldChange = (index: number, newValue: any) => {
            const newValues = [...(value || [])];
            newValues[index] = newValue;
            onChange(newValues);
          };

          return (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                }}
              >
                <div>
                  <h4>Text Fields</h4>
                  <div>
                    <label>Field 1 (min 2 chars)</label>
                    <input
                      type="text"
                      value={value?.[0] || ''}
                      onChange={(e) => handleFieldChange(0, e.target.value)}
                      placeholder="Enter at least 2 characters"
                    />
                    {showErrors[0] && formattedErrors[0] && (
                      <span
                        style={{
                          color: 'red',
                          fontSize: '12px',
                          display: 'block',
                        }}
                      >
                        {formattedErrors[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <label>Field 2 (uppercase start)</label>
                    <input
                      type="text"
                      value={value?.[1] || ''}
                      onChange={(e) => handleFieldChange(1, e.target.value)}
                      placeholder="Must start with uppercase"
                    />
                    {showErrors[1] && formattedErrors[1] && (
                      <span
                        style={{
                          color: 'red',
                          fontSize: '12px',
                          display: 'block',
                        }}
                      >
                        {formattedErrors[1]}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4>Number & Text Fields</h4>
                  <div>
                    <label>Field 3 (0-100)</label>
                    <input
                      type="number"
                      value={value?.[2] || ''}
                      onChange={(e) =>
                        handleFieldChange(
                          2,
                          parseInt(e.target.value) || undefined,
                        )
                      }
                      placeholder="Enter number 0-100"
                    />
                    {showErrors[2] && formattedErrors[2] && (
                      <span
                        style={{
                          color: 'red',
                          fontSize: '12px',
                          display: 'block',
                        }}
                      >
                        {formattedErrors[2]}
                      </span>
                    )}
                  </div>
                  <div>
                    <label>Field 4 (max 10 chars)</label>
                    <input
                      type="text"
                      value={value?.[3] || ''}
                      onChange={(e) => handleFieldChange(3, e.target.value)}
                      placeholder="Max 10 characters"
                    />
                    {showErrors[3] && formattedErrors[3] && (
                      <span
                        style={{
                          color: 'red',
                          fontSize: '12px',
                          display: 'block',
                        }}
                      >
                        {formattedErrors[3]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  marginTop: '10px',
                }}
              >
                <h5>Direct Children Error Information</h5>
                <div>
                  <strong>showError:</strong> {showError ? 'true' : 'false'} |
                  <strong> showErrors:</strong> [
                  {showErrors.map((s) => (s ? 'T' : 'F')).join(', ')}]
                </div>
                <div>
                  <strong>First Error (showError && formattedError):</strong>{' '}
                  {formattedError ? formattedError : 'No errors to show'}
                </div>
                <div>
                  <strong>errorMessage:</strong>{' '}
                  {errorMessage ? errorMessage : 'No error to show'}
                </div>
                <div>
                  <strong>Field Errors:</strong>
                  {formattedErrors.map((error: any, index: number) => (
                    <div key={index}>
                      Field {index + 1}: {error || 'No error'}
                    </div>
                  ))}
                </div>
                <div>
                  <strong>Error Matrix:</strong>
                  <pre style={{ fontSize: '12px' }}>
                    {JSON.stringify(errorMatrix, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          );
        },
      },
    },
    required: ['directChildrenGroup'],
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

export const UseChildNodeErrorsWithEmptyChildren = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      emptySection: {
        type: 'object',
        properties: {},
      },
    },
    virtual: {
      emptyGroup: {
        fields: ['emptySection'],
        FormTypeInput: ({ node, value: _value, onChange: _onChange }) => {
          const {
            errorMatrix,
            formattedErrors,
            formattedError,
            showError,
            showErrors,
            errorMessage,
          } = useChildNodeErrors(node);

          return (
            <div>
              <div>
                <h4>Empty Section Group</h4>
                <p>This virtual node has no child fields to validate.</p>
              </div>

              <div
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  marginTop: '10px',
                }}
              >
                <h5>Error Information for Empty Children</h5>
                <div>
                  <strong>showError:</strong> {showError ? 'true' : 'false'} |
                  <strong> showErrors:</strong> [
                  {showErrors.map((s) => (s ? 'T' : 'F')).join(', ')}]
                </div>
                <div>
                  <strong>First Error (showError && formattedError):</strong>{' '}
                  {formattedError ? formattedError : 'No errors to show'}
                </div>
                <div>
                  <strong>errorMessage:</strong>{' '}
                  {errorMessage ? errorMessage : 'No error to show'}
                </div>
                <div>
                  <strong>Error Messages Count:</strong>{' '}
                  {formattedErrors.length}
                </div>
                <div>
                  <strong>Error Matrix:</strong>
                  <pre>{JSON.stringify(errorMatrix, null, 2)}</pre>
                </div>
              </div>
            </div>
          );
        },
      },
    },
    required: [],
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

export const UseChildNodeErrorsRealTimeUpdate = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      dynamicField1: {
        type: 'string',
        minLength: 5,
        errorMessages: {
          required: 'dynamicField1 is required',
          minLength: 'dynamicField1 must be at least {limit} characters',
        },
      },
      dynamicField2: {
        type: 'string',
        pattern: '^[0-9]+$',
        errorMessages: {
          required: 'dynamicField2 is required',
          pattern: 'dynamicField2 must contain only numbers',
        },
      },
      dynamicField3: {
        type: 'number',
        maximum: 100,
        errorMessages: {
          required: 'dynamicField3 is required',
          maximum: 'dynamicField3 must be at most {limit}',
        },
      },
    },
    virtual: {
      dynamicGroup: {
        fields: ['dynamicField1', 'dynamicField2', 'dynamicField3'],
        FormTypeInput: ({ node, value, onChange }) => {
          const {
            errorMatrix,
            formattedErrors,
            formattedError,
            showError,
            showErrors,
            errorMessage,
          } = useChildNodeErrors(node);
          const [updateCount, setUpdateCount] = useState(0);

          const handleChange = (index: number, newValue: unknown) => {
            const newValues = [...(value || [])];
            newValues[index] = newValue;
            onChange(newValues);
            setUpdateCount((prev) => prev + 1);
          };

          return (
            <div>
              <div>
                <h4>Real-time Error Update Test (Updates: {updateCount})</h4>
                <div>
                  <label>Dynamic Field 1 (min 5 chars)</label>
                  <input
                    type="text"
                    value={value?.[0] || ''}
                    onChange={(e) => handleChange(0, e.target.value)}
                    placeholder="Enter at least 5 characters"
                  />
                  {showErrors[0] && formattedErrors[0] && (
                    <span style={{ color: 'red', marginLeft: '10px' }}>
                      {formattedErrors[0]}
                    </span>
                  )}
                </div>
                <div>
                  <label>Dynamic Field 2 (numbers only)</label>
                  <input
                    type="text"
                    value={value?.[1] || ''}
                    onChange={(e) => handleChange(1, e.target.value)}
                    placeholder="Enter numbers only"
                  />
                  {showErrors[1] && formattedErrors[1] && (
                    <span style={{ color: 'red', marginLeft: '10px' }}>
                      {formattedErrors[1]}
                    </span>
                  )}
                </div>
                <div>
                  <label>Dynamic Field 3 (max 100)</label>
                  <input
                    type="number"
                    value={value?.[2] || ''}
                    onChange={(e) =>
                      handleChange(2, parseInt(e.target.value) || undefined)
                    }
                    placeholder="Enter number ≤ 100"
                  />
                  {showErrors[2] && formattedErrors[2] && (
                    <span style={{ color: 'red', marginLeft: '10px' }}>
                      {formattedErrors[2]}
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  marginTop: '10px',
                }}
              >
                <h5>Real-time Error Monitoring</h5>
                <div>
                  <strong>Show Error (Global):</strong>{' '}
                  <span style={{ color: showError ? 'red' : 'green' }}>
                    {showError ? 'true' : 'false'}
                  </span>
                </div>
                <div>
                  <strong>Show Errors (Individual):</strong> [
                  {showErrors.map((show, i) => (
                    <span key={i} style={{ color: show ? 'red' : 'green' }}>
                      {show ? 'true' : 'false'}
                      {i < showErrors.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  ]
                </div>
                {formattedError && (
                  <div>
                    <strong>First Error:</strong>
                    <span style={{ color: 'red', marginLeft: '5px' }}>
                      {formattedError}
                    </span>
                  </div>
                )}
                {errorMessage && (
                  <div>
                    <strong>errorMessage:</strong>
                    <span style={{ color: 'red', marginLeft: '5px' }}>
                      {errorMessage}
                    </span>
                  </div>
                )}
                <div>
                  <strong>Live Error Count:</strong>{' '}
                  {formattedErrors.filter((msg: any) => msg).length} /{' '}
                  {formattedErrors.length}
                </div>
                <div>
                  <strong>Error Matrix (Live):</strong>
                  <pre
                    style={{
                      fontSize: '12px',
                      maxHeight: '200px',
                      overflow: 'auto',
                    }}
                  >
                    {JSON.stringify(errorMatrix, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          );
        },
      },
    },
    required: ['dynamicGroup'],
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

export const NullableFieldValidation = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      nullableString: {
        type: ['string', 'null'],
        minLength: 3,
        errorMessages: {
          minLength: '최소 {limit}자 이상 입력해야 합니다',
          type: '문자열이거나 null이어야 합니다',
        },
      },
      nullableNumber: {
        type: ['number', 'null'],
        minimum: 0,
        maximum: 100,
        errorMessages: {
          minimum: '{limit} 이상의 숫자를 입력해야 합니다',
          maximum: '{limit} 이하의 숫자를 입력해야 합니다',
          type: '숫자이거나 null이어야 합니다',
        },
      },
      nullableEmail: {
        type: ['string', 'null'],
        format: 'email',
        errorMessages: {
          format: '올바른 이메일 형식이 아닙니다',
          type: '문자열이거나 null이어야 합니다',
        },
      },
    },
    required: [],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>();
  const ref = useRef<FormHandle<typeof jsonSchema>>(null);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <div>
        <h3>Nullable Field Validation</h3>
        <button
          onClick={() => {
            ref.current?.setValue({
              nullableString: null,
              nullableNumber: null,
              nullableEmail: null,
            });
          }}
        >
          set null
        </button>
        <p>
          nullable 필드는 값이 없어도 에러가 발생하지 않지만, 값이 있을 경우
          유효성 검사를 통과해야 합니다.
        </p>

        <Form
          ref={ref}
          jsonSchema={jsonSchema}
          onChange={setValue}
          onValidate={setErrors}
        />
      </div>
    </StoryLayout>
  );
};

export const NullableWithDefaultValueError = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      invalidDefaultString: {
        type: ['string', 'null'],
        default: 'ab',
        minLength: 3,
        errorMessages: {
          minLength: '기본값이 최소 길이({limit}자)를 충족하지 않습니다',
        },
      },
      invalidDefaultNumber: {
        type: ['number', 'null'],
        default: 150,
        maximum: 100,
        errorMessages: {
          maximum: '기본값이 최대값({limit})을 초과합니다',
        },
      },
      invalidDefaultPattern: {
        type: ['string', 'null'],
        default: 'invalid',
        pattern: '^[0-9]+$',
        errorMessages: {
          pattern: '기본값이 숫자 패턴을 충족하지 않습니다',
        },
      },
    },
    required: [],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <div>
        <h3>Nullable Fields with Invalid Default Values</h3>
        <p>
          기본값이 스키마의 유효성 검사 규칙을 위반하는 경우 AJV 에러가
          발생합니다.
        </p>
        <Form
          jsonSchema={jsonSchema}
          onChange={setValue}
          onValidate={setErrors}
        />
      </div>
    </StoryLayout>
  );
};

export const NullableTypeCoercionError = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      strictNumber: {
        type: ['number', 'null'],
        errorMessages: {
          type: '숫자 타입이어야 합니다 (문자열 숫자는 허용되지 않음)',
        },
      },
      strictBoolean: {
        type: ['boolean', 'null'],
        errorMessages: {
          type: 'boolean 타입이어야 합니다 (0, 1은 허용되지 않음)',
        },
      },
      strictArray: {
        type: ['array', 'null'],
        items: { type: 'string' },
        errorMessages: {
          type: '배열이어야 합니다',
        },
      },
    },
    required: [],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({
    strictNumber: '123',
    strictBoolean: 1,
    strictArray: 'not an array',
  });
  const [errors, setErrors] = useState<JsonSchemaError[]>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <div>
        <h3>Nullable Type Coercion Errors</h3>
        <p>
          타입 강제 변환이 없는 엄격한 타입 검사에서 발생하는 에러를
          테스트합니다.
        </p>
        <Form
          jsonSchema={jsonSchema}
          onChange={setValue}
          onValidate={setErrors}
        />
      </div>
    </StoryLayout>
  );
};

export const NullableRequiredFieldConflict = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      requiredNullable: {
        type: ['string', 'null'],
        minLength: 3,
        errorMessages: {
          required: '이 필드는 필수입니다 (null 허용)',
          minLength: '최소 {limit}자 이상이어야 합니다',
        },
      },
      requiredNullableNumber: {
        type: ['number', 'null'],
        minimum: 0,
        errorMessages: {
          required: '이 필드는 필수입니다 (null 허용)',
          minimum: '{limit} 이상이어야 합니다',
        },
      },
    },
    required: ['requiredNullable', 'requiredNullableNumber'],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <div>
        <h3>Nullable Required Fields</h3>
        <p>
          required 필드이면서 nullable인 경우, 필드가 존재해야 하지만 null 값은
          허용됩니다.
        </p>
        <Form
          jsonSchema={jsonSchema}
          onChange={setValue}
          onValidate={setErrors}
        />
      </div>
    </StoryLayout>
  );
};

export const NullableNestedObjectError = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      nullableObject: {
        type: ['object', 'null'],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            errorMessages: {
              minLength: '이름은 최소 {limit}자 이상이어야 합니다',
            },
          },
          age: {
            type: 'number',
            minimum: 0,
            maximum: 150,
            errorMessages: {
              minimum: '나이는 {limit} 이상이어야 합니다',
              maximum: '나이는 {limit} 이하여야 합니다',
            },
          },
        },
        required: ['name'],
        errorMessages: {
          required: '이름 필드는 필수입니다',
        },
      },
    },
    required: [],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({
    nullableObject: { age: 200 },
  });
  const [errors, setErrors] = useState<JsonSchemaError[]>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <div>
        <h3>Nullable Nested Object Validation</h3>
        <p>nullable 중첩 객체의 내부 필드 유효성 검사 에러를 테스트합니다.</p>
        <Form
          jsonSchema={jsonSchema}
          onChange={setValue}
          onValidate={setErrors}
        />
      </div>
    </StoryLayout>
  );
};

export const NullableArrayItemError = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      nullableArray: {
        type: ['array', 'null'],
        items: {
          type: 'string',
          minLength: 3,
          pattern: '^[A-Z]',
          errorMessages: {
            minLength: '각 항목은 최소 {limit}자 이상이어야 합니다',
            pattern: '각 항목은 대문자로 시작해야 합니다',
          },
        },
        minItems: 2,
        errorMessages: {
          minItems: '최소 {limit}개 이상의 항목이 필요합니다',
        },
      },
      nullableNumberArray: {
        type: ['array', 'null'],
        items: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          errorMessages: {
            minimum: '각 항목은 {limit} 이상이어야 합니다',
            maximum: '각 항목은 {limit} 이하여야 합니다',
          },
        },
        errorMessages: {},
      },
    },
    required: [],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({
    nullableArray: ['ab', 'cd'],
    nullableNumberArray: [-10, 150, 50],
  });
  const [errors, setErrors] = useState<JsonSchemaError[]>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <div>
        <h3>Nullable Array Item Validation</h3>
        <p>
          nullable 배열의 항목 유효성 검사 에러와 배열 제약 조건 에러를
          테스트합니다.
        </p>
        <Form
          jsonSchema={jsonSchema}
          onChange={setValue}
          onValidate={setErrors}
        />
      </div>
    </StoryLayout>
  );
};

export const NullableMultipleTypeError = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      number: {
        type: ['number', 'null'],
        minimum: 10,
        errorMessages: {
          minimum: '{limit} 이하여야 합니다.',
          type: '문자열, 숫자, 또는 null이어야 합니다',
        },
      },
      array: {
        type: ['array', 'null'],
        minItems: 2,
        errorMessages: {
          minItems: '배열인 경우 최소 {limit}개 이상의 항목이 필요합니다',
          minProperties: '객체인 경우 최소 {limit}개 이상의 속성이 필요합니다',
          type: '배열, 객체, 또는 null이어야 합니다',
        },
        items: {
          type: 'string',
        },
      },
    },
    required: [],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({
    stringOrNumber: 5,
    arrayOrObject: [],
  });
  const [errors, setErrors] = useState<JsonSchemaError[]>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <div>
        <h3>Nullable Multiple Type Validation</h3>
        <p>
          여러 타입을 허용하는 nullable 필드의 타입별 유효성 검사 에러를
          테스트합니다.
        </p>
        <Form
          jsonSchema={jsonSchema}
          onChange={setValue}
          onValidate={setErrors}
        />
      </div>
    </StoryLayout>
  );
};

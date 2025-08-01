import { useCallback, useState } from 'react';

import type { FormatError, JsonSchemaError } from '../src';
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
  title: 'Form/21. Validation Extended',
};

export const ShowErrorAndShowErrorsStateTest = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      testField1: {
        type: 'string',
        minLength: 3,
        errorMessages: {
          required: 'testField1 is required',
          minLength: 'testField1 must be at least {limit} characters',
        },
      },
      testField2: {
        type: 'string',
        pattern: '^[A-Z]',
        errorMessages: {
          required: 'testField2 is required',
          pattern: 'testField2 must start with uppercase letter',
        },
      },
      testField3: {
        type: 'number',
        minimum: 10,
        errorMessages: {
          required: 'testField3 is required',
          minimum: 'testField3 must be at least {limit}',
        },
      },
    },
    virtual: {
      showErrorStateGroup: {
        fields: ['testField1', 'testField2', 'testField3'],
        FormType: ({ node, value, onChange }) => {
          const {
            errorMatrix,
            errorMessages,
            errorMessage,
            showError,
            showErrors,
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
                  border: '2px solid #e0e0e0',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                }}
              >
                <h4>🧪 ShowError & ShowErrors State Test</h4>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  이 테스트는 showError와 showErrors 상태가 언제 활성화되는지
                  확인합니다. 필드에 포커스한 후 벗어나면 touched 상태가 되어
                  에러가 표시됩니다.
                </p>
              </div>

              <div
                style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}
              >
                <div>
                  <label
                    style={{
                      fontWeight: 'bold',
                      display: 'block',
                      marginBottom: '5px',
                    }}
                  >
                    Test Field 1 (min 3 chars)
                    <span
                      style={{
                        color: showErrors[0] ? 'red' : 'gray',
                        fontSize: '12px',
                      }}
                    >
                      [showErrors[0]: {showErrors[0] ? 'true' : 'false'}]
                    </span>
                  </label>
                  <input
                    type="text"
                    value={value?.[0] || ''}
                    onChange={(e) => handleFieldChange(0, e.target.value)}
                    placeholder="Enter at least 3 characters"
                    style={{
                      padding: '8px',
                      border:
                        showErrors[0] && errorMessages[0]
                          ? '2px solid red'
                          : '1px solid #ccc',
                      borderRadius: '4px',
                      width: '300px',
                    }}
                  />
                  {showErrors[0] && errorMessages[0] && (
                    <div
                      style={{
                        color: 'red',
                        fontSize: '12px',
                        marginTop: '3px',
                      }}
                    >
                      ❌ {errorMessages[0]}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      fontWeight: 'bold',
                      display: 'block',
                      marginBottom: '5px',
                    }}
                  >
                    Test Field 2 (uppercase start)
                    <span
                      style={{
                        color: showErrors[1] ? 'red' : 'gray',
                        fontSize: '12px',
                      }}
                    >
                      [showErrors[1]: {showErrors[1] ? 'true' : 'false'}]
                    </span>
                  </label>
                  <input
                    type="text"
                    value={value?.[1] || ''}
                    onChange={(e) => handleFieldChange(1, e.target.value)}
                    placeholder="Must start with uppercase letter"
                    style={{
                      padding: '8px',
                      border:
                        showErrors[1] && errorMessages[1]
                          ? '2px solid red'
                          : '1px solid #ccc',
                      borderRadius: '4px',
                      width: '300px',
                    }}
                  />
                  {showErrors[1] && errorMessages[1] && (
                    <div
                      style={{
                        color: 'red',
                        fontSize: '12px',
                        marginTop: '3px',
                      }}
                    >
                      ❌ {errorMessages[1]}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      fontWeight: 'bold',
                      display: 'block',
                      marginBottom: '5px',
                    }}
                  >
                    Test Field 3 (min 10)
                    <span
                      style={{
                        color: showErrors[2] ? 'red' : 'gray',
                        fontSize: '12px',
                      }}
                    >
                      [showErrors[2]: {showErrors[2] ? 'true' : 'false'}]
                    </span>
                  </label>
                  <input
                    type="number"
                    value={value?.[2] || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        2,
                        parseInt(e.target.value) || undefined,
                      )
                    }
                    placeholder="Enter number >= 10"
                    style={{
                      padding: '8px',
                      border:
                        showErrors[2] && errorMessages[2]
                          ? '2px solid red'
                          : '1px solid #ccc',
                      borderRadius: '4px',
                      width: '300px',
                    }}
                  />
                  {showErrors[2] && errorMessages[2] && (
                    <div
                      style={{
                        color: 'red',
                        fontSize: '12px',
                        marginTop: '3px',
                      }}
                    >
                      ❌ {errorMessages[2]}
                    </div>
                  )}
                </div>
              </div>

              {/* Global Error Display */}
              {showError && errorMessage && (
                <div
                  style={{
                    backgroundColor: '#ffebee',
                    border: '1px solid #f44336',
                    borderRadius: '4px',
                    padding: '10px',
                    marginBottom: '20px',
                  }}
                >
                  <strong>🚨 Global Error Message:</strong>
                  <span style={{ color: 'red', marginLeft: '5px' }}>
                    {errorMessage}
                  </span>
                </div>
              )}

              {/* State Information Panel */}
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <h5 style={{ marginTop: 0 }}>📊 State Information</h5>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                  }}
                >
                  <div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Show Error (Global):</strong>{' '}
                      <span
                        style={{
                          color: showError ? 'red' : 'green',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          backgroundColor: showError ? '#ffebee' : '#e8f5e8',
                          borderRadius: '4px',
                        }}
                      >
                        {showError ? 'TRUE' : 'FALSE'}
                      </span>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <strong>Show Errors (Individual):</strong>
                      <div style={{ marginTop: '5px' }}>
                        {showErrors.map((show, i) => (
                          <div
                            key={i}
                            style={{ fontSize: '12px', marginBottom: '2px' }}
                          >
                            Field {i + 1}:{' '}
                            <span
                              style={{
                                color: show ? 'red' : 'green',
                                fontWeight: 'bold',
                                padding: '1px 4px',
                                backgroundColor: show ? '#ffebee' : '#e8f5e8',
                                borderRadius: '3px',
                              }}
                            >
                              {show ? 'TRUE' : 'FALSE'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Error Count:</strong>{' '}
                      {errorMessages.filter((msg: any) => msg).length} /{' '}
                      {errorMessages.length}
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <strong>Visible Error Count:</strong>{' '}
                      {
                        showErrors.filter((show, i) => show && errorMessages[i])
                          .length
                      }
                    </div>
                  </div>
                </div>

                <details style={{ marginTop: '15px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    🔍 Debug Information
                  </summary>
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Error Messages:</strong>
                      <pre
                        style={{
                          fontSize: '11px',
                          backgroundColor: '#fff',
                          padding: '5px',
                          borderRadius: '3px',
                        }}
                      >
                        {JSON.stringify(errorMessages, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <strong>Error Matrix:</strong>
                      <pre
                        style={{
                          fontSize: '11px',
                          backgroundColor: '#fff',
                          padding: '5px',
                          borderRadius: '3px',
                          maxHeight: '150px',
                          overflow: 'auto',
                        }}
                      >
                        {JSON.stringify(errorMatrix, null, 2)}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          );
        },
      },
    },
    required: ['showErrorStateGroup'],
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

export const ConditionalErrorDisplayTest = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      conditionalField1: {
        type: 'string',
        minLength: 2,
        errorMessages: {
          required: 'conditionalField1 is required',
          minLength: 'conditionalField1 must be at least {limit} characters',
        },
      },
      conditionalField2: {
        type: 'string',
        pattern: '^[a-z]+$',
        errorMessages: {
          required: 'conditionalField2 is required',
          pattern: 'conditionalField2 must contain only lowercase letters',
        },
      },
    },
    virtual: {
      conditionalGroup: {
        fields: ['conditionalField1', 'conditionalField2'],
        FormType: ({ node, value, onChange }) => {
          const [showIndividualErrors, setShowIndividualErrors] =
            useState(true);
          const [showGlobalError, setShowGlobalError] = useState(true);
          const {
            errorMatrix,
            errorMessages,
            errorMessage,
            showError,
            showErrors,
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
                  border: '2px solid #1976d2',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  backgroundColor: '#f3f8ff',
                }}
              >
                <h4>🎛️ Conditional Error Display Test</h4>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '15px',
                  }}
                >
                  이 테스트는 조건부 에러 표시 로직을 확인합니다. showError &
                  errorMessage 조건과 showErrors[i] & errorMessages[i] 조건을
                  테스트할 수 있습니다.
                </p>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={showGlobalError}
                      onChange={(e) => setShowGlobalError(e.target.checked)}
                    />
                    Show Global Error (showError && errorMessage)
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={showIndividualErrors}
                      onChange={(e) =>
                        setShowIndividualErrors(e.target.checked)
                      }
                    />
                    Show Individual Errors (showErrors[i] & errorMessages[i])
                  </label>
                </div>
              </div>

              <div
                style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}
              >
                <div>
                  <label
                    style={{
                      fontWeight: 'bold',
                      display: 'block',
                      marginBottom: '5px',
                    }}
                  >
                    Conditional Field 1 (min 2 chars)
                  </label>
                  <input
                    type="text"
                    value={value?.[0] || ''}
                    onChange={(e) => handleFieldChange(0, e.target.value)}
                    placeholder="Enter at least 2 characters"
                    style={{
                      padding: '8px',
                      border:
                        showIndividualErrors &&
                        showErrors[0] &&
                        errorMessages[0]
                          ? '2px solid red'
                          : '1px solid #ccc',
                      borderRadius: '4px',
                      width: '300px',
                    }}
                  />
                  {showIndividualErrors &&
                    showErrors[0] &&
                    errorMessages[0] && (
                      <div
                        style={{
                          color: 'red',
                          fontSize: '12px',
                          marginTop: '3px',
                        }}
                      >
                        ❌ Individual Error: {errorMessages[0]}
                      </div>
                    )}
                </div>

                <div>
                  <label
                    style={{
                      fontWeight: 'bold',
                      display: 'block',
                      marginBottom: '5px',
                    }}
                  >
                    Conditional Field 2 (lowercase only)
                  </label>
                  <input
                    type="text"
                    value={value?.[1] || ''}
                    onChange={(e) => handleFieldChange(1, e.target.value)}
                    placeholder="Enter lowercase letters only"
                    style={{
                      padding: '8px',
                      border:
                        showIndividualErrors &&
                        showErrors[1] &&
                        errorMessages[1]
                          ? '2px solid red'
                          : '1px solid #ccc',
                      borderRadius: '4px',
                      width: '300px',
                    }}
                  />
                  {showIndividualErrors &&
                    showErrors[1] &&
                    errorMessages[1] && (
                      <div
                        style={{
                          color: 'red',
                          fontSize: '12px',
                          marginTop: '3px',
                        }}
                      >
                        ❌ Individual Error: {errorMessages[1]}
                      </div>
                    )}
                </div>
              </div>

              {/* Conditional Global Error Display */}
              {showGlobalError && showError && errorMessage && (
                <div
                  style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px',
                    padding: '10px',
                    marginBottom: '20px',
                  }}
                >
                  <strong>🌐 Global Error (showError && errorMessage):</strong>
                  <span style={{ color: '#856404', marginLeft: '5px' }}>
                    {errorMessage}
                  </span>
                </div>
              )}

              {/* Logic Explanation */}
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <h5 style={{ marginTop: 0 }}>🔍 Display Logic Breakdown</h5>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                  }}
                >
                  <div>
                    <h6>Individual Errors Logic:</h6>
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        style={{ marginBottom: '10px', fontSize: '12px' }}
                      >
                        <strong>Field {i + 1}:</strong>
                        <div style={{ marginLeft: '10px' }}>
                          <div>
                            showIndividualErrors:{' '}
                            <code>{showIndividualErrors.toString()}</code>
                          </div>
                          <div>
                            showErrors[{i}]:{' '}
                            <code>{showErrors[i]?.toString() || 'false'}</code>
                          </div>
                          <div>
                            errorMessages[{i}]:{' '}
                            <code>{errorMessages[i] ? 'exists' : 'null'}</code>
                          </div>
                          <div
                            style={{
                              fontWeight: 'bold',
                              color:
                                showIndividualErrors &&
                                showErrors[i] &&
                                errorMessages[i]
                                  ? 'green'
                                  : 'red',
                            }}
                          >
                            Result:{' '}
                            {showIndividualErrors &&
                            showErrors[i] &&
                            errorMessages[i]
                              ? 'SHOW'
                              : 'HIDE'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h6>Global Error Logic:</h6>
                    <div style={{ fontSize: '12px' }}>
                      <div>
                        showGlobalError:{' '}
                        <code>{showGlobalError.toString()}</code>
                      </div>
                      <div>
                        showError: <code>{showError.toString()}</code>
                      </div>
                      <div>
                        errorMessage:{' '}
                        <code>{errorMessage ? 'exists' : 'null'}</code>
                      </div>
                      <div
                        style={{
                          fontWeight: 'bold',
                          color:
                            showGlobalError && showError && errorMessage
                              ? 'green'
                              : 'red',
                        }}
                      >
                        Result:{' '}
                        {showGlobalError && showError && errorMessage
                          ? 'SHOW'
                          : 'HIDE'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      },
    },
    required: ['conditionalGroup'],
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

export const AdvancedErrorDisplayPatterns = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        errorMessages: {
          required: 'Email is required',
          format: 'Please enter a valid email address',
        },
      },
      password: {
        type: 'string',
        minLength: 8,
        errorMessages: {
          required: 'Password is required',
          minLength: 'Password must be at least {limit} characters',
        },
      },
      confirmPassword: {
        type: 'string',
        minLength: 8,
        errorMessages: {
          required: 'Please confirm your password',
          minLength: 'Confirmation must be at least {limit} characters',
        },
      },
    },
    virtual: {
      registrationForm: {
        fields: ['email', 'password', 'confirmPassword'],
        FormType: ({ node, value, onChange }) => {
          const {
            errorMatrix,
            errorMessages,
            errorMessage,
            showError,
            showErrors,
          } = useChildNodeErrors(node);

          const handleFieldChange = (index: number, newValue: any) => {
            const newValues = [...(value || [])];
            newValues[index] = newValue;
            onChange(newValues);
          };

          const hasAnyErrors = errorMessages.some((msg) => msg);
          const visibleErrorCount = showErrors.filter(
            (show, i) => show && errorMessages[i],
          ).length;

          return (
            <div>
              <div
                style={{
                  border: '2px solid #4caf50',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  backgroundColor: '#f1f8e9',
                }}
              >
                <h4>🚀 Advanced Error Display Patterns</h4>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  실제 사용 사례를 기반으로 한 고급 에러 표시 패턴을
                  테스트합니다. 다양한 에러 표시 방식과 상태 조합을 확인할 수
                  있습니다.
                </p>
              </div>

              {/* Error Summary Bar */}
              <div
                style={{
                  backgroundColor: hasAnyErrors ? '#ffebee' : '#e8f5e8',
                  border: `1px solid ${hasAnyErrors ? '#f44336' : '#4caf50'}`,
                  borderRadius: '4px',
                  padding: '10px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>Form Status:</strong>{' '}
                  <span style={{ color: hasAnyErrors ? '#f44336' : '#4caf50' }}>
                    {hasAnyErrors ? '❌ Has Errors' : '✅ Valid'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Visible Errors: {visibleErrorCount} /{' '}
                  {errorMessages.filter((msg) => msg).length}
                </div>
              </div>

              <div
                style={{ display: 'grid', gap: '20px', marginBottom: '20px' }}
              >
                {/* Email Field */}
                <div>
                  <label
                    style={{
                      fontWeight: 'bold',
                      display: 'block',
                      marginBottom: '5px',
                    }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={value?.[0] || ''}
                    onChange={(e) => handleFieldChange(0, e.target.value)}
                    placeholder="Enter your email"
                    style={{
                      padding: '12px',
                      border:
                        showErrors[0] && errorMessages[0]
                          ? '2px solid #f44336'
                          : '1px solid #ddd',
                      borderRadius: '6px',
                      width: '100%',
                      maxWidth: '400px',
                      fontSize: '14px',
                    }}
                  />
                  {showErrors[0] && errorMessages[0] && (
                    <div
                      style={{
                        color: '#f44336',
                        fontSize: '12px',
                        marginTop: '5px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ marginRight: '5px' }}>⚠️</span>
                      {errorMessages[0]}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    style={{
                      fontWeight: 'bold',
                      display: 'block',
                      marginBottom: '5px',
                    }}
                  >
                    Password *
                  </label>
                  <input
                    type="password"
                    value={value?.[1] || ''}
                    onChange={(e) => handleFieldChange(1, e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      padding: '12px',
                      border:
                        showErrors[1] && errorMessages[1]
                          ? '2px solid #f44336'
                          : '1px solid #ddd',
                      borderRadius: '6px',
                      width: '100%',
                      maxWidth: '400px',
                      fontSize: '14px',
                    }}
                  />
                  {showErrors[1] && errorMessages[1] && (
                    <div
                      style={{
                        color: '#f44336',
                        fontSize: '12px',
                        marginTop: '5px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ marginRight: '5px' }}>⚠️</span>
                      {errorMessages[1]}
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    style={{
                      fontWeight: 'bold',
                      display: 'block',
                      marginBottom: '5px',
                    }}
                  >
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={value?.[2] || ''}
                    onChange={(e) => handleFieldChange(2, e.target.value)}
                    placeholder="Confirm your password"
                    style={{
                      padding: '12px',
                      border:
                        showErrors[2] && errorMessages[2]
                          ? '2px solid #f44336'
                          : '1px solid #ddd',
                      borderRadius: '6px',
                      width: '100%',
                      maxWidth: '400px',
                      fontSize: '14px',
                    }}
                  />
                  {showErrors[2] && errorMessages[2] && (
                    <div
                      style={{
                        color: '#f44336',
                        fontSize: '12px',
                        marginTop: '5px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ marginRight: '5px' }}>⚠️</span>
                      {errorMessages[2]}
                    </div>
                  )}
                </div>
              </div>

              {/* Global Error Message */}
              {showError && errorMessage && (
                <div
                  style={{
                    backgroundColor: '#ffebee',
                    border: '1px solid #f44336',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ marginRight: '8px', fontSize: '16px' }}>
                    🚫
                  </span>
                  <div>
                    <strong>Form Validation Error:</strong>
                    <div style={{ marginTop: '2px', fontSize: '14px' }}>
                      {errorMessage}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                disabled={hasAnyErrors}
                style={{
                  padding: '12px 24px',
                  backgroundColor: hasAnyErrors ? '#ccc' : '#1976d2',
                  color: hasAnyErrors ? '#666' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: hasAnyErrors ? 'not-allowed' : 'pointer',
                  marginBottom: '20px',
                }}
              >
                {hasAnyErrors ? '❌ Please fix errors' : '✅ Register'}
              </button>

              {/* Advanced Debug Panel */}
              <details style={{ marginTop: '20px' }}>
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  🔧 Advanced Debug Information
                </summary>
                <div
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    padding: '15px',
                    marginTop: '10px',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '15px',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <h6>Show States:</h6>
                      <div>
                        Global showError:{' '}
                        <strong>{showError ? 'TRUE' : 'FALSE'}</strong>
                      </div>
                      {showErrors.map((show, i) => (
                        <div key={i}>
                          Field {i + 1} showErrors[{i}]:{' '}
                          <strong>{show ? 'TRUE' : 'FALSE'}</strong>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h6>Error Counts:</h6>
                      <div>
                        Total Fields: <strong>{errorMessages.length}</strong>
                      </div>
                      <div>
                        With Errors:{' '}
                        <strong>
                          {errorMessages.filter((msg) => msg).length}
                        </strong>
                      </div>
                      <div>
                        Visible Errors: <strong>{visibleErrorCount}</strong>
                      </div>
                    </div>

                    <div>
                      <h6>Form State:</h6>
                      <div>
                        Has Any Errors:{' '}
                        <strong>{hasAnyErrors ? 'YES' : 'NO'}</strong>
                      </div>
                      <div>
                        Submit Enabled:{' '}
                        <strong>{hasAnyErrors ? 'NO' : 'YES'}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '15px' }}>
                    <h6>Raw Error Data:</h6>
                    <pre
                      style={{
                        fontSize: '10px',
                        backgroundColor: '#fff',
                        padding: '8px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '200px',
                      }}
                    >
                      {JSON.stringify(
                        { errorMessages, errorMatrix, showErrors, showError },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </div>
              </details>
            </div>
          );
        },
      },
    },
    required: ['registrationForm'],
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

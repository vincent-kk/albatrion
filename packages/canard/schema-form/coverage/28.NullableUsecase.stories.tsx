import { useMemo, useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type FormTypeInputMap,
  type FormTypeInputProps,
  type JsonSchema,
  type JsonSchemaError,
  SetValueOption,
} from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/28. Nullable Usecase',
};

export const FormRefHandleWithNullableFields = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Name (nullable)',
        nullable: true,
      },
      age: {
        type: 'number',
        title: 'Age (nullable)',
        nullable: true,
      },
      isActive: {
        type: 'boolean',
        title: 'Active Status (nullable)',
        nullable: true,
      },
      profile: {
        type: 'object',
        title: 'Profile (nullable)',
        nullable: true,
        properties: {
          bio: { type: 'string', nullable: true },
          avatar: { type: 'string', nullable: true },
        },
      },
    },
  } satisfies JsonSchema;

  const defaultValue = useRef({
    name: 'John Doe',
    age: null,
    isActive: true,
    profile: null,
  });

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() =>
            formHandle.current?.setValue(
              { name: 'Jane Smith' },
              SetValueOption.Merge,
            )
          }
        >
          Set Name
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({ name: null }, SetValueOption.Merge)
          }
        >
          Set Name to null
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({ age: 25 }, SetValueOption.Merge)
          }
        >
          Set Age to 25
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({ age: null }, SetValueOption.Merge)
          }
        >
          Set Age to null
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue(
              { isActive: false },
              SetValueOption.Merge,
            )
          }
        >
          Set Active to false
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue(
              { isActive: null },
              SetValueOption.Merge,
            )
          }
        >
          Set Active to null
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              profile: { bio: 'Developer', avatar: 'avatar.jpg' },
            })
          }
        >
          Set Profile
        </button>
        <button onClick={() => formHandle.current?.setValue({ profile: null })}>
          Set Profile to null
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset</button>
      </div>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form
          ref={formHandle}
          jsonSchema={schema}
          defaultValue={defaultValue.current}
          onChange={setValue}
        />
      </StoryLayout>
    </div>
  );
};

export const FormRefWithNullableArrayAndObject = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      tags: {
        type: 'array',
        title: 'Tags (nullable)',
        nullable: true,
        items: { type: 'string' },
      },
      metadata: {
        type: 'object',
        title: 'Metadata (nullable)',
        nullable: true,
        properties: {
          created: { type: 'string', format: 'date-time' },
          updated: { type: 'string', format: 'date-time' },
        },
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() =>
            formHandle.current?.setValue({
              tags: ['react', 'typescript', 'storybook'],
            })
          }
        >
          Set Tags Array
        </button>
        <button onClick={() => formHandle.current?.setValue({ tags: null })}>
          Set Tags to null
        </button>
        <button
          onClick={() => {
            const node = formHandle.current?.node?.find('tags');
            if (node?.type === 'array') {
              node.setValue(['new', 'tag']);
            }
          }}
        >
          Set Tags via Node
        </button>
        <button
          onClick={() => {
            const node = formHandle.current?.node?.find('tags');
            if (node?.type === 'array') {
              node.setValue(null);
            }
          }}
        >
          Set Tags null via Node
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              metadata: {
                created: '2024-01-01T00:00:00Z',
                updated: '2024-01-02T00:00:00Z',
              },
            })
          }
        >
          Set Metadata Object
        </button>
        <button
          onClick={() => formHandle.current?.setValue({ metadata: null })}
        >
          Set Metadata to null
        </button>
        <button
          onClick={() => {
            const node = formHandle.current?.node?.find('metadata');
            if (node?.type === 'object') {
              node.setValue({ created: '2024-03-01T00:00:00Z' });
            }
          }}
        >
          Set Metadata via Node
        </button>
        <button
          onClick={() => {
            const node = formHandle.current?.node?.find('metadata');
            if (node?.type === 'object') {
              node.setValue(null);
            }
          }}
        >
          Set Metadata null via Node
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset</button>
      </div>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form ref={formHandle} jsonSchema={schema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const FormRefWithCustomNullableInputs = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      customString: {
        type: 'string',
        title: 'Custom String Input',
        nullable: true,
      },
      customObject: {
        type: 'object',
        title: 'Custom Object Input',
        nullable: true,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },
  } satisfies JsonSchema;

  const formTypeMap = useMemo<FormTypeInputMap>(() => {
    return {
      '#/customString': ({
        onChange,
        value,
        defaultValue,
      }: FormTypeInputProps<string | null | undefined>) => {
        return (
          <div
            style={{
              border: '1px solid #ccc',
              padding: '8px',
              margin: '4px 0',
            }}
          >
            <div>
              Custom String Input (Current:{' '}
              {value === null ? 'null' : value || 'undefined'})
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <button onClick={() => onChange('Custom Value')}>
                Set Value
              </button>
              <button onClick={() => onChange('Another Value')}>
                Set Another
              </button>
              <button onClick={() => onChange(null)}>Set null</button>
              <button onClick={() => onChange(undefined)}>Set undefined</button>
              <button onClick={() => onChange('')}>Set Empty String</button>
            </div>
            <input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Type custom value"
              style={{ marginTop: '4px', width: '200px' }}
            />
          </div>
        );
      },
      '#/customObject': ({
        onChange,
        value,
        node,
      }: FormTypeInputProps<
        | {
            title?: string;
            description?: string;
          }
        | null
        | undefined
      >) => {
        return (
          <div
            style={{
              border: '1px solid #ccc',
              padding: '8px',
              margin: '4px 0',
            }}
          >
            <div>
              Custom Object Input (Current: {value === null ? 'null' : 'object'}
              )
            </div>
            <div
              style={{
                display: 'flex',
                gap: '4px',
                marginTop: '4px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() =>
                  onChange({
                    title: 'Sample Title',
                    description: 'Sample Description',
                  })
                }
              >
                Set Object
              </button>
              <button
                onClick={() =>
                  onChange({ title: 'Updated Title' }, SetValueOption.Merge)
                }
              >
                Merge Title
              </button>
              <button onClick={() => onChange(null)}>Set null</button>
              <button onClick={() => onChange(undefined)}>Set undefined</button>
              <button onClick={() => onChange({}, SetValueOption.Overwrite)}>
                Set Empty Object
              </button>
              <button onClick={() => node.setValue(null)}>Node Set null</button>
              <button onClick={() => node.setValue({ title: 'Via Node' })}>
                Node Set Value
              </button>
            </div>
            {value && typeof value === 'object' && (
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  background: '#f5f5f5',
                  padding: '4px',
                }}
              >
                <pre>{JSON.stringify(value, null, 2)}</pre>
              </div>
            )}
          </div>
        );
      },
    };
  }, []);

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() =>
            formHandle.current?.setValue({
              customString: 'FormRef Set Value',
              customObject: {
                title: 'FormRef Title',
                description: 'FormRef Description',
              },
            })
          }
        >
          Set Both via FormRef
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              customString: null,
              customObject: null,
            })
          }
        >
          Set Both to null via FormRef
        </button>
        <button
          onClick={() => {
            const stringNode = formHandle.current?.node?.find('customString');
            const objectNode = formHandle.current?.node?.find('customObject');
            if (stringNode?.type === 'string') {
              stringNode.setValue('Node Set String');
            }
            if (objectNode?.type === 'object') {
              objectNode.setValue({ title: 'Node Set Title' });
            }
          }}
        >
          Set Both via Nodes
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset</button>
      </div>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form
          ref={formHandle}
          jsonSchema={schema}
          formTypeInputMap={formTypeMap}
          onChange={setValue}
        />
      </StoryLayout>
    </div>
  );
};

export const FormRefWithNullableConditionalFields = () => {
  const [value, setValue] = useState({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  const schema = {
    type: 'object',
    properties: {
      hasAddress: {
        type: 'boolean',
        title: 'Has Address?',
        default: false,
      },
      contactType: {
        type: 'string',
        enum: ['email', 'phone', 'none'],
        title: 'Contact Type',
        default: 'none',
      },
      address: {
        type: 'object',
        title: 'Address (nullable when has address)',
        nullable: true,
        properties: {
          street: { type: 'string', nullable: true },
          city: { type: 'string', nullable: true },
        },
      },
    },
    if: {
      properties: { hasAddress: { const: true } },
    },
    then: {
      required: ['address'],
    },
    oneOf: [
      {
        computed: {
          if: "#/contactType === 'email'",
        },
        properties: {
          email: {
            type: 'string',
            format: 'email',
            title: 'Email (nullable in email mode)',
            nullable: true,
          },
        },
      },
      {
        computed: {
          if: "#/contactType === 'phone'",
        },
        properties: {
          phone: {
            type: 'string',
            title: 'Phone (nullable in phone mode)',
            nullable: true,
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() =>
            formHandle.current?.setValue(
              { hasAddress: true },
              SetValueOption.Merge,
            )
          }
        >
          Enable Address
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue(
              { hasAddress: false },
              SetValueOption.Merge,
            )
          }
        >
          Disable Address
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              hasAddress: true,
              address: { street: 'Main St', city: 'NYC' },
            })
          }
        >
          Set Address
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              hasAddress: true,
              address: null,
            })
          }
        >
          Set Address to null
        </button>
        <button
          onClick={() => formHandle.current?.setValue({ contactType: 'email' })}
        >
          Switch to Email
        </button>
        <button
          onClick={() => formHandle.current?.setValue({ contactType: 'phone' })}
        >
          Switch to Phone
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              contactType: 'email',
              email: 'test@example.com',
            })
          }
        >
          Set Email
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              contactType: 'email',
              email: null,
            })
          }
        >
          Set Email to null
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              contactType: 'phone',
              phone: '+1234567890',
            })
          }
        >
          Set Phone
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              contactType: 'phone',
              phone: null,
            })
          }
        >
          Set Phone to null
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset</button>
      </div>
      <StoryLayout jsonSchema={schema} value={value} errors={errors}>
        <Form
          ref={formHandle}
          jsonSchema={schema}
          onChange={setValue}
          onValidate={setErrors}
        />
      </StoryLayout>
    </div>
  );
};

export const FormRefWithNullableNestedStructure = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      user: {
        type: 'object',
        nullable: true,
        properties: {
          name: { type: 'string', nullable: true },
          preferences: {
            type: 'object',
            nullable: true,
            properties: {
              theme: { type: 'string', nullable: true },
              notifications: {
                type: 'array',
                nullable: true,
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    enabled: { type: 'boolean', nullable: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() =>
            formHandle.current?.setValue({
              user: {
                name: 'John Doe',
                preferences: {
                  theme: 'dark',
                  notifications: [
                    { type: 'email', enabled: true },
                    { type: 'sms', enabled: null },
                  ],
                },
              },
            })
          }
        >
          Set Full Structure
        </button>
        <button onClick={() => formHandle.current?.setValue({ user: null })}>
          Set User to null
        </button>
        <button
          onClick={() => {
            const node = formHandle.current?.node?.find('user');
            if (node?.type === 'object') {
              node.setValue({ name: 'Jane Doe', preferences: null });
            }
          }}
        >
          Set User, null Preferences via Node
        </button>
        <button
          onClick={() => {
            const node = formHandle.current?.node?.find('user/preferences');
            if (node?.type === 'object') {
              node.setValue({ theme: 'light', notifications: null });
            }
          }}
        >
          Set Preferences, null Notifications via Node
        </button>
        <button
          onClick={() => {
            const node = formHandle.current?.node?.find(
              'user/preferences/notifications',
            );
            if (node?.type === 'array') {
              node.setValue([{ type: 'push', enabled: false }]);
            }
          }}
        >
          Set Notifications Array via Node
        </button>
        <button
          onClick={() => {
            const node = formHandle.current?.node?.find(
              'user/preferences/notifications',
            );
            if (node?.type === 'array') {
              node.setValue(null);
            }
          }}
        >
          Set Notifications to null via Node
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset</button>
      </div>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form ref={formHandle} jsonSchema={schema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const FormRefWithNullHandling = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      nullField: {
        type: 'null',
        title: 'Always Null Field',
      },
      nullableString: {
        type: 'string',
        title: 'Nullable String',
        nullable: true,
      },
    },
  } satisfies JsonSchema;

  const defaultValue = useRef({
    nullField: null,
    nullableString: 'initial value',
    stringOrNull: null,
  });

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() =>
            formHandle.current?.setValue({
              nullableString: 'Updated String',
            })
          }
        >
          Set Nullable String
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              nullableString: null,
            })
          }
        >
          Set Nullable String to null
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              stringOrNull: 'OneOf String',
            })
          }
        >
          Set OneOf to String
        </button>
        <button
          onClick={() =>
            formHandle.current?.setValue({
              stringOrNull: null,
            })
          }
        >
          Set OneOf to null
        </button>
        <button
          onClick={() => {
            const node = formHandle.current?.node?.find('nullableString');
            if (node?.type === 'string') {
              node.setValue('Via Node');
            }
          }}
        >
          Set via Node
        </button>
        <button
          onClick={() => {
            const node = formHandle.current?.node?.find('nullableString');
            if (node?.type === 'string') {
              node.setValue(null);
            }
          }}
        >
          Set null via Node
        </button>
        <button onClick={() => formHandle.current?.reset()}>Reset</button>
      </div>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form
          ref={formHandle}
          jsonSchema={schema}
          defaultValue={defaultValue.current}
          onChange={setValue}
        />
      </StoryLayout>
    </div>
  );
};

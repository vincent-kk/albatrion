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

export const FormRefWithDeepConditionalAndOneOf = () => {
  const [value, setValue] = useState({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  const schema = {
    type: 'object',
    properties: {
      // Control fields
      userType: {
        type: 'string',
        enum: ['individual', 'company', 'none'],
        title: 'User Type',
        default: 'none',
      },
      accountTier: {
        type: 'string',
        enum: ['free', 'premium', 'enterprise'],
        title: 'Account Tier',
        default: 'free',
      },
      dataSelection: {
        type: 'string',
        enum: ['basic', 'extended', 'full'],
        title: 'Data Selection',
        default: 'basic',
      },

      // All properties pre-declared for individual path
      personalInfo: {
        type: 'object',
        title: 'Personal Information',
        nullable: true,
        computed: {
          active: "#/userType === 'individual'",
        },
        properties: {
          firstName: { type: 'string', nullable: true },
          lastName: { type: 'string', nullable: true },
          age: { type: 'number', nullable: true },
        },
      },

      // Premium features for individual
      premiumFeatures: {
        type: 'object',
        title: 'Premium Features',
        nullable: true,
        computed: {
          active: "#/userType === 'individual' && #/accountTier === 'premium'",
        },
        properties: {
          prioritySupport: { type: 'boolean', nullable: true },
          customTheme: { type: 'string', nullable: true },
        },
      },

      // Extended data for premium individuals
      extendedData: {
        type: 'object',
        title: 'Extended Data',
        nullable: true,
        computed: {
          active:
            "#/userType === 'individual' && #/accountTier === 'premium' && #/dataSelection === 'extended'",
        },
        properties: {
          interests: {
            type: 'array',
            nullable: true,
            items: { type: 'string' },
          },
          preferences: {
            type: 'object',
            nullable: true,
            properties: {
              notifications: { type: 'boolean', nullable: true },
              newsletter: { type: 'boolean', nullable: true },
            },
          },
        },
      },

      // Basic data for premium individuals with basic selection
      basicData: {
        type: 'object',
        title: 'Basic Data',
        nullable: true,
        computed: {
          active:
            "#/userType === 'individual' && #/accountTier === 'premium' && #/dataSelection !== 'extended'",
        },
        properties: {
          subscribed: { type: 'boolean', nullable: true },
        },
      },

      // Free features for individual
      freeFeatures: {
        type: 'object',
        title: 'Free Features',
        nullable: true,
        computed: {
          active: "#/userType === 'individual' && #/accountTier === 'free'",
        },
        properties: {
          adsEnabled: { type: 'boolean', default: true },
          limitedAccess: { type: 'boolean', default: true },
        },
      },

      // Company properties
      companyInfo: {
        type: 'object',
        title: 'Company Information',
        nullable: true,
        computed: {
          active: "#/userType === 'company'",
        },
        properties: {
          companyName: { type: 'string', nullable: true },
          taxId: { type: 'string', nullable: true },
          employeeCount: { type: 'number', nullable: true },
        },
      },

      // Enterprise features for company
      enterpriseFeatures: {
        type: 'object',
        title: 'Enterprise Features',
        nullable: true,
        computed: {
          active: "#/userType === 'company' && #/accountTier === 'enterprise'",
        },
        properties: {
          dedicatedManager: { type: 'boolean', nullable: true },
          sla: { type: 'string', nullable: true },
          customIntegrations: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                enabled: { type: 'boolean', nullable: true },
              },
            },
          },
        },
      },

      // Business features for premium company
      businessFeatures: {
        type: 'object',
        title: 'Business Features',
        nullable: true,
        computed: {
          active: "#/userType === 'company' && #/accountTier === 'premium'",
        },
        properties: {
          apiAccess: { type: 'boolean', nullable: true },
          teamSize: { type: 'number', nullable: true },
        },
      },

      // Trial features for free company
      trialFeatures: {
        type: 'object',
        title: 'Trial Features',
        nullable: true,
        computed: {
          active: "#/userType === 'company' && #/accountTier === 'free'",
        },
        properties: {
          trialDaysLeft: { type: 'number', nullable: true },
          upgradePrompt: { type: 'boolean', default: true },
        },
      },

      // Basic info for none type
      basicInfo: {
        type: 'object',
        title: 'Basic Information',
        nullable: true,
        computed: {
          active: "#/userType === 'none'",
        },
        properties: {
          email: { type: 'string', format: 'email', nullable: true },
          subscribeNewsletter: { type: 'boolean', nullable: true },
        },
      },
    },

    // Standard if-then-else for required fields
    if: {
      properties: {
        userType: { const: 'individual' },
        accountTier: { const: 'premium' },
      },
    },
    then: {
      required: ['personalInfo'],
    },
    else: {
      if: {
        properties: { userType: { const: 'company' } },
      },
      then: {
        required: ['companyInfo'],
      },
    },

    // OneOf for additional conditional logic
    oneOf: [
      {
        computed: {
          if: "#/userType === 'individual' && #/accountTier === 'premium' && #/dataSelection === 'full'",
        },
        properties: {
          fullAccessData: {
            type: 'object',
            title: 'Full Access Data',
            nullable: true,
            properties: {
              analytics: { type: 'boolean', nullable: true },
              exportOptions: {
                type: 'array',
                nullable: true,
                items: { type: 'string', enum: ['pdf', 'csv', 'json'] },
              },
            },
          },
        },
      },
      {
        computed: {
          if: "#/userType === 'company' && #/accountTier === 'enterprise' && #/dataSelection === 'full'",
        },
        properties: {
          advancedAnalytics: {
            type: 'object',
            title: 'Advanced Analytics',
            nullable: true,
            properties: {
              dashboards: { type: 'number', nullable: true },
              customReports: { type: 'boolean', nullable: true },
              aiInsights: { type: 'boolean', nullable: true },
            },
          },
        },
      },
    ],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  const defaultValue = useRef({
    userType: 'individual',
    accountTier: 'premium',
    dataSelection: 'extended',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
    },
    premiumFeatures: {
      prioritySupport: true,
      customTheme: 'dark',
    },
    extendedData: {
      interests: ['tech', 'science'],
      preferences: {
        notifications: true,
        newsletter: false,
      },
    },
  });

  return (
    <div>
      <h3>Deep Conditional with If-Then-Else and OneOf Testing</h3>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* User Type Switching - Tests data removal on condition change */}
        <button
          onClick={() => {
            console.log('Switching to Individual - should keep personal data');
            formHandle.current?.setValue(
              { userType: 'individual' },
              SetValueOption.Merge,
            );
          }}
        >
          Switch to Individual
        </button>
        <button
          onClick={() => {
            console.log(
              'Switching to Company - should remove personal data, add company data',
            );
            formHandle.current?.setValue(
              { userType: 'company' },
              SetValueOption.Merge,
            );
          }}
        >
          Switch to Company
        </button>
        <button
          onClick={() => {
            console.log(
              'Switching to None - should remove both personal and company data',
            );
            formHandle.current?.setValue(
              { userType: 'none' },
              SetValueOption.Merge,
            );
          }}
        >
          Switch to None
        </button>

        {/* Account Tier Changes - Tests nested condition data removal */}
        <button
          onClick={() => {
            console.log(
              'Changing to Free tier - should remove premium/enterprise features',
            );
            formHandle.current?.setValue(
              { accountTier: 'free' },
              SetValueOption.Merge,
            );
          }}
        >
          Change to Free Tier
        </button>
        <button
          onClick={() => {
            console.log(
              'Changing to Premium tier - should adjust available features',
            );
            formHandle.current?.setValue(
              { accountTier: 'premium' },
              SetValueOption.Merge,
            );
          }}
        >
          Change to Premium Tier
        </button>
        <button
          onClick={() => {
            console.log(
              'Changing to Enterprise tier - should add enterprise features',
            );
            formHandle.current?.setValue(
              { accountTier: 'enterprise' },
              SetValueOption.Merge,
            );
          }}
        >
          Change to Enterprise Tier
        </button>

        {/* Data Selection Changes - Tests deeply nested condition changes */}
        <button
          onClick={() => {
            console.log('Changing to Basic data - should remove extended data');
            formHandle.current?.setValue(
              { dataSelection: 'basic' },
              SetValueOption.Merge,
            );
          }}
        >
          Basic Data Selection
        </button>
        <button
          onClick={() => {
            console.log(
              'Changing to Extended data - should add extended fields',
            );
            formHandle.current?.setValue(
              { dataSelection: 'extended' },
              SetValueOption.Merge,
            );
          }}
        >
          Extended Data Selection
        </button>
        <button
          onClick={() => {
            console.log(
              'Changing to Full data - should maximize available fields',
            );
            formHandle.current?.setValue(
              { dataSelection: 'full' },
              SetValueOption.Merge,
            );
          }}
        >
          Full Data Selection
        </button>

        {/* Complex Combined Changes - Tests multiple condition changes */}
        <button
          onClick={() => {
            console.log('Complex change: Individual + Premium + Extended');
            formHandle.current?.setValue({
              userType: 'individual',
              accountTier: 'premium',
              dataSelection: 'extended',
              personalInfo: {
                firstName: 'Alice',
                lastName: 'Smith',
                age: 25,
              },
              premiumFeatures: {
                prioritySupport: false,
                customTheme: 'light',
              },
              extendedData: {
                interests: ['art', 'music'],
                preferences: {
                  notifications: false,
                  newsletter: true,
                },
              },
            });
          }}
        >
          Set Individual+Premium+Extended
        </button>
        <button
          onClick={() => {
            console.log('Complex change: Company + Enterprise');
            formHandle.current?.setValue({
              userType: 'company',
              accountTier: 'enterprise',
              companyInfo: {
                companyName: 'Tech Corp',
                taxId: '12-3456789',
                employeeCount: 500,
              },
              enterpriseFeatures: {
                dedicatedManager: true,
                sla: '99.99%',
                customIntegrations: [
                  { name: 'Salesforce', enabled: true },
                  { name: 'Slack', enabled: false },
                ],
              },
            });
          }}
        >
          Set Company+Enterprise
        </button>
        <button
          onClick={() => {
            console.log('Complex change: Individual + Premium + Extended');
            formHandle.current?.setValue({
              userType: 'individual',
              accountTier: 'premium',
              dataSelection: 'extended',
              personalInfo: {
                firstName: 'Alice',
                lastName: 'Smith',
                age: 25,
              },
              premiumFeatures: {
                prioritySupport: false,
                customTheme: 'light',
              },
              companyInfo: {
                companyName: 'Tech Corp',
                taxId: '12-3456789',
                employeeCount: 500,
              },
              extendedData: {
                interests: ['art', 'music'],
                preferences: {
                  notifications: false,
                  newsletter: true,
                },
              },
            });
          }}
        >
          Set Individual+Premium+Extended+Company(will be removed)
        </button>

        {/* Null Setting Tests */}
        <button
          onClick={() => {
            console.log('Setting personalInfo to null');
            formHandle.current?.setValue(
              { personalInfo: null },
              SetValueOption.Merge,
            );
          }}
        >
          Set PersonalInfo to null
        </button>
        <button
          onClick={() => {
            console.log('Setting companyInfo to null');
            formHandle.current?.setValue(
              { companyInfo: null },
              SetValueOption.Merge,
            );
          }}
        >
          Set CompanyInfo to null
        </button>
        <button
          onClick={() => {
            console.log('Setting all nested objects to null');
            formHandle.current?.setValue({
              personalInfo: null,
              companyInfo: null,
              premiumFeatures: null,
              enterpriseFeatures: null,
              extendedData: null,
            });
          }}
        >
          Set All Nested to null
        </button>

        {/* Edge Case Tests */}
        <button
          onClick={() => {
            console.log('Testing rapid condition changes');
            formHandle.current?.setValue(
              { userType: 'company' },
              SetValueOption.Merge,
            );
            setTimeout(() => {
              formHandle.current?.setValue(
                { userType: 'individual' },
                SetValueOption.Merge,
              );
            }, 100);
            setTimeout(() => {
              formHandle.current?.setValue(
                { accountTier: 'enterprise' },
                SetValueOption.Merge,
              );
            }, 200);
          }}
        >
          Rapid Condition Changes
        </button>

        <button onClick={() => formHandle.current?.reset()}>
          Reset to Default
        </button>
        <button
          onClick={() => {
            console.log('Current form value:', formHandle.current?.getValue());
          }}
        >
          Log Current Value
        </button>
      </div>
      <StoryLayout jsonSchema={schema} value={value} errors={errors}>
        <Form
          ref={formHandle}
          jsonSchema={schema}
          defaultValue={defaultValue.current}
          onChange={setValue}
          onValidate={setErrors}
        />
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

export const ConditionalSchema = () => {
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
        '&active': '../category === "game"',
      },
      releaseDate: {
        type: 'string',
        format: 'date',
        '&active': '../category === "movie"',
      },
      numOfPlayers: { type: 'number' },
      price: {
        type: 'number',
        minimum: 50,
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            category: 'movie',
            title: 'ABC',
            openingDate: '1999-01-01',
            releaseDate: '2020-02-01',
            numOfPlayers: 10,
            price: 100,
          })
        }
      >
        Set Movie
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            category: 'game',
            title: 'DEF',
            openingDate: '2030-02-01',
            releaseDate: '2030-03-01',
            numOfPlayers: 20,
            price: 200,
          })
        }
      >
        Set Game
      </button>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

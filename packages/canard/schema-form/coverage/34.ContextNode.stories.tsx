import { useState } from 'react';

import { Form, type JsonSchema } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/34. Context Node',
};

/**
 * Mode-based form control using @.mode context
 * - view mode: fields become readOnly
 * - edit mode: fields become editable
 */
export const ModeBasedControl = () => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [value, setValue] = useState<Record<string, unknown>>();

  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: 'Name',
        FormTypeInputProps: {
          placeholder: 'Enter your name',
        },
        computed: {
          readOnly: '@.mode === "view"',
        },
      },
      email: {
        type: 'string',
        title: 'Email',
        FormTypeInputProps: {
          placeholder: 'Enter your email',
        },
        computed: {
          disabled: '@.mode === "view"',
        },
      },
      bio: {
        type: 'string',
        title: 'Bio',
        FormTypeInputProps: {
          placeholder: 'Enter your bio',
        },
        computed: {
          readOnly: '@.mode === "view"',
          disabled: '@.mode === "view"',
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() => setMode((m) => (m === 'view' ? 'edit' : 'view'))}
          style={{
            padding: '8px 16px',
            backgroundColor: mode === 'edit' ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Current Mode: {mode.toUpperCase()} (Click to toggle)
        </button>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form jsonSchema={jsonSchema} onChange={setValue} context={{ mode }} />
      </StoryLayout>
    </div>
  );
};

/**
 * UserRole-based visibility control using @.userRole context
 * - admin: can see all fields
 * - user: cannot see admin-only fields
 * - guest: most fields are hidden or disabled
 */
export const UserRoleBasedVisibility = () => {
  const [userRole, setUserRole] = useState<'admin' | 'user' | 'guest'>('user');
  const [value, setValue] = useState<Record<string, unknown>>();

  const jsonSchema = {
    type: 'object',
    properties: {
      publicField: {
        type: 'string',
        title: 'Public Field',
        FormTypeInputProps: {
          placeholder: 'Visible to everyone',
        },
      },
      userField: {
        type: 'string',
        title: 'User Field',
        FormTypeInputProps: {
          placeholder: 'Visible to users and admins',
        },
        computed: {
          active: '@.userRole !== "guest"',
        },
      },
      adminField: {
        type: 'string',
        title: 'Admin Field',
        FormTypeInputProps: {
          placeholder: 'Admin only',
        },
        computed: {
          active: '@.userRole === "admin"',
        },
      },
      sensitiveData: {
        type: 'string',
        title: 'Sensitive Data',
        FormTypeInputProps: {
          placeholder: 'Admins can edit, users can only view',
        },
        computed: {
          active: '@.userRole !== "guest"',
          readOnly: '@.userRole !== "admin"',
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10, display: 'flex', gap: 8 }}>
        {(['guest', 'user', 'admin'] as const).map((role) => (
          <button
            key={role}
            onClick={() => setUserRole(role)}
            style={{
              padding: '8px 16px',
              backgroundColor: userRole === role ? '#4CAF50' : '#e0e0e0',
              color: userRole === role ? 'white' : 'black',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {role.toUpperCase()}
          </button>
        ))}
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form
          jsonSchema={jsonSchema}
          onChange={setValue}
          context={{ userRole }}
        />
      </StoryLayout>
    </div>
  );
};

/**
 * Permissions object access using @.permissions context
 * - Demonstrates nested object property access
 * - Uses optional chaining patterns
 */
export const PermissionsObject = () => {
  const [permissions, setPermissions] = useState({
    canEdit: true,
    canDelete: false,
    canPublish: false,
  });
  const [value, setValue] = useState<Record<string, unknown>>();

  const jsonSchema = {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        title: 'Title',
        FormTypeInputProps: {
          placeholder: 'Document title',
        },
        computed: {
          readOnly: '(@).permissions?.canEdit !== true',
        },
      },
      content: {
        type: 'string',
        title: 'Content',
        FormTypeInputProps: {
          placeholder: 'Document content',
        },
        computed: {
          readOnly: '(@).permissions?.canEdit !== true',
        },
      },
      deleteButton: {
        type: 'boolean',
        title: 'Mark for Deletion',
        computed: {
          visible: '(@).permissions?.canDelete === true',
        },
      },
      publishStatus: {
        type: 'string',
        title: 'Publish Status',
        enum: ['draft', 'pending', 'published'],
        computed: {
          visible: '(@).permissions?.canPublish === true',
        },
      },
    },
  } satisfies JsonSchema;

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Permissions:</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(Object.keys(permissions) as Array<keyof typeof permissions>).map(
            (key) => (
              <button
                key={key}
                onClick={() => togglePermission(key)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: permissions[key] ? '#4CAF50' : '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                {key}: {permissions[key] ? 'ON' : 'OFF'}
              </button>
            ),
          )}
        </div>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form
          jsonSchema={jsonSchema}
          onChange={setValue}
          context={{ permissions }}
        />
      </StoryLayout>
    </div>
  );
};

/**
 * Combined conditions using both context (@) and form field references
 * - Shows how to combine context checks with form value checks
 */
export const CombinedConditions = () => {
  const [mode, setMode] = useState<'view' | 'edit'>('edit');
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [value, setValue] = useState<Record<string, unknown>>({
    status: 'draft',
  });

  const jsonSchema = {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        title: 'Status',
        enum: ['draft', 'published', 'archived'],
      },
      content: {
        type: 'string',
        title: 'Content',
        FormTypeInputProps: {
          placeholder: 'Only editable when: mode=edit AND status=draft',
        },
        computed: {
          // Context condition (mode) AND Form field condition (status)
          readOnly: '@.mode === "view" || /status === "published"',
        },
      },
      adminNotes: {
        type: 'string',
        title: 'Admin Notes',
        FormTypeInputProps: {
          placeholder: 'Only visible to admins, editable in edit mode',
        },
        computed: {
          visible: '@.userRole === "admin"',
          readOnly: '@.mode === "view"',
        },
      },
      archiveReason: {
        type: 'string',
        title: 'Archive Reason',
        FormTypeInputProps: {
          placeholder: 'Only shown when status is archived',
        },
        computed: {
          visible: '/status === "archived"',
          readOnly: '@.mode === "view"',
        },
      },
      publishDate: {
        type: 'string',
        title: 'Publish Date',
        FormTypeInputProps: {
          placeholder: 'Shown for published or archived status',
        },
        computed: {
          visible: '/status !== "draft"',
          disabled: '@.userRole !== "admin" || @.mode === "view"',
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10, display: 'flex', gap: 16 }}>
        <div>
          <div style={{ marginBottom: 4, fontWeight: 'bold' }}>Mode:</div>
          <button
            onClick={() => setMode((m) => (m === 'view' ? 'edit' : 'view'))}
            style={{
              padding: '8px 16px',
              backgroundColor: mode === 'edit' ? '#4CAF50' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {mode.toUpperCase()}
          </button>
        </div>
        <div>
          <div style={{ marginBottom: 4, fontWeight: 'bold' }}>Role:</div>
          <button
            onClick={() =>
              setUserRole((r) => (r === 'admin' ? 'user' : 'admin'))
            }
            style={{
              padding: '8px 16px',
              backgroundColor: userRole === 'admin' ? '#9C27B0' : '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {userRole.toUpperCase()}
          </button>
        </div>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form
          jsonSchema={jsonSchema}
          defaultValue={{ status: 'draft' }}
          onChange={setValue}
          context={{ mode, userRole }}
        />
      </StoryLayout>
    </div>
  );
};

/**
 * Dynamic context change demonstration
 * - Shows real-time updates when context values change
 * - Multiple context properties changing together
 */
export const DynamicContextChange = () => {
  const [context, setContext] = useState({
    theme: 'light' as 'light' | 'dark',
    language: 'en' as 'en' | 'ko' | 'ja',
    isAuthenticated: true,
    premiumUser: false,
  });
  const [value, setValue] = useState<Record<string, unknown>>();

  const jsonSchema = {
    type: 'object',
    properties: {
      welcomeMessage: {
        type: 'string',
        title: 'Welcome Message',
        FormTypeInputProps: {
          placeholder: 'Only shown when authenticated',
        },
        computed: {
          visible: '@.isAuthenticated === true',
        },
      },
      premiumFeature: {
        type: 'string',
        title: 'Premium Feature',
        FormTypeInputProps: {
          placeholder: 'Only for premium users',
        },
        computed: {
          visible: '@.premiumUser === true',
          disabled: '@.isAuthenticated !== true',
        },
      },
      languageSpecific: {
        type: 'string',
        title: 'Language Specific Field',
        FormTypeInputProps: {
          placeholder: 'Only shown for Korean language',
        },
        computed: {
          visible: '@.language === "ko"',
        },
      },
      themePreview: {
        type: 'string',
        title: 'Theme Preview',
        FormTypeInputProps: {
          placeholder: 'Changes based on theme',
        },
        computed: {
          readOnly: '@.theme === "dark"',
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          padding: 16,
          border: '1px solid #ddd',
          borderRadius: 8,
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: 12 }}>
          Context Controls:
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
          }}
        >
          <div>
            <div style={{ marginBottom: 4 }}>Theme:</div>
            <button
              onClick={() =>
                setContext((c) => ({
                  ...c,
                  theme: c.theme === 'light' ? 'dark' : 'light',
                }))
              }
              style={{
                padding: '8px 16px',
                backgroundColor: context.theme === 'dark' ? '#333' : '#fff',
                color: context.theme === 'dark' ? '#fff' : '#333',
                border: '1px solid #333',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {context.theme}
            </button>
          </div>

          <div>
            <div style={{ marginBottom: 4 }}>Language:</div>
            <select
              value={context.language}
              onChange={(e) =>
                setContext((c) => ({
                  ...c,
                  language: e.target.value as 'en' | 'ko' | 'ja',
                }))
              }
              style={{ padding: '8px 16px', borderRadius: 4 }}
            >
              <option value="en">English</option>
              <option value="ko">Korean</option>
              <option value="ja">Japanese</option>
            </select>
          </div>

          <div>
            <div style={{ marginBottom: 4 }}>Authenticated:</div>
            <button
              onClick={() =>
                setContext((c) => ({
                  ...c,
                  isAuthenticated: !c.isAuthenticated,
                }))
              }
              style={{
                padding: '8px 16px',
                backgroundColor: context.isAuthenticated
                  ? '#4CAF50'
                  : '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {context.isAuthenticated ? 'YES' : 'NO'}
            </button>
          </div>

          <div>
            <div style={{ marginBottom: 4 }}>Premium User:</div>
            <button
              onClick={() =>
                setContext((c) => ({ ...c, premiumUser: !c.premiumUser }))
              }
              style={{
                padding: '8px 16px',
                backgroundColor: context.premiumUser ? '#FFD700' : '#9e9e9e',
                color: context.premiumUser ? '#333' : 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {context.premiumUser ? 'PREMIUM' : 'BASIC'}
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          marginBottom: 8,
          padding: 8,
          backgroundColor: '#f5f5f5',
          borderRadius: 4,
        }}
      >
        <strong>Current Context:</strong> <code>{JSON.stringify(context)}</code>
      </div>

      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form jsonSchema={jsonSchema} onChange={setValue} context={context} />
      </StoryLayout>
    </div>
  );
};

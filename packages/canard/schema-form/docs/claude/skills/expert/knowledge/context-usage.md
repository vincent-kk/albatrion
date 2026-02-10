
# Context Usage Skill

Expert skill for @canard/schema-form's context feature.

## Skill Info

- **Name**: context-usage
- **Purpose**: Guide for integrating external data using context prop and @ references
- **Triggers**: context, @, external data, userRole, permissions, mode related questions


## Basic Syntax

```typescript
// Pass context to Form
<Form
  jsonSchema={schema}
  context={{
    userRole: 'admin',
    mode: 'edit',
    permissions: { canEdit: true },
  }}
/>

// Reference context in computed properties
computed: {
  visible: '@.userRole === "admin"',
  readOnly: '@.mode === "view"',
  disabled: '(@).permissions?.canEdit !== true',
}

// Shorthand syntax
'&active': '@.isEnabled === true'
'&visible': '@.showAdvanced'
```


## Accessing Nested Objects

How to access nested objects in context:

```typescript
const context = {
  permissions: {
    canEdit: true,
    canDelete: false,
    canPublish: false,
  },
  settings: {
    theme: 'dark',
    locale: 'ko',
  },
};

const jsonSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      computed: {
        // Wrap with (@) to use optional chaining
        readOnly: '(@).permissions?.canEdit !== true',
      },
    },
    deleteButton: {
      type: 'boolean',
      computed: {
        active: '(@).permissions?.canDelete === true',
      },
    },
    publishToggle: {
      type: 'boolean',
      computed: {
        visible: '(@).permissions?.canPublish === true',
        disabled: '(@).permissions?.canEdit !== true',
      },
    },
  },
};

<Form
  jsonSchema={jsonSchema}
  context={context}
/>
```


## Dynamic Context Updates

When context changes, related computed properties are automatically recalculated.

```typescript
const [permissions, setPermissions] = useState({
  canEdit: true,
  canDelete: false,
});

// Permission toggle button
<button onClick={() => setPermissions(prev => ({
  ...prev,
  canEdit: !prev.canEdit,
}))}>
  Toggle Edit Permission
</button>

<Form
  jsonSchema={jsonSchema}
  context={{ permissions }}
/>

// When permissions.canEdit changes,
// related computed properties (readOnly, etc.) are automatically recalculated
```


## Real-World Usage Patterns

### Tenant-Based Form Customization

```typescript
const [tenant, setTenant] = useState({
  id: 'company-a',
  features: {
    advancedMode: true,
    customFields: true,
  },
  branding: {
    primaryColor: '#3498db',
  },
});

const jsonSchema = {
  type: 'object',
  properties: {
    basicField: { type: 'string' },
    advancedField: {
      type: 'string',
      computed: {
        active: '(@).features?.advancedMode === true',
      },
    },
    customData: {
      type: 'object',
      computed: {
        active: '(@).features?.customFields === true',
      },
    },
  },
};

<Form
  jsonSchema={jsonSchema}
  context={tenant}
/>
```

### A/B Testing Based UI

```typescript
const context = {
  experiment: {
    variant: 'B',  // 'A' or 'B'
  },
};

const jsonSchema = {
  type: 'object',
  properties: {
    // Variant A: Basic input
    simpleInput: {
      type: 'string',
      computed: {
        active: '(@).experiment?.variant === "A"',
      },
    },
    // Variant B: Advanced input
    advancedInput: {
      type: 'object',
      computed: {
        active: '(@).experiment?.variant === "B"',
      },
      properties: {
        // ...
      },
    },
  },
};
```

### Multilingual Support

```typescript
const [locale, setLocale] = useState<'ko' | 'en'>('ko');

const jsonSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: locale === 'ko' ? '이름' : 'Name',
      FormTypeInputProps: {
        placeholder: locale === 'ko' ? '이름을 입력하세요' : 'Enter your name',
      },
    },
  },
};

// Or handle in FormTypeInput through context
<Form
  jsonSchema={jsonSchema}
  context={{ locale }}
/>
```


## References

- Full spec: `docs/ko/SPECIFICATION.md`
- Related story: `stories/34.ContextNode.stories.tsx`

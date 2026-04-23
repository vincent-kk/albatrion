
# Validation Skill

Expert skill for @canard/schema-form's validation system.

## Skill Info

- **Name**: validation
- **Purpose**: Guide for form validation, error handling, and error message formatting
- **Triggers**: Questions about validation, validate, errors, errorMessages, formatError, ValidationMode


## ValidationMode

```typescript
enum ValidationMode {
  None = 0,       // Disable validation
  OnChange = 1,   // Validate on value change
  OnRequest = 2,  // Validate only when validate() is called
}

// Combined usage
const mode = ValidationMode.OnChange | ValidationMode.OnRequest;
```

### Usage Examples

```typescript
import { Form, ValidationMode } from '@canard/schema-form';

// Validate immediately on value change
<Form
  jsonSchema={schema}
  validationMode={ValidationMode.OnChange}
/>

// Validate only on explicit call
<Form
  jsonSchema={schema}
  validationMode={ValidationMode.OnRequest}
/>

// Enable both
<Form
  jsonSchema={schema}
  validationMode={ValidationMode.OnChange | ValidationMode.OnRequest}
/>
```


## formatError Function

Dynamically format error messages.

```typescript
import type { FormatError } from '@canard/schema-form';

const formatError: FormatError = (error, node) => {
  const schema = node.jsonSchema;
  const options = schema.errorMessages;

  if (!options || !error.keyword) return error.message;

  let formattedError = options[error.keyword];

  if (typeof formattedError === 'string') {
    let message = formattedError;

    // Substitute error details
    if (error.details) {
      Object.entries(error.details).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, String(value));
      });
    }

    // Substitute current value
    message = message.replace('{value}', String(node.value));

    return message;
  }

  return error.message;
};

// Pass to Form
<Form
  jsonSchema={schema}
  formatError={formatError}
/>
```


## Virtual Node Errors

Use virtual nodes to validate multiple fields as a group.

```typescript
const schema = {
  type: 'object',
  properties: {
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
  required: ['address'],
};
```

### useChildNodeErrors Hook

```typescript
import { useChildNodeErrors } from '@canard/schema-form';

const AddressInput: FC<FormTypeInputProps> = ({ node, value, onChange }) => {
  const {
    errorMessage,      // First error message
    showError,         // Whether to show errors overall
    showErrors,        // Array of whether to show error per field
    formattedError,    // Formatted first error
    formattedErrors,   // Array of formatted errors per field
    errorMatrix,       // Full error matrix
  } = useChildNodeErrors(node);

  return (
    <div>
      <input
        type="text"
        placeholder="Zip Code"
        value={value?.[0] || ''}
        onChange={(e) => onChange([e.target.value, value?.[1], value?.[2]])}
      />
      {showErrors[0] && formattedErrors[0] && (
        <span style={{ color: 'red' }}>{formattedErrors[0]}</span>
      )}

      <input
        type="text"
        placeholder="City"
        value={value?.[1] || ''}
        onChange={(e) => onChange([value?.[0], e.target.value, value?.[2]])}
      />
      {showErrors[1] && formattedErrors[1] && (
        <span style={{ color: 'red' }}>{formattedErrors[1]}</span>
      )}

      <input
        type="text"
        placeholder="Street Address"
        value={value?.[2] || ''}
        onChange={(e) => onChange([value?.[0], value?.[1], e.target.value])}
      />
      {showErrors[2] && formattedErrors[2] && (
        <span style={{ color: 'red' }}>{formattedErrors[2]}</span>
      )}
    </div>
  );
};
```


## Validation Plugins

### Registering AJV Plugin

```typescript
import { registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// Register at app startup
registerPlugin(ajvValidatorPlugin);
```

### Available Plugins

| Plugin | Package |
|--------|---------|
| AJV 8.x | `@canard/schema-form-ajv8-plugin` |
| AJV 7.x | `@canard/schema-form-ajv7-plugin` |
| AJV 6.x | `@canard/schema-form-ajv6-plugin` |


## References

- Full specification: `docs/ko/SPECIFICATION.md`
- Related stories: `stories/21.Validation.stories.tsx`, `stories/21.ValidationExtended.stories.tsx`

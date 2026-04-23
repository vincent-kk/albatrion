
# Testing Guide Skill

Expert skill for writing tests for @canard/schema-form.

## Skill Info

- **Name**: testing-guide
- **Purpose**: Guide for writing unit tests, component tests, and integration tests
- **Triggers**: Questions about testing, test, unit testing, component testing, integration testing


## Test Environment Setup

### Required Packages

```bash
yarn add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
  },
});
```

### Setup File

```typescript
// test/setup.ts
import '@testing-library/jest-dom';
import { registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// Register plugins before tests
registerPlugin(ajvValidatorPlugin);
```


## Component Testing

### Form Component Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Form } from '@canard/schema-form';

describe('Form Component', () => {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', title: 'Name' },
      email: { type: 'string', format: 'email', title: 'Email' },
    },
  } as const;

  it('should render form fields', () => {
    render(<Form jsonSchema={schema} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should call onChange when value changes', async () => {
    const handleChange = vi.fn();

    render(<Form jsonSchema={schema} onChange={handleChange} />);

    const input = screen.getByRole('textbox', { name: /name/i });
    fireEvent.change(input, { target: { value: 'Alice' } });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
    });
  });
});
```

### FormHandle Tests

```typescript
import { useRef } from 'react';
import { Form, FormHandle } from '@canard/schema-form';

describe('FormHandle', () => {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
    },
  } as const;

  it('should get and set values programmatically', async () => {
    let formHandle: FormHandle<typeof schema> | null = null;

    const TestComponent = () => {
      const ref = useRef<FormHandle<typeof schema>>(null);
      formHandle = ref.current;

      return <Form ref={ref} jsonSchema={schema} />;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(formHandle).not.toBeNull();
    });

    formHandle?.setValue({ name: 'Test' });

    await waitFor(() => {
      expect(formHandle?.getValue()).toEqual({ name: 'Test' });
    });
  });

  it('should validate and return errors', async () => {
    const schemaWithValidation = {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
      },
      required: ['email'],
    } as const;

    let formHandle: FormHandle<typeof schemaWithValidation> | null = null;

    const TestComponent = () => {
      const ref = useRef<FormHandle<typeof schemaWithValidation>>(null);
      formHandle = ref.current;

      return <Form ref={ref} jsonSchema={schemaWithValidation} />;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(formHandle).not.toBeNull();
    });

    const errors = await formHandle?.validate();

    expect(errors?.length).toBeGreaterThan(0);
    expect(errors?.[0].keyword).toBe('required');
  });
});
```

### Custom FormTypeInput Tests

```typescript
import { FormTypeInputProps } from '@canard/schema-form';

describe('Custom FormTypeInput', () => {
  const CustomInput: FC<FormTypeInputProps<string>> = ({
    value,
    onChange,
    errors,
    errorVisible,
  }) => (
    <div>
      <input
        data-testid="custom-input"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
      {errorVisible && errors.length > 0 && (
        <span data-testid="error">{errors[0].message}</span>
      )}
    </div>
  );

  it('should render custom input and handle changes', async () => {
    const handleChange = vi.fn();

    render(
      <Form
        jsonSchema={{
          type: 'object',
          properties: {
            custom: { type: 'string', FormTypeInput: CustomInput },
          },
        }}
        onChange={handleChange}
      />
    );

    const input = screen.getByTestId('custom-input');
    fireEvent.change(input, { target: { value: 'test value' } });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({ custom: 'test value' })
      );
    });
  });
});
```


## Validation Testing

### Field-Level Validation

```typescript
describe('Validation', () => {
  it('should validate required fields', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      },
    });

    await delay();

    const errors = await node.validate();

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.keyword === 'required')).toBe(true);
  });

  it('should validate format constraints', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
    });

    await delay();

    node.setValue({ email: 'invalid-email' });
    await delay();

    const errors = await node.validate();

    expect(errors.some((e) => e.keyword === 'format')).toBe(true);
  });
});
```

### Custom Error Message Tests

```typescript
describe('Custom Error Messages', () => {
  it('should use custom error messages', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            errorMessages: {
              minLength: 'Name must be at least {limit} characters',
            },
          },
        },
      },
    });

    await delay();

    node.setValue({ name: 'ab' });
    await delay();

    const errors = await node.validate();
    const nameNode = node.find('./name');

    // Error message verification is done after formatError function is applied
    expect(nameNode?.errors.length).toBeGreaterThan(0);
  });
});
```


## Test Utilities

### delay Function

```typescript
// test/utils.ts
export const delay = (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));
```

### Schema Builder for Testing

```typescript
// test/schemaBuilder.ts
export const createTestSchema = (properties: Record<string, any>) => ({
  type: 'object' as const,
  properties,
});

export const stringField = (options = {}) => ({
  type: 'string' as const,
  ...options,
});

export const numberField = (options = {}) => ({
  type: 'number' as const,
  ...options,
});

// Usage
const schema = createTestSchema({
  name: stringField({ minLength: 3 }),
  age: numberField({ minimum: 0 }),
});
```

### FormHandle Wrapper

```typescript
// test/formTestWrapper.tsx
import { useRef, useEffect } from 'react';
import { Form, FormHandle } from '@canard/schema-form';

export const createFormTestHarness = <T extends object>(
  schema: any,
  defaultValue?: T
) => {
  let handle: FormHandle | null = null;

  const TestComponent = () => {
    const ref = useRef<FormHandle>(null);

    useEffect(() => {
      handle = ref.current;
    }, []);

    return (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={defaultValue}
      />
    );
  };

  return {
    Component: TestComponent,
    getHandle: () => handle,
  };
};
```


## References

- Full specification: `docs/ko/SPECIFICATION.md`
- Test code: `src/core/__tests__/*.test.ts`
- Stories: `stories/*.stories.tsx`

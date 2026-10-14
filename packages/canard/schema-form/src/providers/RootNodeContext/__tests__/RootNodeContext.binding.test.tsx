import { StrictMode, createRef } from 'react';

import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form } from '@/schema-form/components/Form';
import type { FormHandle } from '@/schema-form/components/Form';
import { ValidationMode, type Validator } from '@/schema-form/core';

afterEach(cleanup);

it('REACT-007 VALIDATE-044 validates only after the committed load is ready', async () => {
  const validate = vi.fn(() => []);
  const validator: Validator = {
    compile: () => validate,
    compileGuard: () => () => true,
  };
  const ref = createRef<FormHandle>();
  render(
    <StrictMode>
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        validatorFactory={validator}
        validationMode={ValidationMode.OnChange}
      >
        <span />
      </Form>
    </StrictMode>,
  );
  await waitFor(() => expect(validate).toHaveBeenCalledTimes(1));
  expect(ref.current!.node).toBeDefined();
});

it('ERROR-026 LANDING-075 buffers construction warnings until commit and delivers once', () => {
  const onError = vi.fn();
  const validator: Validator = {
    compile: () => () => [],
    compileGuard: () => () => true,
  };
  render(
    <StrictMode>
      <Form
        jsonSchema={{ type: 'number' }}
        defaultValue="not-a-number"
        validatorFactory={validator}
        onError={onError}
      >
        <span />
      </Form>
    </StrictMode>,
  );
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0][0].code).toBe(
    'SCHEMA_FORM_WARNING.TYPE_MISMATCH',
  );
});

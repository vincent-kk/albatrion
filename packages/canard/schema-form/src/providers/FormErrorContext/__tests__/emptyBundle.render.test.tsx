import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import { FormErrorCode } from '@/schema-form/errors';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it.each([
  ['empty', []],
  ['sparse', Array(2)],
] as const)(
  'DR-14 gate records a renderer empty or sparse bundle (%s)',
  (_label, errors) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();
    const error = { code: FormErrorCode.MultipleErrors, details: { errors } };
    const Renderer = () => {
      throw error;
    };
    render(
      <Form
        jsonSchema={{ type: 'string' }}
        validationMode={ValidationMode.None}
        FieldRenderer={Renderer}
        onError={onError}
      />,
    );
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        code: FormErrorCode.RenderFailed,
        componentStack: expect.any(String),
        error,
      }),
    );
    expect(onError.mock.calls[0][0].componentStack.length).toBeGreaterThan(0);
  },
);

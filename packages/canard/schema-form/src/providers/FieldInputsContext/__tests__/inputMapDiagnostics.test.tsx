import { StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal('reportError', vi.fn());
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it.each([false, true])(
  'reports an invalid input-map pattern once after fallback commits (StrictMode=%s)',
  (strict) => {
    const Input = vi.fn(() => <input aria-label="Mapped input" />);
    const fallbackAtReport: (string | null | undefined)[] = [];
    const onError = vi.fn(() => {
      fallbackAtReport.push(
        document.querySelector('[role="alert"]')?.textContent,
      );
    });
    const form = (
      <Form
        jsonSchema={{
          type: 'object',
          properties: { name: { type: 'string' } },
        }}
        fieldInputMap={{ '^/**': Input }}
        validationMode={ValidationMode.None}
        onError={onError}
      />
    );
    const view = render(strict ? <StrictMode>{form}</StrictMode> : form);

    expect(onError).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        level: 'error',
        code: FormErrorCode.FieldInputMap,
        origin: 'load',
        error: expect.objectContaining({
          code: FormErrorCode.FieldInputMap,
          details: expect.objectContaining({ path: '^/**' }),
        }),
      }),
    );
    expect(view.getByRole('alert').textContent).toBe('Unable to load form.');
    expect(fallbackAtReport).toEqual(['Unable to load form.']);
    expect(Input).not.toHaveBeenCalled();
  },
);

it.each([false, true])(
  'keeps a throwing user input as a render failure (StrictMode=%s)',
  (strict) => {
    const error = new SchemaFormError(
      FormErrorCode.FieldInputMap,
      'User input threw during render',
      { path: '/name' },
    );
    const BrokenInput = () => {
      throw error;
    };
    const onError = vi.fn();
    const form = (
      <Form
        jsonSchema={{
          type: 'object',
          properties: { name: { type: 'string' } },
        }}
        fieldInputMap={{ '/name': BrokenInput }}
        validationMode={ValidationMode.None}
        onError={onError}
      />
    );
    render(strict ? <StrictMode>{form}</StrictMode> : form);

    expect(onError).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        level: 'error',
        code: FormErrorCode.RenderFailed,
        origin: 'render',
        path: '/name',
        componentStack: expect.any(String),
        error,
      }),
    );
  },
);

it('renders a valid mapped input without reporting an error', () => {
  const onError = vi.fn();
  const view = render(
    <Form
      jsonSchema={{ type: 'object', properties: { name: { type: 'string' } } }}
      fieldInputMap={{ '/name': () => <input aria-label="Mapped input" /> }}
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );

  expect(view.getByLabelText('Mapped input')).toBeTruthy();
  expect(onError).not.toHaveBeenCalled();
});

it.each(['reset', 'rebuild'] as const)(
  'keeps the fixed input-map configuration fatal after %s',
  (operation) => {
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        fieldInputMap={{
          '^/**': () => <input aria-label="Invalid mapped input" />,
        }}
        validationMode={ValidationMode.None}
        onError={onError}
      />,
    );

    act(() => {
      expect(() => ref.current![operation]()).toThrow(
        'Invalid key pattern in FieldInputMap',
      );
    });
    expect(ref.current!.node).toBeUndefined();
    expect(view.getByRole('alert').textContent).toBe('Unable to load form.');
    expect(onError).toHaveBeenCalledTimes(1);
  },
);

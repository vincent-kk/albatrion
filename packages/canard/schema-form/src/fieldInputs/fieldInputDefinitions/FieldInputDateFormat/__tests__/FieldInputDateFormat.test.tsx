import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { observeErrorSink } from '@/schema-form/__tests__/helpers/observeErrorSink';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import type { FormErrorRecord } from '@/schema-form/errors';

afterEach(cleanup);

it.each(['date', 'month', 'week', 'time', 'datetime-local'])(
  'shows a malformed %s value as editable text',
  (format) => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'string', format }}
        defaultValue="not-a-date"
      />,
    );
    const input = view.container.querySelector('input')!;
    expect(input.type).toBe('text');
    expect(input.value).toBe('not-a-date');
    fireEvent.change(input, { target: { value: '2024-02-29' } });
    expect(ref.current!.getValue()).toBe('2024-02-29');
    expect(view.container.querySelector('input')).toBe(input);
    expect(input.type).toBe('text');
  },
);

it('keeps a valid date in the native date input', () => {
  const view = render(
    <Form
      jsonSchema={{ type: 'string', format: 'date' }}
      defaultValue="2024-02-29"
    />,
  );
  const input = view.container.querySelector('input')!;
  expect(input.type).toBe('date');
  expect(input.value).toBe('2024-02-29');
});

it('keeps an empty date in the native date input', () => {
  const view = render(<Form jsonSchema={{ type: 'string', format: 'date' }} />);
  const input = view.container.querySelector('input')!;
  expect(input.type).toBe('date');
  expect(input.value).toBe('');
});

it('CONTROLS-081 reads minimum and maximum from presentation.FieldInputProps', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          day: {
            type: 'string',
            format: 'date',
            presentation: {
              FieldInputProps: {
                minimum: '2024-01-01',
                maximum: '2024-12-31',
              },
            },
          },
        },
      }}
    />,
  );
  const input = view.container.querySelector('input[type="date"]')!;
  expect(input.getAttribute('min')).toBe('2024-01-01');
  expect(input.getAttribute('max')).toBe('2024-12-31');
});

it('CONTROLS-051 rejects minimum under options as UNKNOWN_GROUP_KEY', () => {
  observeErrorSink();
  const onError = vi.fn<(record: FormErrorRecord) => void>();
  render(
    <Form
      onError={onError}
      jsonSchema={{
        type: 'object',
        properties: {
          day: {
            type: 'string',
            format: 'date',
            options: { minimum: '2024-01-01' },
          },
        },
      }}
    />,
  );
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({
      code: 'JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY',
      details: expect.objectContaining({ group: 'options', key: 'minimum' }),
    }),
  );
  expect(screen.getByRole('alert').textContent).toBe('Unable to load form.');
});

it('REACT-027 publishes undefined when a date input is cleared whether or not it is nullable', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'string',
        format: 'date',
        options: { omitEmpty: false },
      }}
      defaultValue="2024-02-29"
    />,
  );
  fireEvent.change(view.container.querySelector('input')!, {
    target: { value: '' },
  });
  expect(ref.current!.getValue()).toBeUndefined();
  view.unmount();
  const nullable = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: ['string', 'null'],
        format: 'date',
        options: { omitEmpty: false },
      }}
      defaultValue="2024-02-29"
    />,
  );
  fireEvent.change(nullable.container.querySelector('input')!, {
    target: { value: '' },
  });
  expect(ref.current!.getValue()).toBeUndefined();
});

it('REACT-027 does not publish a badInput date draft', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', format: 'date' }}
      defaultValue="2024-02-29"
    />,
  );
  const input = view.container.querySelector('input')!;
  Object.defineProperty(input, 'validity', {
    configurable: true,
    value: { badInput: true },
  });
  fireEvent.change(input, { target: { value: '' } });
  expect(ref.current!.getValue()).toBe('2024-02-29');
});

it('REACT-027 restores the node date display on blur after a badInput draft', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', format: 'date' }}
      defaultValue="2024-02-29"
    />,
  );
  const input = view.container.querySelector('input')!;
  Object.defineProperty(input, 'validity', {
    configurable: true,
    value: { badInput: true },
  });
  fireEvent.change(input, { target: { value: '' } });
  expect(input.value).toBe('');
  fireEvent.blur(input);
  expect(input.value).toBe('2024-02-29');
});

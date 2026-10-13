import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form } from '@/schema-form/components/Form';
import type { FormErrorRecord } from '@/schema-form/errors';

import { observeErrorSink } from '../../__tests__/helpers/observeErrorSink';

afterEach(cleanup);

it('CONTROLS-081 reads minimum and maximum from presentation.FormTypeInputProps', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          day: {
            type: 'string',
            format: 'date',
            presentation: {
              FormTypeInputProps: {
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

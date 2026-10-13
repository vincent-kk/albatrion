import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FormTypeInputUriDefinition } from '../FormTypeInputUri';

const preventWindowError = (event: ErrorEvent) => event.preventDefault();

afterEach(() => {
  cleanup();
  window.removeEventListener('error', preventWindowError);
});

it('reads protocols from presentation.FormTypeInputProps', async () => {
  const onChange = vi.fn();
  const view = render(
    <Form
      formTypeInputDefinitions={[FormTypeInputUriDefinition]}
      onChange={onChange}
      jsonSchema={{
        type: 'object',
        properties: {
          link: {
            type: 'string',
            format: 'uri',
            presentation: {
              FormTypeInputProps: { protocols: ['ftp'] },
            },
          },
        },
      }}
    />,
  );
  expect(screen.getByText('ftp://')).toBeTruthy();
  expect(screen.queryByText('http://')).toBeNull();
  await userEvent.type(view.container.querySelector('input#\\/link')!, 'a');
  expect(onChange).toHaveBeenLastCalledWith({ link: 'ftp://a' });
});

it('rejects protocols under options as UNKNOWN_GROUP_KEY', () => {
  window.addEventListener('error', preventWindowError);
  const onError = vi.fn();
  render(
    <Form
      formTypeInputDefinitions={[FormTypeInputUriDefinition]}
      onError={onError}
      jsonSchema={{
        type: 'object',
        properties: {
          link: {
            type: 'string',
            format: 'uri',
            options: { protocols: ['ftp'] },
          },
        },
      }}
    />,
  );
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({
      code: 'JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY',
      details: expect.objectContaining({ group: 'options', key: 'protocols' }),
    }),
  );
  expect(screen.getByRole('alert').textContent).toBe('Unable to load form.');
});

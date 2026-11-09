import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, ValidationMode } from '@canard/schema-form';

import { FieldInputUriDefinition } from '../FieldInputUri';

const preventWindowError = (event: ErrorEvent) => event.preventDefault();

afterEach(() => {
  cleanup();
  window.removeEventListener('error', preventWindowError);
});

it('reads protocols from presentation.FieldInputProps', async () => {
  const onChange = vi.fn();
  const view = render(
    <Form
      fieldInputDefinitions={[FieldInputUriDefinition]}
      onChange={onChange}
      jsonSchema={{
        type: 'object',
        properties: {
          link: {
            type: 'string',
            format: 'uri',
            presentation: {
              FieldInputProps: { protocols: ['ftp'] },
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

it('accepts protocols under options without a schema error', () => {
  window.addEventListener('error', preventWindowError);
  const onError = vi.fn();
  render(
    <Form
      fieldInputDefinitions={[FieldInputUriDefinition]}
      onError={onError}
      validationMode={ValidationMode.None}
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
  expect(onError).not.toHaveBeenCalled();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.queryByText('ftp://')).toBeNull();
  expect(screen.getByText('http://')).toBeTruthy();
});

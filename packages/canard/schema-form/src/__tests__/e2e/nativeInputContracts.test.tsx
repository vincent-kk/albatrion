import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { type FieldInputProps, Form, ValidationMode } from '../../index';

afterEach(cleanup);

it('selects a native password input from the schema format', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          password: { type: 'string', title: 'Password', format: 'password' },
        },
      }}
      validationMode={ValidationMode.None}
    />,
  );
  const password = view.container.querySelector('input[name="password"]');
  expect(password?.getAttribute('type')).toBe('password');
});

it('a custom input that omits inputId has no native label association', () => {
  const InputWithoutId = ({ labelId }: FieldInputProps) => (
    <input aria-labelledby={labelId} />
  );
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: { name: { type: 'string', title: 'Name' } },
      }}
      fieldInputMap={{ '/name': InputWithoutId }}
      validationMode={ValidationMode.None}
    />,
  );
  const label = view.container.querySelector('label')!;
  expect(label.textContent).toBe('name');
  expect(label.htmlFor).not.toBe('');
  expect(label.control).toBeNull();
});

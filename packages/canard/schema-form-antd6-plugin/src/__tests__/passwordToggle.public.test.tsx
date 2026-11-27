import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

it('renders a password input with the library visibility toggle', () => {
  const { container } = render(
    <Form
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={{ type: 'string', format: 'password' }}
    />,
  );
  expect(container.querySelector('input[type="password"]')).not.toBeNull();
  expect(container.querySelector('.ant-input-password-icon')).not.toBeNull();
});

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputStringDefinition } from '../FieldInputString';

afterEach(cleanup);

it('selects a password input from presentation.inputType', () => {
  const view = render(
    <Form
      fieldInputDefinitions={[FieldInputStringDefinition]}
      context={{ size: 'small', variant: 'outlined', fullWidth: true }}
      jsonSchema={{
        type: 'string',
        presentation: { inputType: 'password' },
      }}
    />,
  );

  expect(view.container.querySelector('input')?.type).toBe('password');
});

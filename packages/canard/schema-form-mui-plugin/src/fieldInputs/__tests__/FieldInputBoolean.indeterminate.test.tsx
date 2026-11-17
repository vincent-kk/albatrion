import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputBooleanDefinition } from '../FieldInputBoolean';

afterEach(cleanup);

const isIndeterminate = (defaultValue?: boolean | null) => {
  const { container } = render(
    <Form
      fieldInputDefinitions={[FieldInputBooleanDefinition]}
      jsonSchema={{ type: ['boolean', 'null'] }}
      defaultValue={defaultValue}
    />,
  );
  const box = container.querySelector('input[type="checkbox"]')!;
  return box.getAttribute('data-indeterminate') === 'true';
};

it('shows the indeterminate state for null, as the README states', () => {
  expect(isIndeterminate(null)).toBe(true);
});

it('shows an unset value and booleans without the indeterminate state', () => {
  expect(isIndeterminate(undefined)).toBe(false);
  cleanup();
  expect(isIndeterminate(true)).toBe(false);
  cleanup();
  expect(isIndeterminate(false)).toBe(false);
});

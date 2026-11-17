import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputBooleanDefinition } from '../FieldInputBoolean';

afterEach(cleanup);

it.each([
  ['null', true, null],
  ['undefined', false, undefined],
  ['true', false, true],
  ['false', false, false],
])('a %s value shows indeterminate: %s', (_, indeterminate, defaultValue) => {
  const { container } = render(
    <Form
      fieldInputDefinitions={[FieldInputBooleanDefinition]}
      jsonSchema={{ type: ['boolean', 'null'] }}
      defaultValue={defaultValue}
    />,
  );
  expect(!!container.querySelector('.adm-checkbox-indeterminate')).toBe(
    indeterminate,
  );
  expect(container.querySelector('input')!.checked).toBe(defaultValue === true);
});

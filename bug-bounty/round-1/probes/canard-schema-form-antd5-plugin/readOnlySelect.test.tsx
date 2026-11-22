import { createRef } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputStringEnumDefinition } from '../../fieldInputs/FieldInputStringEnum';

afterEach(cleanup);

it('readOnly enum select keeps the displayed selection equal to the stored value', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={[FieldInputStringEnumDefinition]}
      jsonSchema={{ type: 'string', enum: ['alpha', 'beta'] }}
      defaultValue="alpha"
    />,
  );
  await userEvent.click(container.querySelector('.ant-select-selector')!);
  const option = screen.queryByTitle('beta');
  if (option) await userEvent.click(option);
  expect(ref.current!.getValue()).toBe('alpha');
  expect(
    container.querySelector('.ant-select-selection-item')!.textContent,
  ).toBe('alpha');
});

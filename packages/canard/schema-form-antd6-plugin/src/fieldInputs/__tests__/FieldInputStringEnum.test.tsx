import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputStringEnumDefinition } from '../FieldInputStringEnum';

afterEach(cleanup);

it('shows no selected enum option or current label for an undefined value', () => {
  const view = render(
    <Form
      fieldInputDefinitions={[FieldInputStringEnumDefinition]}
      jsonSchema={{ type: 'string', enum: ['KR', 'US'] }}
    />,
  );
  const combobox = screen.getByRole<HTMLInputElement>('combobox');
  expect(combobox.value).toBe('');
  expect(view.container.querySelector('.ant-select-content-value')).toBeNull();
  fireEvent.mouseDown(combobox);
  expect(
    screen
      .getAllByRole('option')
      .filter((option) => option.getAttribute('aria-selected') === 'true'),
  ).toHaveLength(0);
});

it('clears the current enum label when a form value returns to undefined', async () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputStringEnumDefinition]}
      jsonSchema={{ type: 'string', enum: ['KR', 'US'] }}
      defaultValue="US"
    />,
  );
  expect(
    view.container.querySelector('.ant-select-content-value')?.textContent,
  ).toBe('US');
  await act(async () => ref.current!.setValue(undefined));
  expect(ref.current!.getValue()).toBeUndefined();
  expect(view.container.querySelector('.ant-select-content-value')).toBeNull();
  const combobox = screen.getByRole<HTMLInputElement>('combobox');
  expect(combobox.value).toBe('');
  fireEvent.mouseDown(combobox);
  expect(
    screen
      .getAllByRole('option')
      .filter((option) => option.getAttribute('aria-selected') === 'true'),
  ).toHaveLength(0);
});

it.each([
  { value: null, count: 0 },
  { value: [null], count: 1 },
  { value: ['null'], count: 1 },
])(
  'shows the correct tags when an enum array starts at $value',
  ({ value, count }) => {
    const { container } = render(
      <Form
        fieldInputDefinitions={[FieldInputStringEnumDefinition]}
        jsonSchema={{
          type: ['array', 'null'],
          items: { type: ['string', 'null'], enum: [null, 'null'] },
        }}
        defaultValue={value}
      />,
    );
    const selected = container.querySelectorAll('.ant-select-selection-item');
    expect(selected).toHaveLength(count);
  },
);

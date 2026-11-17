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
  render(
    <Form
      fieldInputDefinitions={[FieldInputStringEnumDefinition]}
      context={{ size: 'small', variant: 'outlined', fullWidth: true }}
      jsonSchema={{ type: 'string', enum: ['KR', 'US'] }}
    />,
  );
  const combobox = screen.getByRole('combobox');
  expect(combobox.textContent?.replace(/\u200b/g, '').trim()).toBe('');
  fireEvent.mouseDown(combobox);
  expect(
    screen
      .getAllByRole('option')
      .filter((option) => option.getAttribute('aria-selected') === 'true'),
  ).toHaveLength(0);
});

it('clears the current enum label when a form value returns to undefined', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputStringEnumDefinition]}
      context={{ size: 'small', variant: 'outlined', fullWidth: true }}
      jsonSchema={{ type: 'string', enum: ['KR', 'US'] }}
      defaultValue="US"
    />,
  );
  expect(screen.getByRole('combobox').textContent).toBe('US');
  await act(async () => ref.current!.setValue(undefined));
  expect(ref.current!.getValue()).toBeUndefined();
  const combobox = screen.getByRole('combobox');
  expect(combobox.textContent?.replace(/\u200b/g, '').trim()).toBe('');
  fireEvent.mouseDown(combobox);
  expect(
    screen
      .getAllByRole('option')
      .filter((option) => option.getAttribute('aria-selected') === 'true'),
  ).toHaveLength(0);
});

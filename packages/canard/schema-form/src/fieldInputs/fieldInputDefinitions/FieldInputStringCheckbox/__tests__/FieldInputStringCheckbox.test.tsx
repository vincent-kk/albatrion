import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@/schema-form/components/Form';

afterEach(cleanup);

it('selects checkbox inputs from presentation.inputType for a string enum array', () => {
  render(
    <Form
      jsonSchema={{
        type: 'array',
        items: { type: 'string', enum: ['S', 'M'] },
        presentation: { inputType: 'checkbox' },
      }}
      defaultValue={['M']}
    />,
  );
  const inputs = screen.getAllByRole<HTMLInputElement>('checkbox');
  expect(inputs.map((input) => input.type)).toEqual(['checkbox', 'checkbox']);
  expect(inputs.map((input) => input.checked)).toEqual([false, true]);
});

it('gives each option a unique id that its label points to', () => {
  render(
    <Form
      jsonSchema={{
        type: 'array',
        items: { type: 'string', enum: ['S', 'M', 'L'] },
        presentation: { inputType: 'checkbox' },
      }}
    />,
  );
  const inputs = screen.getAllByRole<HTMLInputElement>('checkbox');
  const ids = inputs.map((input) => input.id);
  expect(new Set(ids).size).toBe(3);
  expect(
    inputs.map((input) => input.closest('label')?.htmlFor),
  ).toEqual(ids);
});

it('does not select checkbox inputs from a top-level inputType alone', () => {
  render(
    <Form
      jsonSchema={{
        type: 'array',
        items: { type: 'string', enum: ['S', 'M'] },
        inputType: 'checkbox',
      }}
      defaultValue={['M']}
    />,
  );
  expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('M');
});

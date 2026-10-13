import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@/schema-form/components/Form';

afterEach(cleanup);

it('selects checkbox inputs from presentation.formType for a string enum array', () => {
  render(
    <Form
      jsonSchema={{
        type: 'array',
        items: { type: 'string', enum: ['S', 'M'] },
        presentation: { formType: 'checkbox' },
      }}
      defaultValue={['M']}
    />,
  );
  const inputs = screen.getAllByRole<HTMLInputElement>('checkbox');
  expect(inputs.map((input) => input.type)).toEqual(['checkbox', 'checkbox']);
  expect(inputs.map((input) => input.checked)).toEqual([false, true]);
});

it('does not select checkbox inputs from a top-level formType alone', () => {
  render(
    <Form
      jsonSchema={{
        type: 'array',
        items: { type: 'string', enum: ['S', 'M'] },
        formType: 'checkbox',
      }}
      defaultValue={['M']}
    />,
  );
  expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('M');
});

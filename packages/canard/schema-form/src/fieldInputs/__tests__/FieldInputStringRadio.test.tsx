import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@/schema-form/components/Form';

afterEach(cleanup);

it.each(['radio', 'radiogroup'])(
  'selects radio inputs from presentation.inputType=%s',
  (inputType) => {
    render(
      <Form
        jsonSchema={{
          type: 'string',
          enum: ['S', 'M'],
          presentation: { inputType },
        }}
        defaultValue="M"
      />,
    );
    const inputs = screen.getAllByRole<HTMLInputElement>('radio');
    expect(inputs.map((input) => input.type)).toEqual(['radio', 'radio']);
    expect(inputs.map((input) => input.checked)).toEqual([false, true]);
  },
);

it('does not select radio inputs from a top-level inputType alone', () => {
  render(
    <Form
      jsonSchema={{ type: 'string', enum: ['S', 'M'], inputType: 'radio' }}
      defaultValue="M"
    />,
  );
  expect(screen.queryAllByRole('radio')).toHaveLength(0);
  expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('M');
});

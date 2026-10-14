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

it('gives each option a unique id that its label points to', () => {
  render(
    <Form
      jsonSchema={{
        type: 'string',
        enum: ['S', 'M', 'L'],
        presentation: { inputType: 'radio' },
      }}
    />,
  );
  const inputs = screen.getAllByRole<HTMLInputElement>('radio');
  const ids = inputs.map((input) => input.id);
  expect(new Set(ids).size).toBe(3);
  expect(inputs.map((input) => input.closest('label')?.htmlFor)).toEqual(ids);
});

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

it('keeps radio options in an inline group named by the field title', () => {
  render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          Size: {
            type: 'string',
            enum: ['S', 'M'],
            presentation: { inputType: 'radio' },
          },
        },
      }}
    />,
  );
  const group = screen.getByRole('group', { name: 'Size' });
  expect(group.tagName).toBe('SPAN');
  expect(group.getAttribute('aria-labelledby')).toBe('label:/Size');
});

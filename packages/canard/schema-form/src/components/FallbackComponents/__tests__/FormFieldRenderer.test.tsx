import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@/schema-form/components/Form';

afterEach(cleanup);

it.each(['checkbox', 'radio'])(
  'names the builtin %s options group while preserving its title layout',
  (inputType) => {
    render(
      <Form
        jsonSchema={{
          type: 'object',
          properties: {
            Size:
              inputType === 'checkbox'
                ? {
                    type: 'array',
                    title: 'Size',
                    items: { type: 'string', enum: ['S', 'M'] },
                    presentation: { inputType },
                  }
                : {
                    type: 'string',
                    title: 'Size',
                    enum: ['S', 'M'],
                    presentation: { inputType },
                  },
          },
        }}
      />,
    );
    const title = screen.getByText('Size');
    expect(title.tagName).toBe(inputType === 'checkbox' ? 'LEGEND' : 'LABEL');
    if (inputType === 'checkbox')
      expect(title.parentElement?.tagName).toBe('FIELDSET');
    else expect(title.getAttribute('for')).toBe('/Size');
    expect(title.id).toBe('label:/Size');
    expect(
      within(title.parentElement!)
        .getByRole('group', { name: 'Size' })
        .getAttribute('aria-labelledby'),
    ).toBe('label:/Size');
  },
);

it('keeps a plain string title associated with its input', () => {
  render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: { Text: { type: 'string', title: 'Text' } },
      }}
    />,
  );
  const input = screen.getByRole<HTMLInputElement>('textbox');
  expect(screen.getByText('Text').getAttribute('for')).toBe(input.id);
  expect(input.id).toBe('/Text');
  expect(screen.getByText('Text').id).toBe('label:/Text');
});

it('keeps the title associated with a date-format input despite the radio hint', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          When: {
            type: 'string',
            format: 'date',
            enum: ['2024-01-01'],
            presentation: { inputType: 'radio' },
          },
        },
      }}
    />,
  );
  const input = view.container.querySelector<HTMLInputElement>('input')!;
  const title = screen.getByText('When');
  expect(input.type).toBe('date');
  expect(title.getAttribute('for')).toBe(input.id);
  expect(title.id).toBe('label:/When');
});

it('avoids title id collisions with sibling input paths', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          button: { type: 'string', title: 'Button' },
          'button-label': { type: 'string', title: 'Button label' },
        },
      }}
    />,
  );
  const ids = Array.from(view.container.querySelectorAll('[id]'), (el) => el.id);
  expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  const inputs = screen.getAllByRole<HTMLInputElement>('textbox');
  expect(inputs.map((input) => input.id)).toEqual(['/button', '/button-label']);
  expect(screen.getByText('button').closest('label')!.control).toBe(inputs[0]);
  expect(screen.getByText('button-label').closest('label')!.control).toBe(
    inputs[1],
  );
});

it('keeps a sibling textbox associated when the button field is a radio group', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          button: {
            type: 'string',
            enum: ['S', 'M'],
            presentation: { inputType: 'radio' },
          },
          'button-label': { type: 'string' },
        },
      }}
    />,
  );
  const ids = Array.from(view.container.querySelectorAll('[id]'), (el) => el.id);
  expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  expect(screen.getAllByRole('radio')).toHaveLength(2);
  const input = screen.getByRole<HTMLInputElement>('textbox');
  expect(input.id).toBe('/button-label');
  expect(screen.getByText('button-label').closest('label')!.control).toBe(input);
});

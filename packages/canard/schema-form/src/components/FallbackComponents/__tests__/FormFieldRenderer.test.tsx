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
    else expect(title.hasAttribute('for')).toBe(false);
    expect(title.id).toBe('/Size-label');
    expect(
      within(title.parentElement!)
        .getByRole('group', { name: 'Size' })
        .getAttribute('aria-labelledby'),
    ).toBe('/Size-label');
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
});

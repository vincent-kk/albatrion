import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '../index';

afterEach(cleanup);

it.each(['checkbox', 'radio'])(
  'associates Form.Label with the builtin %s group',
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
      >
        <Form.Label path="/Size" />
        <Form.Input path="/Size" />
      </Form>,
    );
    const label = screen.getByText('Size').closest('label')!;
    expect(label.hasAttribute('for')).toBe(false);
    expect(label.id).toBe('/Size-label');
    expect(
      screen
        .getByRole('group', { name: 'Size' })
        .getAttribute('aria-labelledby'),
    ).toBe('/Size-label');
  },
);

it('keeps Form.Label associated with a plain string input', () => {
  render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: { Text: { type: 'string', title: 'Text' } },
      }}
    >
      <Form.Label path="/Text" />
      <Form.Input path="/Text" />
    </Form>,
  );
  const input = screen.getByRole<HTMLInputElement>('textbox');
  expect(screen.getByText('Text').closest('label')!.getAttribute('for')).toBe(
    input.id,
  );
  expect(input.id).toBe('/Text');
});

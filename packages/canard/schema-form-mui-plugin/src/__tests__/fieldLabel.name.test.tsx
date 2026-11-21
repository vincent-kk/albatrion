import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);
it.each<[string, JSONSchema, string]>([
  ['enum', { type: 'string', enum: ['a', 'b'] }, 'combobox'],
  [
    'slider',
    { type: 'number', format: 'slider', presentation: { inputType: 'slider' } },
    'slider',
  ],
  [
    'boolean switch',
    { type: 'boolean', presentation: { inputType: 'switch' } },
    'switch',
  ],
  [
    'string switch',
    {
      type: 'string',
      enum: ['on', 'off'],
      presentation: { inputType: 'switch' },
    },
    'switch',
  ],
  ['text', { type: 'string' }, 'textbox'],
])(
  '%s accessible name contains the visible custom label',
  (_kind, field, role) => {
    const view = render(
      <Form
        jsonSchema={{
          type: 'object',
          properties: {
            internalKey: {
              ...field,
              presentation: {
                ...field.presentation,
                FieldInputProps: { label: 'Volume setting' },
              },
            },
          },
        }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
        LabelRenderer={plugin.LabelRenderer}
      />,
    );
    expect(
      view.getByText('Volume setting', {
        selector: 'label, label span, .MuiFormControlLabel-label',
      }),
    ).toBeTruthy();
    expect(view.getByRole(role, { name: /Volume setting/ })).toBeTruthy();
  },
);

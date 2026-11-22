import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

it.each<[string, JSONSchema]>([
  [
    'radiogroup',
    { type: 'string', enum: ['a', 'b'], presentation: { inputType: 'radio' } },
  ],
  [
    'group',
    {
      type: 'array',
      items: { type: 'string', enum: ['a', 'b'] },
      presentation: { inputType: 'checkbox' },
    },
  ],
  ['switch', { type: 'boolean', presentation: { inputType: 'switch' } }],
  ['group', { type: 'number' }],
  ['slider', { type: 'number', format: 'slider' }],
])('names the %s from a separately rendered Form.Label', (role, field) => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: { field: { ...field, title: 'Field title' } },
      }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      LabelRenderer={plugin.LabelRenderer}
    >
      <Form.Label path="/field">Field title</Form.Label>
      <Form.Input path="/field" />
    </Form>,
  );
  expect(view.getAllByRole(role, { name: 'Field title' })).not.toHaveLength(0);
});

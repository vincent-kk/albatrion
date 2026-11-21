import { Fragment } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../index';
import { fieldNameReference } from './utils/fieldNameReference';

afterEach(cleanup);

it.each([
  ['array', []],
  ['nested array', [[], [null, '  ']]],
  ['fragment', <Fragment />],
] as const)(
  'uses the schema title for an empty React %s label',
  (_kind, label) => {
    const title = 'Schema title';
    const view = render(
      <Form
        jsonSchema={{
          type: 'object',
          properties: {
            field: {
              type: 'string',
              title,
              presentation: { FieldInputProps: { label } },
            },
          },
        }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
        LabelRenderer={plugin.LabelRenderer}
      />,
    );
    const name = fieldNameReference({ visible: [title], title, key: 'field' });
    expect(view.getByRole('textbox', { name })).toBeTruthy();
  },
);

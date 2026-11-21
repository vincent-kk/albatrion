import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../index';
import { fieldNameReference } from './utils/fieldNameReference';

afterEach(cleanup);

it('gives options precedence over a hidden schema title', () => {
  const title = 'Schema title';
  const ariaLabel = 'Options name';
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          field: {
            type: 'string',
            title,
            options: { 'aria-label': ariaLabel },
            presentation: { FieldInputProps: { hideLabel: true } },
          },
        },
      }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
    />,
  );
  const name = fieldNameReference({
    visible: [],
    ariaLabel,
    title,
    key: 'field',
  });
  expect(view.getByRole('textbox', { name })).toBeTruthy();
});

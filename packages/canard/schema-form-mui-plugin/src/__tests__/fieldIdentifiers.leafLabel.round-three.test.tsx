import { cleanup, render } from '@testing-library/react';
import { computeAccessibleName } from 'dom-accessibility-api';
import { afterEach, expect, it } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);
it.each<[JSONSchema, string | boolean]>([
  [{ type: 'string', presentation: { inputType: 'radio' } }, 'value'],
  [{ type: 'boolean', presentation: { inputType: 'radio' } }, false],
])(
  'keeps the real fallback title and accessible name equal to the leaf (round-3 leaf name)',
  (schema, value) => {
    const view = render(
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
        LabelRenderer={plugin.LabelRenderer}
        jsonSchema={{ type: 'object', properties: { Field: schema } }}
        defaultValue={{ Field: value }}
      />,
    );
    const input = view.container.querySelector<HTMLInputElement>('input')!;
    expect(input.labels).toHaveLength(1);
    expect(input.labels![0].textContent).toBe('Field');
    expect(computeAccessibleName(input)).toBe('Field');
  },
);

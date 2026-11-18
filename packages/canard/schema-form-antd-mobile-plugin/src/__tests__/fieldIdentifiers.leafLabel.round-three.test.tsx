import { cleanup, render } from '@testing-library/react';
import { computeAccessibleName } from 'dom-accessibility-api';
import { afterEach, expect, it } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);
const readGroupName = (schema: JSONSchema, value: string | boolean) => {
  const view = render(
    <Form
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
      jsonSchema={{
        type: 'object',
        properties: { Field: { type: 'array', items: schema } },
      }}
      defaultValue={{ Field: [value] }}
    />,
  );
  const group = view.container.querySelector<HTMLElement>(
    '[data-path="/Field/0"] [role="group"]',
  )!;
  const name = computeAccessibleName(group);
  cleanup();
  return name;
};
it.each<[JSONSchema, string | boolean]>([
  [{ type: 'string' }, 'value'],
  [{ type: 'boolean' }, false],
])(
  'keeps a radio hint equivalent to the ordinary array-item aria-label fallback (round-3 leaf name)',
  (schema, value) => {
    const ordinary = readGroupName(schema, value);
    const hinted = readGroupName(
      { ...schema, presentation: { inputType: 'radio' } },
      value,
    );
    expect(ordinary).toBe('0');
    expect(hinted).toBe(ordinary);
  },
);

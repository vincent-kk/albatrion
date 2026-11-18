import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { type FieldInputProps, Form } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);
it('uses the scoped id as each native radio name when the input name is a leaf (round-3 leaf name)', () => {
  const definitions = plugin.fieldInputDefinitions.map((definition) => {
    const Component = definition.Component;
    const LeafNamedInput = (props: FieldInputProps) => (
      <Component {...props} name="leaf" />
    );
    return { ...definition, Component: LeafNamedInput };
  });
  const view = render(
    <Form
      fieldInputDefinitions={definitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
      jsonSchema={{
        type: 'object',
        properties: {
          Field: {
            type: 'string',
            enum: ['one', 'two'],
            presentation: { inputType: 'radio' },
          },
        },
      }}
      defaultValue={{ Field: 'one' }}
    />,
  );
  const group = view.container.querySelector<HTMLElement>(
    '[role="radiogroup"]',
  )!;
  expect(group.id).toContain(':/Field');
  const inputs = group.querySelectorAll<HTMLInputElement>(
    'input[type="radio"]',
  );
  expect(inputs).toHaveLength(2);
  for (const input of inputs) {
    expect(input.name).toBe(group.id);
    expect(input.name).not.toBe('leaf');
  }
});

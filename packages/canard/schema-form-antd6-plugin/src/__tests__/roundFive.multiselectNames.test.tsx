import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { type FieldRendererProps, Form } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);
const Custom = ({ depth, Label, Input }: FieldRendererProps) =>
  depth === 0 ? (
    <Input />
  ) : (
    <div>
      <Label />
      <Input />
    </div>
  );

it.each(['plugin', 'standalone', 'custom', 'hideLabel'] as const)(
  'round-5: enum array has its field name in %s',
  (layout) => {
    const view = render(
      <Form
        jsonSchema={{
          type: 'object',
          properties: {
            Colors: {
              type: 'array',
              items: { type: 'string', enum: ['one', 'two'] },
            },
          },
        }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={layout === 'custom' ? Custom : plugin.FieldRenderer}
        LabelRenderer={plugin.LabelRenderer}
        ErrorMessageRenderer={plugin.ErrorMessageRenderer}
      >
        {layout === 'standalone' || layout === 'hideLabel' ? (
          <>
            <Form.Label path="/Colors" />
            <Form.Input path="/Colors" hideLabel={layout === 'hideLabel'} />
          </>
        ) : undefined}
      </Form>,
    );
    expect(view.getByRole('combobox', { name: 'Colors' })).toBeTruthy();
  },
);

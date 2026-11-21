import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type LabelRendererProps } from '@canard/schema-form';

import { plugin } from '../index';
import { fieldNameReference } from './utils/fieldNameReference';

afterEach(cleanup);

const ConsumerLabel = ({ children, id, htmlFor }: LabelRendererProps) => (
  <label id={id} htmlFor={htmlFor}>
    {children}
  </label>
);

it.each([
  { source: 'schema', renderer: ConsumerLabel },
  { source: 'input', renderer: plugin.LabelRenderer },
  { source: 'input', renderer: ConsumerLabel },
] as const)(
  'combines separately rendered captions with the $source label and $renderer.name',
  async ({ source, renderer }) => {
    const outer = 'Outer caption';
    const inner = 'Inner caption';
    const view = render(
      <Form
        jsonSchema={{
          type: 'object',
          properties: {
            field: {
              type: 'string',
              presentation:
                source === 'schema'
                  ? { FieldInputProps: { label: inner } }
                  : undefined,
            },
          },
        }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
        LabelRenderer={renderer}
      >
        <Form.Label path="/field">{outer}</Form.Label>
        <Form.Input
          path="/field"
          {...(source === 'input' ? { label: inner } : {})}
        />
      </Form>,
    );
    expect(view.getByText(outer, { selector: 'label' })).toBeTruthy();
    expect(view.getByText(inner, { selector: 'label' })).toBeTruthy();
    const name = fieldNameReference({ visible: [outer, inner], key: 'field' });
    expect(await view.findByRole('textbox', { name })).toBeTruthy();
  },
);

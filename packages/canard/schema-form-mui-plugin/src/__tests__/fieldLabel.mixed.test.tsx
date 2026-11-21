import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';
import { fieldNameReference } from './utils/fieldNameReference';

afterEach(cleanup);

it('uses the visible input label when default renderer metadata names the hidden title differently', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          internalKey: {
            type: 'string',
            presentation: {
              FieldRendererProps: { label: 'Outer caption' },
              FieldInputProps: { label: 'Inner caption' },
            },
          },
        },
      }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
    />,
  );
  expect(view.getByText('Inner caption', { selector: 'label' })).toBeTruthy();
  expect(view.getByRole('textbox', { name: 'Inner caption' })).toBeTruthy();
});

it('combines two visible titles and drops the input title once hidden', async () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      internalKey: {
        type: 'string',
        presentation: { FieldInputProps: { label: 'Inner caption' } },
      },
    },
  } satisfies JSONSchema;
  const form = (hideLabel: boolean) => (
    <Form
      jsonSchema={jsonSchema}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
    >
      <Form.Label path="/internalKey">Outer caption</Form.Label>
      <Form.Input path="/internalKey" hideLabel={hideLabel} />
    </Form>
  );
  const view = render(form(false));
  expect(view.getByText('Inner caption', { selector: 'label' })).toBeTruthy();
  expect(view.getByText('Outer caption', { selector: 'label' })).toBeTruthy();
  expect(
    view.getByRole('textbox', {
      name: fieldNameReference({
        visible: ['Outer caption', 'Inner caption'],
        key: 'internalKey',
      }),
    }),
  ).toBeTruthy();
  view.rerender(form(true));
  expect(view.queryByText('Inner caption', { selector: 'label' })).toBeNull();
  expect(
    await view.findByRole('textbox', {
      name: fieldNameReference({
        visible: ['Outer caption'],
        key: 'internalKey',
      }),
    }),
  ).toBeTruthy();
});

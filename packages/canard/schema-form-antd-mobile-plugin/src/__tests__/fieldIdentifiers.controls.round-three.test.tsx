import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

const formProps = {
  fieldInputDefinitions: plugin.fieldInputDefinitions,
  FieldRenderer: plugin.FieldRenderer,
  LabelRenderer: plugin.LabelRenderer,
  ErrorMessageRenderer: plugin.ErrorMessageRenderer,
};

it.each<[string, JSONSchema, string | number | boolean | string[]]>([
  ['text', { type: 'string' }, 'hello'],
  [
    'textarea',
    { type: 'string', presentation: { inputType: 'textarea' } },
    'hello',
  ],
  ['number', { type: 'number' }, 3],
  ['integer', { type: 'integer' }, 3],
  ['boolean', { type: 'boolean' }, false],
  [
    'boolean switch',
    { type: 'boolean', presentation: { inputType: 'switch' } },
    true,
  ],
  [
    'string switch',
    {
      type: 'string',
      enum: ['yes', 'no'],
      presentation: { inputType: 'switch' },
    },
    'yes',
  ],
  [
    'radio',
    {
      type: 'string',
      enum: ['one', 'two'],
      presentation: { inputType: 'radio' },
    },
    'one',
  ],
  [
    'radiogroup',
    {
      type: 'string',
      enum: ['one', 'two'],
      presentation: { inputType: 'radiogroup' },
    },
    'one',
  ],
  [
    'checkbox group',
    {
      type: 'array',
      items: { type: 'string', enum: ['one', 'two'] },
      presentation: { inputType: 'checkbox' },
    },
    ['one'],
  ],
  ['slider', { type: 'number', format: 'slider' }, 3],
])(
  'scopes the real %s controls independently in two Forms',
  (_kind, schema, value) => {
    const jsonSchema: JSONSchema = {
      type: 'object',
      properties: { Field: schema },
    };
    const view = render(
      <>
        <Form
          {...formProps}
          jsonSchema={jsonSchema}
          defaultValue={{ Field: value }}
        />
        <Form
          {...formProps}
          jsonSchema={jsonSchema}
          defaultValue={{ Field: value }}
        />
      </>,
    );
    const fields = view.container.querySelectorAll<HTMLElement>(
      '[data-path="/Field"]',
    );
    expect(fields).toHaveLength(2);
    const addresses = Array.from(fields, (field) =>
      Array.from(
        field.querySelectorAll<HTMLElement>(
          'input:not([type="hidden"]):not([aria-hidden="true"]), textarea, [role="switch"], [role="slider"], [role="combobox"]',
        ),
        (control) => control.id,
      ),
    );
    for (const ids of addresses) {
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(id).toContain(':/Field');
    }
    expect(addresses[0].map((id) => id.slice(id.indexOf(':/Field')))).toEqual(
      addresses[1].map((id) => id.slice(id.indexOf(':/Field'))),
    );
    const all = addresses.flat();
    expect(new Set(all).size).toBe(all.length);
  },
);

it('clicking the second Form label matches an isolated checkbox without changing the first', () => {
  const schema: JSONSchema = {
    type: 'object',
    properties: { Field: { type: 'boolean' } },
  };
  const isolated = render(
    <Form {...formProps} jsonSchema={schema} defaultValue={{ Field: false }} />,
  );
  const checkbox = isolated.container.querySelector<HTMLInputElement>(
    'input[type="checkbox"]',
  )!;
  const before = checkbox.checked;
  fireEvent.click(isolated.container.querySelector('label')!);
  const after = checkbox.checked;
  expect(after).not.toBe(before);
  isolated.unmount();
  const pair = render(
    <>
      <Form
        {...formProps}
        jsonSchema={schema}
        defaultValue={{ Field: false }}
      />
      <Form
        {...formProps}
        jsonSchema={schema}
        defaultValue={{ Field: false }}
      />
    </>,
  );
  const labels = pair.container.querySelectorAll<HTMLLabelElement>(
    '[data-path="/Field"] label',
  );
  const controls = pair.container.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  const label = Array.from(labels).find(
    (item) => item.htmlFor === controls[1].id,
  )!;
  expect(label).toBeDefined();
  expect(label.control).toBe(controls[1]);
  fireEvent.click(label);
  expect({ first: controls[0].checked, second: controls[1].checked }).toEqual({
    first: before,
    second: after,
  });
});

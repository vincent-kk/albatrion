import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

const cases = [
  {
    name: 'enum Select',
    field: { type: 'string', enum: ['alpha', 'beta'] },
    value: 'alpha',
    selector: '[role="combobox"]',
  },
  {
    name: 'URI address',
    field: { type: 'string', format: 'uri' },
    value: 'https://example.com',
    selector: 'input[type="text"]:not([aria-hidden])',
  },
  {
    name: 'date editor',
    field: { type: 'string', format: 'date' },
    value: '2024-01-15',
    selector: '[role="group"][tabindex="0"]',
  },
  {
    name: 'month editor',
    field: { type: 'string', format: 'month' },
    value: '2024-01',
    selector: '[role="group"][tabindex="0"]',
  },
  {
    name: 'time editor',
    field: { type: 'string', format: 'time' },
    value: '10:30:00Z',
    selector: '[role="group"][tabindex="0"]',
  },
] satisfies {
  name: string;
  field: JSONSchema;
  value: string;
  selector: string;
}[];

it.each(cases)(
  'focus(path) reaches the primary control for the $name',
  async ({ field, value, selector }) => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
        jsonSchema={{ type: 'object', properties: { field } }}
        defaultValue={{ field: value }}
        validationMode={0}
      />,
    );
    const target = container
      .querySelector('[data-path="/field"]')
      ?.querySelector(selector);
    expect(target).toBeTruthy();

    await act(async () => {
      ref.current!.focus('/field');
    });

    expect(target?.contains(document.activeElement)).toBe(true);
  },
);

import { createRef } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputDefinition,
  Form,
  type FormHandle,
  type JSONSchema,
} from '@canard/schema-form';

import { FieldInputStringDefinition } from '../FieldInputString';
import { FieldInputTextareaDefinition } from '../FieldInputTextarea';
import { FieldInputUriDefinition } from '../FieldInputUri';

afterEach(cleanup);

type EmptyCase = readonly [
  name: string,
  definition: FieldInputDefinition,
  jsonSchema: JSONSchema,
  selector: string,
  typedValue: string,
];

const cases: EmptyCase[] = [
  [
    'String (non-nullable)',
    FieldInputStringDefinition,
    { type: 'string' },
    'input#\\/field',
    'abc',
  ],
  [
    'String (nullable)',
    FieldInputStringDefinition,
    { type: ['string', 'null'] },
    'input#\\/field',
    'abc',
  ],
  [
    'Textarea (non-nullable)',
    FieldInputTextareaDefinition,
    { type: 'string', format: 'textarea' },
    'textarea#\\/field',
    'abc',
  ],
  [
    'Textarea (nullable)',
    FieldInputTextareaDefinition,
    { type: ['string', 'null'], format: 'textarea' },
    'textarea#\\/field',
    'abc',
  ],
  [
    'Uri (non-nullable)',
    FieldInputUriDefinition,
    { type: 'string', format: 'uri' },
    'input#\\/field',
    'http://abc',
  ],
  [
    'Uri (nullable)',
    FieldInputUriDefinition,
    { type: ['string', 'null'], format: 'uri' },
    'input#\\/field',
    'http://abc',
  ],
];

it.each(cases)(
  '%s publishes undefined when typed text is cleared',
  async (_, definition, fieldSchema, selector, typedValue) => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={[definition]}
        jsonSchema={{
          type: 'object',
          properties: {
            field: fieldSchema,
          },
        }}
      />,
    );

    const input = container.querySelector(selector)!;
    await userEvent.type(input, 'abc');
    expect(ref.current!.getValue()?.field).toBe(typedValue);

    await userEvent.clear(input);
    expect(ref.current!.getValue()?.field).toBeUndefined();
  },
);

it.each([
  ['Uri (non-nullable)', { type: 'string', format: 'uri' } as JSONSchema],
  ['Uri (nullable)', { type: ['string', 'null'], format: 'uri' } as JSONSchema],
])(
  '%s keeps chosen protocol in local state and publishes undefined on protocol-only change',
  async (_, fieldSchema) => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={[FieldInputUriDefinition]}
        jsonSchema={{
          type: 'object',
          properties: {
            field: fieldSchema,
          },
        }}
      />,
    );

    const selectButton = screen.getByRole('combobox');
    await userEvent.click(selectButton);
    const httpsOption = await screen.findByRole('option', { name: 'https://' });
    await userEvent.click(httpsOption);

    expect(ref.current!.getValue()?.field).toBeUndefined();

    const input = container.querySelector('input#\\/field')!;
    await userEvent.type(input, 'example.com');
    expect(ref.current!.getValue()?.field).toBe('https://example.com');
  },
);

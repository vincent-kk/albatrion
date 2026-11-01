import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputDefinition,
  Form,
  type FormHandle,
  type JSONSchema,
} from '@canard/schema-form';

import { FieldInputStringDefinition } from '../FieldInputString';
import { FieldInputTextareaDefinition } from '../FieldInputTextarea';

afterEach(cleanup);

const KEY = 'text';

const cases: ReadonlyArray<
  readonly [string, string, FieldInputDefinition, JSONSchema]
> = [
  [
    'String',
    'non-nullable',
    FieldInputStringDefinition,
    { type: 'string', options: { omitEmpty: false } },
  ],
  [
    'String',
    'nullable',
    FieldInputStringDefinition,
    { type: ['string', 'null'], options: { omitEmpty: false } },
  ],
  [
    'Textarea',
    'non-nullable',
    FieldInputTextareaDefinition,
    { type: 'string', format: 'textarea', options: { omitEmpty: false } },
  ],
  [
    'Textarea',
    'nullable',
    FieldInputTextareaDefinition,
    {
      type: ['string', 'null'],
      format: 'textarea',
      options: { omitEmpty: false },
    },
  ],
];

const readKey = (value: unknown) =>
  value !== null && typeof value === 'object' ? Reflect.get(value, KEY) : value;

it.each(cases)(
  'publishes undefined when %s is cleared (%s)',
  (_, __, definition, property) => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        fieldInputDefinitions={[definition]}
        jsonSchema={{ type: 'object', properties: { [KEY]: property } }}
        onError={() => {}}
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'typed' } });
    expect(ref.current!.getValue()).toEqual({ [KEY]: 'typed' });
    fireEvent.change(input, { target: { value: '' } });
    expect(readKey(ref.current!.getValue())).toBeUndefined();
  },
);

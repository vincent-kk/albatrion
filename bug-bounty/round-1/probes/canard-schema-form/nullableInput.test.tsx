import { cleanup, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '@/schema-form/index';

afterEach(() => cleanup());

const seen: Record<string, unknown> = {};
const Probe = (props: FieldInputProps) => {
  seen[props.path] = props.value;
  return null;
};

it.each([
  ['branch array', { type: ['array', 'null'], items: { type: 'string' } }],
  ['terminal array', { type: ['array', 'null'], items: { type: 'string' }, options: { terminal: true } }],
  ['branch object', { type: ['object', 'null'], properties: { a: { type: 'string' } } }],
  ['terminal object', { type: ['object', 'null'], properties: { a: { type: 'string' } }, options: { terminal: true } }],
])('%s loaded as null reaches its FieldInput as null', (_label, fieldSchema) => {
  const schema = { type: 'object', properties: { f: fieldSchema } } as JSONSchema;
  const ref = createRef<FormHandle<JSONSchema>>();
  render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ f: null }}
      fieldInputMap={{ '/f': Probe }}
      validationMode={ValidationMode.None}
    />,
  );
  expect(ref.current?.getValue()).toEqual({ f: null });
  expect({ inputValue: seen['/f'], nodeValue: ref.current?.findNode('/f')?.value }).toEqual({
    inputValue: null,
    nodeValue: null,
  });
});

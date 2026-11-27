import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  ValidationMode,
} from '../../index';

afterEach(cleanup);

it.each([
  ['branch array', { type: ['array', 'null'], items: { type: 'string' } }],
  [
    'terminal array',
    {
      type: ['array', 'null'],
      items: { type: 'string' },
      options: { terminal: true },
    },
  ],
  [
    'branch object',
    { type: ['object', 'null'], properties: { a: { type: 'string' } } },
  ],
  [
    'terminal object',
    {
      type: ['object', 'null'],
      properties: { a: { type: 'string' } },
      options: { terminal: true },
    },
  ],
] as const)(
  '%s loaded as null reaches its FieldInput as null',
  (_label, field) => {
    const seen: unknown[] = [];
    const Probe = ({ value }: FieldInputProps) => {
      seen.push(value);
      return null;
    };
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'object', properties: { f: field } }}
        defaultValue={{ f: null }}
        fieldInputMap={{ '/f': Probe }}
        validationMode={ValidationMode.None}
      />,
    );
    expect(ref.current?.getValue()).toEqual({ f: null });
    expect(seen.at(-1)).toBeNull();
    expect(ref.current?.findNode('/f')?.value).toBeNull();
  },
);

it.each([
  [
    'branch array',
    { type: 'array', nullable: true, items: { type: 'string' } },
    ['a'],
  ],
  [
    'branch object',
    { type: 'object', nullable: true, properties: { a: { type: 'string' } } },
    { a: 'x' },
  ],
] as const)(
  'nullable: true %s written to null reaches its FieldInput as null',
  (_label, field, initial) => {
    const seen: unknown[] = [];
    const Probe = ({ value }: FieldInputProps) => {
      seen.push(value);
      return null;
    };
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'object', properties: { f: field } }}
        defaultValue={{ f: initial }}
        fieldInputMap={{ '/f': Probe }}
        validationMode={ValidationMode.None}
      />,
    );
    expect(seen.at(-1)).toEqual(initial);
    act(() => ref.current?.findNode('/f')?.setValue(null));
    expect(ref.current?.getValue()).toEqual({ f: null });
    expect(seen.at(-1)).toBeNull();
    expect(ref.current?.findNode('/f')?.value).toBeNull();
  },
);

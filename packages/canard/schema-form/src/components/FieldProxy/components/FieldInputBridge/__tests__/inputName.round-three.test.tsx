import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import type { FieldInputProps } from '@/schema-form/types';

afterEach(cleanup);

/** A consumer input that uses the leaf name as its fallback label. */
const NamedInput = ({ id, name }: FieldInputProps) => (
  <label htmlFor={id}>
    <span data-testid="input-label">{name}</span>
    <input id={id} name={name} />
  </label>
);

it.each(['radio', 'radiogroup'] as const)(
  'keeps a string fallback name equivalent to an unhinted field (%s)',
  (inputType) => {
    const view = render(
      <>
        <Form
          jsonSchema={{
            type: 'object',
            properties: { Field: { type: 'string' } },
          }}
          validationMode={ValidationMode.None}
        />
        <Form
          jsonSchema={{
            type: 'object',
            properties: {
              Field: { type: 'string', presentation: { inputType } },
            },
          }}
          validationMode={ValidationMode.None}
        />
      </>,
    );
    const [plain, hinted] =
      view.container.querySelectorAll<HTMLInputElement>('input');
    expect(plain.name).toBe('Field');
    expect(hinted.name).toBe(plain.name);
    expect(hinted.id).not.toBe(plain.id);
  },
);

it.each(['radio', 'radiogroup'] as const)(
  'keeps a custom input fallback label equivalent to an unhinted field (%s)',
  (inputType) => {
    const view = render(
      <>
        <Form
          jsonSchema={{
            type: 'object',
            properties: {
              Field: {
                type: 'string',
                presentation: { FieldInput: NamedInput },
              },
            },
          }}
          validationMode={ValidationMode.None}
        />
        <Form
          jsonSchema={{
            type: 'object',
            properties: {
              Field: {
                type: 'string',
                presentation: { inputType, FieldInput: NamedInput },
              },
            },
          }}
          validationMode={ValidationMode.None}
        />
      </>,
    );
    const [plain, hinted] = view.getAllByTestId('input-label');
    expect(plain.textContent).toBe('Field');
    expect(hinted.textContent).toBe(plain.textContent);
    expect(
      Array.from(
        view.container.querySelectorAll<HTMLInputElement>('input'),
        (input) => input.name,
      ),
    ).toEqual(['Field', 'Field']);
  },
);

import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '../../index';

// Probe for r5-ids: EQ1 and IN3, ids of referenced, repeated and composed schemas.
// Verification level: public API (package source).

afterEach(cleanup);

const duplicateIds = (container: HTMLElement) => {
  const ids = Array.from(container.querySelectorAll('[id]'), (e) => e.id);
  return ids.filter((id, index) => ids.indexOf(id) !== index);
};

const fieldOf = (element: Element | null) =>
  element?.closest('[data-path]')?.getAttribute('data-path');

/** Each label's own field and its control's field, plus radio checked states, without ids. */
const structure = (container: HTMLElement) => ({
  labels: Array.from(container.querySelectorAll('label[for]'), (label) => [
    fieldOf(label),
    fieldOf(document.getElementById(label.getAttribute('for')!)),
  ]),
  radios: Array.from(
    container.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    (radio) => [fieldOf(radio), radio.value, radio.checked],
  ),
});

const address = {
  type: 'object',
  properties: {
    method: {
      type: 'string',
      enum: ['post', 'courier'],
      presentation: { inputType: 'radio' },
    },
    note: { type: 'string' },
  },
} as const;

const value = {
  billing: { method: 'post', note: 'b' },
  shipping: { method: 'courier', note: 's' },
};

describe('core: referenced and composed schemas', () => {
  it('a $defs template referenced twice gives the same structure as two inline copies', () => {
    const referenced: JSONSchema = {
      type: 'object',
      $defs: { Address: address },
      properties: {
        billing: { $ref: '#/$defs/Address' },
        shipping: { $ref: '#/$defs/Address' },
      },
    } as JSONSchema;
    const inline: JSONSchema = {
      type: 'object',
      properties: { billing: address, shipping: address },
    } as JSONSchema;
    const a = render(
      <Form jsonSchema={referenced} defaultValue={value} validationMode={ValidationMode.None} />,
    );
    const b = render(
      <Form jsonSchema={inline} defaultValue={value} validationMode={ValidationMode.None} />,
    );
    expect(duplicateIds(a.container)).toEqual([]);
    expect(structure(a.container)).toEqual(structure(b.container));
  });

  it('a virtual group keeps ids unique and every label targets a control of its own field', () => {
    const RangeInput = ({ inputId, getInputId, labelId }: FieldInputProps) => (
      <span role="group" aria-labelledby={labelId}>
        <input id={inputId} />
        <input id={getInputId('end')} />
      </span>
    );
    const { container } = render(
      <Form
        validationMode={ValidationMode.None}
        jsonSchema={
          {
            type: 'object',
            properties: {
              startDate: { type: 'string' },
              endDate: { type: 'string' },
            },
            options: {
              virtual: {
                period: {
                  fields: ['startDate', 'endDate'],
                  presentation: { FieldInput: RangeInput },
                },
              },
            },
          } as JSONSchema
        }
      >
        <Form.Label path="/period" />
        <Form.Input path="/period" />
        <Form.Label path="/startDate" />
        <Form.Input path="/startDate" />
      </Form>,
    );
    expect(duplicateIds(container)).toEqual([]);
    expect(structure(container).labels).toEqual([
      ['/period', '/period'],
      ['/startDate', '/startDate'],
    ]);
  });

  it('anyOf branches that both declare one property keep ids unique', async () => {
    const handle = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={handle}
        validationMode={ValidationMode.None}
        jsonSchema={
          {
            type: 'object',
            properties: { a: { type: 'boolean' }, b: { type: 'boolean' } },
            anyOf: [
              { properties: { a: { const: true }, x: { type: 'string' } } },
              { properties: { b: { const: true }, x: { type: 'string' } } },
            ],
          } as JSONSchema
        }
        defaultValue={{ a: true, b: true, x: 'v' }}
      />,
    );
    expect(duplicateIds(container)).toEqual([]);
    expect(container.querySelectorAll('[data-path="/x"]').length).toBeLessThanOrEqual(1);
  });

  it('a field in then and else under one name keeps ids unique across a switch', async () => {
    const handle = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={handle}
        validationMode={ValidationMode.None}
        jsonSchema={
          {
            type: 'object',
            properties: { flag: { type: 'boolean' } },
            if: { properties: { flag: { const: true } } },
            then: {
              properties: {
                x: {
                  type: 'string',
                  enum: ['p', 'q'],
                  presentation: { inputType: 'radio' },
                },
              },
            },
            else: { properties: { x: { type: 'string' } } },
          } as JSONSchema
        }
        defaultValue={{ flag: true, x: 'q' }}
      />,
    );
    expect(duplicateIds(container)).toEqual([]);
    await act(async () => {
      handle.current!.findNode('/flag')!.setValue(false);
    });
    expect(duplicateIds(container)).toEqual([]);
    await act(async () => {
      handle.current!.findNode('/flag')!.setValue(true);
    });
    expect(duplicateIds(container)).toEqual([]);
  });
});

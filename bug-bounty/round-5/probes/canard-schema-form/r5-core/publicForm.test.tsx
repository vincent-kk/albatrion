import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Form,
  type FieldInputProps,
  type FormHandle,
  ValidationMode,
} from '../../index';

afterEach(cleanup);

/** A grouped address widget that edits the documented tuple `[country, state, city]`. */
const AddressInput = ({ value, onChange }: FieldInputProps<any>) => (
  <div>
    <output data-testid="tuple">{JSON.stringify(value)}</output>
    <button
      type="button"
      onClick={() => onChange(['JP', value?.[1], value?.[2]])}
    >
      choose Japan
    </button>
  </div>
);

describe('public Form: virtual tuple positions with a gated-off constituent', () => {
  const schema = {
    type: 'object',
    properties: {
      country: { type: 'string' },
      state: { type: 'string', controls: { active: '../country === "US"' } },
      city: { type: 'string' },
    },
    options: {
      virtual: {
        address: {
          fields: ['country', 'state', 'city'],
          presentation: { FieldInput: AddressInput },
        },
      },
    },
  } as const;

  it('choosing a country in the grouped widget keeps the stored city', async () => {
    const ref = createRef<FormHandle<any, any>>();
    render(
      <Form
        ref={ref}
        jsonSchema={schema as any}
        defaultValue={{ country: 'KR', city: 'Seoul' }}
        validationMode={ValidationMode.None}
      />,
    );
    const shown = screen.getByTestId('tuple').textContent;
    await act(async () => {
      fireEvent.click(screen.getByText('choose Japan'));
    });
    expect({ shown, value: ref.current?.getValue() }).toEqual({
      shown: '["KR",null,"Seoul"]',
      value: { country: 'JP', city: 'Seoul' },
    });
  });
});

describe('public Form: draft-04 `id` resources', () => {
  const documentFor = (ref: string) => ({
    $schema: 'http://json-schema.org/draft-04/schema#',
    id: 'https://example.test/root.json',
    type: 'object',
    properties: { home: { $ref: ref } },
    definitions: {
      kind: { type: 'number', default: 1 },
      address: {
        id: 'address.json',
        type: 'object',
        properties: { kind: { $ref: '#/definitions/kind' } },
        definitions: { kind: { type: 'string', default: 'house' } },
      },
    },
  });

  it.each(['#/definitions/address', 'address.json'])(
    'the reference %s builds the resource-local string kind',
    (ref) => {
      const ref2 = createRef<FormHandle<any, any>>();
      const onError = vi.fn();
      render(
        <Form
          ref={ref2}
          jsonSchema={documentFor(ref) as any}
          validationMode={ValidationMode.None}
          onError={onError}
        />,
      );
      expect({
        value: ref2.current?.getValue(),
        errors: onError.mock.calls.map(([record]) => record.code),
      }).toEqual({ value: { home: { kind: 'house' } }, errors: [] });
    },
  );
});

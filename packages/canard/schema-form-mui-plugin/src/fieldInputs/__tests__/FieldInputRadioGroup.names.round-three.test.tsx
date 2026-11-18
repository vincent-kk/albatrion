import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputRadioGroupDefinition } from '../FieldInputRadioGroup';

afterEach(cleanup);

const method = {
  type: 'string',
  enum: ['card', 'cash'],
  presentation: { inputType: 'radio' },
} as const;

const nestedSchema = {
  type: 'object',
  properties: {
    billing: { type: 'object', properties: { method } },
    shipping: { type: 'object', properties: { method } },
  },
} as const;

const arraySchema = {
  type: 'object',
  properties: {
    contacts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind: {
            type: 'string',
            enum: ['home', 'work'],
            presentation: { inputType: 'radio' },
          },
        },
      },
    },
  },
} as const;

/** Native checked state and the MUI radio root's checked class of one field's radios. */
const radiosOf = (container: HTMLElement, path: string) => {
  const radios = Array.from(
    container.querySelectorAll<HTMLInputElement>(
      `[data-path="${path}"] input[type="radio"]`,
    ),
  );
  return {
    radios,
    native: radios.map((radio) => radio.checked),
    shown: radios.map(
      (radio) =>
        !!radio.closest('.MuiRadio-root')?.classList.contains('Mui-checked'),
    ),
    names: radios.map((radio) => radio.name),
  };
};

describe('radio fields that share a leaf name (mui)', () => {
  it('two radio fields with the same leaf name keep both loaded selections checked', () => {
    const view = render(
      <Form
        fieldInputDefinitions={[FieldInputRadioGroupDefinition]}
        jsonSchema={nestedSchema}
        defaultValue={{
          billing: { method: 'card' },
          shipping: { method: 'cash' },
        }}
        onError={() => {}}
      />,
    );
    const billing = radiosOf(view.container, '/billing/method');
    const shipping = radiosOf(view.container, '/shipping/method');
    expect(billing.radios).toHaveLength(2);
    expect({
      billingNative: billing.native,
      shippingNative: shipping.native,
      billingShown: billing.shown,
      shippingShown: shipping.shown,
    }).toEqual({
      billingNative: [true, false],
      shippingNative: [false, true],
      billingShown: [true, false],
      shippingShown: [false, true],
    });
  });

  it('choosing a shipping radio keeps the billing radio checked', () => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        fieldInputDefinitions={[FieldInputRadioGroupDefinition]}
        jsonSchema={nestedSchema}
        onError={() => {}}
      />,
    );
    act(() => {
      fireEvent.click(radiosOf(view.container, '/billing/method').radios[0]);
    });
    act(() => {
      fireEvent.click(radiosOf(view.container, '/shipping/method').radios[1]);
    });
    expect(ref.current!.getValue()).toEqual({
      billing: { method: 'card' },
      shipping: { method: 'cash' },
    });
    expect(radiosOf(view.container, '/billing/method').native).toEqual([
      true,
      false,
    ]);
  });

  it('radio fields inside two array items keep both loaded selections checked', () => {
    const view = render(
      <Form
        fieldInputDefinitions={[FieldInputRadioGroupDefinition]}
        jsonSchema={arraySchema}
        defaultValue={{ contacts: [{ kind: 'home' }, { kind: 'work' }] }}
        onError={() => {}}
      />,
    );
    const first = radiosOf(view.container, '/contacts/0/kind');
    const second = radiosOf(view.container, '/contacts/1/kind');
    expect({
      first: first.native,
      second: second.native,
      sharedName:
        [...first.names, ...second.names].every((name) => name !== '') &&
        new Set([...first.names, ...second.names]).size === 1,
    }).toEqual({
      first: [true, false],
      second: [false, true],
      sharedName: false,
    });
  });

  it('control: a single radio field keeps its loaded selection checked', () => {
    const view = render(
      <Form
        fieldInputDefinitions={[FieldInputRadioGroupDefinition]}
        jsonSchema={{ type: 'object', properties: { method } }}
        defaultValue={{ method: 'cash' }}
        onError={() => {}}
      />,
    );
    expect(radiosOf(view.container, '/method').native).toEqual([false, true]);
  });
});

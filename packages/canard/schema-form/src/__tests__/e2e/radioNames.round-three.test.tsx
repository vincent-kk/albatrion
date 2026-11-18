import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '../../index';

afterEach(cleanup);

const method = {
  type: 'string',
  enum: ['card', 'cash'],
  presentation: { inputType: 'radio' },
} as const;

/** Two radio fields whose leaf names collide at different object paths. */
const nestedSchema = {
  type: 'object',
  properties: {
    billing: { type: 'object', properties: { method } },
    shipping: { type: 'object', properties: { method } },
  },
} as const;

const radiosOf = (container: HTMLElement, path: string) =>
  Array.from(
    container.querySelectorAll<HTMLInputElement>(
      `[data-path="${path}"] input[type="radio"]`,
    ),
  );

it('two radio fields with the same leaf name show both loaded selections', () => {
  const view = render(
    <Form
      jsonSchema={nestedSchema}
      validationMode={ValidationMode.None}
      defaultValue={{
        billing: { method: 'card' },
        shipping: { method: 'cash' },
      }}
    />,
  );
  const billing = radiosOf(view.container, '/billing/method');
  const shipping = radiosOf(view.container, '/shipping/method');
  expect(billing.length).toBe(2);
  expect(shipping.length).toBe(2);
  expect({
    billing: billing.map((radio) => radio.checked),
    shipping: shipping.map((radio) => radio.checked),
  }).toEqual({ billing: [true, false], shipping: [false, true] });
});

it('choosing a shipping radio keeps the billing radio selection on screen', () => {
  const ref = createRef<FormHandle<typeof nestedSchema>>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={nestedSchema}
      validationMode={ValidationMode.None}
    />,
  );
  const billing = radiosOf(view.container, '/billing/method');
  const shipping = radiosOf(view.container, '/shipping/method');
  act(() => {
    fireEvent.click(billing[0]);
  });
  act(() => {
    fireEvent.click(shipping[1]);
  });
  expect(ref.current?.getValue()).toEqual({
    billing: { method: 'card' },
    shipping: { method: 'cash' },
  });
  expect({
    billing: billing.map((radio) => radio.checked),
    shipping: shipping.map((radio) => radio.checked),
  }).toEqual({ billing: [true, false], shipping: [false, true] });
});

/** Array items repeat the same property name in every item. */
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

it('radio fields inside two array items show both loaded selections', () => {
  const view = render(
    <Form
      jsonSchema={arraySchema}
      validationMode={ValidationMode.None}
      defaultValue={{ contacts: [{ kind: 'home' }, { kind: 'work' }] }}
    />,
  );
  const first = radiosOf(view.container, '/contacts/0/kind');
  const second = radiosOf(view.container, '/contacts/1/kind');
  expect({
    first: first.map((radio) => radio.checked),
    second: second.map((radio) => radio.checked),
    groupNames: [...first, ...second].map((radio) => radio.name),
  }).toEqual({
    first: [true, false],
    second: [false, true],
    groupNames: expect.any(Array),
  });
});

it('control: a single radio field shows its loaded selection', () => {
  const view = render(
    <Form
      jsonSchema={{ type: 'object', properties: { method } } as const}
      validationMode={ValidationMode.None}
      defaultValue={{ method: 'cash' }}
    />,
  );
  expect(
    radiosOf(view.container, '/method').map((radio) => radio.checked),
  ).toEqual([false, true]);
});

it('round-3: native radio names differ by complete field path and FormData keeps both groups', () => {
  const view = render(
    <Form
      jsonSchema={nestedSchema}
      validationMode={ValidationMode.None}
      defaultValue={{
        billing: { method: 'card' },
        shipping: { method: 'cash' },
      }}
    />,
  );
  const billing = radiosOf(view.container, '/billing/method');
  const shipping = radiosOf(view.container, '/shipping/method');
  expect(billing[0].name).not.toBe(shipping[0].name);
  expect(billing[0].name).toBe(billing[1].name);
  expect(shipping[0].name).toBe(shipping[1].name);
  const form = view.container.querySelector('form')!;
  expect([...new FormData(form).entries()]).toEqual([
    [billing[0].name, 'card'],
    [shipping[0].name, 'cash'],
  ]);
});

it('round-3: built-in radios use the scoped id as their native name across Forms', () => {
  const schema = { type: 'object', properties: { method } } as const;
  const view = render(
    <>
      <Form
        jsonSchema={schema}
        defaultValue={{ method: 'card' }}
        validationMode={ValidationMode.None}
      />
      <Form
        jsonSchema={schema}
        defaultValue={{ method: 'cash' }}
        validationMode={ValidationMode.None}
      />
    </>,
  );
  const forms = Array.from(view.container.querySelectorAll('form'));
  const [first, second] = forms.map((form) =>
    Array.from(form.querySelectorAll<HTMLInputElement>('input[type="radio"]')),
  );
  for (const group of [first, second]) {
    expect(group[0].name).toBe(group[0].id.slice(0, -2));
    expect(group[1].name).toBe(group[0].name);
  }
  expect(first[0].name).not.toBe(second[0].name);
  expect([...new FormData(forms[0]).entries()]).toEqual([
    [first[0].name, 'card'],
  ]);
  expect([...new FormData(forms[1]).entries()]).toEqual([
    [second[0].name, 'cash'],
  ]);
  fireEvent.click(second[0]);
  expect(first.map((radio) => radio.checked)).toEqual([true, false]);
  expect(second.map((radio) => radio.checked)).toEqual([true, false]);
});

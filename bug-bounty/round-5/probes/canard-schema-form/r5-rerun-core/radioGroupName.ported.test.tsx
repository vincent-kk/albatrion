import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '@/schema-form';

/**
 * Port of bug-bounty/round-3/probes/canard-schema-form/r3-react/radioGroupName.test.tsx
 * (round 3 item 6, reopened by round 4 item 6). The original selected radios with
 * `input[type="radio"][id^="<path>-"]`, the option id format that the round 4 identifier design
 * replaced. This port selects the radios inside the field's `data-path` wrapper; the
 * assertions are unchanged, and it adds the native name check that item 6 decided.
 */

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

const radiosOf = (container: HTMLElement, path: string) => {
  const field = Array.from(container.querySelectorAll<HTMLElement>('[data-path]')).find(
    (element) => element.getAttribute('data-path') === path,
  );
  return field
    ? Array.from(field.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
    : [];
};

it('two radio fields with the same leaf name show both loaded selections', () => {
  const view = render(
    <Form
      jsonSchema={nestedSchema}
      validationMode={ValidationMode.None}
      defaultValue={{ billing: { method: 'card' }, shipping: { method: 'cash' } }}
    />,
  );
  const billing = radiosOf(view.container, '/billing/method');
  const shipping = radiosOf(view.container, '/shipping/method');
  expect(billing.length).toBe(2);
  expect(shipping.length).toBe(2);
  expect({
    billing: billing.map((radio) => radio.checked),
    shipping: shipping.map((radio) => radio.checked),
    namesDiffer: billing[0].name !== shipping[0].name,
  }).toEqual({ billing: [true, false], shipping: [false, true], namesDiffer: true });
});

it('choosing a shipping radio keeps the billing radio selection on screen', () => {
  const ref = createRef<FormHandle<typeof nestedSchema>>();
  const view = render(
    <Form ref={ref} jsonSchema={nestedSchema} validationMode={ValidationMode.None} />,
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

const arraySchema = {
  type: 'object',
  properties: {
    contacts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: ['home', 'work'], presentation: { inputType: 'radio' } },
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
    namesDiffer: first[0]?.name !== second[0]?.name,
  }).toEqual({ first: [true, false], second: [false, true], namesDiffer: true });
});

it('control: a single radio field shows its loaded selection', () => {
  const view = render(
    <Form
      jsonSchema={{ type: 'object', properties: { method } } as const}
      validationMode={ValidationMode.None}
      defaultValue={{ method: 'cash' }}
    />,
  );
  expect(radiosOf(view.container, '/method').map((radio) => radio.checked)).toEqual([false, true]);
});

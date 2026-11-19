import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, FormProvider, ValidationMode } from '@/schema-form';

/**
 * Port of bug-bounty/round-3/probes/canard-schema-form/r3-react/siblingFormIds.test.tsx
 * (round 3 item 1, high; reopened by round 4 item 8). The original located elements by the
 * path-equal ids (`label[for="/email"]`, `label[for="/plan-1"]`) that the round 4 identifier
 * design replaced. This port finds each field through its `data-path` wrapper and matches a
 * label to a control by comparing `htmlFor` with the control's id, never by a selector built
 * from a scoped id (NWSAPI mis-escapes `:`). The assertions are unchanged.
 */

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    plan: {
      type: 'string',
      enum: ['free', 'pro'],
      presentation: { inputType: 'radio' },
    },
  },
} as const;

const renderSiblings = () =>
  render(
    <FormProvider>
      <section data-testid="shipping">
        <Form jsonSchema={schema} validationMode={ValidationMode.None} />
      </section>
      <section data-testid="billing">
        <Form jsonSchema={schema} validationMode={ValidationMode.None} />
      </section>
    </FormProvider>,
  );

const fieldOf = (scope: HTMLElement, path: string) =>
  Array.from(scope.querySelectorAll<HTMLElement>('[data-path]')).find(
    (element) => element.getAttribute('data-path') === path,
  )!;

const labelFor = (scope: HTMLElement, control: HTMLElement) =>
  Array.from(scope.querySelectorAll<HTMLLabelElement>('label')).find(
    (label) => label.htmlFor === control.id,
  ) ?? null;

it('each sibling Form label labels the input of its own Form', () => {
  const view = renderSiblings();
  const billing = view.getByTestId('billing');
  const input = fieldOf(billing, '/email').querySelector<HTMLInputElement>('input')!;
  expect(input).not.toBeNull();
  const label = labelFor(billing, input);
  expect(label).not.toBeNull();
  expect(label!.control).toBe(input);
});

it('ids rendered by two sibling Forms are unique in the document', () => {
  const view = renderSiblings();
  const ids = Array.from(view.container.querySelectorAll('[id]')).map(
    (element) => element.id,
  );
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  expect(duplicates).toEqual([]);
});

const writeSchema = {
  type: 'object',
  properties: {
    agree: { type: 'boolean' },
    plan: {
      type: 'string',
      enum: ['free', 'pro'],
      presentation: { inputType: 'radio' },
    },
  },
} as const;

const renderWriteSiblings = () => {
  const first = createRef<FormHandle<typeof writeSchema>>();
  const second = createRef<FormHandle<typeof writeSchema>>();
  const view = render(
    <FormProvider>
      <section data-testid="first">
        <Form ref={first} jsonSchema={writeSchema} validationMode={ValidationMode.None} />
      </section>
      <section data-testid="second">
        <Form ref={second} jsonSchema={writeSchema} validationMode={ValidationMode.None} />
      </section>
    </FormProvider>,
  );
  return { view, first, second };
};

it('clicking a radio option text in the second Form selects that option in the second Form', () => {
  const { view, first, second } = renderWriteSiblings();
  const scope = view.getByTestId('second');
  const radio = fieldOf(scope, '/plan').querySelectorAll<HTMLInputElement>('input[type="radio"]')[1];
  const option = labelFor(scope, radio)!;
  expect(option).not.toBeNull();
  act(() => {
    fireEvent.click(option);
  });
  expect({
    first: first.current?.getValue(),
    second: second.current?.getValue(),
  }).toEqual({ first: {}, second: { plan: 'pro' } });
});

it('clicking the boolean field label in the second Form toggles the second Form', () => {
  const { view, first, second } = renderWriteSiblings();
  const scope = view.getByTestId('second');
  const checkbox = fieldOf(scope, '/agree').querySelector<HTMLInputElement>('input')!;
  const label = labelFor(scope, checkbox)!;
  expect(label).not.toBeNull();
  act(() => {
    fireEvent.click(label);
  });
  expect({
    first: first.current?.getValue(),
    second: second.current?.getValue(),
  }).toEqual({ first: {}, second: { agree: true } });
});

it('the radio group of the second Form is labelled by its own field title', () => {
  const view = renderSiblings();
  const billing = view.getByTestId('billing');
  const group = billing.querySelector<HTMLElement>('[role="group"]');
  expect(group).not.toBeNull();
  const labelledBy = group!.getAttribute('aria-labelledby')!;
  const title = document.getElementById(labelledBy);
  expect(billing.contains(title)).toBe(true);
});

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, FormProvider, ValidationMode } from '@/schema-form';

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

/**
 * imperative-and-layout.md "Compose one data tree": sibling Forms under FormProvider are the
 * documented way to place independent forms on one page.
 */
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

it('each sibling Form label labels the input of its own Form', () => {
  const view = renderSiblings();
  const billing = view.getByTestId('billing');
  const label = billing.querySelector<HTMLLabelElement>('label[for="/email"]');
  const input = billing.querySelector<HTMLInputElement>('input[type="text"], input:not([type])');
  expect(label).not.toBeNull();
  expect(input).not.toBeNull();
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
        <Form
          ref={first}
          jsonSchema={writeSchema}
          validationMode={ValidationMode.None}
        />
      </section>
      <section data-testid="second">
        <Form
          ref={second}
          jsonSchema={writeSchema}
          validationMode={ValidationMode.None}
        />
      </section>
    </FormProvider>,
  );
  return { view, first, second };
};

it('clicking a radio option text in the second Form selects that option in the second Form', () => {
  const { view, first, second } = renderWriteSiblings();
  const option = view
    .getByTestId('second')
    .querySelector<HTMLLabelElement>('label[for="/plan-1"]')!;
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
  const label = view
    .getByTestId('second')
    .querySelector<HTMLLabelElement>('label[for="/agree"]')!;
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

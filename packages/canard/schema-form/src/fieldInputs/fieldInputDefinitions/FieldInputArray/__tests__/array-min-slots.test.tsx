import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { renderForm } from '@/schema-form/__tests__/renderForm';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import type { JSONSchema } from '@/schema-form/types';

afterEach(cleanup);

/**
 * Render a form and expose the array wrapper under the given path.
 * @param jsonSchema - Object schema holding the array under `path`.
 * @param defaultValue - Initial form value.
 * @returns Handle ref and a reader for the array wrapper element.
 */
const renderArray = (jsonSchema: JSONSchema, defaultValue: unknown) => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form ref={ref} jsonSchema={jsonSchema} defaultValue={defaultValue} />,
  );
  const wrapper = () =>
    view.container.querySelector<HTMLElement>('[data-path="/rows"]')!;
  return { ref, wrapper };
};

/**
 * Inputs drawn inside the array that belong to no item node.
 * @param wrapper - The array's `[data-path]` element.
 * @returns Slot inputs in document order.
 */
const slotInputs = (wrapper: HTMLElement) =>
  Array.from(wrapper.querySelectorAll('input')).filter(
    (input) => !input.closest('[data-path^="/rows/"]'),
  );

const rowsSchema = {
  type: 'object',
  properties: {
    rows: { type: 'array', items: { type: 'string' }, minItems: 3 },
  },
} satisfies JSONSchema;

it('tidy-S draws minItems empty slots in the UI only and writes no value', () => {
  const { ref, wrapper } = renderArray(rowsSchema, { rows: [] });
  expect(slotInputs(wrapper())).toHaveLength(3);
  expect(wrapper().querySelector('[data-path^="/rows/"]')).toBeNull();
  expect(ref.current!.findNode('/rows')!.value).toEqual([]);
  expect(ref.current!.getValue()).toEqual({});
});

it('tidy-S writes the typed slot position at input time and keeps the count', () => {
  const { ref, wrapper } = renderArray(rowsSchema, { rows: [] });
  act(() => {
    fireEvent.change(slotInputs(wrapper())[0], { target: { value: 'a' } });
  });
  expect(ref.current!.findNode('/rows')!.value).toEqual(['a']);
  const row = wrapper().querySelector<HTMLInputElement>(
    '[data-path="/rows/0"] input',
  )!;
  expect(row.value).toBe('a');
  expect(document.activeElement).toBe(row);
  expect(slotInputs(wrapper())).toHaveLength(2);
  act(() => {
    fireEvent.change(slotInputs(wrapper())[0], { target: { value: 'b' } });
  });
  expect(ref.current!.findNode('/rows')!.value).toEqual(['a', 'b']);
  expect(
    wrapper().querySelector<HTMLInputElement>('[data-path="/rows/0"] input'),
  ).toBe(row);
  expect(slotInputs(wrapper())).toHaveLength(1);
});

it('tidy-S follows a gated minItems change with the slot count', async () => {
  const form = await renderForm(
    {
      type: 'object',
      properties: {
        many: { type: 'boolean' },
        rows: { type: 'array', items: { type: 'string' }, minItems: 1 },
      },
      allOf: [
        {
          if: { properties: { many: { const: true } }, required: ['many'] },
          then: { properties: { rows: { minItems: 3 } } },
        },
      ],
    },
    { defaultValue: { rows: [] }, validator: true },
  );
  const wrapper = () =>
    form.container.querySelector<HTMLElement>('[data-path="/rows"]')!;
  try {
    expect(slotInputs(wrapper())).toHaveLength(1);
    await act(async () => form.node('/many')!.setValue(true));
    expect(slotInputs(wrapper())).toHaveLength(3);
    await act(async () => form.node('/many')!.setValue(false));
    expect(slotInputs(wrapper())).toHaveLength(1);
    expect(form.node('/rows')!.value).toEqual([]);
  } finally {
    form.unmount();
  }
});

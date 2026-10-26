import { createRef } from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputNumberDefinition } from '../FieldInputNumber';

afterEach(cleanup);

const mount = (
  type: 'number' | 'integer' | ['number', 'null'],
  defaultValue?: number,
) => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputNumberDefinition]}
      jsonSchema={{ type }}
      defaultValue={defaultValue}
      onError={() => {}}
    />,
  );
  const input = () => screen.getByRole('spinbutton') as HTMLInputElement;
  const type_ = (text: string) =>
    fireEvent.change(input(), { target: { value: text } });
  return { ref, input, type_ };
};

it.each([
  ['non-nullable', 'number' as const],
  ['nullable', ['number', 'null'] as ['number', 'null']],
])('publishes undefined when the text is cleared (%s)', (_, schemaType) => {
  const { ref, input, type_ } = mount(schemaType, 3);
  fireEvent.focus(input());
  type_('5');
  expect(ref.current!.getValue()).toBe(5);
  type_('');
  expect(ref.current!.getValue()).toBeUndefined();
});

it('keeps unparsable text as a draft and reverts it at blur', () => {
  const { ref, input, type_ } = mount('number', 3);
  fireEvent.focus(input());
  type_('7');
  type_('abc');
  expect(ref.current!.getValue()).toBe(7);
  fireEvent.blur(input());
  expect(input().value).toBe('7');
});

it('displays an empty field for a node without a value', () => {
  const { input } = mount('number');
  expect(input().value).toBe('');
});

it('keeps the plus button connected and focused while reverting 1.5 on an integer node', async () => {
  const { input, type_ } = mount('integer', 3);
  act(() => input().focus());
  type_('1.5');
  const plus = screen.getAllByRole('button').at(-1)!;
  await act(async () => {
    plus.focus();
  });
  expect(plus.isConnected).toBe(true);
  expect(document.activeElement).toBe(plus);
  expect(input().value).toBe('3');
});

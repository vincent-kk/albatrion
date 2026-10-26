import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputNumberDefinition } from '../FieldInputNumber';

afterEach(cleanup);

const mount = (type: 'number' | 'integer' | ['number', 'null']) => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputNumberDefinition]}
      jsonSchema={{ type }}
      defaultValue={3}
      onError={() => {}}
    />,
  );
  const input = view.container.querySelector('input') as HTMLInputElement;
  return { ref, input };
};

it.each([
  ['non-nullable', 'number' as const],
  ['nullable', ['number', 'null'] as ['number', 'null']],
])('publishes undefined, never null, for an empty field (%s)', (_, type) => {
  const { ref, input } = mount(type);
  fireEvent.change(input, { target: { value: '' } });
  expect(ref.current!.getValue()).toBeUndefined();
});

it('does not publish while the browser reports badInput', () => {
  const { ref, input } = mount('number');
  Object.defineProperty(input, 'validity', { value: { badInput: true } });
  fireEvent.change(input, { target: { value: '5' } });
  expect(ref.current!.getValue()).toBe(3);
});

it('does not publish 1.5 on an integer node, and never truncates 1e3 to 1', () => {
  const { ref, input } = mount('integer');
  fireEvent.change(input, { target: { value: '1.5' } });
  expect(ref.current!.getValue()).toBe(3);
  fireEvent.change(input, { target: { value: '1e3' } });
  expect(ref.current!.getValue()).toBe(1000);
  fireEvent.change(input, { target: { value: '4' } });
  expect(ref.current!.getValue()).toBe(4);
});

it('publishes 1000 for 1e3 on a number node', () => {
  const { ref, input } = mount('number');
  fireEvent.change(input, { target: { value: '1e3' } });
  expect(ref.current!.getValue()).toBe(1000);
});

it('restores the displayed text to the node value when blurred with a draft left', () => {
  const { ref, input } = mount('integer');
  fireEvent.change(input, { target: { value: '1.5' } });
  expect(input.value).toBe('1.5');
  fireEvent.blur(input);
  expect(ref.current!.getValue()).toBe(3);
  expect(input.value).toBe('3');
});

it('leaves the displayed text alone on blur when no draft is pending', () => {
  const { input } = mount('number');
  fireEvent.change(input, { target: { value: '7' } });
  fireEvent.blur(input);
  expect(input.value).toBe('7');
});

it('restores an empty display on blur when the browser holds unparsable text in an empty field', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputNumberDefinition]}
      jsonSchema={{ type: 'number' }}
      onError={() => {}}
    />,
  );
  const input = view.container.querySelector('input') as HTMLInputElement;
  Object.defineProperty(input, 'validity', { value: { badInput: true } });
  const write = vi.spyOn(input, 'value', 'set');
  fireEvent.blur(input);
  expect(write).toHaveBeenCalledWith('');
});

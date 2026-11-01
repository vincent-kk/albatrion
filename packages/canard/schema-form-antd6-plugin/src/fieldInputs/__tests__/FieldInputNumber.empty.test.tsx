import { createRef } from 'react';
import type { ComponentProps } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import type { InputNumber as AntdInputNumber } from 'antd';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputNumberDefinition } from '../FieldInputNumber';

type NumberProps = ComponentProps<typeof AntdInputNumber>;

const received = vi.hoisted(() => ({ props: [] as NumberProps[] }));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    InputNumber: (props: NumberProps) => {
      received.props.push(props);
      return <actual.InputNumber {...props} />;
    },
  };
});

beforeEach(() => {
  received.props.length = 0;
});

afterEach(cleanup);

const mount = (
  type: 'number' | 'integer' | ['number', 'null'],
  bounds: { minimum?: number; maximum?: number } = {},
) => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputNumberDefinition]}
      jsonSchema={{ type, ...bounds }}
      defaultValue={3}
      onError={() => {}}
    />,
  );
  const send = (value: number | null) =>
    act(() => {
      (received.props.at(-1)!.onChange as (v: number | null) => void)(value);
    });
  return { ref, send };
};

it.each([
  ['non-nullable', 'number' as const],
  ['nullable', ['number', 'null'] as ['number', 'null']],
])('publishes undefined when InputNumber clears (%s)', (_, type) => {
  const { ref, send } = mount(type);
  send(null);
  expect(ref.current!.getValue()).toBeUndefined();
});

it('does not publish NaN', () => {
  const { ref, send } = mount('number');
  send(NaN);
  expect(ref.current!.getValue()).toBe(3);
});

it('does not publish 1.5 on an integer node but publishes an integer', () => {
  const { ref, send } = mount('integer');
  send(1.5);
  expect(ref.current!.getValue()).toBe(3);
  send(4);
  expect(ref.current!.getValue()).toBe(4);
});

it('reverts a withheld 1.5 on an integer node to the node value at blur', async () => {
  const { ref } = mount('integer');
  const input = () => screen.getByRole('spinbutton') as HTMLInputElement;
  fireEvent.change(input(), { target: { value: '1.5' } });
  expect(input().value).toBe('1.5');
  await act(async () => {
    fireEvent.blur(input());
  });
  expect(input().value).toBe('3');
  expect(ref.current!.getValue()).toBe(3);
});

it.each([
  { bound: 'maximum', bounds: { minimum: 0, maximum: 3.5 }, draft: '10' },
  { bound: 'minimum', bounds: { minimum: 2.5 }, draft: '0' },
])(
  'reverts a blur correction to a non-integer $bound on an integer node',
  async ({ bounds, draft }) => {
    const { ref } = mount('integer', bounds);
    const input = () => screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input(), { target: { value: draft } });
    expect(input().value).toBe(draft);
    expect(ref.current!.getValue()).toBe(3);
    await act(async () => {
      fireEvent.blur(input());
    });
    expect(input().value).toBe('3');
    expect(ref.current!.getValue()).toBe(3);
  },
);

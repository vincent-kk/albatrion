import { createRef } from 'react';
import type { ComponentProps } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import type { Stepper as MobileStepper } from 'antd-mobile';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputNumberDefinition } from '../FieldInputNumber';

type StepperProps = ComponentProps<typeof MobileStepper>;

const received = vi.hoisted(() => ({ props: [] as StepperProps[] }));

vi.mock('antd-mobile', async (importOriginal) => ({
  ...(await importOriginal<typeof import('antd-mobile')>()),
  Stepper: (props: StepperProps) => {
    received.props.push(props);
    return null;
  },
}));

beforeEach(() => {
  received.props.length = 0;
});

afterEach(cleanup);

const mount = (type: 'number' | 'integer' | ['number', 'null']) => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputNumberDefinition]}
      jsonSchema={{ type }}
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
])('publishes undefined when Stepper clears (%s)', (_, type) => {
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

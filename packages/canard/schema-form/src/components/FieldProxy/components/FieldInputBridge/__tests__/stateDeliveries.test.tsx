import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { flushSync } from 'react-dom';
import { afterEach, expect, it, vi } from 'vitest';

import { advanceValidationFrame } from '@/schema-form/__tests__/helpers/advanceValidationFrame';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import { FieldNodeState } from '@/schema-form/core';
import type { FieldInputProps, InputRendererProps } from '@/schema-form/types';

import { createStateDeliveryForm } from './helpers/createStateDeliveryForm';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('updates group visibility without rendering the frame or input on Touched-only deliveries', () => {
  const view = createStateDeliveryForm();
  expect(view.getByTestId('visibility').textContent).toBe('hidden');
  act(() => view.node.setState({ [FieldNodeState.Touched]: true }));
  expect(view.getByTestId('visibility').textContent).toBe('visible');
  expect(view.getByTestId('message').textContent).toBe('Issue');
  expect(view.frames).toHaveBeenCalledTimes(0);
  expect(view.inputs).toHaveBeenCalledTimes(0);

  act(() => view.node.setState({ [FieldNodeState.Touched]: false }));
  expect(view.getByTestId('visibility').textContent).toBe('hidden');
  expect(view.getByTestId('message').textContent).toBe('');
  expect(view.frames).toHaveBeenCalledTimes(0);
  expect(view.inputs).toHaveBeenCalledTimes(0);
});

it('renders the pristine field frame exactly once for its first edit', async () => {
  const view = createStateDeliveryForm(false);
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false);
  flushSync(() => view.change('typed'));
  await new Promise((resolve) => setTimeout(resolve, 30));
  expect(view.node.value).toBe('typed');
  expect(
    view.frames.mock.calls.filter(([props]) => props.path === '/field'),
  ).toHaveLength(1);
  expect(view.inputs).toHaveBeenCalledTimes(1);
});

it('marks Touched after blur and shows the group error without rendering its frame', async () => {
  const view = createStateDeliveryForm();
  fireEvent.blur(view.container.querySelector('input')!);
  await advanceValidationFrame();
  expect(view.node.state[FieldNodeState.Touched]).toBe(true);
  expect(view.getByTestId('visibility').textContent).toBe('visible');
  expect(view.getByTestId('message').textContent).toBe('Issue');
  expect(view.frames).toHaveBeenCalledTimes(0);
  expect(view.inputs).toHaveBeenCalledTimes(0);
});
it('renders the root frame once when a pristine child receives its first edit', async () => {
  const ref = createRef<FormHandle>();
  const frames = vi.fn(({ children }: InputRendererProps) => (
    <section>{children}</section>
  ));
  const inputs = vi.fn(({ path, defaultValue, onChange }: FieldInputProps) => (
    <input
      id={path}
      defaultValue={defaultValue}
      onChange={(event) => onChange(event.target.value)}
    />
  ));
  const properties = Object.fromEntries(
    Array.from({ length: 200 }, (_, index) => [
      `field${index}`,
      { type: 'string' as const },
    ]),
  );
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'object', properties }}
      InputRenderer={frames}
      fieldInputDefinitions={[{ test: { type: 'string' }, Component: inputs }]}
    />,
  );
  frames.mockClear();
  inputs.mockClear();
  await act(async () =>
    fireEvent.change(view.container.querySelector('input')!, {
      target: { value: 'a' },
    }),
  );
  const split = {
    root: frames.mock.calls.filter(([props]) => props.path === '').length,
    leaf: frames.mock.calls.filter(([props]) => props.path === '/field0')
      .length,
    allFrames: frames.mock.calls.length,
    inputs: inputs.mock.calls.length,
  };
  expect(ref.current!.findNode('/field0')!.value).toBe('a');
  expect(split).toEqual({ root: 1, leaf: 1, allFrames: 2, inputs: 1 });
});

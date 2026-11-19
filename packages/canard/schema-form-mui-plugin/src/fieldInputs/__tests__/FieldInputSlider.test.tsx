import { createRef } from 'react';

import type { SliderProps } from '@mui/material';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../FieldInputSlider';

/** Slider props captured by Vitest's hoisted MUI mock for callback assertions. */
const received = vi.hoisted(() => ({ props: [] as SliderProps[] }));

vi.mock('@mui/material', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@mui/material')>()),
  Slider: (props: SliderProps) => {
    received.props.push(props);
    return null;
  },
}));

beforeEach(() => {
  received.props.length = 0;
});

afterEach(cleanup);

it('publishes only on commit when presentation.FieldInputProps.lazy is true', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'number',
        default: 0,
        presentation: {
          inputType: 'slider',
          FieldInputProps: { lazy: true },
        },
      }}
    />,
  );
  await act(async () => {});
  expect(ref.current!.getValue()).toBe(0);
  const props = received.props.at(-1)!;

  await act(async () => props.onChange!(new Event('change'), 42, 0));
  expect(ref.current!.getValue()).toBe(0);

  await act(async () => props.onChangeCommitted!(new Event('mouseup'), 42));
  expect(ref.current!.getValue()).toBe(42);
});

it('stores a committed value equal to the minimum when the slider is unset', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'number',
        minimum: 10,
        maximum: 20,
        presentation: { inputType: 'slider' },
      }}
    />,
  );
  await act(async () => {});
  expect(ref.current!.getValue()).toBeUndefined();
  const props = received.props.at(-1)!;

  // MUI skips onChange when the value stays at the minimum but still commits it.
  await act(async () => props.onChangeCommitted!(new Event('mouseup'), 10));
  expect(ref.current!.getValue()).toBe(10);
});

it('control: a commit does not write again when the slider holds a value and lazy is false', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'number',
        default: 0,
        presentation: { inputType: 'slider', FieldInputProps: { lazy: false } },
      }}
    />,
  );
  await act(async () => {});
  const props = received.props.at(-1)!;

  await act(async () => props.onChangeCommitted!(new Event('mouseup'), 42));
  expect(ref.current!.getValue()).toBe(0);
});

it('publishes on every move when lazy is false', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'number',
        default: 0,
        presentation: { inputType: 'slider', FieldInputProps: { lazy: false } },
      }}
    />,
  );
  await act(async () => {});
  const props = received.props.at(-1)!;

  await act(async () => props.onChange!(new Event('change'), 42, 0));
  expect(ref.current!.getValue()).toBe(42);
});

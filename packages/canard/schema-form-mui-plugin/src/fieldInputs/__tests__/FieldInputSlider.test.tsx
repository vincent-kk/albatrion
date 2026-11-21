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

it('publishes on every move when lazy is omitted', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'number',
        default: 0,
        presentation: { inputType: 'slider' },
      }}
    />,
  );
  await act(async () => {});
  const props = received.props.at(-1)!;

  await act(async () => props.onChange!(new Event('change'), 42, 0));
  expect(ref.current!.getValue()).toBe(42);
});

import { createRef } from 'react';
import type { ComponentProps } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import type { Slider as AntdSlider } from 'antd';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../FieldInputSlider';

type SliderProps = ComponentProps<typeof AntdSlider>;

const received = vi.hoisted(() => ({ props: [] as SliderProps[] }));

vi.mock('antd', async (importOriginal) => ({
  ...(await importOriginal<typeof import('antd')>()),
  Slider: (props: SliderProps) => {
    received.props.push(props);
    return null;
  },
}));

beforeEach(() => {
  received.props.length = 0;
});

afterEach(cleanup);

it.each([
  ['non-nullable', 'number' as const],
  ['nullable', ['number', 'null'] as ['number', 'null']],
])('publishes undefined for null and never NaN (%s)', (_, type) => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type,
        presentation: { inputType: 'slider', FieldInputProps: { lazy: false } },
      }}
      defaultValue={5}
      onError={() => {}}
    />,
  );
  const change = (value: number | null) =>
    act(() => {
      (received.props.at(-1)!.onChange as (v: number | null) => void)(value);
    });
  change(NaN);
  expect(ref.current!.getValue()).toBe(5);
  change(null);
  expect(ref.current!.getValue()).toBeUndefined();
});

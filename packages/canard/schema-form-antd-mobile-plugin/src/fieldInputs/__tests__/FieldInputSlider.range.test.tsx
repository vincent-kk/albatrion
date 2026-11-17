import { createRef } from 'react';
import type { ComponentProps } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import type { Slider as MobileSlider } from 'antd-mobile';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../FieldInputSlider';

type SliderProps = ComponentProps<typeof MobileSlider>;

const received = vi.hoisted(() => ({ props: [] as SliderProps[] }));

vi.mock('antd-mobile', async (importOriginal) => ({
  ...(await importOriginal<typeof import('antd-mobile')>()),
  Slider: (props: SliderProps) => {
    received.props.push(props);
    return null;
  },
}));

beforeEach(() => {
  received.props.length = 0;
});
afterEach(cleanup);

const publish = (value: number | [number, number]) =>
  act(() => {
    (
      received.props.at(-1)!.onAfterChange as (
        value: number | [number, number],
      ) => void
    )(value);
  });

it('renders a range slider with the array default for a numeric array schema', () => {
  render(
    <Form
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'array',
        items: { type: 'number' },
        format: 'slider',
        minimum: 0,
        maximum: 100,
      }}
      defaultValue={[10, 20]}
      onError={() => {}}
    />,
  );
  const props = received.props.at(-1)!;
  expect(props.range).toBe(true);
  expect(props.defaultValue).toEqual([10, 20]);
});

it('never writes a scalar into a numeric array node', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'array',
        items: { type: 'number' },
        format: 'slider',
      }}
      defaultValue={[10, 20]}
      onError={() => {}}
    />,
  );
  publish(30);
  expect(ref.current!.getValue()).toEqual([10, 20]);
  publish([30, 40]);
  expect(ref.current!.getValue()).toEqual([30, 40]);
});

it('renders a single thumb for a number schema even when presentation asks for a range', () => {
  render(
    <Form
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'number',
        format: 'slider',
        presentation: { FieldInputProps: { range: true } },
      }}
      defaultValue={10}
      onError={() => {}}
    />,
  );
  const props = received.props.at(-1)!;
  expect(props.range).toBe(false);
  expect(props.defaultValue).toBe(10);
});

it('never writes an array into a number node', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: 'number',
        format: 'slider',
        presentation: { FieldInputProps: { range: true } },
      }}
      defaultValue={10}
      onError={() => {}}
    />,
  );
  publish([1, 2]);
  expect(ref.current!.getValue()).toBe(10);
  publish(30);
  expect(ref.current!.getValue()).toBe(30);
});

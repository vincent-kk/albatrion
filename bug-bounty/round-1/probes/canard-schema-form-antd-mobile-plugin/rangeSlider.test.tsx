import { createRef } from 'react';
import type { ComponentProps } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import type { Slider as MobileSlider } from 'antd-mobile';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../../index';

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

it('numeric array with format slider renders a range slider (README: "range slider")', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
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
  expect(props).toBeDefined();
  expect(props.range).toBe(true);
  expect(props.defaultValue).toEqual([10, 20]);
});

it('numeric array slider never writes a scalar into the array node', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={{
        type: 'array',
        items: { type: 'number' },
        format: 'slider',
      }}
      defaultValue={[10, 20]}
      onError={() => {}}
    />,
  );
  const props = received.props.at(-1)!;
  act(() => {
    (props.onAfterChange as (v: number) => void)(30);
  });
  expect(Array.isArray(ref.current!.getValue())).toBe(true);
});

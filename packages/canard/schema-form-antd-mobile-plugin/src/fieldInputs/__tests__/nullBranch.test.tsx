import { createRef } from 'react';
import type { ComponentProps } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Slider as MobileSlider } from 'antd-mobile';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputArrayDefinition } from '../FieldInputArray';
import { FieldInputSliderDefinition } from '../FieldInputSlider';
import { FieldInputStringDefinition } from '../FieldInputString';
import { FieldInputStringCheckboxDefinition } from '../FieldInputStringCheckbox';

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

it('nullable checkbox group with a null value shows no selection and commits an array', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputStringCheckboxDefinition]}
      jsonSchema={{
        type: ['array', 'null'],
        items: { type: 'string', enum: ['a', 'b'] },
        presentation: { inputType: 'checkbox' },
      }}
      defaultValue={null}
      onError={() => {}}
    />,
  );
  expect(ref.current!.getValue()).toBeNull();
  const boxes = container.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  expect([...boxes].map((box) => box.checked)).toEqual([false, false]);
  await userEvent.click(boxes[1]);
  expect(ref.current!.getValue()).toEqual(['b']);
});

it('nullable range slider with a null value starts empty and commits a two-number array', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
      jsonSchema={{
        type: ['array', 'null'],
        items: { type: 'number' },
        format: 'slider',
      }}
      defaultValue={null}
      onError={() => {}}
    />,
  );
  expect(ref.current!.getValue()).toBeNull();
  const props = received.props.at(-1)!;
  expect(props.range).toBe(true);
  expect(props.defaultValue).toBeUndefined();
  act(() => {
    (props.onAfterChange as (value: [number, number]) => void)([10, 20]);
  });
  expect(ref.current!.getValue()).toEqual([10, 20]);
});

it('nullable dynamic list with a null value renders no rows and adds one item', async () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[
        FieldInputArrayDefinition,
        FieldInputStringDefinition,
      ]}
      jsonSchema={{ type: ['array', 'null'], items: { type: 'string' } }}
      defaultValue={null}
      onError={() => {}}
    />,
  );
  expect(ref.current!.getValue()).toBeNull();
  expect(screen.queryByRole('button', { name: '-' })).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: '+' }));
  const value = ref.current!.getValue();
  expect(Array.isArray(value)).toBe(true);
  expect(value).toHaveLength(1);
});

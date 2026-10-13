import type { ComponentProps } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import type { Slider as MobileSlider } from 'antd-mobile';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FormTypeInputSliderDefinition } from '../FormTypeInputSlider';

type SliderProps = ComponentProps<typeof MobileSlider>;

const received = vi.hoisted(() => ({ props: [] as SliderProps[] }));

vi.mock('antd-mobile', async (importOriginal) => ({
  ...(await importOriginal<typeof import('antd-mobile')>()),
  Slider: (props: SliderProps) => {
    received.props.push(props);
    return null;
  },
}));

const marks = { 0: '0', 50: '50', 100: '100' };

const preventWindowError = (event: ErrorEvent) => event.preventDefault();

beforeEach(() => {
  received.props.length = 0;
});

afterEach(() => {
  cleanup();
  window.removeEventListener('error', preventWindowError);
});

it('reads range, marks and lazy from presentation.FormTypeInputProps', () => {
  render(
    <Form
      formTypeInputDefinitions={[FormTypeInputSliderDefinition]}
      jsonSchema={{
        type: 'object',
        properties: {
          level: {
            type: 'number',
            format: 'slider',
            presentation: {
              FormTypeInputProps: { range: true, marks, lazy: false },
            },
          },
        },
      }}
    />,
  );
  const props = received.props.at(-1)!;
  expect(props.range).toBe(true);
  expect(props.marks).toEqual(marks);
  expect(props.onChange).toBeTypeOf('function');
  expect(props.onAfterChange).toBeUndefined();
});

it('rejects range under options as UNKNOWN_GROUP_KEY', () => {
  window.addEventListener('error', preventWindowError);
  const onError = vi.fn();
  render(
    <Form
      formTypeInputDefinitions={[FormTypeInputSliderDefinition]}
      onError={onError}
      jsonSchema={{
        type: 'object',
        properties: {
          level: {
            type: 'number',
            format: 'slider',
            options: { range: true },
          },
        },
      }}
    />,
  );
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({
      code: 'JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY',
      details: expect.objectContaining({ group: 'options', key: 'range' }),
    }),
  );
  expect(screen.getByRole('alert').textContent).toBe('Unable to load form.');
});

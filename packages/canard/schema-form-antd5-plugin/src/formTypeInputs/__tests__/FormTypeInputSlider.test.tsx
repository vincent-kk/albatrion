import type { ComponentProps } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import type { Slider as AntdSlider } from 'antd';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FormTypeInputSliderDefinition } from '../FormTypeInputSlider';

type SliderProps = ComponentProps<typeof AntdSlider>;

const received = vi.hoisted(() => ({ props: [] as SliderProps[] }));

vi.mock('antd', async (importOriginal) => ({
  ...(await importOriginal<typeof import('antd')>()),
  Slider: (props: SliderProps) => {
    received.props.push(props);
    return null;
  },
}));

const preventWindowError = (event: ErrorEvent) => event.preventDefault();

beforeEach(() => {
  received.props.length = 0;
});

afterEach(() => {
  cleanup();
  window.removeEventListener('error', preventWindowError);
});

it('reads lazy from presentation.FormTypeInputProps', () => {
  render(
    <Form
      formTypeInputDefinitions={[FormTypeInputSliderDefinition]}
      jsonSchema={{
        type: 'object',
        properties: {
          level: {
            type: 'number',
            presentation: {
              formType: 'slider',
              FormTypeInputProps: { lazy: false },
            },
          },
        },
      }}
    />,
  );
  const props = received.props.at(-1)!;
  expect(props.onChange).toBeTypeOf('function');
  expect(props.onChangeComplete).toBeUndefined();
});

it('rejects lazy under options as UNKNOWN_GROUP_KEY', () => {
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
            options: { lazy: false },
            presentation: { formType: 'slider' },
          },
        },
      }}
    />,
  );
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({
      code: 'JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY',
      details: expect.objectContaining({ group: 'options', key: 'lazy' }),
    }),
  );
  expect(screen.getByRole('alert').textContent).toBe('Unable to load form.');
});

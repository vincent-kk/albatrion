import { createRef } from 'react';

import { sliderClasses } from '@mui/material';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type NumberSchema } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../fieldInputs/FieldInputSlider';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mount = (
  constraints: Partial<NumberSchema> = {},
  initial?: number,
  readOnly = false,
) => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      defaultValue={initial}
      readOnly={readOnly}
      jsonSchema={{
        type: 'number',
        ...constraints,
        presentation: {
          inputType: 'slider',
          FieldInputProps: { unsetValueText: '미설정' },
        },
      }}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
    />,
  );
  return {
    ref,
    slider: () => view.getByRole('slider'),
    track: () => view.container.querySelector<HTMLElement>(`.${sliderClasses.root}`)!,
    thumb: () => view.container.querySelector<HTMLElement>(`.${sliderClasses.thumb}`)!,
  };
};

const pressTrack = (track: HTMLElement, clientX: number) => {
  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    bottom: 10,
    left: 0,
    right: 100,
    width: 100,
    height: 10,
    toJSON: () => ({}),
  });
  fireEvent.mouseDown(track, { button: 0, buttons: 1, clientX, clientY: 5 });
  fireEvent.mouseUp(document, { button: 0, clientX, clientY: 5 });
};

it('announces and hides an unset slider until a value is committed', async () => {
  const { ref, slider, track, thumb } = mount({ maximum: 10 });
  expect(ref.current?.getValue()).toBeUndefined();
  expect(slider().getAttribute('aria-valuenow')).toBeNull();
  expect(slider().getAttribute('aria-valuetext')).toBe('미설정');
  expect(getComputedStyle(thumb()).opacity).toBe('0');
  pressTrack(track(), 30);
  expect(ref.current?.getValue()).toBe(3);
  expect(slider().getAttribute('aria-valuetext')).toBeNull();
  expect(slider().getAttribute('aria-valuenow')).toBe('3');

  await act(async () => ref.current!.findNode('/')!.setValue(undefined));
  expect(ref.current?.getValue()).toBeUndefined();
  expect(slider().getAttribute('aria-valuetext')).toBe('미설정');
  expect(getComputedStyle(thumb()).opacity).toBe('0');
});

it.each([
  { minimum: 1e-8, maximum: 9.9e-7, multipleOf: 1e-7, click: 50, value: 5e-7 },
  { minimum: 0, maximum: 1e-5, multipleOf: 5e-7, click: 10, value: 1e-6 },
])('commits exact native pointer steps for $multipleOf', ({ click, value, ...schema }) => {
  const { ref, track } = mount(schema);
  pressTrack(track(), click);
  expect(ref.current?.getValue()).toBe(value);
});

it('displays a valid read-only decimal when the schema has no required step', () => {
  const { ref, slider } = mount({ maximum: 10 }, 1.4, true);
  expect(slider().getAttribute('aria-valuenow')).toBe('1.4');
  expect(slider()).toHaveProperty('disabled', true);
  fireEvent.keyDown(slider(), { key: 'End', keyCode: 35 });
  expect(ref.current?.getValue()).toBe(1.4);
});

it.each([
  { minimum: 0, exclusiveMinimum: 0, maximum: 10, multipleOf: 1, click: 0, value: 1 },
  { minimum: 0, maximum: 10, exclusiveMaximum: 10, multipleOf: 1, click: 100, value: 9 },
])('commits the legal track endpoint for an exclusive bound', ({ click, value, ...schema }) => {
  const { ref, track } = mount(schema);
  pressTrack(track(), click);
  expect(ref.current?.getValue()).toBe(value);
});

it('disables the control when no schema step lies in the interval', () => {
  const { ref, slider } = mount({ exclusiveMinimum: 0, exclusiveMaximum: 1, multipleOf: 1 });
  expect(slider()).toHaveProperty('disabled', true);
  fireEvent.keyDown(slider(), { key: 'End', keyCode: 35 });
  expect(ref.current?.getValue()).toBeUndefined();
});

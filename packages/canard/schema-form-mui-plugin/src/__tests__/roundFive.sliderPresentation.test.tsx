import { createRef } from 'react';

import { ThemeProvider, createTheme, sliderClasses } from '@mui/material';
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
  direction: 'ltr' | 'rtl' = 'ltr',
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
    {
      wrapper: ({ children }) => (
        <ThemeProvider theme={createTheme({ direction })}>
          {children}
        </ThemeProvider>
      ),
    },
  );
  return {
    ref,
    slider: () => view.getByRole('slider'),
    track: () =>
      view.container.querySelector<HTMLElement>(`.${sliderClasses.root}`)!,
    thumb: () =>
      view.container.querySelector<HTMLElement>(`.${sliderClasses.thumb}`)!,
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

  await act(async () => ref.current!.setValue(undefined));
  expect(ref.current?.getValue()).toBeUndefined();
  expect(slider().getAttribute('aria-valuetext')).toBe('미설정');
  expect(getComputedStyle(thumb()).opacity).toBe('0');
});

it.each([
  { minimum: 1e-8, maximum: 9.9e-7, multipleOf: 1e-7, click: 50, value: 5e-7 },
  { minimum: 0, maximum: 1e-5, multipleOf: 5e-7, click: 10, value: 1e-6 },
])(
  'commits exact native pointer steps for $multipleOf',
  ({ click, value, ...schema }) => {
    const { ref, track } = mount(schema);
    pressTrack(track(), click);
    expect(ref.current?.getValue()).toBe(value);
  },
);

it('displays a valid read-only decimal when the schema has no required step', () => {
  const { ref, slider } = mount({ maximum: 10 }, 1.4, true);
  expect(slider().getAttribute('aria-valuenow')).toBe('1.4');
  expect(slider()).toHaveProperty('disabled', true);
  fireEvent.keyDown(slider(), { key: 'End', keyCode: 35 });
  expect(ref.current?.getValue()).toBe(1.4);
});

it.each([
  {
    minimum: 0,
    exclusiveMinimum: 0,
    maximum: 10,
    multipleOf: 1,
    click: 0,
    value: 1,
  },
  {
    minimum: 0,
    maximum: 10,
    exclusiveMaximum: 10,
    multipleOf: 1,
    click: 100,
    value: 9,
  },
])(
  'commits the legal track endpoint for an exclusive bound',
  ({ click, value, ...schema }) => {
    const { ref, track } = mount(schema);
    pressTrack(track(), click);
    expect(ref.current?.getValue()).toBe(value);
  },
);

it('disables the control when no schema step lies in the interval', () => {
  const { ref, slider } = mount({
    exclusiveMinimum: 0,
    exclusiveMaximum: 1,
    multipleOf: 1,
  });
  expect(slider()).toHaveProperty('disabled', true);
  fireEvent.keyDown(slider(), { key: 'End', keyCode: 35 });
  expect(ref.current?.getValue()).toBeUndefined();
});

it('commits a native keyboard change once on keydown with the default lazy policy', () => {
  const change = vi.fn();
  const view = render(
    <Form
      defaultValue={20}
      onChange={change}
      jsonSchema={{ type: 'number', presentation: { inputType: 'slider' } }}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
    />,
  );
  const slider = view.getByRole('slider');
  fireEvent.keyDown(slider, { key: 'ArrowUp', keyCode: 38 });
  expect(change).toHaveBeenCalledTimes(1);
  expect(change.mock.calls[0]?.[0]).toBe(21);
  fireEvent.keyUp(slider, { key: 'ArrowUp', keyCode: 38 });
  expect(change).toHaveBeenCalledTimes(1);
});

it('starts keyboard movement from a legal stop when the stored value is off grid', () => {
  const { ref, slider } = mount(
    { minimum: 0, maximum: 100, multipleOf: 5 },
    52,
  );
  expect(ref.current?.getValue()).toBe(52);
  fireEvent.keyDown(slider(), { key: 'ArrowUp', keyCode: 38 });
  expect(ref.current?.getValue()).toBe(55);
});

it('offers the included maximum in an interval narrower than the default step', () => {
  const { ref, slider } = mount({ exclusiveMinimum: 0.1, maximum: 0.2 });
  fireEvent.keyDown(slider(), { key: 'End', keyCode: 35 });
  expect(ref.current?.getValue()).toBe(0.2);
});

it('honors the provider direction while using the configured shift step', () => {
  const { ref, slider } = mount(
    { minimum: 0, maximum: 120, multipleOf: 3 },
    60,
    false,
    'rtl',
  );
  fireEvent.keyDown(slider(), {
    key: 'ArrowRight',
    keyCode: 39,
    shiftKey: true,
  });
  expect(ref.current?.getValue()).toBe(30);
  fireEvent.keyDown(slider(), { key: 'PageUp', keyCode: 33 });
  expect(ref.current?.getValue()).toBe(60);
});

import { createRef } from 'react';

import { sliderClasses } from '@mui/material';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type NumberSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mount = (constraints: Partial<NumberSchema>) => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'number',
        ...constraints,
        presentation: { inputType: 'slider' },
      }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
    />,
  );
  const track = view.container.querySelector<HTMLElement>(
    `.${sliderClasses.root}`,
  )!;
  const press = (clientX: number) => {
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
  return { ref, press };
};

it('stores the largest multiple of the integer grid step at the slider maximum', () => {
  const { ref, press } = mount({
    type: 'integer',
    maximum: 10,
    multipleOf: 1.5,
  });
  press(100);
  expect(ref.current?.getValue()).toBe(9);
});

it.each([
  { click: 0, value: 5 },
  { click: 100, value: 20 },
])(
  'stores $value when the slider is pressed at $click on a grid anchored at zero',
  ({ click, value }) => {
    const { ref, press } = mount({ minimum: 2, maximum: 23, multipleOf: 5 });
    press(click);
    expect(ref.current?.getValue()).toBe(value);
  },
);

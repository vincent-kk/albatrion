import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type NumberSchema } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../FieldInputSlider';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mount = (
  limits: Partial<NumberSchema>,
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
        format: 'slider',
        ...limits,
        presentation: { inputType: 'slider' },
      }}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
    />,
    {
      wrapper: ({ children }) => (
        <ConfigProvider direction={direction}>{children}</ConfigProvider>
      ),
    },
  );
  const slider = view.getByRole('slider');
  const track = view.container.querySelector<HTMLElement>('.ant-slider')!;
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
  Object.defineProperty(track, 'offsetWidth', { value: 100 });
  const tap = (clientX: number) => {
    fireEvent.mouseDown(track, { button: 0, buttons: 1, clientX, clientY: 5 });
    fireEvent.mouseUp(document, { button: 0, clientX, clientY: 5 });
  };
  return { ref, slider, tap };
};

it('shows a stored decimal in a read-only slider with no required step', () => {
  const { slider, ref } = mount({ maximum: 5 }, 2.4, true);
  expect(slider.getAttribute('aria-valuenow')).toBe('2.4');
  expect(ref.current?.getValue()).toBe(2.4);
});

it('shows the integer grid point without rewriting a read-only decimal', () => {
  const { slider, ref } = mount({ type: 'integer', maximum: 5 }, 2.4, true);
  expect(slider.getAttribute('aria-valuenow')).toBe('2');
  expect(ref.current?.getValue()).toBe(2.4);
});

it('does not offer the excluded schema bound', () => {
  const { ref, tap } = mount({
    minimum: 0,
    exclusiveMinimum: 0,
    maximum: 10,
    multipleOf: 1,
  });
  tap(0);
  expect(ref.current?.getValue()).toBe(1);
});

it('offers the included maximum in an interval narrower than the default step', () => {
  const { ref, tap } = mount({ exclusiveMinimum: 0.1, maximum: 0.2 });
  tap(20);
  expect(ref.current?.getValue()).toBe(0.2);
});

it('does not publish a pointer selection when the allowed grid is empty', () => {
  const { ref, tap } = mount({
    exclusiveMinimum: 0,
    exclusiveMaximum: 1,
    multipleOf: 1,
  });
  tap(50);
  expect(ref.current?.getValue()).toBeUndefined();
});

it('uses the RTL provider and commits after the movement key is released', () => {
  const { ref, slider } = mount(
    { minimum: 0, maximum: 20, multipleOf: 2 },
    10,
    false,
    'rtl',
  );
  fireEvent.keyDown(slider, { key: 'ArrowRight', keyCode: 39, which: 39 });
  expect(ref.current?.getValue()).toBe(10);
  fireEvent.keyUp(slider, { key: 'Shift', keyCode: 16, which: 16 });
  expect(ref.current?.getValue()).toBe(10);
  fireEvent.keyUp(slider, { key: 'ArrowRight', keyCode: 39, which: 39 });
  expect(ref.current?.getValue()).toBe(8);
});

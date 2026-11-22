import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type NumberSchema } from '@canard/schema-form';

import { FieldInputSliderDefinition } from '../FieldInputSlider';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mount = (limits: Partial<NumberSchema>, initial?: number, readOnly = false) => {
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
  );
  const slider = view.getByRole('slider');
  const track = view.container.querySelector<HTMLElement>('.adm-slider-track')!;
  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
    x: 0, y: 0, top: 0, bottom: 10, left: 0, right: 100, width: 100, height: 10,
    toJSON: () => ({}),
  });
  Object.defineProperty(track, 'offsetWidth', { value: 100 });
  const tap = (clientX: number) => {
    fireEvent.click(track, { clientX, clientY: 5 });
  };
  return { ref, slider, tap };
};

it('shows a stored decimal in a read-only slider with no required step', () => {
  const { slider, ref } = mount({ maximum: 5 }, 2.4, true);
  expect(slider.getAttribute('aria-valuenow')).toBe('2.4');
  expect(ref.current?.getValue()).toBe(2.4);
});

it('does not offer the excluded schema bound', () => {
  const { ref, tap } = mount({ minimum: 0, exclusiveMinimum: 0, maximum: 10, multipleOf: 1 });
  tap(0);
  expect(ref.current?.getValue()).toBe(1);
});

it('offers the included maximum in an interval narrower than the default step', () => {
  const { ref, tap } = mount({ exclusiveMinimum: 0.1, maximum: 0.2 });
  tap(20);
  expect(ref.current?.getValue()).toBe(0.2);
});

it('does not publish a pointer selection when the allowed grid is empty', () => {
  const { ref, tap } = mount({ exclusiveMinimum: 0, exclusiveMaximum: 1, multipleOf: 1 });
  tap(50);
  expect(ref.current?.getValue()).toBeUndefined();
});

it('selects the inclusive maximum when both ends are closer than one step', () => {
  const { ref, tap } = mount({ minimum: 0.1, maximum: 0.2 });
  tap(100);
  expect(ref.current?.getValue()).toBe(0.2);
});

it('offers fractional marks within exclusive bounds and removes the excluded mark', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      defaultValue={2}
      jsonSchema={{
        type: 'number',
        format: 'slider',
        minimum: 0,
        exclusiveMaximum: 4.5,
        presentation: {
          FieldInputProps: { marks: { 2: 'Middle', 4.25: 'Outer', 4.5: 'Excluded' } },
        },
      }}
      fieldInputDefinitions={[FieldInputSliderDefinition]}
    />,
  );
  const track = view.container.querySelector<HTMLElement>('.adm-slider-track')!;
  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
    x: 0, y: 0, top: 0, bottom: 10, left: 0, right: 100, width: 100, height: 10,
    toJSON: () => ({}),
  });
  Object.defineProperty(track, 'offsetWidth', { value: 100 });
  expect(view.getByText('Outer')).toBeTruthy();
  expect(view.queryByText('Excluded')).toBeNull();
  fireEvent.click(track, { clientX: 100, clientY: 5 });
  expect(ref.current?.getValue()).toBe(4.25);
});

import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type NumberSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mount = (
  limits: Partial<NumberSchema>,
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
        format: 'slider',
        ...limits,
        presentation: { inputType: 'slider' },
      }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
    />,
  );
  const slider = view.getByRole('slider');
  const track = view.container.querySelector<HTMLElement>('.adm-slider-track')!;
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
    fireEvent.click(track, { clientX, clientY: 5 });
  };
  return { ref, slider, tap };
};

it('shows the initial native position without storing a value', () => {
  const { ref, slider } = mount({});
  expect(slider.getAttribute('aria-valuenow')).toBe('0');
  expect(slider.id).toBe('');
  expect(ref.current?.getValue()).toBeUndefined();
});

it('displays the native initial position for an editable off-step value', () => {
  const { ref, slider } = mount({ maximum: 5 }, 2.4);
  expect(slider.getAttribute('aria-valuenow')).toBe('2.4');
  expect(ref.current?.getValue()).toBe(2.4);
});

it('uses the native pointer result for a step of 1e-7', () => {
  const { ref, tap } = mount({
    minimum: 1e-7,
    maximum: 9e-7,
    multipleOf: 1e-7,
  });
  tap(50);
  expect(ref.current?.getValue()).toBe(0);
});

it('retains a valid mark label on a disabled empty grid', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'number',
        format: 'slider',
        exclusiveMinimum: 0.1,
        exclusiveMaximum: 0.9,
        presentation: { FieldInputProps: { marks: { 0.4: 'Marker' } } },
      }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
    />,
  );
  expect(view.getByText('Marker')).toBeTruthy();
  expect(view.getByRole('slider').getAttribute('aria-disabled')).toBe('true');
});

it('shows a stored decimal in a read-only slider with no required step', () => {
  const { slider, ref } = mount({ maximum: 5 }, 2.4, true);
  expect(slider.getAttribute('aria-valuenow')).toBe('2.4');
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
          FieldInputProps: {
            marks: { 2: 'Middle', 4.25: 'Outer', 4.5: 'Excluded' },
          },
        },
      }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
    />,
  );
  const track = view.container.querySelector<HTMLElement>('.adm-slider-track')!;
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
  expect(view.getByText('Outer')).toBeTruthy();
  expect(view.queryByText('Excluded')).toBeNull();
  fireEvent.click(track, { clientX: 100, clientY: 5 });
  expect(ref.current?.getValue()).toBe(4.25);
});

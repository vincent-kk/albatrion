import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { Form, type FormHandle, registerPlugin } from '@canard/schema-form';
import { plugin as validator } from '@canard/schema-form-ajv8-plugin';
import { plugin } from '../index';
beforeAll(() => registerPlugin(validator));
beforeEach(() => vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it.each([
  { multipleOf: 0.5, integerStep: 1 }, { multipleOf: 0.3, integerStep: 3 },
  { multipleOf: 1.5, integerStep: 3 }, { multipleOf: 2.5, integerStep: 5 },
])('integer multiples of $multipleOf agree with integer step $integerStep', async ({ multipleOf, integerStep }) => {
  const results = [];
  for (const step of [multipleOf, integerStep]) {
    const ref = createRef<FormHandle>();
    const { unmount } = render(<Form ref={ref} jsonSchema={{ type: 'integer', format: 'slider', minimum: 0, maximum: 30, multipleOf: step, presentation: { inputType: 'slider', FieldInputProps: { lazy: false } } }} defaultValue={0} fieldInputDefinitions={plugin.fieldInputDefinitions} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight', keyCode: 39 });
    fireEvent.keyUp(screen.getByRole('slider'), { key: 'ArrowRight', keyCode: 39 });
    await act(async () => { await ref.current!.validate(); });
    expect(ref.current!.getErrors()).toEqual([]);
    results.push(ref.current!.getValue());
    unmount();
  }
  expect(results[0]).toEqual(results[1]);
});

it('fractional bounds without multipleOf keep their authored lower endpoint', () => {
  const ref = createRef<FormHandle>();
  render(<Form ref={ref} jsonSchema={{ type: 'number', format: 'slider', minimum: 0.1, maximum: 0.9, presentation: { inputType: 'slider', FieldInputProps: { lazy: false } } }} fieldInputDefinitions={plugin.fieldInputDefinitions} />);
  const control = screen.getByRole('slider');
  expect(control.getAttribute('aria-valuemin')).toBe('0.1');
  expect(control.getAttribute('aria-valuemax')).toBe('0.9');
  fireEvent.keyDown(control, { key: 'Home', keyCode: 36 });
  fireEvent.keyUp(control, { key: 'Home', keyCode: 36 });
  expect(ref.current!.getValue()).toBe(0.1);
});
it('an interval with no multiple leaves the form unset', () => {
  const ref = createRef<FormHandle>();
  render(<Form ref={ref} jsonSchema={{ type: 'number', format: 'slider', minimum: 1, maximum: 2, multipleOf: 5, presentation: { inputType: 'slider', FieldInputProps: { lazy: false } } }} fieldInputDefinitions={plugin.fieldInputDefinitions} />);
  const control = screen.getByRole('slider');
  expect(control instanceof HTMLInputElement ? control.disabled : control.getAttribute('aria-disabled') === 'true').toBe(true);
  fireEvent.keyDown(control, { key: 'Home', keyCode: 36 });
  fireEvent.keyUp(control, { key: 'Home', keyCode: 36 });
  expect(ref.current!.getValue()).toBeUndefined();
});

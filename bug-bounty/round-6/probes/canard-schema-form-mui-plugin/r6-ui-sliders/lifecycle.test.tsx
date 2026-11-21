import { createRef } from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';
import { plugin } from '../../index';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, right: 100, bottom: 10, width: 100, height: 10, x: 0, y: 0, toJSON: () => ({}) });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100);
});
const sliderSchema: JSONSchema = { type: 'object', properties: { level: { type: 'number', format: 'slider', minimum: 0, maximum: 10, presentation: { inputType: 'slider' } } } };
const mount = (readOnly = false, initial = 2) => {
  const ref = createRef<FormHandle>();
  const form = (lock: boolean) => <Form ref={ref} readOnly={lock} defaultValue={{ level: initial }} jsonSchema={sliderSchema} fieldInputDefinitions={plugin.fieldInputDefinitions} FieldRenderer={plugin.FieldRenderer} LabelRenderer={plugin.LabelRenderer} />;
  const view = render(form(readOnly));
  return { ref, view, form };
};
it('control: keyboard movement commits on key release', () => {
  const { ref, view } = mount();
  const thumb = view.getByRole('slider');
  fireEvent.keyDown(thumb, { key: 'ArrowRight', keyCode: 39 });
  expect(ref.current!.getValue()).toEqual({ level: 2 });
  fireEvent.keyUp(thumb, { key: 'ArrowRight', keyCode: 39 });
  expect(ref.current!.getValue()).toEqual({ level: 3 });
});
it('read-only transition shows the same valid decimal as a read-only mount', () => {
  const { view, form, ref } = mount(false, 2.4);
  view.rerender(form(true));
  const transitioned = view.getByRole('slider').getAttribute('aria-valuenow');
  expect(ref.current!.getValue()).toEqual({ level: 2.4 });
  view.unmount();
  const direct = mount(true, 2.4);
  expect(transitioned).toBe(direct.view.getByRole('slider').getAttribute('aria-valuenow'));
});
it('control: releasing a navigation key while read-only does not publish the pending value', () => {
  const { ref, view, form } = mount();
  fireEvent.keyDown(view.getByRole('slider'), { key: 'ArrowRight', keyCode: 39 });
  view.rerender(form(true));
  fireEvent.keyUp(view.getByRole('slider'), { key: 'ArrowRight', keyCode: 39 });
  expect(ref.current!.getValue()).toEqual({ level: 2 });
});

it.each([
  { name: 'combined strict lower and inclusive upper', constraints: { minimum: 0, exclusiveMinimum: 0.15, maximum: 0.8, multipleOf: 0.1 }, expected: [0.2, 0.8] },
  { name: 'inclusive lower and combined strict upper', constraints: { minimum: -0.8, maximum: 0, exclusiveMaximum: -0.15, multipleOf: 0.1 }, expected: [-0.8, -0.2] },
  { name: 'exponent step with both strict boundaries', constraints: { exclusiveMinimum: 1e-7, exclusiveMaximum: 9e-7, multipleOf: 1e-7 }, expected: [2e-7, 8e-7] },
  { name: 'ungridded narrow inclusive interval', constraints: { minimum: 0.1, maximum: 0.4 }, expected: [0.1, 0.4] },
])('control: $name gives the same endpoint for every commit mode', ({ constraints, expected }) => {
  for (const lazy of [undefined, false]) for (const [index, key] of ['Home', 'End'].entries()) {
    const ref = createRef<FormHandle>();
    const view = render(<Form ref={ref} jsonSchema={{ type: 'number', format: 'slider', ...constraints, presentation: { inputType: 'slider', FieldInputProps: { lazy } } }} fieldInputDefinitions={plugin.fieldInputDefinitions} />);
    const thumb = view.getByRole('slider');
    fireEvent.keyDown(thumb, { key, keyCode: key === 'Home' ? 36 : 35 });
    fireEvent.keyUp(thumb, { key, keyCode: key === 'Home' ? 36 : 35 });
    expect(ref.current!.getValue()).toBe(expected[index]);
    view.unmount();
  }
});

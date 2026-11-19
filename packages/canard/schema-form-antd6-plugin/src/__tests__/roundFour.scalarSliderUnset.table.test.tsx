import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, registerPlugin } from '@canard/schema-form';
import { plugin as validator } from '@canard/schema-form-ajv8-plugin';

import { plugin } from '../index';

beforeAll(() => registerPlugin(validator));
beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it.each([
  { type: 'number', lazy: false },
  { type: 'number', lazy: true },
  { type: 'integer', lazy: false },
  { type: 'integer', lazy: true },
] as const)(
  'unset $type slider commits the first minimum with lazy=$lazy',
  async ({ type, lazy }) => {
    for (const initial of [undefined, null]) {
      const ref = createRef<FormHandle>();
      const errors: unknown[] = [];
      const { unmount } = render(
        <Form
          onError={(error) => errors.push(error)}
          ref={ref}
          jsonSchema={{
            type,
            nullable: true,
            format: 'slider',
            minimum: 10,
            maximum: 20,
            multipleOf: 5,
            presentation: { inputType: 'slider', FieldInputProps: { lazy } },
          }}
          defaultValue={initial}
          fieldInputDefinitions={plugin.fieldInputDefinitions}
        />,
      );
      const thumb = screen.getByRole('slider');
      expect(ref.current!.getValue()).toBe(initial);
      expect(thumb.getAttribute('aria-valuenow')).toBeNull();
      expect(thumb.getAttribute('aria-valuetext')).toBe('Not set');
      fireEvent.keyDown(thumb, { key: 'Home', keyCode: 36 });
      fireEvent.keyUp(thumb, { key: 'Home', keyCode: 36 });
      expect(errors).toEqual([]);
      expect(ref.current!.getValue()).toBe(10);
      expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe(
        '10',
      );
      await act(async () => {
        ref.current!.setValue(undefined);
      });
      expect(ref.current!.getValue()).toBeUndefined();
      expect(
        screen.getByRole('slider').getAttribute('aria-valuenow'),
      ).toBeNull();
      unmount();
    }
  },
);

it('a populated lazy=false slider publishes moves before key-up', () => {
  const ref = createRef<FormHandle>();
  render(<Form ref={ref} jsonSchema={{ type: 'number', format: 'slider', minimum: 10, maximum: 20, multipleOf: 5, presentation: { inputType: 'slider', FieldInputProps: { lazy: false } } }} defaultValue={10} fieldInputDefinitions={plugin.fieldInputDefinitions} />);
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight', keyCode: 39 });
  expect(ref.current!.getValue()).toBe(15);
});

it.each(['disabled', 'readOnly'])('keeps an unset %s slider untouched', lock => {
  const ref = createRef<FormHandle>();
  render(<Form ref={ref} jsonSchema={{ type: 'number', minimum: 10, maximum: 20, ...(lock === 'disabled' ? { controls: { disabled: true } } : { readOnly: true }), presentation: { inputType: 'slider' } }} fieldInputDefinitions={plugin.fieldInputDefinitions} />);
  const thumb = screen.getByRole('slider');
  fireEvent.keyDown(thumb, { key: 'Home', keyCode: 36 });
  fireEvent.keyUp(thumb, { key: 'Home', keyCode: 36 });
  expect(ref.current!.getValue()).toBeUndefined();
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBeNull();
});

it.each([false, true])('a first pointer selection commits the minimum with lazy=%s', lazy => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, right: 100, bottom: 10, width: 100, height: 10, x: 0, y: 0, toJSON: () => ({}) });
  const ref = createRef<FormHandle>();
  render(<Form ref={ref} jsonSchema={{ type: 'number', minimum: 10, maximum: 20, multipleOf: 5, presentation: { inputType: 'slider', FieldInputProps: { lazy } } }} fieldInputDefinitions={plugin.fieldInputDefinitions} />);
  fireEvent.mouseDown(screen.getByRole('slider'), { button: 0, buttons: 1, clientX: 0 });
  fireEvent.mouseUp(document, { button: 0, clientX: 0 });
  expect(ref.current!.getValue()).toBe(10);
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('10');
  vi.restoreAllMocks();
});

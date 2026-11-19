import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeAll, expect, it } from 'vitest';

import { Form, type FormHandle, registerPlugin } from '@canard/schema-form';
import { plugin as validator } from '@canard/schema-form-ajv8-plugin';

import { plugin } from '../index';

beforeAll(() => registerPlugin(validator));
afterEach(cleanup);
it.each([
  { type: 'number', minimum: 1, maximum: 99, multipleOf: 5 },
  { type: 'number', minimum: -0.99, maximum: -0.01, multipleOf: 0.1 },
  { type: 'integer', minimum: 0, maximum: 30, multipleOf: 0.3 },
  { type: 'integer', minimum: 0, maximum: 30, multipleOf: 1.5 },
] as const)(
  'range $type values all pass the item constraints $multipleOf',
  async (constraints) => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'array', format: 'slider', items: constraints }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
      />,
    );
    const controls = screen.getAllByRole('slider');
    fireEvent.keyDown(controls[0], { key: 'Home' });
    fireEvent.keyDown(controls[1], { key: 'End' });
    fireEvent.keyDown(controls[0], { key: 'ArrowRight' });
    await act(async () => {
      await ref.current!.validate();
    });
    expect(ref.current!.getErrors()).toEqual([]);
  },
);
it.each(['Home', 'End', 'ArrowLeft', 'ArrowRight'])(
  'invalid marked stops agree with their valid subset for %s',
  async (key) => {
    const results = [];
    for (const filtered of [false, true]) {
      const ref = createRef<FormHandle>();
      const { unmount } = render(
        <Form
          ref={ref}
          jsonSchema={{
            type: 'number',
            format: 'slider',
            minimum: 5,
            maximum: 20,
            multipleOf: 5,
            presentation: {
              FieldInputProps: {
                marks: filtered
                  ? { 10: 'valid' }
                  : { 7: 'invalid', 10: 'valid' },
                lazy: false,
              },
            },
          }}
          defaultValue={10}
          fieldInputDefinitions={plugin.fieldInputDefinitions}
        />,
      );
      fireEvent.keyDown(screen.getByRole('slider'), { key });
      await act(async () => {
        await ref.current!.validate();
      });
      expect(ref.current!.getErrors()).toEqual([]);
      results.push(ref.current!.getValue());
      unmount();
    }
    expect(results[0]).toEqual(results[1]);
  },
);

import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeAll, expect, it } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  registerPlugin,
} from '@canard/schema-form';
import { plugin as validator } from '@canard/schema-form-ajv8-plugin';

import { plugin } from '../index';

beforeAll(() => registerPlugin(validator));
afterEach(cleanup);
it.each([
  { minimum: 1, maximum: 99, multipleOf: 5 },
  { minimum: 0, maximum: 100, multipleOf: 5 },
  { minimum: -99, maximum: -1, multipleOf: 5 },
  { minimum: -100, maximum: 0, multipleOf: 5 },
  { minimum: 0.01, maximum: 0.99, multipleOf: 0.1 },
  { minimum: -0.99, maximum: -0.01, multipleOf: 0.1 },
  { minimum: -0.3, maximum: 0.3, multipleOf: 0.1 },
  { minimum: 1e-8, maximum: 9.9e-7, multipleOf: 1e-7 },
])(
  'writes the same valid grid as aligned bounds: $minimum to $maximum by $multipleOf',
  async (constraints) => {
    const lower = Number(
      (
        Math.ceil(constraints.minimum / constraints.multipleOf - 1e-10) *
        constraints.multipleOf
      ).toPrecision(12),
    );
    const upper = Number(
      (
        Math.floor(constraints.maximum / constraints.multipleOf + 1e-10) *
        constraints.multipleOf
      ).toPrecision(12),
    );
    for (const key of ['Home', 'End', 'ArrowRight', 'PageUp']) {
      const results = [];
      for (const aligned of [false, true]) {
        const ref = createRef<FormHandle>();
        const jsonSchema = {
          type: 'object',
          properties: {
            level: {
              type: 'number',
              format: 'slider',
              ...constraints,
              ...(aligned ? { minimum: lower, maximum: upper } : {}),
              presentation: {
                inputType: 'slider',
                FieldInputProps: { lazy: false },
              },
            },
          },
        } satisfies JSONSchema;
        const { unmount } = render(
          <Form
            ref={ref}
            jsonSchema={jsonSchema}
            defaultValue={{ level: lower + constraints.multipleOf }}
            fieldInputDefinitions={plugin.fieldInputDefinitions}
            FieldRenderer={plugin.FieldRenderer}
          />,
        );
        const thumb = screen.getByRole('slider');
        fireEvent.keyDown(thumb, {
          key,
          keyCode: { Home: 36, End: 35, ArrowRight: 39, PageUp: 33 }[key],
        });
        fireEvent.keyUp(thumb, {
          key,
          keyCode: { Home: 36, End: 35, ArrowRight: 39, PageUp: 33 }[key],
        });
        await act(async () => {
          await ref.current!.validate();
        });
        results.push(ref.current!.getValue());
        expect(ref.current!.getErrors()).toEqual([]);
        expect(ref.current!.getValue()).toHaveProperty(
          'level',
          expect.any(Number),
        );
        unmount();
      }
      expect(results[0]).toEqual(results[1]);
    }
  },
);

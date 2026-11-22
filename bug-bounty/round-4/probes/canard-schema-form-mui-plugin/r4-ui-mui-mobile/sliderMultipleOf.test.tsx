import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  registerPlugin,
} from '@canard/schema-form';
import { plugin as ajvPlugin } from '@canard/schema-form-ajv8-plugin';

import { plugin } from '../../index';

beforeAll(() => {
  registerPlugin(ajvPlugin);
});
afterEach(cleanup);

/**
 * README: the slider supports `minimum`, `maximum` and `multipleOf`. A percentage that starts
 * at 1 and moves in fives: the valid values are 5, 10, ... 100.
 */
const schemaOf = (minimum: number) =>
  ({
    type: 'object',
    properties: {
      share: {
        type: 'number',
        minimum,
        maximum: 100,
        multipleOf: 5,
        presentation: { inputType: 'slider' },
      },
    },
  }) satisfies JSONSchema;

const mount = (minimum: number, defaultValue?: number) => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      jsonSchema={schemaOf(minimum)}
      defaultValue={defaultValue === undefined ? {} : { share: defaultValue }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
    />,
  );
  const thumb = container.querySelector<HTMLInputElement>(
    'input[type="range"]',
  )!;
  return { ref, thumb };
};

const share = (ref: { current: FormHandle | null }) =>
  (ref.current!.getValue() as { share?: number }).share;

it('control: with minimum 0 an arrow key stores a multiple of 5', async () => {
  const { ref, thumb } = mount(0, 50);
  fireEvent.keyDown(thumb, { key: 'ArrowRight' });
  expect(share(ref)).toBe(55);
  await act(async () => {
    await ref.current!.validate();
  });
  expect(ref.current!.getErrors()).toEqual([]);
});

it.each([
  ['ArrowRight from the stored 50', 50, 'ArrowRight'],
  ['PageUp from the stored 50', 50, 'PageUp'],
  ['ArrowRight from an unset field', undefined, 'ArrowRight'],
])(
  'with minimum 1, %s stores a value that passes multipleOf 5',
  async (_, defaultValue, key) => {
    const { ref, thumb } = mount(1, defaultValue);
    fireEvent.keyDown(thumb, { key });
    const value = share(ref);
    expect(typeof value).toBe('number');
    await act(async () => {
      await ref.current!.validate();
    });
    expect({ value, errors: ref.current!.getErrors().length }).toEqual({
      value: expect.toSatisfy((v: number) => v % 5 === 0),
      errors: 0,
    });
  },
);

it('with minimum 1, a press at the middle of the track stores a value that passes multipleOf 5', async () => {
  const rect = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue({
      left: 0,
      top: 0,
      right: 100,
      bottom: 10,
      width: 100,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
  try {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        jsonSchema={schemaOf(1)}
        defaultValue={{ share: 20 }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
      />,
    );
    const root = container.querySelector<HTMLElement>('.MuiSlider-root')!;
    fireEvent.mouseDown(root, { button: 0, buttons: 1, clientX: 50 });
    fireEvent.mouseUp(document, { button: 0, clientX: 50 });
    const value = share(ref);
    await act(async () => {
      await ref.current!.validate();
    });
    expect({ value, errors: ref.current!.getErrors().length }).toEqual({
      value: expect.toSatisfy((v: number) => v % 5 === 0),
      errors: 0,
    });
  } finally {
    rect.mockRestore();
  }
});

import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

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

const mount = (field: JSONSchema, defaultValue?: unknown) => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'object', properties: { share: field } }}
      defaultValue={defaultValue === undefined ? {} : { share: defaultValue }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
    />,
  );
  const thumbs = () =>
    Array.from(container.querySelectorAll<HTMLElement>('[role="slider"]'));
  return { ref, thumbs };
};

const share = (ref: { current: FormHandle | null }) =>
  (ref.current!.getValue() as { share?: unknown }).share;

/** README: the slider applies `minimum`, `maximum` and `multipleOf`. */
const percent = (minimum: number) =>
  ({
    type: 'number',
    format: 'slider',
    minimum,
    maximum: 100,
    multipleOf: 5,
  }) satisfies JSONSchema;

it('control: with minimum 0 an arrow key stores a multiple of 5', async () => {
  const { ref, thumbs } = mount(percent(0), 50);
  fireEvent.keyDown(thumbs()[0], { key: 'ArrowRight' });
  expect(share(ref)).toBe(55);
  await act(async () => {
    await ref.current!.validate();
  });
  expect(ref.current!.getErrors()).toEqual([]);
});

it.each([
  ['ArrowRight from the stored 50', 50],
  ['ArrowRight from an unset field', undefined],
])(
  'with minimum 1, %s stores a value that passes multipleOf 5',
  async (_, defaultValue) => {
    const { ref, thumbs } = mount(percent(1), defaultValue);
    fireEvent.keyDown(thumbs()[0], { key: 'ArrowRight' });
    const value = share(ref) as number;
    await act(async () => {
      await ref.current!.validate();
    });
    expect({ value, errors: ref.current!.getErrors().length }).toEqual({
      value: expect.toSatisfy((v: number) => v % 5 === 0),
      errors: 0,
    });
  },
);

it('an unset slider does not announce the minimum as its value (MUI round-1 item 4 decision)', () => {
  const { ref, thumbs } = mount({
    type: 'number',
    format: 'slider',
    minimum: 10,
    maximum: 20,
  });
  expect(share(ref)).toBeUndefined();
  expect(thumbs()[0].getAttribute('aria-valuenow')).toBeNull();
});

it('an unset range slider does not announce [minimum, minimum] as its value', () => {
  const { ref, thumbs } = mount({
    type: 'array',
    format: 'slider',
    items: { type: 'number', minimum: 10, maximum: 20 },
  });
  expect(share(ref)).toBeUndefined();
  expect(thumbs().map((thumb) => thumb.getAttribute('aria-valuenow'))).toEqual(
    [null, null],
  );
});

describe('pointer input with minimum 1 and multipleOf 5', () => {
  beforeEach(() => {
    // A 100px track starting at x=0, so clientX is the percentage along it.
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
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
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('a click at the middle of the track stores a value that passes multipleOf 5', async () => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'object', properties: { share: percent(1) } }}
        defaultValue={{ share: 50 }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
      />,
    );
    fireEvent.click(container.querySelector('.adm-slider-track')!, {
      clientX: 50,
    });
    const value = share(ref) as number;
    await act(async () => {
      await ref.current!.validate();
    });
    expect({ value, errors: ref.current!.getErrors().length }).toEqual({
      value: expect.toSatisfy((v: number) => v % 5 === 0),
      errors: 0,
    });
  });
});

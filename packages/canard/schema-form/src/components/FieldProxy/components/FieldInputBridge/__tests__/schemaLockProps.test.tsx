import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import type { FieldInputProps, InputRendererProps } from '@/schema-form/types';

afterEach(cleanup);

const LOCKS = ['readOnly', 'disabled'] as const;

/** Lock prop pair with only `lock` set, as the input and its frame receive it. */
const lockedProps = (lock: (typeof LOCKS)[number]) => ({
  readOnly: lock === 'readOnly',
  disabled: lock === 'disabled',
});

it.each(LOCKS)(
  'CONTROLS-083 passes schema FieldInputProps %s: true to the input and its frame',
  (lock) => {
    const inputs = vi.fn((_: FieldInputProps) => <input readOnly />);
    const frames = vi.fn(({ children }: InputRendererProps) => (
      <section>{children}</section>
    ));
    render(
      <Form
        jsonSchema={{
          type: 'string',
          presentation: {
            FieldInput: inputs,
            FieldInputProps: { [lock]: true },
          },
        }}
        InputRenderer={frames}
        validationMode={ValidationMode.None}
      />,
    );
    const input = inputs.mock.lastCall![0];
    const frame = frames.mock.lastCall![0];
    expect({ readOnly: input.readOnly, disabled: input.disabled }).toEqual(
      lockedProps(lock),
    );
    expect({ readOnly: frame.readOnly, disabled: frame.disabled }).toEqual(
      lockedProps(lock),
    );
  },
);

it.each([
  ['readOnly', 'Form'],
  ['disabled', 'Form'],
  ['readOnly', 'field'],
  ['disabled', 'field'],
] as const)(
  'CONTROLS-083 schema FieldInputProps %s: false cannot unlock a locked %s',
  (lock, owner) => {
    const inputs = vi.fn((_: FieldInputProps) => <input readOnly />);
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'string',
          ...(owner === 'field' && { controls: { [lock]: true } }),
          presentation: {
            FieldInput: inputs,
            FieldInputProps: { [lock]: false },
          },
        }}
        defaultValue="before"
        validationMode={ValidationMode.None}
        {...(owner === 'Form' && { [lock]: true })}
      />,
    );
    const input = inputs.mock.lastCall![0];
    expect(input[lock]).toBe(true);
    act(() => input.onChange('blocked'));
    expect(ref.current!.getValue()).toBe('before');
  },
);

it.each(LOCKS)(
  'CONTROLS-083 schema FieldInputProps %s: true sets only the prop and leaves writes open',
  (lock) => {
    const inputs = vi.fn((_: FieldInputProps) => <input readOnly />);
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'string',
          presentation: {
            FieldInput: inputs,
            FieldInputProps: { [lock]: true },
          },
        }}
        defaultValue="before"
        validationMode={ValidationMode.None}
      />,
    );
    expect(inputs.mock.lastCall![0][lock]).toBe(true);
    act(() => inputs.mock.lastCall![0].onChange('typed'));
    expect(ref.current!.getValue()).toBe('typed');
    act(() => inputs.mock.lastCall![0].onFileAttach(new File([], 'a.txt')));
    expect(ref.current!.getAttachedFilesMap().size).toBe(1);
  },
);

it.each(LOCKS)(
  'CONTROLS-083 an override %s: true sets the input prop and leaves writes open',
  (lock) => {
    const inputs = vi.fn((_: FieldInputProps) => <input readOnly />);
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'object', properties: { a: { type: 'string' } } }}
        validationMode={ValidationMode.None}
      >
        <Form.Input path="/a" FieldInput={inputs} {...{ [lock]: true }} />
      </Form>,
    );
    const input = inputs.mock.lastCall![0];
    expect({ readOnly: input.readOnly, disabled: input.disabled }).toEqual(
      lockedProps(lock),
    );
    act(() => input.onChange('typed'));
    expect(ref.current!.getValue()).toEqual({ a: 'typed' });
  },
);

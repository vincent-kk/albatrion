import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { type FieldInputProps, Form, type FormHandle } from '../../index';

afterEach(cleanup);

it.each(['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__'])(
  'passes only own data to updaters at the %s field',
  (name) => {
    const seen: unknown[] = [];
    const update = (value: unknown) => {
      seen.push(value);
      return String(value ?? '') + 'x';
    };
    let inputChange: FieldInputProps<string>['onChange'] | undefined;
    const Input = ({ onChange }: FieldInputProps<string>) => {
      inputChange = onChange;
      return null;
    };
    const handle = createRef<FormHandle>();
    render(
      <Form
        ref={handle}
        jsonSchema={{
          type: 'object',
          properties: { [name]: { type: 'string' } },
        }}
        fieldInputMap={{ ['/' + name]: Input }}
        defaultValue={{}}
      />,
    );
    const field = handle.current!.findNode('/' + name)!;
    const root = handle.current!.node!;
    expect(inputChange).toBeDefined();
    act(() => {
      field.setValue(update);
      field.setValue(undefined);
      root.batch(() => field.setValue(update));
      field.setValue(undefined);
    });
    act(() => inputChange?.(update));
    expect(seen).toEqual([undefined, undefined, undefined]);
    expect(field.value).toBe('x');
    expect(
      Object.getOwnPropertyDescriptor(handle.current!.getValue() ?? {}, name),
    ).toBeDefined();
  },
);

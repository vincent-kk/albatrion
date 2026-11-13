import { StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import type { FieldInputProps } from '@/schema-form/types';

import type { ChildField } from '../type';

afterEach(cleanup);

it.each([false, true])(
  'keeps node/type/key across visibility off/on while remounting the input, StrictMode=%s',
  (strict) => {
    const ref = createRef<FormHandle>();
    let fields: readonly ChildField[] = [];
    const Branch = ({ ChildFields }: FieldInputProps) => {
      fields = ChildFields;
      return (
        <>
          {ChildFields.map((Child) => (
            <Child key={Child.key} />
          ))}
        </>
      );
    };
    const Leaf = ({ path, defaultValue }: FieldInputProps) => (
      <input data-path={path} defaultValue={String(defaultValue ?? '')} />
    );
    const form = (
      <Form
        ref={ref}
        validationMode={0}
        jsonSchema={{
          type: 'object',
          properties: {
            show: { type: 'boolean' },
            rows: {
              type: 'array',
              options: { terminal: false },
              presentation: { FieldInput: Branch },
              items: {
                type: 'string',
                controls: { visible: '../../show' },
                presentation: { FieldInput: Leaf },
              },
            },
          },
        }}
        defaultValue={{ show: true, rows: ['stored'] }}
      />
    );
    const view = render(strict ? <StrictMode>{form}</StrictMode> : form);
    const node = ref.current!.findNode('/rows/0')!;
    const Child = fields[0];
    const key = Child.key;
    const input = view.container.querySelector<HTMLInputElement>(
      'input[data-path="/rows/0"]',
    )!;
    input.value = 'uncommitted draft';
    act(() => ref.current!.findNode('/show')!.setValue(false));
    expect(
      view.container.querySelector('input[data-path="/rows/0"]'),
    ).toBeNull();
    expect(fields[0]).toBe(Child);
    act(() => ref.current!.findNode('/show')!.setValue(true));
    expect(ref.current!.findNode('/rows/0')).toBe(node);
    expect(fields[0]).toBe(Child);
    expect(fields[0].key).toBe(key);
    const reopened = view.container.querySelector<HTMLInputElement>(
      'input[data-path="/rows/0"]',
    )!;
    expect(reopened).not.toBe(input);
    expect(reopened.value).toBe('stored');
  },
);

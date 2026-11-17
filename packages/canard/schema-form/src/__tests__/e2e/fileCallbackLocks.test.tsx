import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type FormHandle,
  ValidationMode,
} from '../../index';

afterEach(cleanup);

it.each([
  ['form', 'disabled', 'direct'],
  ['form', 'readOnly', 'direct'],
  ['node', 'disabled', 'direct'],
  ['node', 'readOnly', 'direct'],
  ['form', 'disabled', 'renderer'],
  ['form', 'readOnly', 'renderer'],
  ['node', 'disabled', 'renderer'],
  ['node', 'readOnly', 'renderer'],
  ['form', 'disabled', 'parent'],
  ['form', 'readOnly', 'parent'],
  ['node', 'disabled', 'parent'],
  ['node', 'readOnly', 'parent'],
] as const)(
  '%s %s gates delayed file replacement and removal (relay=%s)',
  (scope, lock, relay) => {
    let input!: FieldInputProps;
    let relayedFiles: File | File[] | undefined;
    const onFileAttach = vi.fn((files: File | File[] | undefined) => {
      relayedFiles = files;
    });
    const Input = (props: FieldInputProps) => {
      input = props;
      return <input type="file" disabled={props.disabled} />;
    };
    const Renderer = ({ Input }: FieldRendererProps) => (
      <Input onFileAttach={onFileAttach} />
    );
    const Parent = ({ ChildFields }: FieldInputProps) => (
      <>
        {ChildFields.filter((Child) => Child.field === 'file').map((Child) => (
          <Child key={Child.key} onFileAttach={onFileAttach} />
        ))}
      </>
    );
    const schema = {
      type: 'object',
      options: { terminal: false },
      presentation: relay === 'parent' ? { FieldInput: Parent } : undefined,
      properties: {
        locked: { type: 'boolean' },
        file: {
          type: 'string',
          controls: scope === 'node' ? { [lock]: '../locked' } : undefined,
          presentation: {
            FieldInput: Input,
            controlled: true,
          },
        },
      },
    } as const;
    const ref = createRef<FormHandle<typeof schema>>();
    const tree = (locked: boolean) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={{ locked: false, file: 'unchanged' }}
        validationMode={ValidationMode.None}
        {...(scope === 'form' ? { [lock]: locked } : {})}
      >
        {relay !== 'parent' ? (
          <Form.Field
            path="/file"
            FieldRenderer={relay === 'renderer' ? Renderer : undefined}
          />
        ) : undefined}
      </Form>
    );
    const view = render(tree(false));
    const pending = input.onFileAttach;
    const first = new File(['first'], 'first.txt');
    const second = new File(['second'], 'second.txt');
    const files = () =>
      (relay !== 'direct'
        ? relayedFiles
        : ref.current!.getAttachedFilesMap().get('/file')) as
        | File[]
        | undefined;
    const setLocked = (locked: boolean) => {
      if (scope === 'form') view.rerender(tree(locked));
      else act(() => ref.current!.findNode('/locked')!.setValue(locked));
    };
    act(() => pending([first]));
    expect(files()?.[0]).toBe(first);
    onFileAttach.mockClear();

    setLocked(true);
    expect(input[lock]).toBe(true);
    act(() => pending([second]));
    expect(files()?.[0]).toBe(first);
    act(() => pending(undefined));
    expect(files()?.[0]).toBe(first);
    expect(onFileAttach).not.toHaveBeenCalled();

    setLocked(false);
    expect(input[lock]).toBe(false);
    act(() => pending([second]));
    expect(files()?.[0]).toBe(second);
    act(() => pending(undefined));
    expect(files()).toBeUndefined();
    expect(onFileAttach).toHaveBeenCalledTimes(relay !== 'direct' ? 2 : 0);
    expect(ref.current!.findNode('/file')!.value).toBe('unchanged');
  },
);

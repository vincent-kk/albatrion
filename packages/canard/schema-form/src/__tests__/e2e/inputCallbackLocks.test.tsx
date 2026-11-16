import { Suspense, createRef, startTransition } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { type FieldInputProps, Form, type FormHandle } from '../../index';

afterEach(cleanup);
it.each(['disabled', 'readOnly'] as const)(
  'an outstanding input callback respects the latest Form %s',
  (lock) => {
    let callback: FieldInputProps['onChange'];
    const Input = (props: FieldInputProps) => {
      callback = props.onChange;
      return <input value={String(props.value ?? '')} readOnly />;
    };
    const schema = {
      type: 'string',
      presentation: { FieldInput: Input },
    } as const;
    const ref = createRef<FormHandle<typeof schema>>();
    const view = render(
      <Form ref={ref} jsonSchema={schema} defaultValue="before" />,
    );
    const pending = callback!;
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="before"
        {...{ [lock]: true }}
      />,
    );
    act(() => pending('late response'));
    expect(ref.current!.getValue()).toBe('before');
  },
);
it.each(['disabled', 'readOnly'] as const)(
  'an outstanding callback works after Form %s is removed',
  (lock) => {
    let callback: FieldInputProps['onChange'];
    const Input = (props: FieldInputProps) => {
      callback = props.onChange;
      return <input value={String(props.value ?? '')} readOnly />;
    };
    const schema = {
      type: 'string',
      presentation: { FieldInput: Input },
    } as const;
    const ref = createRef<FormHandle<typeof schema>>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="before"
        {...{ [lock]: true }}
      />,
    );
    const pending = callback!;
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="before"
        {...{ [lock]: false }}
      />,
    );
    act(() => pending('enabled response'));
    expect(ref.current!.getValue()).toBe('enabled response');
  },
);

it('does not publish locks from a suspended render', () => {
  let callback: FieldInputProps['onChange'];
  let suspend = false;
  const pendingRender = new Promise<void>(() => {});
  const Input = (props: FieldInputProps) => {
    if (suspend) throw pendingRender;
    callback = props.onChange;
    return (
      <input
        data-testid="live-input"
        value={String(props.value ?? '')}
        readOnly
      />
    );
  };
  const schema = {
    type: 'string',
    presentation: { FieldInput: Input, controlled: true },
  } as const;
  const ref = createRef<FormHandle<typeof schema>>();
  const tree = (disabled: boolean) => (
    <Suspense fallback={<span>loading</span>}>
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="before"
        disabled={disabled}
      />
    </Suspense>
  );
  const view = render(tree(false));
  const pending = callback!;
  const input = view.getByTestId('live-input');
  const handle = ref.current!;
  suspend = true;
  act(() => startTransition(() => view.rerender(tree(true))));
  expect(view.queryByText('loading')).toBeNull();
  expect(view.getByTestId('live-input')).toBe(input);
  act(() => pending('while pending'));
  expect(handle.getValue()).toBe('while pending');
  suspend = false;
  view.rerender(tree(false));
});

import {
  StrictMode,
  Suspense,
  createRef,
  startTransition,
  useLayoutEffect,
  useRef,
} from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';

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

it.each([
  ['disabled', false, true],
  ['disabled', true, false],
  ['readOnly', false, true],
  ['readOnly', true, false],
] as const)(
  'publishes Form %s %s → %s before child layout callbacks',
  (lock, initial, next) => {
    let callback: FieldInputProps['onChange'];
    let pending: FieldInputProps['onChange'];
    const calls: boolean[] = [];
    const Input = (props: FieldInputProps) => {
      callback = props.onChange;
      const locked = props[lock];
      useLayoutEffect(() => {
        if (locked === next) {
          calls.push(locked);
          pending!('layout response');
        }
      }, [locked]);
      return <input value={String(props.value ?? '')} readOnly />;
    };
    const schema = {
      type: 'string',
      presentation: { FieldInput: Input, controlled: true },
    } as const;
    const ref = createRef<FormHandle<typeof schema>>();
    const tree = (locked: boolean) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="before"
        {...{ [lock]: locked }}
      />
    );
    const view = render(tree(initial), { wrapper: StrictMode });
    pending = callback!;
    view.rerender(tree(next));
    expect(calls).toEqual([next]);
    expect(ref.current!.getValue()).toBe(next ? 'before' : 'layout response');
  },
);

it.each(['disabled', 'readOnly'] as const)(
  'keeps server-rendered Form %s in force through hydration',
  (lock) => {
    let callback: FieldInputProps['onChange'];
    const Input = (props: FieldInputProps) => {
      callback = props.onChange;
      const initialOnChange = useRef(props.onChange);
      useLayoutEffect(() => initialOnChange.current('hydration response'), []);
      return (
        <input
          value={String(props.value ?? '')}
          disabled={props.disabled}
          readOnly={props.readOnly}
          onChange={(event) => props.onChange(event.target.value)}
        />
      );
    };
    const schema = {
      type: 'string',
      presentation: { FieldInput: Input, controlled: true },
    } as const;
    const ref = createRef<FormHandle<typeof schema>>();
    const tree = (locked: boolean) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="before"
        {...{ [lock]: locked }}
      />
    );
    const container = document.createElement('div');
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    try {
      container.innerHTML = renderToString(
        <StrictMode>{tree(true)}</StrictMode>,
      );
    } finally {
      consoleError.mockRestore();
    }
    document.body.append(container);
    const serverInput = container.querySelector('input')!;
    expect(serverInput[lock]).toBe(true);
    const errors: unknown[] = [];
    const view = render(tree(true), {
      container,
      hydrate: true,
      wrapper: StrictMode,
      onRecoverableError: (error) => errors.push(error),
    });
    expect(container.querySelector('input')).toBe(serverInput);
    expect(ref.current!.getValue()).toBe('before');
    const pending = callback!;
    act(() => pending('while locked'));
    expect(ref.current!.getValue()).toBe('before');
    view.rerender(tree(false));
    act(() => pending('after hydration'));
    expect(ref.current!.getValue()).toBe('after hydration');
    expect(container.querySelector('input')).toBe(serverInput);
    expect(errors).toEqual([]);
  },
);

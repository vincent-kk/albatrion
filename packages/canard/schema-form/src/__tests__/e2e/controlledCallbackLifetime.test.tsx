import { createRef, useLayoutEffect, useRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { type FieldInputProps, Form, type FormHandle } from '../../index';

afterEach(cleanup);
/** Only transitions between effective controlled and uncontrolled modes retire a selection. */
const modeTransitions = [
  [true, false],
  [false, true],
  [true, undefined],
  [undefined, true],
] as const;

it.each(modeTransitions)(
  'retired raw input callbacks are rejected after controlled=%s changes to %s',
  (initial, next) => {
    let callback: FieldInputProps['onChange'];
    const Input = (props: FieldInputProps) => {
      callback = props.onChange;
      return (
        <input data-testid="input" value={String(props.value ?? '')} readOnly />
      );
    };
    const schema = { type: 'string' } as const;
    const definitions = (controlled: boolean | undefined) => [
      { test: { type: 'string' as const }, Component: Input, controlled },
    ];
    const ref = createRef<FormHandle<typeof schema>>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="before"
        fieldInputDefinitions={definitions(initial)}
      />,
    );
    act(() => ref.current!.setValue('reset'));
    const pending = callback!;
    const before = view.getByTestId('input');
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="before"
        fieldInputDefinitions={definitions(next)}
      />,
    );
    expect(view.getByTestId('input')).not.toBe(before);
    act(() => pending('retired input response'));
    expect(ref.current!.getValue()).toBe('reset');
    act(() => callback!('current response'));
    expect(ref.current!.getValue()).toBe('current response');
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="before"
        fieldInputDefinitions={definitions(initial)}
      />,
    );
    act(() => pending('first lifetime response'));
    expect(ref.current!.getValue()).toBe('current response');
  },
);
it('ordinary uncontrolled Refresh rejects the old callback', () => {
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
  render(<Form ref={ref} jsonSchema={schema} defaultValue="before" />);
  const pending = callback!;
  act(() => ref.current!.setValue('reset'));
  act(() => pending('retired response'));
  expect(ref.current!.getValue()).toBe('reset');
});

it.each(modeTransitions)(
  'controlled=%s to %s layout cleanup cannot change values or attachments',
  (initial, next) => {
    let armed = false;
    let cleanupCount = 0;
    const Input = ({ onChange, onFileAttach }: FieldInputProps) => {
      const initialCallbacks = useRef({ onChange, onFileAttach });
      useLayoutEffect(
        () => () => {
          if (!armed) return;
          cleanupCount++;
          initialCallbacks.current.onChange('retired cleanup');
          initialCallbacks.current.onFileAttach(
            new File(['retired'], 'retired.txt'),
          );
        },
        [initialCallbacks],
      );
      return <input />;
    };
    const schema = { type: 'string' } as const;
    const ref = createRef<FormHandle<typeof schema>>();
    const tree = (controlled: boolean | undefined) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="before"
        fieldInputDefinitions={[
          { test: { type: 'string' }, Component: Input, controlled },
        ]}
      />
    );
    const view = render(tree(initial));
    act(() => ref.current!.setValue('reset'));
    armed = true;
    view.rerender(tree(next));
    expect(cleanupCount).toBe(1);
    expect.soft(ref.current!.getValue()).toBe('reset');
    expect.soft(ref.current!.getAttachedFilesMap().size).toBe(0);
    armed = false;
  },
);

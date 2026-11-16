import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { type FieldInputProps, Form, type FormHandle } from '../../index';

afterEach(cleanup);
it.each([true, false])(
  'retired raw input callbacks are rejected after controlled=%s changes',
  (initial) => {
    let callback: FieldInputProps['onChange'];
    const Input = (props: FieldInputProps) => {
      callback = props.onChange;
      return (
        <input data-testid="input" value={String(props.value ?? '')} readOnly />
      );
    };
    const schema = { type: 'string' } as const;
    const definitions = (controlled: boolean) => [
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
        fieldInputDefinitions={definitions(!initial)}
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

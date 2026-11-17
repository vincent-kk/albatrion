import { createRef } from 'react';

import { act, render, screen } from '@testing-library/react';
import { expect, expectTypeOf, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import {
  FieldNodeEventType,
  type StringNode,
  ValidationMode,
} from '@/schema-form/core';

import { useFieldNodeSubscribe } from '../fieldNode/useFieldNodeSubscribe';
import { useFieldNodeTracker } from '../fieldNode/useFieldNodeTracker';

it('connects both hooks to formRef.current?.node only on a later render', () => {
  const schema = { type: 'string' } as const;
  const formRef = createRef<FormHandle<typeof schema>>();
  const listener = vi.fn();
  const catchUp = vi.fn();
  /** A form handle supplies its node after this consumer's initial render. */
  const Probe = () => {
    const revision = useFieldNodeTracker(
      formRef.current?.node,
      FieldNodeEventType.UpdateValue,
    );
    useFieldNodeSubscribe(formRef.current?.node, listener, {
      onSubscribe: (node) => {
        expectTypeOf(node).toEqualTypeOf<StringNode>();
        catchUp(node, node.value);
      },
    });
    return (
      <>
        <output data-testid="revision">{revision}</output>
        <Form
          ref={formRef}
          jsonSchema={schema}
          validationMode={ValidationMode.None}
        >
          <span />
        </Form>
      </>
    );
  };
  const view = render(<Probe />);
  expect(formRef.current?.node).toBeDefined();
  act(() => formRef.current?.setValue('before consumer render'));
  expect(screen.getByTestId('revision').textContent).toBe('0');
  expect(listener).not.toHaveBeenCalled();
  expect(catchUp).not.toHaveBeenCalled();

  view.rerender(<Probe />);
  expect(catchUp).toHaveBeenCalledExactlyOnceWith(
    formRef.current?.node,
    'before consumer render',
  );
  expect(screen.getByTestId('revision').textContent).toBe(
    String(formRef.current?.node?.revision(FieldNodeEventType.UpdateValue)),
  );
  act(() => formRef.current?.setValue('after consumer render'));
  expect(listener).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('revision').textContent).toBe(
    String(formRef.current?.node?.revision(FieldNodeEventType.UpdateValue)),
  );
});

it('keeps observing the old root after rebuild until the consumer renders again', () => {
  const schema = { type: 'string' } as const;
  const formRef = createRef<FormHandle<typeof schema>>();
  const listener = vi.fn();
  /** The consumer re-renders only when the tracker or its parent says so. */
  const Probe = () => {
    const node = formRef.current?.node;
    const revision = useFieldNodeTracker(node, FieldNodeEventType.UpdateValue);
    useFieldNodeSubscribe(node, listener);
    return (
      <>
        <output data-testid="revision">{revision}</output>
        <Form
          ref={formRef}
          jsonSchema={schema}
          validationMode={ValidationMode.None}
        >
          <span />
        </Form>
      </>
    );
  };
  const view = render(<Probe />);
  view.rerender(<Probe />);
  const oldRoot = formRef.current?.node;

  act(() => formRef.current?.rebuild());
  const newRoot = formRef.current?.node;
  expect(newRoot).toBeDefined();
  expect(newRoot).not.toBe(oldRoot);

  listener.mockClear();
  act(() => formRef.current?.setValue('on the new root'));
  expect(listener).not.toHaveBeenCalled();
  expect(screen.getByTestId('revision').textContent).toBe(
    String(oldRoot?.revision(FieldNodeEventType.UpdateValue)),
  );

  view.rerender(<Probe />);
  act(() => formRef.current?.setValue('after consumer render'));
  expect(listener).toHaveBeenCalledTimes(1);
});

import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

afterEach(cleanup);

it('REACT-027 LANDING-150 writes undefined for an empty nonnullable number and null for nullable', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form ref={ref} jsonSchema={{ type: 'number' }} defaultValue={2} />,
  );
  fireEvent.change(view.container.querySelector('input')!, {
    target: { value: '' },
  });
  expect(ref.current!.getValue()).toBeUndefined();
  view.unmount();
  const nullable = render(
    <Form
      ref={ref}
      jsonSchema={{ type: ['number', 'null'] }}
      defaultValue={2}
    />,
  );
  fireEvent.change(nullable.container.querySelector('input')!, {
    target: { value: '' },
  });
  expect(ref.current!.getValue()).toBeNull();
});

it('REACT-027 restores a bad numeric draft on blur without publishing it', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form ref={ref} jsonSchema={{ type: 'number' }} defaultValue={2} />,
  );
  const input = view.container.querySelector('input')!;
  Object.defineProperty(input, 'validity', {
    configurable: true,
    value: { badInput: true },
  });
  fireEvent.change(input, { target: { value: '' } });
  expect(ref.current!.getValue()).toBe(2);
  fireEvent.blur(input);
  expect(input.value).toBe('2');
});

it('REACT-027 renders a nonboolean checkbox value as indeterminate', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form ref={ref} jsonSchema={{ type: 'boolean' }} defaultValue="wrong" />,
  );
  expect(view.container.querySelector('input')!.indeterminate).toBe(true);
  act(() => ref.current!.setValue(false));
  expect(view.container.querySelector('input')!.indeterminate).toBe(false);
});

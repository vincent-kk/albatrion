import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

afterEach(cleanup);

it('REACT-027 SURFACE-061 marks a string value on a number node with aria-invalid and clears it after a valid number is typed', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form ref={ref} jsonSchema={{ type: 'number' }} defaultValue="abc" />,
  );
  const input = view.container.querySelector('input')!;
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(ref.current!.getValue()).toBe('abc');
  fireEvent.change(input, { target: { value: '42' } });
  expect(input.hasAttribute('aria-invalid')).toBe(false);
  expect(ref.current!.getValue()).toBe(42);
});

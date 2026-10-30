import { createRef } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

import { FieldInputBoolean } from '../FieldInputBoolean';

afterEach(cleanup);

it('marks an object boolean value as unchecked until a valid value is written', () => {
  const ref = createRef<FormHandle>();
  const value = { enabled: true };
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'boolean',
        presentation: { FieldInput: FieldInputBoolean },
      }}
      defaultValue={value}
    />,
  );
  let input = screen.getByRole<HTMLInputElement>('checkbox');
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.checked).toBe(false);
  expect(ref.current!.getValue()).toEqual(value);
  act(() => ref.current!.setValue(true));
  input = screen.getByRole<HTMLInputElement>('checkbox');
  expect(input.hasAttribute('aria-invalid')).toBe(false);
  expect(input.checked).toBe(true);
  act(() => ref.current!.setValue(value));
  input = screen.getByRole<HTMLInputElement>('checkbox');
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.checked).toBe(false);
  expect(ref.current!.getValue()).toEqual(value);
});

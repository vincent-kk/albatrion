import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

import { FieldInputStringEnum } from '../FieldInputStringEnum';

afterEach(cleanup);

it('marks a wrong-typed enum value until a valid value is written', () => {
  const ref = createRef<FormHandle>();
  const value = { wrong: true };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'string',
        enum: ['S', 'M'],
        presentation: { FieldInput: FieldInputStringEnum },
      }}
      defaultValue={value}
    />,
  );
  expect(view.getByRole('combobox').getAttribute('aria-invalid')).toBe('true');
  expect(ref.current!.getValue()).toEqual(value);
  act(() => ref.current!.setValue('M'));
  expect(view.getByRole('combobox').hasAttribute('aria-invalid')).toBe(false);
  expect(ref.current!.getValue()).toBe('M');
});

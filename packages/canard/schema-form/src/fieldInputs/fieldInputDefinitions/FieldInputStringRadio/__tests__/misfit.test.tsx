import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

import { FieldInputStringRadio } from '../FieldInputStringRadio';

afterEach(cleanup);

it('marks a wrong-typed radio value until a valid value is written', () => {
  const ref = createRef<FormHandle>();
  const value = { wrong: true };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'string',
        enum: ['S', 'M'],
        presentation: { FieldInput: FieldInputStringRadio },
      }}
      defaultValue={value}
    />,
  );
  expect(view.getByRole('group').getAttribute('aria-invalid')).toBe('true');
  expect(ref.current!.getValue()).toEqual(value);
  act(() => ref.current!.setValue('M'));
  expect(view.getByRole('group').hasAttribute('aria-invalid')).toBe(false);
  expect(ref.current!.getValue()).toBe('M');
});

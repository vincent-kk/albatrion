import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

import { FieldInputString } from '../FieldInputString';

afterEach(cleanup);

it('marks a wrong-typed string value until a valid value is written', () => {
  const ref = createRef<FormHandle>();
  const value = { wrong: true };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'string',
        presentation: { FieldInput: FieldInputString },
      }}
      defaultValue={value}
    />,
  );
  expect(view.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
  expect(ref.current!.getValue()).toEqual(value);
  act(() => ref.current!.setValue('valid'));
  expect(view.getByRole('textbox').hasAttribute('aria-invalid')).toBe(false);
  expect(ref.current!.getValue()).toBe('valid');
});

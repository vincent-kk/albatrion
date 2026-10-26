import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

import { FieldInputDateFormat } from '../FieldInputDateFormat';

afterEach(cleanup);

it('marks a wrong-typed date-format value until a valid value is written', () => {
  const ref = createRef<FormHandle>();
  const value = { wrong: true };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'string',
        format: 'date',
        presentation: { FieldInput: FieldInputDateFormat },
      }}
      defaultValue={value}
    />,
  );
  expect(
    view.container.querySelector('input')!.getAttribute('aria-invalid'),
  ).toBe('true');
  expect(ref.current!.getValue()).toEqual(value);
  act(() => ref.current!.setValue('2024-02-29'));
  expect(
    view.container.querySelector('input')!.hasAttribute('aria-invalid'),
  ).toBe(false);
  expect(ref.current!.getValue()).toBe('2024-02-29');
});

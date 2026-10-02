import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';

afterEach(cleanup);

it('REACT-033 LANDING-186 renders the default union input and retains string members', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: ['number', 'string'] }}
      validationMode={ValidationMode.None}
    />,
  );
  const input = view.getByRole('textbox');
  fireEvent.change(input, { target: { value: '42' } });
  expect(ref.current!.getValue()).toBe('42');
});

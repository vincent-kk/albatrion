import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputNumberDefinition } from '../FieldInputNumber';

afterEach(cleanup);

it('reverts a withheld 1.5 on an integer node to the node value at blur', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputNumberDefinition]}
      jsonSchema={{ type: 'integer' }}
      defaultValue={3}
      onError={() => {}}
    />,
  );
  const input = () => screen.getByRole('spinbutton') as HTMLInputElement;
  fireEvent.focus(input());
  fireEvent.change(input(), { target: { value: '1.5' } });
  expect(input().value).toBe('1.5');
  expect(ref.current!.getValue()).toBe(3);
  fireEvent.blur(input());
  expect(input().value).toBe('3');
  expect(ref.current!.getValue()).toBe(3);
});

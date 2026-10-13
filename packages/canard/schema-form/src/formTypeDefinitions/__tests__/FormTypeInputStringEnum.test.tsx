import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

afterEach(cleanup);

it('shows an out-of-set default as a leading disabled option and allows an enum choice', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', enum: ['S', 'M'] }}
      defaultValue="XL"
    />,
  );
  const select = screen.getByRole<HTMLSelectElement>('combobox');
  expect(select.value).toBe('XL');
  expect(select.options[0].textContent).toBe('XL');
  expect(select.options[0].disabled).toBe(true);
  expect(select.options).toHaveLength(3);
  fireEvent.change(select, { target: { value: 'M' } });
  expect(ref.current!.getValue()).toBe('M');
});

it('keeps an in-set value and its alias without an extra option', () => {
  render(
    <Form
      jsonSchema={{
        type: 'string',
        enum: ['S', 'M'],
        presentation: { FormTypeInputProps: { alias: { M: 'Medium' } } },
      }}
      defaultValue="M"
    />,
  );
  const select = screen.getByRole<HTMLSelectElement>('combobox');
  expect(select.value).toBe('M');
  expect(select.selectedOptions[0].textContent).toBe('Medium');
  expect(select.options).toHaveLength(2);
});

it('shows an out-of-set empty string as a disabled option', () => {
  render(<Form jsonSchema={{ type: 'string', enum: ['S'] }} defaultValue="" />);
  const select = screen.getByRole<HTMLSelectElement>('combobox');
  expect(select.value).toBe('');
  expect(select.options[0].disabled).toBe(true);
});

it('keeps an out-of-set null at the existing first-option display', () => {
  render(
    <Form
      jsonSchema={{ type: ['string', 'null'], enum: ['S', 'M'] }}
      defaultValue={null}
    />,
  );
  const select = screen.getByRole<HTMLSelectElement>('combobox');
  expect(select.value).toBe('S');
  expect(select.options).toHaveLength(2);
});

it('keeps an in-set null selectable', () => {
  render(
    <Form
      jsonSchema={{ type: ['string', 'null'], enum: ['S', null] }}
      defaultValue={null}
    />,
  );
  const select = screen.getByRole<HTMLSelectElement>('combobox');
  expect(select.value).toBe('null');
  expect(select.selectedOptions[0].disabled).toBe(false);
});

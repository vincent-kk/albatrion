import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

afterEach(cleanup);

const schema = {
  type: 'array',
  items: { type: 'string', enum: ['a', 'b'] },
  presentation: { inputType: 'checkbox' },
} as const;
const nullableSchema = { ...schema, type: ['array', 'null'] } as const;

it.each([['ab'], [{ a: 1 }]])(
  'renders a non-array value %j without throwing, checks nothing, and marks the group',
  (value) => {
    render(<Form jsonSchema={schema} defaultValue={value} />);
    const inputs = screen.getAllByRole<HTMLInputElement>('checkbox');
    expect(inputs.map((input) => input.checked)).toEqual([false, false]);
    expect(screen.getByRole('group').getAttribute('aria-invalid')).toBe('true');
  },
);

it.each([[null], [undefined]])(
  'shows %s of a nullable array as an empty selection without a marker',
  (value) => {
    render(<Form jsonSchema={nullableSchema} defaultValue={value} />);
    const inputs = screen.getAllByRole<HTMLInputElement>('checkbox');
    expect(inputs.map((input) => input.checked)).toEqual([false, false]);
    expect(screen.getByRole('group').hasAttribute('aria-invalid')).toBe(false);
  },
);

it('turns a string value into the exact array on one check and removes the marker', () => {
  const ref = createRef<FormHandle>();
  render(<Form ref={ref} jsonSchema={schema} defaultValue="ab" />);
  act(() => {
    fireEvent.click(screen.getAllByRole<HTMLInputElement>('checkbox')[0]);
  });
  expect(ref.current!.getValue()).toEqual(['a']);
  expect(screen.getByRole('group').hasAttribute('aria-invalid')).toBe(false);
});

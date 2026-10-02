import { act } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { SetValueOption, type FormTypeInputProps } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

it('LANDING-200 child input restores a null object without refilling its sibling', async () => {
  form = await renderForm({ type: 'object', properties: {
    o: { type: 'object', properties: {
      a: { type: 'string', default: 'x' }, c: { type: 'number' },
    } },
  } });
  expect(form.value('/o/a')).toBe('x');
  const child = form.node('/o/a');
  await act(async () => form.node('/o')!.setValue(null));
  expect(form.getValue()).toEqual({ o: null });
  expect(form.node('/o/a')).toBe(child);
  expect(child?.value).toBeUndefined();
  expect(form.value('/o/a')).toBe('');
  await form.type('/o/c', '3');
  expect(form.getValue()).toEqual({ o: { c: 3 } });
  expect(form.value('/o/a')).toBe('');
});

it('LANDING-201 input Overwrite preserves the input instance and caret', async () => {
  const Input = ({ path, value, onChange }: FormTypeInputProps) => (
    <input id={path} defaultValue={value ?? ''}
      onChange={(event) => onChange(event.target.value, SetValueOption.Overwrite)} />
  );
  form = await renderForm({ type: 'string' }, {
    defaultValue: '', formTypeInputDefinitions: [{ test: () => true, Component: Input }],
  });
  const field = form.field('') as HTMLInputElement;
  await form.user.type(field, 'abc');
  expect(form.field('')).toBe(field);
  expect(document.activeElement).toBe(field);
  expect(field.selectionStart).toBe(3);
  expect(form.getValue()).toBe('abc');
});

it('LANDING-202 whole-array replacement fills only the newly created tail', async () => {
  form = await renderForm({ type: 'array', items: {
    type: 'object', properties: { a: { type: 'string', default: 'x' } },
  } }, { defaultValue: [{}] });
  const item = form.node('/0');
  expect(form.value('/0/a')).toBe('x');
  await form.setValue([{}, {}]);
  expect(form.node('/0')).toBe(item);
  expect(form.node('/1')).not.toBe(item);
  expect(form.getValue()).toEqual([{}, { a: 'x' }]);
  expect([form.value('/0/a'), form.value('/1/a')]).toEqual(['', 'x']);
});

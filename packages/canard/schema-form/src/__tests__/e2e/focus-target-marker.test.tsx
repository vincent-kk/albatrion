import { act } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { type FieldInputProps } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

/** Each focus test owns its mounted form. */
let form: FormHarness;
afterEach(() => form?.unmount());

it('focuses a marked custom switch through the public handle', async () => {
  const Switch = ({ path }: FieldInputProps) => (
    <div
      id={path}
      role="switch"
      tabIndex={0}
      data-focus-target
      aria-checked={false}
    />
  );
  form = await renderForm({
    type: 'boolean',
    presentation: { FieldInput: Switch },
  });
  const target = form.container.querySelector('[data-focus-target]');
  await act(async () => form.handle.focus(''));
  expect(document.activeElement).toBe(target);
});

it('keeps the native target for inputs without a marker', async () => {
  form = await renderForm({ type: 'string' });
  const target = form.field('');
  await act(async () => form.handle.focus(''));
  expect(document.activeElement).toBe(target);
});

it('chooses the first match in DOM order instead of prioritizing a later marker', async () => {
  const Input = () => (
    <>
      <button type="button">first</button>
      <div tabIndex={0} data-focus-target />
    </>
  );
  form = await renderForm({
    type: 'string',
    presentation: { FieldInput: Input },
  });
  await act(async () => form.handle.focus(''));
  expect(document.activeElement).toBe(form.container.querySelector('button'));
});

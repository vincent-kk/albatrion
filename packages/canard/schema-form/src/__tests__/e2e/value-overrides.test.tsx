import { useState } from 'react';

import { afterEach, expect, it } from 'vitest';

import { Form, type FormTypeInputProps } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

/** Render a visible marker from the override supplied by Form.Input. */
const Badge = ({ badge }: FormTypeInputProps) => <output>{badge ?? 'none'}</output>;

/** Replace or remove a JSX override without replacing the Form. */
const Swap = ({ next }: { next?: string }) => {
  const [changed, change] = useState(false);
  const props = changed ? (next ? { badge: next } : {}) : { badge: 'first' };
  return <><button type="button" onClick={() => change(true)}>swap</button><Form.Input path="/name" FormTypeInput={Badge} {...props} /></>;
};

it('LANDING-035 removing the last Form.Input override updates the DOM', async () => {
  form = await renderForm({ type: 'object', properties: { name: { type: 'string' } } }, { children: <Swap /> });
  expect(form.container.querySelector('output')?.textContent).toBe('first');
  await form.user.click(form.container.querySelector('button')!);
  expect(form.container.querySelector('output')?.textContent).toBe('none');
});

it('LANDING-035 replacing a Form.Input override updates the DOM', async () => {
  form = await renderForm({ type: 'object', properties: { name: { type: 'string' } } }, { children: <Swap next="second" /> });
  await form.user.click(form.container.querySelector('button')!);
  expect(form.container.querySelector('output')?.textContent).toBe('second');
});

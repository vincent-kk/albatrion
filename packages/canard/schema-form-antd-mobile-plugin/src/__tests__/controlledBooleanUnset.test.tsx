import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

it('keeps the native read-only Checkbox enabled while the form keeps its value', () => {
  const ref = createRef<FormHandle>();
  const { getByRole } = render(
    <Form
      ref={ref}
      readOnly
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={{ type: 'boolean' }}
      defaultValue={true}
    />,
  );
  const checkbox = getByRole('checkbox');
  expect(checkbox.hasAttribute('disabled')).toBe(false);
  fireEvent.click(checkbox);
  expect(ref.current?.getValue()).toBe(true);
});

const schema = {
  type: 'object',
  properties: { agree: { type: 'boolean' } },
} as const;

it('checkbox clears when the value is written to undefined from outside (round-2 antd-mobile-plugin 1)', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={schema}
      defaultValue={{ agree: true }}
    />,
  );
  const box = () =>
    container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  expect(box().checked).toBe(true);
  await act(async () => ref.current!.findNode('/agree')!.setValue(undefined));
  expect(ref.current!.getValue()).toEqual({});
  expect(box().checked).toBe(false);
});

it('checkbox clears after reset to a form without a default (round-2 antd-mobile-plugin 1)', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      jsonSchema={schema}
    />,
  );
  const box = () =>
    container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  await act(async () => ref.current!.setValue({ agree: true }));
  expect(box().checked).toBe(true);
  await act(async () => ref.current!.reset());
  expect(ref.current!.getValue()).toEqual({});
  expect(box().checked).toBe(false);
});

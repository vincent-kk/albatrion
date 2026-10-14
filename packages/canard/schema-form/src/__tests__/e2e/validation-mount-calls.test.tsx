import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Form, type JSONSchema, ValidationMode } from '@/schema-form';

import {
  type FormHarness,
  renderForm,
  setupValidatorPlugin,
} from '../renderForm';

/** Valid string schema whose first validator result is an empty issue list. */
const schema = { type: 'string' } satisfies JSONSchema;

/** Mounted harness whose subscriptions and error observer need cleanup. */
let form: FormHarness | undefined;
afterEach(() => {
  form?.unmount();
  form = undefined;
  cleanup();
});

describe('mount onValidate calls', () => {
  it('publishes only the first validation result in the default mode without errors', async () => {
    const onValidate = vi.fn();
    form = await renderForm(schema, {
      validator: true,
      defaultValue: 'valid',
      onValidate,
    });
    await form.flush();
    expect(onValidate).toHaveBeenCalledTimes(1);
    expect(onValidate).toHaveBeenLastCalledWith([]);
  });

  it('publishes nothing in None mode without errors', async () => {
    const onValidate = vi.fn();
    form = await renderForm(schema, {
      validator: true,
      defaultValue: 'valid',
      validationMode: ValidationMode.None,
      onValidate,
    });
    await form.flush();
    expect(onValidate).toHaveBeenCalledTimes(0);
  });

  it('publishes the external errors once when the first validation repeats their reference', async () => {
    const errors = [{ dataPath: '', message: 'server says no' }];
    const onValidate = vi.fn();
    form = await renderForm(schema, {
      validator: true,
      defaultValue: 'valid',
      errors,
      onValidate,
    });
    await form.flush();
    expect(onValidate).toHaveBeenCalledTimes(1);
    expect(onValidate.mock.calls.map(([issues]) => issues)).toEqual([errors]);
  });

  it.each([
    { label: 'undefined', errors: undefined },
    { label: 'an empty list', errors: [] },
  ])(
    'publishes nothing extra when $label is replaced by a fresh empty errors list',
    async ({ errors }) => {
      setupValidatorPlugin();
      const onValidate = vi.fn();
      const view = render(
        <Form
          jsonSchema={schema}
          defaultValue="valid"
          errors={errors}
          onValidate={onValidate}
        />,
      );
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      expect(onValidate).toHaveBeenCalledTimes(1);
      view.rerender(
        <Form
          jsonSchema={schema}
          defaultValue="valid"
          errors={[]}
          onValidate={onValidate}
        />,
      );
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      expect(onValidate).toHaveBeenCalledTimes(1);
    },
  );
});

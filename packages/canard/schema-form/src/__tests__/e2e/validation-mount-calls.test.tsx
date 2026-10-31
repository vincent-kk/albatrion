import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '@/schema-form';

import { settleValidation } from '../helpers/settleValidation';
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
  it('does not compile a development None-mode form without an if gate', async () => {
    expect(process.env.NODE_ENV).not.toBe('production');
    const compile = vi.fn(() => () => null);
    const compileGuard = vi.fn(() => () => true);
    form = await renderForm(schema, {
      validatorFactory: { compile, compileGuard },
      validationMode: ValidationMode.None,
    });
    await form.flush();
    expect(compile).not.toHaveBeenCalled();
    expect(compileGuard).not.toHaveBeenCalled();
  });

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
      const ref = createRef<FormHandle>();
      const view = render(
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue="valid"
          errors={errors}
          onValidate={onValidate}
        />,
      );
      await act(async () => {
        await settleValidation(() => ref.current?.node);
      });
      expect(onValidate).toHaveBeenCalledTimes(1);
      view.rerender(
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue="valid"
          errors={[]}
          onValidate={onValidate}
        />,
      );
      await act(async () => {
        await settleValidation(() => ref.current?.node);
      });
      expect(onValidate).toHaveBeenCalledTimes(1);
    },
  );
});

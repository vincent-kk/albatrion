import type { ReactNode } from 'react';

import { act, cleanup, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { settleValidation } from '@/schema-form/__tests__/helpers/settleValidation';
import { FieldNodeState } from '@/schema-form/core';
import { ExternalFormContextProvider } from '@/schema-form/providers/ExternalFormContext';
import { ShowError } from '@/schema-form/types';

import { awaitNativeSubmitVerdict } from './fixtures/awaitNativeSubmitVerdict';
import {
  type NativeSubmitFormOptions,
  mountNativeSubmitForm,
} from './fixtures/mountNativeSubmitForm';

// Native-submit behavior that the error reveal leaves unchanged: disabled policies, explicit visibility, imperative rejection, valid submits and consumer failures.

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/**
 * Wrap a Form in a FormProvider with the given showError.
 * @param showError - Provider policy.
 * @returns A wrapper for {@link mountNativeSubmitForm}.
 */
const withProvider = (showError: boolean) => (node: ReactNode) => (
  <ExternalFormContextProvider showError={showError}>
    {node}
  </ExternalFormContextProvider>
);

it.each([
  ['showError={false}', { formProps: { showError: false } }],
  ['ShowError.Never', { formProps: { showError: ShowError.Never } }],
  ['FormProvider showError false only', { wrap: withProvider(false) }],
  [
    'Form false over FormProvider true',
    { formProps: { showError: false }, wrap: withProvider(true) },
  ],
] as const)(
  'ERROR-139 %s: an invalid native submit neither reveals nor focuses',
  async (_, options: NativeSubmitFormOptions) => {
    const form = await mountNativeSubmitForm(options);
    const validate = vi.spyOn(form.ref.current!.node!, 'validate');
    await form.user.click(form.button());
    await awaitNativeSubmitVerdict(validate);
    await settleValidation(() => form.ref.current?.node);
    form.expectNothingReported();
    expect(form.errorText('/a')).toBe('');
    expect(form.errorText('/b')).toBe('');
    expect(document.activeElement).toBe(form.button());
  },
);

it('ERROR-139 ShowError.Always | ShowError.Never shows the errors after an invalid native submit', async () => {
  const form = await mountNativeSubmitForm({
    formProps: { showError: ShowError.Always | ShowError.Never },
  });
  const validate = vi.spyOn(form.ref.current!.node!, 'validate');
  await form.user.click(form.button());
  await awaitNativeSubmitVerdict(validate);
  await settleValidation(() => form.ref.current?.node);
  expect(form.errorText('/a')).toBe('a required');
  expect(form.onSubmit).not.toHaveBeenCalled();
});

it('ERROR-139 an explicit ErrorVisible false keeps its error hidden after an invalid native submit', async () => {
  const form = await mountNativeSubmitForm({ formProps: { showError: true } });
  act(() =>
    form.ref.current!.findNode('/a')!.setState({
      [FieldNodeState.ErrorVisible]: false,
    }),
  );
  const validate = vi.spyOn(form.ref.current!.node!, 'validate');
  await form.user.click(form.button());
  await awaitNativeSubmitVerdict(validate);
  await settleValidation(() => form.ref.current?.node);
  expect(form.errorText('/a')).toBe('');
  expect(form.errorText('/b')).toBe('b required');
});

it('ERROR-139 handle.submit() rejects with the verdict and reveals nothing', async () => {
  const form = await mountNativeSubmitForm();
  await act(async () => {
    await expect(form.ref.current!.submit()).rejects.toMatchObject({
      code: 'VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED',
    });
  });
  await settleValidation(() => form.ref.current?.node);
  expect(form.errorText('/a')).toBe('');
  form.expectNothingReported();
});

it('ERROR-139 a valid Enter calls onSubmit and reports nothing', async () => {
  const form = await mountNativeSubmitForm({ defaultValue: { a: 'x' } });
  await form.user.type(form.field('/b')!, 'y{Enter}');
  await waitFor(() =>
    expect(form.onSubmit).toHaveBeenCalledWith({ a: 'x', b: 'y' }),
  );
  expect(form.sink.errors()).toEqual([]);
  expect(form.onError).not.toHaveBeenCalled();
});

it("ERROR-139 onSubmit rethrowing another form's verdict reaches the host channel", async () => {
  const other = await mountNativeSubmitForm();
  let verdict: unknown;
  await act(async () => {
    verdict = await other.ref.current!.submit().catch((error) => error);
  });
  other.view.unmount();
  const form = await mountNativeSubmitForm({
    defaultValue: { a: 'x', b: 'y' },
    formProps: {
      onSubmit: () => {
        throw verdict;
      },
    },
  });
  await form.user.click(form.button());
  await waitFor(() => expect(form.sink.errors()).toEqual([verdict]));
  expect(form.onError).not.toHaveBeenCalled();
  expect(form.errorText('/a')).toBe('');
});

it('ERROR-139 handle.submit passed straight to a click listener still rejects with the verdict', async () => {
  const form = await mountNativeSubmitForm();
  const focusRequests = form.spyFocusRequests('/a');
  const submit = form.ref.current!.submit;
  const outer = document.createElement('button');
  document.body.append(outer);
  const results: Promise<void>[] = [];
  outer.addEventListener('click', (event) =>
    results.push(Reflect.apply(submit, undefined, [event])),
  );
  try {
    outer.click();
    await act(async () => {
      await expect(results[0]).rejects.toMatchObject({
        code: 'VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED',
      });
    });
    await settleValidation(() => form.ref.current?.node);
    expect(form.errorText('/a')).toBe('');
    expect(focusRequests()).toBe(0);
    form.expectNothingReported();
  } finally {
    outer.remove();
  }
});

it('FormHandle.select() still selects the text input after a <select>', async () => {
  const form = await mountNativeSubmitForm({
    schema: {
      type: 'object',
      properties: {
        a: { type: 'string', enum: ['x', 'y'] },
        b: { type: 'string' },
      },
    },
    defaultValue: { a: 'x', b: 'text' },
  });
  const input = form.field('/b') as HTMLInputElement;
  input.setSelectionRange(4, 4);
  act(() => form.ref.current!.select(''));
  expect([input.selectionStart, input.selectionEnd]).toEqual([0, 4]);
});

import { act, cleanup, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { settleValidation } from '@/schema-form/__tests__/helpers/settleValidation';
import { FieldNodeState } from '@/schema-form/core';
import type { FieldInputProps, JSONSchema } from '@/schema-form/types';

import { awaitNativeSubmitVerdict } from './fixtures/awaitNativeSubmitVerdict';
import { mountNativeSubmitForm } from './fixtures/mountNativeSubmitForm';
import { requireKeys } from './fixtures/requireKeys';

// An invalid native submit reveals the form's errors and focuses the first invalid field (ERROR-139).

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('ERROR-139 reports nothing, reveals both errors and focuses the first invalid field', async () => {
  const form = await mountNativeSubmitForm();
  expect(form.errorText('/a')).toBe('');
  await form.user.click(form.button());
  await waitFor(() => expect(document.activeElement).toBe(form.field('/a')));
  await settleValidation(() => form.ref.current?.node);
  form.expectNothingReported();
  expect(form.errorText('/a')).toBe('a required');
  expect(form.errorText('/b')).toBe('b required');
});

it('ERROR-139 focuses a <select> when the first invalid field is an enum', async () => {
  const form = await mountNativeSubmitForm({
    schema: {
      type: 'object',
      properties: {
        a: { type: 'string', enum: ['x', 'y'] },
        b: { type: 'string' },
      },
    },
  });
  await form.user.click(form.button());
  await waitFor(() => expect(document.activeElement).toBe(form.field('/a')));
  expect(form.field('/a')!.tagName).toBe('SELECT');
  form.expectNothingReported();
});

it('ERROR-139 focuses /b when the root and /b both have errors', async () => {
  const form = await mountNativeSubmitForm({
    check: (value) => [
      { dataPath: '', keyword: 'root', message: 'root issue' },
      ...requireKeys('b')(value),
    ],
    defaultValue: { a: 'filled' },
  });
  await form.user.click(form.button());
  await waitFor(() => expect(document.activeElement).toBe(form.field('/b')));
  form.expectNothingReported();
});

it('ERROR-139 focuses the first input of the root when only the root has an error', async () => {
  const form = await mountNativeSubmitForm({
    check: () => [{ dataPath: '', keyword: 'root', message: 'root issue' }],
    defaultValue: { a: 'filled', b: 'filled' },
  });
  await form.user.click(form.button());
  await waitFor(() => expect(document.activeElement).toBe(form.field('/a')));
  form.expectNothingReported();
});

it('ERROR-139 focuses the input of a terminal object root for an inner-path error', async () => {
  const TerminalRoot = ({ path }: FieldInputProps) => (
    <>
      <input id={path} />
      <button type="submit">submit</button>
    </>
  );
  const form = await mountNativeSubmitForm({
    schema: {
      type: 'object',
      options: { terminal: true },
      properties: { x: { type: 'string' } },
    } as JSONSchema,
    check: requireKeys('x'),
    formProps: { fieldInputMap: { '': TerminalRoot } },
  });
  await form.user.click(form.button());
  await waitFor(() => expect(document.activeElement).toBe(form.field('')));
  form.expectNothingReported();
});

it.each([
  ['read-only', { type: 'string', readOnly: true }],
  ['disabled', { type: 'string', controls: { disabled: true } }],
] as const)(
  'ERROR-139 skips a %s field and focuses the next invalid field',
  async (_, a) => {
    const form = await mountNativeSubmitForm({
      schema: {
        type: 'object',
        properties: { a, b: { type: 'string' } },
      } as JSONSchema,
    });
    await form.user.click(form.button());
    await waitFor(() => expect(document.activeElement).toBe(form.field('/b')));
    form.expectNothingReported();
  },
);

it('ERROR-139 skips a field whose own ErrorVisible state is false', async () => {
  const form = await mountNativeSubmitForm();
  act(() =>
    form.ref.current!.findNode('/a')!.setState({
      [FieldNodeState.ErrorVisible]: false,
    }),
  );
  await form.user.click(form.button());
  await waitFor(() => expect(document.activeElement).toBe(form.field('/b')));
  form.expectNothingReported();
  await settleValidation(() => form.ref.current?.node);
  expect(form.errorText('/a')).toBe('');
});

it('ERROR-139 reveals and focuses once for two overlapping Enter presses', async () => {
  const form = await mountNativeSubmitForm();
  const focuses: string[] = [];
  form.view.container.addEventListener('focusin', (event) =>
    focuses.push((event.target as HTMLElement).id),
  );
  form.validator.hold();
  await form.user.type(form.field('/b')!, '{Enter}{Enter}');
  await act(async () => form.validator.release());
  await waitFor(() => expect(document.activeElement).toBe(form.field('/a')));
  await settleValidation(() => form.ref.current?.node);
  expect(focuses.filter((path) => path === '/a')).toEqual(['/a']);
  form.expectNothingReported();
});

it('ERROR-139 StrictMode: an invalid native submit reveals the errors and focuses the first invalid field', async () => {
  const form = await mountNativeSubmitForm({ strictMode: true });
  const focusRequests = form.spyFocusRequests('/a');
  await form.user.click(form.button());
  await waitFor(() => expect(document.activeElement).toBe(form.field('/a')));
  await settleValidation(() => form.ref.current?.node);
  expect(focusRequests()).toBe(1);
  expect(form.errorText('/a')).toBe('a required');
  form.expectNothingReported();
});

it.each([['readOnly'], ['disabled']] as const)(
  'ERROR-139 a Form with %s reveals the errors without a Focus request',
  async (lock) => {
    const form = await mountNativeSubmitForm({ formProps: { [lock]: true } });
    const focusRequests = form.spyFocusRequests('/a');
    const validate = vi.spyOn(form.ref.current!.node!, 'validate');
    await form.user.click(form.button());
    await awaitNativeSubmitVerdict(validate);
    await settleValidation(() => form.ref.current?.node);
    expect(form.errorText('/a')).toBe('a required');
    expect(focusRequests()).toBe(0);
    expect(document.activeElement).toBe(form.button());
    form.expectNothingReported();
  },
);

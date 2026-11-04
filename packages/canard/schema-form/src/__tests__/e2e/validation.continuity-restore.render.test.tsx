import * as React from 'react';
import { type ReactNode, Suspense, createRef, useLayoutEffect } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, inject, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type FormHandle,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { settleValidation } from '../helpers/settleValidation';

const suspended = new Promise<void>(() => undefined);
const Gate = ({ hidden }: { hidden: boolean }) => {
  if (hidden) throw suspended;
  return null;
};
const boundary = (
  kind: 'activity' | 'suspense',
  form: ReactNode,
  hidden: boolean,
) =>
  kind === 'activity' ? (
    <React.Activity mode={hidden ? 'hidden' : 'visible'}>{form}</React.Activity>
  ) : (
    <Suspense fallback={<span>Loading</span>}>
      {form}
      <Gate hidden={hidden} />
    </Suspense>
  );

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** Preserve the same rendered Form element so restore reuses its old layout closures. */
const restore = async (
  kind: 'activity' | 'suspense',
  normalizeOnRestore: boolean,
) => {
  let normalize = false;
  const ref = createRef<FormHandle>();
  const Input = ({ errorVisible, errors, onChange }: FieldInputProps) => {
    useLayoutEffect(() => {
      if (normalize) onChange('valid');
    }, [onChange]);
    return (
      <span data-testid="input-error">
        {errorVisible ? errors[0]?.message : ''}
      </span>
    );
  };
  const Renderer = ({
    Input,
    errorVisible,
    errorMessage,
  }: FieldRendererProps) => (
    <>
      <Input />
      <span data-testid="renderer-error">
        {errorVisible ? errorMessage : ''}
      </span>
    </>
  );
  const form = (
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue=""
      showError={true}
      FieldRenderer={Renderer}
      fieldInputMap={{ '': Input }}
      formatError={(error) => error.message ?? null}
      validatorFactory={{
        compileGuard: () => () => true,
        compile: () => (value) =>
          value === 'valid' ? [] : [{ dataPath: '', message: 'old error' }],
      }}
    />
  );
  const view = render(boundary(kind, form, false));
  await settleValidation(() => ref.current?.node);
  const handle = ref.current!;
  // Exercise a version replacement before restoring the same retained Form element.
  act(() => handle.remount(''));
  expect(view.getByTestId('input-error').textContent).toBe('old error');
  expect(view.getByTestId('renderer-error').textContent).toBe('old error');
  await act(async () => {
    view.rerender(boundary(kind, form, true));
    await Promise.resolve();
  });
  const clock = createValidationFrameClock();
  normalize = normalizeOnRestore;
  view.rerender(boundary(kind, form, false));
  const expected = 'old error';
  expect(view.getByTestId('input-error').textContent).toBe(expected);
  expect(view.getByTestId('renderer-error').textContent).toBe(expected);
  for (let frame = 0; frame < 3; frame++) {
    await act(async () => {
      clock.frame();
      expect(view.getByTestId('renderer-error').textContent).toBe(
        frame === 0 || !normalize ? expected : '',
      );
      await clock.task();
    });
    expect(view.getByTestId('input-error').textContent).toBe(
      normalize ? '' : expected,
    );
    expect(view.getByTestId('renderer-error').textContent).toBe(
      normalize ? '' : expected,
    );
  }
};

it('IR-6 X1 Activity restore keeps baseline-eligible errors through mount-layout normalization', async (context) => {
  if (inject('reactMajor') !== '19') context.skip();
  await restore('activity', true);
});
it('IR-6 X1 Suspense restore keeps baseline-eligible errors through mount-layout normalization', async () => {
  await restore('suspense', true);
});
it('IR-6 X1 Activity restore without a write shows the verdict at once', async (context) => {
  if (inject('reactMajor') !== '19') context.skip();
  await restore('activity', false);
});
it('IR-6 X1 Suspense restore without a write shows the verdict at once', async () => {
  await restore('suspense', false);
});

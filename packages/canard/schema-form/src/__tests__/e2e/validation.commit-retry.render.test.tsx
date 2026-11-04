import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { type FieldRendererProps, Form, type FormHandle } from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { isValidationPending } from '../helpers/isValidationPending';
import { settleValidation } from '../helpers/settleValidation';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const Renderer = ({
  Input,
  errorVisible,
  errorMessage,
}: FieldRendererProps) => (
  <>
    <Input />
    <span data-testid="error">{errorVisible ? errorMessage : ''}</span>
  </>
);
type Issue = { dataPath: string; message: string };
it('IR-6 R-a a context commit in an async gap keeps display held until the newest verdict', async () => {
  const ref = createRef<FormHandle>();
  let asynchronous = false;
  const finishes: ((issues: readonly Issue[]) => void)[] = [];
  const validator = {
    compileGuard: () => () => true,
    compile: () => () =>
      asynchronous
        ? new Promise<readonly Issue[]>((resolve) => finishes.push(resolve))
        : [{ dataPath: '', message: 'old error' }],
  };
  const props = {
    jsonSchema: { type: 'string' as const },
    defaultValue: '',
    showError: false,
    FieldRenderer: Renderer,
    validatorFactory: validator,
    formatError: (error: { message?: string }) => error.message ?? null,
  };
  const view = render(<Form ref={ref} {...props} context={{ version: 0 }} />);
  await settleValidation(() => ref.current?.node);
  const clock = createValidationFrameClock();
  asynchronous = true;
  act(() => {
    ref.current!.setValue('new');
    ref.current!.showError();
  });
  await act(async () => {
    clock.frame();
    await clock.task();
  });
  expect(finishes).toHaveLength(1);
  view.rerender(<Form ref={ref} {...props} context={{ version: 1 }} />);
  await act(async () => {
    finishes[0]([{ dataPath: '', message: 'discarded' }]);
    await clock.task();
  });
  expect(isValidationPending(ref.current!.node!)).toBe(true);
  expect(view.getByTestId('error').textContent).toBe('');
  for (let frame = 0; frame < 2; frame++)
    await act(async () => {
      clock.frame();
      expect(view.getByTestId('error').textContent).toBe('');
      await clock.task();
    });
  expect(finishes).toHaveLength(2);
  await act(async () => {
    finishes[1]([{ dataPath: '', message: 'newest' }]);
    await clock.task();
  });
  expect(view.getByTestId('error').textContent).toBe('newest');
  expect(isValidationPending(ref.current!.node!)).toBe(false);
});
it('IR-6 R-a an async mount discarded by context still obtains an OnChange verdict', async () => {
  const clock = createValidationFrameClock();
  const ref = createRef<FormHandle>();
  const finishes: ((issues: readonly Issue[]) => void)[] = [];
  const validator = {
    compileGuard: () => () => true,
    compile: () => () =>
      new Promise<readonly Issue[]>((resolve) => finishes.push(resolve)),
  };
  const props = {
    jsonSchema: { type: 'string' as const },
    defaultValue: '',
    showError: false,
    FieldRenderer: Renderer,
    validatorFactory: validator,
  };
  const view = render(<Form ref={ref} {...props} context={{ version: 0 }} />);
  await act(async () => {
    clock.frame();
    await clock.task();
  });
  expect(finishes).toHaveLength(1);
  expect(isValidationPending(ref.current!.node!)).toBe(false);
  view.rerender(<Form ref={ref} {...props} context={{ version: 1 }} />);
  await act(async () => {
    finishes[0]([{ dataPath: '', message: 'stale mount' }]);
    await clock.task();
  });
  expect(isValidationPending(ref.current!.node!)).toBe(true);
  await act(async () => {
    clock.frame();
    await clock.task();
  });
  expect(finishes).toHaveLength(2);
  await act(async () => {
    finishes[1]([{ dataPath: '', message: 'newest mount' }]);
    await clock.task();
  });
  expect(ref.current!.getErrors()[0]?.message).toBe('newest mount');
});

import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '@/schema-form';
import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';

import { settleValidation } from '../helpers/settleValidation';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('IR-6 stream has exactly leading plus 100ms caps plus trailing across forty frames', async () => {
  const ref = createRef<FormHandle>();
  const onValidate = vi.fn();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'number' }}
      validationMode={ValidationMode.OnChange}
      validatorFactory={{
        compile: () => (value) => [{ dataPath: '', message: String(value) }],
        compileGuard: () => () => true,
      }}
      onValidate={onValidate}
    />,
  );
  await settleValidation(() => ref.current?.node);
  onValidate.mockClear();
  const clock = createValidationFrameClock();
  vi.spyOn(performance, 'now').mockImplementation(clock.now);
  for (let frame = 0; frame < 40; frame++) {
    await act(async () => {
      ref.current!.setValue(frame);
      clock.frame();
      await clock.task();
    });
  }
  expect(onValidate).toHaveBeenCalledTimes(6);
  await act(async () => {
    clock.frame();
    await clock.task();
    clock.frame();
    await clock.task();
  });
  expect(onValidate).toHaveBeenCalledTimes(7);
  expect(clock.pending()).toBe(0);
});

it('IR-6 keys three frames apart each deliver one verdict', async () => {
  const ref = createRef<FormHandle>();
  const onValidate = vi.fn();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'number' }}
      validationMode={ValidationMode.OnChange}
      validatorFactory={{
        compile: () => (value) => [{ dataPath: '', message: String(value) }],
        compileGuard: () => () => true,
      }}
      onValidate={onValidate}
    />,
  );
  await settleValidation(() => ref.current?.node);
  onValidate.mockClear();
  const clock = createValidationFrameClock();
  vi.spyOn(performance, 'now').mockImplementation(clock.now);
  for (let key = 0; key < 3; key++) {
    await act(async () => {
      ref.current!.setValue(key);
      for (let frame = 0; frame < 3; frame++) {
        clock.frame();
        await clock.task();
      }
    });
    expect(onValidate).toHaveBeenCalledTimes(key + 1);
  }
  expect(clock.pending()).toBe(0);
});

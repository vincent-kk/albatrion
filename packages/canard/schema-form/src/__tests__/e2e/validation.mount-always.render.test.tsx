import { createRef, useLayoutEffect } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  FormErrorCode,
  type FormHandle,
  ShowError,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { observeErrorSink } from '../helpers/observeErrorSink';

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
    <span data-testid="error">{errorVisible ? errorMessage : null}</span>
  </>
);

it.each([false, true])(
  'IR-6 Always renders the load verdict only after the slot (layout write=%s)',
  async (write) => {
    const clock = createValidationFrameClock();
    const validate = vi.fn(() => [{ dataPath: '', message: 'required' }]);
    const Input = ({ onChange }: FieldInputProps) => {
      useLayoutEffect(() => {
        if (write) onChange('child');
      }, [onChange]);
      return <input />;
    };
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        showError={ShowError.Always}
        FieldRenderer={Renderer}
        fieldInputMap={{ '': Input }}
        formatError={(error) => error.message ?? null}
        validatorFactory={{
          compile: () => validate,
          compileGuard: () => () => true,
        }}
      />,
    );
    await act(async () => {
      await clock.task();
    });
    expect(validate).not.toHaveBeenCalled();
    expect(view.getByTestId('error').textContent).toBe('');
    await act(async () => {
      clock.frame();
      await clock.task();
    });
    expect(validate).toHaveBeenCalledTimes(1);
    expect(view.getByTestId('error').textContent).toBe('required');
    await act(async () => {
      clock.frame();
      await clock.task();
      clock.frame();
      await clock.task();
    });
    expect(validate).toHaveBeenCalledTimes(1);
  },
);

it('IR-6 the default visibility keeps mount validation after its first frame', async () => {
  const clock = createValidationFrameClock();
  const validate = vi.fn(() => []);
  render(
    <Form
      jsonSchema={{ type: 'string' }}
      validatorFactory={{
        compile: () => validate,
        compileGuard: () => () => true,
      }}
    />,
  );
  await act(async () => {
    await clock.task();
  });
  expect(validate).not.toHaveBeenCalled();
  await act(async () => {
    clock.frame();
    await clock.task();
  });
  expect(validate).toHaveBeenCalledTimes(1);
});

it('IR-6 an Always layout-write compile failure releases pending and reports sink once', async () => {
  const clock = createValidationFrameClock();
  const onError = vi.fn();
  const sink = observeErrorSink();
  const Input = ({ onChange }: FieldInputProps) => {
    useLayoutEffect(() => {
      onChange('child');
    }, [onChange]);
    return <input />;
  };
  render(
    <Form
      jsonSchema={{ type: 'string' }}
      showError={true}
      fieldInputMap={{ '': Input }}
      onError={onError}
      validatorFactory={{
        compile: () => {
          throw new Error('compile');
        },
        compileGuard: () => () => true,
      }}
    />,
  );
  await act(async () => {
    await clock.task();
  });
  expect(onError).not.toHaveBeenCalled();
  await act(async () => {
    clock.frame();
    await clock.task();
  });
  expect(onError).toHaveBeenCalledTimes(1);
  expect(sink.errors()).toHaveLength(1);
  expect(onError.mock.calls[0][0]).toMatchObject({
    code: FormErrorCode.ValidatorCompileFailed,
    surface: 'sink',
  });
  await act(async () => {
    clock.frame();
    await clock.task();
    clock.frame();
    await clock.task();
  });
  expect(onError).toHaveBeenCalledTimes(1);
});

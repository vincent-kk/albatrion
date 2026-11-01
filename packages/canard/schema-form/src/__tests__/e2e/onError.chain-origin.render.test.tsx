import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form,
  FormErrorCode,
  type FormHandle,
  type FormProps,
  ValidationMode,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { observeErrorSink } from '../helpers/observeErrorSink';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it.each(['reset', 'rebuild', 'validator'] as const)(
  'A1 %s through the handle reports reset-chain failures as load',
  (operation) => {
    createValidationFrameClock();
    const ref = createRef<FormHandle>();
    const onError = vi.fn<NonNullable<FormProps['onError']>>();
    const validator = {
      compile: () => () => [],
      compileGuard: () => () => true,
    };
    let fail = false;
    const failure = new Error('reset-chain onChange');
    const form = (next = validator) => (
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        defaultValue="initial"
        validatorFactory={next}
        validationMode={ValidationMode.None}
        onError={onError}
        onChange={() => {
          if (fail) throw failure;
        }}
      />
    );
    const view = render(form());
    act(() => ref.current!.setValue('changed'));
    fail = true;
    if (operation === 'validator') {
      observeErrorSink();
      vi.spyOn(console, 'error').mockImplementation(() => {});
      view.rerender(form({ ...validator }));
    } else
      act(() => {
        expect(() => ref.current![operation]()).toThrow(failure);
      });
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ origin: 'load', error: failure }),
    );
  },
);

it('T2 reset onChange nested writes retain the outer load origin', () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  let nested = false;
  const failure = new Error('nested');
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="initial"
      validationMode={ValidationMode.None}
      onError={onError}
      onChange={() => {
        if (nested) {
          nested = false;
          ref.current!.setValue('inner');
          throw failure;
        }
      }}
    />,
  );
  act(() => ref.current!.setValue('changed'));
  nested = true;
  act(() => {
    expect(() => ref.current!.reset()).toThrow(failure);
  });
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ origin: 'load', error: failure }),
  );
});

it('P3-4 a write node listener calling reset keeps write across adoption', () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );
  const old = ref.current!.node!;
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'number',
        controls: { derived: '(() => { throw new Error("nested reset") })()' },
      }}
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );
  const unsubscribe = old.subscribe(() => {
    unsubscribe();
    ref.current!.reset();
  });
  act(() => {
    expect(() => old.setValue('next')).toThrow();
  });
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({
      origin: 'write',
      code: FormErrorCode.ExpressionThrew,
    }),
  );
});

it('P3-4 a validation-result listener failure carries validate', async () => {
  createValidationFrameClock();
  observeErrorSink();
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  const failure = new Error('verdict listener');
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.OnRequest}
      onError={onError}
      validatorFactory={{
        compile: () => () => [{ dataPath: '', message: 'invalid' }],
        compileGuard: () => () => true,
      }}
    />,
  );
  ref.current!.node!.subscribe(() => {
    throw failure;
  });
  await act(async () => {
    await ref.current!.validate();
  });
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ origin: 'validate', error: failure }),
  );
});

it('P3-4 standalone setState after a load never retains stale load origin', () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );
  act(() => ref.current!.reset());
  const failure = new Error('state listener');
  ref.current!.node!.subscribe(() => {
    throw failure;
  });
  act(() => {
    expect(() => ref.current!.node!.setState({ touched: true })).toThrow(
      failure,
    );
  });
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ origin: 'write', error: failure }),
  );
});

it('P3-4 external errors at first commit use load and prop changes use write', () => {
  observeErrorSink();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  const failure = new Error('external errors callback');
  const form = (message: string) => (
    <Form
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.None}
      errors={[{ dataPath: '', message }]}
      onError={onError}
      onValidate={() => {
        throw failure;
      }}
    />
  );
  const view = render(form('first'));
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ origin: 'load', error: failure }),
  );
  onError.mockClear();
  view.rerender(form('second'));
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ origin: 'write', error: failure }),
  );
});

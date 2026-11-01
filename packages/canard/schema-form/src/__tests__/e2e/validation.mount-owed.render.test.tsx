import * as React from 'react';
import { type ReactNode, Suspense, createRef, useLayoutEffect } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, inject, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  FormErrorCode,
  type FormHandle,
  ValidationMode,
} from '@/schema-form';

import { advanceValidationFrame } from '../helpers/advanceValidationFrame';
import { observeErrorSink } from '../helpers/observeErrorSink';
import { settleValidation } from '../helpers/settleValidation';

/** Never-resolving work keeps a committed Suspense tree's layout effects hidden. */
const pending = new Promise<void>(() => undefined);

/**
 * Hide already committed layout effects without replacing the preserved Form load.
 * @param hidden - Whether the boundary must show its fallback.
 * @returns An empty committed sibling when the boundary may become visible.
 */
const Gate = ({ hidden }: { hidden: boolean }) => {
  if (hidden) throw pending;
  return null;
};

/** Preserve a committed load while React hides and restores its layout effects. */
const hideable = (form: ReactNode, hidden: boolean) =>
  inject('reactMajor') === '19' ? (
    <React.Activity mode={hidden ? 'hidden' : 'visible'}>{form}</React.Activity>
  ) : (
    <Suspense fallback={<span>Loading</span>}>
      {form}
      <Gate hidden={hidden} />
    </Suspense>
  );

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('IR-7 T2 mount validation runs while hidden and is not repeated on show', async () => {
  const validate = vi.fn(() => []);
  const validator = { compile: () => validate, compileGuard: () => () => true };
  const ref = createRef<FormHandle>();
  const form = (
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.OnChange}
      validatorFactory={validator}
    />
  );
  const wrap = (hidden: boolean) => hideable(form, hidden);
  const view = render(wrap(false));
  const root = ref.current!.node!;
  view.rerender(wrap(true));
  await settleValidation(root);
  expect(validate).toHaveBeenCalledTimes(1);
  view.rerender(wrap(false));
  await settleValidation(root);
  expect(validate).toHaveBeenCalledTimes(1);
  await settleValidation(root);
  expect(validate).toHaveBeenCalledTimes(1);
  view.rerender(wrap(true));
  await settleValidation(root);
  view.rerender(wrap(false));
  await settleValidation(root);
  expect(validate).toHaveBeenCalledTimes(1);
});

it('IR-7 T3 R1 reports a layout-write compile failure while hidden', async () => {
  const onError = vi.fn();
  const sink = observeErrorSink();
  const Input = ({ onChange }: FieldInputProps) => {
    useLayoutEffect(() => {
      onChange('child-write');
    }, [onChange]);
    return <input />;
  };
  const ref = createRef<FormHandle>();
  const form = (
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      fieldInputMap={{ '': Input }}
      validationMode={ValidationMode.OnChange}
      validatorFactory={{
        compile: () => {
          throw new Error('hidden compile');
        },
        compileGuard: () => () => true,
      }}
      onError={onError}
    />
  );
  try {
    const view = render(hideable(form, false));
    const root = ref.current!.node!;
    view.rerender(hideable(form, true));
    await settleValidation(root);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(sink.errors().length).toBeGreaterThan(0);
    view.rerender(hideable(form, false));
    await settleValidation(root);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toMatchObject({
      code: FormErrorCode.ValidatorCompileFailed,
      surface: 'sink',
    });
    view.rerender(hideable(form, true));
    view.rerender(hideable(form, false));
    await settleValidation(root);
    expect(onError).toHaveBeenCalledTimes(1);
  } finally {
    sink.cleanup();
  }
});

it('IR-7 T3 V6 isolates onError at hidden chain end and delivers later records', async () => {
  const ref = createRef<FormHandle>();
  const handlerFailure = new Error('handler failure');
  const onError = vi.fn(() => {
    throw handlerFailure;
  });
  const sink = observeErrorSink();
  const form = (
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validatorFactory={{
        compile: () => (value) => {
          if (String(value).startsWith('fail')) throw new Error(String(value));
          return [];
        },
        compileGuard: () => () => true,
      }}
      onError={onError}
    />
  );
  const view = render(hideable(form, false));
  await settleValidation(() => ref.current?.node);
  const handle = ref.current!;
  const root = handle.node!;
  view.rerender(hideable(form, true));
  act(() => handle.setValue('fail-one'));
  await settleValidation(root);
  act(() => handle.setValue('fail-two'));
  await settleValidation(root);
  expect(onError).toHaveBeenCalledTimes(2);
  view.rerender(hideable(form, false));
  await settleValidation(() => ref.current?.node);
  expect(view.container.querySelector('form')).not.toBeNull();
  expect(onError).toHaveBeenCalledTimes(2);
  expect(sink.errors()).toContain(handlerFailure);
});

it('IR-7 T3 rebuild follows a failure already delivered while hidden', async () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  observeErrorSink();
  const form = (
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validatorFactory={{
        compile: () => (value) => {
          if (value === 'fail') throw new Error('hidden old root');
          return [];
        },
        compileGuard: () => () => true,
      }}
      onError={onError}
    />
  );
  const view = render(hideable(form, false));
  await settleValidation(() => ref.current?.node);
  const handle = ref.current!;
  const old = handle.node!;
  view.rerender(hideable(form, true));
  act(() => handle.setValue('fail'));
  await settleValidation(old);
  expect(onError).toHaveBeenCalledTimes(1);
  act(() => handle.rebuild());
  expect(handle.node).not.toBe(old);
  expect(onError).toHaveBeenCalledTimes(1);
  view.rerender(hideable(form, false));
  await settleValidation(() => ref.current?.node);
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0][0]).toMatchObject({
    code: FormErrorCode.ValidatorThrew,
    surface: 'sink',
  });
  view.rerender(hideable(form, true));
  view.rerender(hideable(form, false));
  await settleValidation(() => ref.current?.node);
  expect(onError).toHaveBeenCalledTimes(1);
});

it('IR-7 T3 W4 async mount rejection reports once while hidden', async () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  observeErrorSink();
  let reject!: (reason: unknown) => void;
  let start!: () => void;
  const started = new Promise<void>((resolve) => {
    start = resolve;
  });
  const form = (
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      onError={onError}
      validatorFactory={{
        compile: () => () =>
          new Promise((_resolve, fail) => {
            reject = fail;
            start();
          }),
        compileGuard: () => () => true,
      }}
    />
  );
  const view = render(hideable(form, false));
  await advanceValidationFrame();
  await started;
  view.rerender(hideable(form, true));
  await act(async () => {
    reject(new Error('hidden mount rejection'));
    await Promise.resolve();
  });
  expect(onError).toHaveBeenCalledTimes(1);
  view.rerender(hideable(form, false));
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0][0]).toMatchObject({
    code: FormErrorCode.ValidatorThrew,
    surface: 'rejected',
  });
});

it('IR-6 W4 a compile onError failure reaches the host once without recapture', async () => {
  const handler = new Error('handler');
  vi.stubGlobal('reportError', vi.fn());
  const sink = observeErrorSink();
  let first!: () => void;
  const called = new Promise<void>((resolve) => {
    first = resolve;
  });
  const onError = vi.fn(() => {
    first();
    throw handler;
  });
  render(
    <Form
      jsonSchema={{ type: 'string' }}
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
    await called;
    await new Promise<void>((resolve) => setImmediate(resolve));
  });
  expect(onError).toHaveBeenCalledTimes(1);
  expect(sink.errors().filter((error) => error === handler)).toHaveLength(1);
});

it('IR-7 T3 W5 hidden chain reports guard writes into the current form', async () => {
  const ref = createRef<FormHandle>();
  observeErrorSink();
  let handle: FormHandle;
  const attempts: unknown[] = [];
  const onError = vi.fn(() => {
    try {
      handle.setValue('forbidden');
    } catch (error) {
      attempts.push(error);
    }
  });
  const form = (
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      onError={onError}
      validatorFactory={{
        compile: () => (value) => {
          if (value === 'fail') throw new Error('old');
          return [];
        },
        compileGuard: () => () => true,
      }}
    />
  );
  const view = render(hideable(form, false));
  await settleValidation(() => ref.current?.node);
  handle = ref.current!;
  const old = handle.node!;
  view.rerender(hideable(form, true));
  act(() => handle.setValue('fail'));
  await settleValidation(old);
  expect(onError).toHaveBeenCalledTimes(1);
  expect(attempts).toHaveLength(1);
  act(() => handle.rebuild());
  view.rerender(hideable(form, false));
  await settleValidation(() => ref.current?.node);
  expect(onError).toHaveBeenCalledTimes(1);
  expect(attempts).toHaveLength(1);
  expect(attempts[0]).toMatchObject({ code: FormErrorCode.WriteInObserver });
  expect(handle.getValue()).not.toBe('forbidden');
});

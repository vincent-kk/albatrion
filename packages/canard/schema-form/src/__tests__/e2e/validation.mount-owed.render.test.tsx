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

afterEach(() => cleanup());

it('IR-6 (d-owed) restores exactly one owed mount validation after layout effects return', async () => {
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
  view.rerender(wrap(true));
  await settleValidation(() => ref.current?.node);
  expect(validate).not.toHaveBeenCalled();
  view.rerender(wrap(false));
  await settleValidation(() => ref.current?.node);
  expect(validate).toHaveBeenCalledTimes(1);
  await settleValidation(() => ref.current?.node);
  expect(validate).toHaveBeenCalledTimes(1);
  view.rerender(wrap(true));
  await settleValidation(() => ref.current?.node);
  view.rerender(wrap(false));
  await settleValidation(() => ref.current?.node);
  expect(validate).toHaveBeenCalledTimes(1);
});

it('IR-6 R1 restores a compile failure buffered while a layout-write form is hidden', async () => {
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
    view.rerender(hideable(form, true));
    await settleValidation(() => ref.current?.node);
    expect(onError).not.toHaveBeenCalled();
    expect(sink.errors().length).toBeGreaterThan(0);
    view.rerender(hideable(form, false));
    await settleValidation(() => ref.current?.node);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toMatchObject({
      code: FormErrorCode.ValidatorCompileFailed,
      surface: 'sink',
    });
    view.rerender(hideable(form, true));
    view.rerender(hideable(form, false));
    await settleValidation(() => ref.current?.node);
    expect(onError).toHaveBeenCalledTimes(1);
  } finally {
    sink.cleanup();
  }
});

it('IR-6 reconnect isolates a throwing onError and still delivers later buffered records', async () => {
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
  expect(onError).not.toHaveBeenCalled();
  view.rerender(hideable(form, false));
  await settleValidation(() => ref.current?.node);
  expect(view.container.querySelector('form')).not.toBeNull();
  expect(onError).toHaveBeenCalledTimes(2);
  expect(sink.errors()).toContain(handlerFailure);
});

it('IR-6 rebuild transfers a hidden load failure once before replacement records', async () => {
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
  expect(onError).not.toHaveBeenCalled();
  act(() => handle.rebuild());
  expect(handle.node).not.toBe(old);
  expect(onError).not.toHaveBeenCalled();
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

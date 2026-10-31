import * as React from 'react';
import { type ReactNode, Suspense, useLayoutEffect } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, inject, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  FormErrorCode,
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
  const form = (
    <Form
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.OnChange}
      validatorFactory={validator}
    />
  );
  const wrap = (hidden: boolean) => hideable(form, hidden);
  const view = render(wrap(false));
  view.rerender(wrap(true));
  await settleValidation();
  expect(validate).not.toHaveBeenCalled();
  view.rerender(wrap(false));
  await settleValidation();
  expect(validate).toHaveBeenCalledTimes(1);
  await settleValidation();
  expect(validate).toHaveBeenCalledTimes(1);
  view.rerender(wrap(true));
  await settleValidation();
  view.rerender(wrap(false));
  await settleValidation();
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
  const form = (
    <Form
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
    await settleValidation();
    expect(onError).not.toHaveBeenCalled();
    expect(sink.errors().length).toBeGreaterThan(0);
    view.rerender(hideable(form, false));
    await settleValidation();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toMatchObject({
      code: FormErrorCode.ValidatorCompileFailed,
      surface: 'sink',
    });
    view.rerender(hideable(form, true));
    view.rerender(hideable(form, false));
    await settleValidation();
    expect(onError).toHaveBeenCalledTimes(1);
  } finally {
    sink.cleanup();
  }
});

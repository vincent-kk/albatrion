import { createRef, useState } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import { FormErrorCode } from '@/schema-form/errors';

import { observeErrorSink } from '../../../__tests__/helpers/observeErrorSink';

afterEach(cleanup);

/** `discount` is active while `code` has characters; the expression throws while `code` is missing. */
const schema = {
  type: 'object',
  properties: {
    code: { type: 'string' },
    discount: { type: 'number', controls: { active: '(../code).length > 0' } },
  },
} as const;

/**
 * Assert that a commit-started load reached the throw without replacing the form.
 * @param handle - Ref of the form under test
 * @param onError - Form error observer that saw no record before the load
 * @param sink - Host sink observer for this render
 */
const expectDegradedAndReportedOnce = (
  handle: ReturnType<typeof createRef<FormHandle>>,
  onError: ReturnType<typeof vi.fn>,
  sink: ReturnType<typeof observeErrorSink>,
) => {
  expect(handle.current).not.toBeNull();
  expect(handle.current?.node?.diagnostics.status).toBe('degraded');
  expect(onError).toHaveBeenCalledTimes(1);
  const [record] = onError.mock.calls[0];
  expect(record).toMatchObject({
    code: FormErrorCode.ExpressionThrew,
    origin: 'load',
  });
  expect(sink.errors().filter((error) => error === record.error)).toHaveLength(
    1,
  );
};

it('keeps the form degraded when a validator change reloads into a throwing expression', () => {
  const sink = observeErrorSink();
  const onError = vi.fn();
  const handle = createRef<FormHandle>();
  const first = { compile: () => () => null, compileGuard: () => () => true };
  const second = { compile: () => () => null, compileGuard: () => () => true };
  const view = render(
    <Form
      ref={handle}
      onError={onError}
      validationMode={ValidationMode.None}
      validatorFactory={first}
      jsonSchema={schema}
      defaultValue={{ code: 'x' }}
    />,
  );
  expect(handle.current?.node?.diagnostics.status).toBe('stable');
  view.rerender(
    <Form
      ref={handle}
      onError={onError}
      validationMode={ValidationMode.None}
      validatorFactory={second}
      jsonSchema={schema}
      defaultValue={{}}
    />,
  );
  expectDegradedAndReportedOnce(handle, onError, sink);
});

it('keeps the form degraded when the commit re-reconciles a reset into a throwing expression', () => {
  const sink = observeErrorSink();
  const onError = vi.fn();
  const handle = createRef<FormHandle>();
  let changeDefaultValue: (value: { code?: string }) => void = () => {};
  const Host = () => {
    const [defaultValue, setDefaultValue] = useState<{ code?: string }>({
      code: 'x',
    });
    changeDefaultValue = setDefaultValue;
    return (
      <Form
        ref={handle}
        onError={onError}
        validationMode={ValidationMode.None}
        jsonSchema={schema}
        defaultValue={defaultValue}
      />
    );
  };
  render(<Host />);
  expect(handle.current?.node?.diagnostics.status).toBe('stable');
  act(() => {
    changeDefaultValue({});
    handle.current?.reset();
  });
  expectDegradedAndReportedOnce(handle, onError, sink);
});

it('does not evaluate expressions when the errors prop changes on a degraded form', () => {
  observeErrorSink();
  const onError = vi.fn();
  const handle = createRef<FormHandle>();
  const view = render(
    <Form
      ref={handle}
      onError={onError}
      validationMode={ValidationMode.None}
      jsonSchema={schema}
      defaultValue={{}}
    />,
  );
  expect(onError).toHaveBeenCalledTimes(1);
  view.rerender(
    <Form
      ref={handle}
      onError={onError}
      validationMode={ValidationMode.None}
      jsonSchema={schema}
      defaultValue={{}}
      errors={[{ dataPath: '/code', message: 'external' }]}
    />,
  );
  expect(handle.current?.node?.diagnostics.status).toBe('degraded');
  expect(handle.current?.findNode('/code')?.errors).toEqual([
    { dataPath: '/code', message: 'external' },
  ]);
  expect(onError).toHaveBeenCalledTimes(1);
});

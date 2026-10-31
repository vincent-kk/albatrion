import * as React from 'react';
import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, inject, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  FormWarningCode,
  ValidationMode,
} from '@/schema-form';

import { observeErrorSink } from '../helpers/observeErrorSink';
import { settleValidation } from '../helpers/settleValidation';

afterEach(cleanup);

it('IR-7 T4 initially hidden Activity buffers construction records until first show', async (context) => {
  if (inject('reactMajor') !== '19') context.skip();
  const onError = vi.fn();
  const onChange = vi.fn();
  const ref = createRef<FormHandle>();
  const form = (
    <Form
      ref={ref}
      jsonSchema={{ type: 'number' }}
      defaultValue="bad"
      validationMode={ValidationMode.None}
      onError={onError}
      onChange={onChange}
    >
      <span />
    </Form>
  );
  const view = render(<React.Activity mode="hidden">{form}</React.Activity>);
  await act(async () => {
    await Promise.resolve();
  });
  expect(ref.current).toBeNull();
  expect(onError).not.toHaveBeenCalled();
  expect(onChange).not.toHaveBeenCalled();
  view.rerender(<React.Activity mode="visible">{form}</React.Activity>);
  expect(onError).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ code: FormWarningCode.Misfit }),
  );
  expect(onChange).not.toHaveBeenCalled();
  view.rerender(<React.Activity mode="hidden">{form}</React.Activity>);
  view.rerender(<React.Activity mode="visible">{form}</React.Activity>);
  expect(onError).toHaveBeenCalledTimes(1);
});

it('IR-7 T4 validator replacement before first show flushes each load once and subscribes once', async (context) => {
  if (inject('reactMajor') !== '19') context.skip();
  observeErrorSink();
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  const onDiagnosticsChange = vi.fn();
  const schema = {
    type: 'number',
    $schema: 'http://json-schema.org/draft-07/schema#',
  };
  const first = {
    dialect: 'https://json-schema.org/draft/2020-12/schema',
    compile: () => () => [],
    compileGuard: () => () => true,
  };
  const second = { ...first };
  const form = (validator: typeof first) => (
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={0}
      validatorFactory={validator}
      validationMode={ValidationMode.None}
      onError={onError}
      onDiagnosticsChange={onDiagnosticsChange}
    >
      <span />
    </Form>
  );
  const view = render(
    <React.Activity mode="hidden">{form(first)}</React.Activity>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  view.rerender(<React.Activity mode="hidden">{form(second)}</React.Activity>);
  expect(onError).not.toHaveBeenCalled();
  view.rerender(<React.Activity mode="visible">{form(second)}</React.Activity>);
  await settleValidation(() => ref.current?.node);
  expect(onError.mock.calls.map(([record]) => record.code)).toEqual([
    FormWarningCode.DialectMismatch,
    FormWarningCode.DialectMismatch,
  ]);
  onDiagnosticsChange.mockClear();
  act(() => ref.current?.reset());
  expect(onDiagnosticsChange).toHaveBeenCalledTimes(1);
});

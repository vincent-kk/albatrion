import { StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  FormWarningCode,
  ValidationMode,
} from '@/schema-form';

import { advanceValidationFrame } from '../helpers/advanceValidationFrame';
import { hideCommittedForm } from '../helpers/hideCommittedForm';
import { observeErrorSink } from '../helpers/observeErrorSink';
import { settleValidation } from '../helpers/settleValidation';

afterEach(cleanup);

it('IR-7 T1 visible and hidden sequences deliver identical ordered callback arguments without show replay', async () => {
  observeErrorSink();
  const run = async (hidden: boolean) => {
    const log: unknown[] = [];
    const record = (kind: string) => (value: unknown) => {
      log.push(
        JSON.parse(
          JSON.stringify([kind, value], (_key, item) =>
            item instanceof Error
              ? { name: item.name, message: item.message }
              : item,
          ),
        ),
      );
    };
    const validator = {
      compileGuard: () => () => true,
      compile: () => (value: unknown) => {
        if (
          typeof value === 'object' &&
          value &&
          Reflect.get(value, 'marker') === 'throw'
        )
          throw new Error('validator failure');
        if (
          typeof value === 'object' &&
          value &&
          Reflect.get(value, 'value') === 'bad'
        )
          return [{ dataPath: '/value', message: 'invalid number' }];
        return [];
      },
    };
    const ref = createRef<FormHandle>();
    const form = (
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            value: { type: 'number' },
            marker: { type: 'string' },
          },
        }}
        defaultValue={{ value: 0 }}
        validatorFactory={validator}
        onChange={record('change')}
        onStateChange={record('state')}
        onValidate={record('validate')}
        onDiagnosticsChange={record('diagnostics')}
        onError={record('error')}
      >
        <span />
      </Form>
    );
    const view = render(hideCommittedForm(form, false));
    await settleValidation(() => ref.current?.node);
    const handle = ref.current!;
    log.length = 0;
    if (hidden) view.rerender(hideCommittedForm(form, true));
    for (const value of [
      { value: 1 },
      { value: 'bad' },
      { value: 2, marker: 'throw' },
    ]) {
      act(() => handle.setValue(value));
      await settleValidation(() => handle.node);
    }
    act(() => handle.findNode('/value')?.setState({ touched: true }));
    await settleValidation(() => handle.node);
    act(() => handle.reset());
    await settleValidation(() => handle.node);
    act(() => handle.rebuild());
    await settleValidation(() => handle.node);
    const delivered = log.slice();
    if (hidden) {
      view.rerender(hideCommittedForm(form, false));
      await settleValidation(() => handle.node);
      expect(log).toEqual(delivered);
    }
    view.unmount();
    return delivered;
  };
  const visible = await run(false);
  expect(
    visible.map((entry) => (Array.isArray(entry) ? entry[0] : undefined)),
  ).toEqual(
    expect.arrayContaining([
      'change',
      'state',
      'validate',
      'diagnostics',
      'error',
    ]),
  );
  expect(await run(true)).toEqual(visible);
});

it.each(['reset', 'rebuild', 'cycles', 'strict'] as const)(
  'IR-7 T5 %s keeps exactly one diagnostics subscription after hiding',
  async (kind) => {
    const onDiagnosticsChange = vi.fn();
    const ref = createRef<FormHandle>();
    const form = (
      <Form
        ref={ref}
        jsonSchema={{ type: 'number' }}
        defaultValue={0}
        validationMode={ValidationMode.None}
        onError={() => undefined}
        onDiagnosticsChange={onDiagnosticsChange}
      >
        <span />
      </Form>
    );
    const wrap = (hidden: boolean) =>
      kind === 'strict' ? (
        <StrictMode>{hideCommittedForm(form, hidden)}</StrictMode>
      ) : (
        hideCommittedForm(form, hidden)
      );
    const view = render(wrap(false));
    const handle = ref.current!;
    view.rerender(wrap(true));
    if (kind === 'reset') act(() => handle.reset());
    if (kind === 'rebuild') act(() => handle.rebuild());
    view.rerender(wrap(false));
    view.rerender(wrap(true));
    view.rerender(wrap(false));
    onDiagnosticsChange.mockClear();
    act(() => handle.reset());
    expect(onDiagnosticsChange).toHaveBeenCalledTimes(1);
  },
);

it.each([false, true])(
  'IR-7 T6 reset isolates build-record handler failure (hidden=%s)',
  async (hidden) => {
    const sink = observeErrorSink();
    const failure = new Error('reset handler');
    let throwing = false;
    const onError = vi.fn(() => {
      if (throwing) throw failure;
    });
    const ref = createRef<FormHandle>();
    const form = (
      <Form
        ref={ref}
        jsonSchema={{
          type: 'number',
          $schema: 'http://json-schema.org/draft-07/schema#',
        }}
        defaultValue={0}
        validationMode={ValidationMode.None}
        validatorFactory={{
          dialect: 'https://json-schema.org/draft/2020-12/schema',
          compile: () => () => [],
          compileGuard: () => () => true,
        }}
        onError={onError}
      >
        <span />
      </Form>
    );
    const view = render(hideCommittedForm(form, false));
    const handle = ref.current!;
    const old = handle.node;
    onError.mockClear();
    if (hidden) view.rerender(hideCommittedForm(form, true));
    throwing = true;
    act(() => handle.rebuild());
    expect(handle.node).not.toBe(old);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: FormWarningCode.DialectMismatch }),
    );
    expect(sink.errors().filter((error) => error === failure)).toHaveLength(1);
    throwing = false;
    onError.mockClear();
    act(() => handle.setValue('bad'));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(handle.getValue()).toBe('bad');
    act(() => handle.setValue(7));
    expect(handle.getValue()).toBe(7);
  },
);

it('IR-7 T7a retired detached nodes cannot report to the consumer', () => {
  const onError = vi.fn();
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'array', items: { type: 'string' } }}
      defaultValue={['old']}
      validationMode={ValidationMode.None}
      onError={onError}
    >
      <span />
    </Form>,
  );
  const handle = ref.current!;
  const detached = handle.findNode('/0')!;
  act(() => handle.setValue([]));
  onError.mockClear();
  act(() => {
    handle.rebuild();
    detached.setValue('late');
  });
  expect(onError).not.toHaveBeenCalled();
  act(() => handle.setValue(['current']));
  expect(handle.getValue()).toEqual(['current']);
});

it('IR-7 T7b validation rejected after rebuild reaches neither consumer nor host', async () => {
  const sink = observeErrorSink();
  let reject!: (reason: unknown) => void;
  let start!: () => void;
  const started = new Promise<void>((resolve) => {
    start = resolve;
  });
  const onError = vi.fn();
  const ref = createRef<FormHandle>();
  const form = (
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="ok"
      onError={onError}
      validatorFactory={{
        compileGuard: () => () => true,
        compile: () => (value) =>
          value === 'wait'
            ? new Promise<null>((_resolve, fail) => {
                reject = fail;
                start();
              })
            : [],
      }}
    >
      <span />
    </Form>
  );
  render(form);
  await settleValidation(() => ref.current?.node);
  const handle = ref.current!;
  act(() => handle.setValue('wait'));
  await advanceValidationFrame();
  await started;
  expect(reject).toBeTypeOf('function');
  act(() => handle.rebuild());
  await act(async () => {
    reject(new Error('retired validation'));
    await Promise.resolve();
  });
  await settleValidation(() => handle.node);
  expect(onError).not.toHaveBeenCalled();
  expect(sink.errors()).toEqual([]);
});

it('IR-7 T8 L1 a retained node delivers onChange after actual unmount', async () => {
  const onChange = vi.fn();
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.None}
      onChange={onChange}
    >
      <span />
    </Form>,
  );
  const node = ref.current!.node!;
  view.unmount();
  act(() => node.setValue('after'));
  expect(onChange).toHaveBeenCalledExactlyOnceWith('after');
});

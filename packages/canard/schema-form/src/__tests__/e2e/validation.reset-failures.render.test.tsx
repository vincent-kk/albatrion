import * as React from 'react';
import { StrictMode, createRef, useLayoutEffect } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, inject, it, vi } from 'vitest';

import {
  Form,
  FormErrorCode,
  type FormHandle,
  ValidationMode,
} from '@/schema-form';

import { hideCommittedForm } from '../helpers/hideCommittedForm';
import { observeErrorSink } from '../helpers/observeErrorSink';

afterEach(cleanup);

it.each([false, true])(
  'IR-7 round b adoption compile failure delivers its reset record (hidden=%s)',
  (hidden) => {
    const sink = observeErrorSink();
    const onError = vi.fn();
    const failure = new Error('replacement compile');
    const validator = {
      compileGuard: () => () => true,
      compile: () => {
        throw failure;
      },
    };
    const ref = createRef<FormHandle>();
    const initial = { type: 'string' } as const;
    const replacement = { type: 'number' } as const;
    const form = (jsonSchema: typeof initial | typeof replacement) => (
      <Form
        ref={ref}
        jsonSchema={jsonSchema}
        validatorFactory={validator}
        validationMode={ValidationMode.OnRequest}
        onError={onError}
      >
        <span />
      </Form>
    );
    const view = render(hideCommittedForm(form(initial), false));
    const handle = ref.current!;
    view.rerender(hideCommittedForm(form(replacement), false));
    if (hidden) view.rerender(hideCommittedForm(form(replacement), true));
    let thrown: unknown;
    act(() => {
      try {
        handle.reset();
      } catch (error) {
        thrown = error;
      }
    });
    expect(thrown).toMatchObject({
      code: FormErrorCode.ValidatorCompileFailed,
    });
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        code: FormErrorCode.ValidatorCompileFailed,
      }),
    );
    expect(sink.errors()).toContain(thrown);
  },
);

it('IR-7 round b StrictMode replay delivers the non-idempotent child layout write once', () => {
  const ref = createRef<FormHandle>();
  const onChange = vi.fn();
  const Child = ({ node }: { node: NonNullable<FormHandle['node']> }) => {
    useLayoutEffect(() => {
      node.setValue((value: unknown) => Number(value) + 1);
    }, [node]);
    return null;
  };
  render(
    <StrictMode>
      <Form
        ref={ref}
        jsonSchema={{ type: 'number' }}
        defaultValue={0}
        validationMode={ValidationMode.None}
        onChange={onChange}
      >
        {({ node }) => <Child node={node} />}
      </Form>
    </StrictMode>,
  );
  expect(ref.current?.getValue()).toBe(2);
  expect(onChange).toHaveBeenCalledExactlyOnceWith(2);
});

it('IR-7 round b failed build before first show retains exactly one root subscription', async (context) => {
  if (inject('reactMajor') !== '19') context.skip();
  observeErrorSink();
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  const onDiagnosticsChange = vi.fn();
  const initial = {
    type: 'object',
    properties: {
      trigger: { type: 'boolean' },
      value: {
        type: 'number',
        controls: {
          derived:
            '../trigger ? (() => { throw new Error("diagnostic"); })() : 0',
        },
      },
    },
  } as const;
  const invalid = {
    ...initial,
    controls: { visible: true, unknownControl: true },
  };
  const first = { compile: () => () => [], compileGuard: () => () => true };
  const second = { ...first };
  const form = (bad: boolean) => (
    <Form
      ref={ref}
      jsonSchema={bad ? invalid : initial}
      validatorFactory={bad ? second : first}
      validationMode={ValidationMode.None}
      onError={onError}
      onDiagnosticsChange={onDiagnosticsChange}
    >
      <span />
    </Form>
  );
  const view = render(
    <React.Activity mode="hidden">{form(false)}</React.Activity>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  view.rerender(<React.Activity mode="hidden">{form(true)}</React.Activity>);
  view.rerender(<React.Activity mode="visible">{form(true)}</React.Activity>);
  expect(onError).toHaveBeenCalledTimes(1);
  expect(ref.current?.node).toBeDefined();
  onDiagnosticsChange.mockClear();
  let failure: unknown;
  act(() => {
    try {
      ref.current?.setValue({ trigger: true });
    } catch (error) {
      failure = error;
    }
  });
  expect(failure).toMatchObject({ code: FormErrorCode.ExpressionThrew });
  expect(ref.current?.node?.diagnostics.status).toBe('degraded');
  expect(onDiagnosticsChange).toHaveBeenCalledTimes(1);
});

it('IR-7 round b replacing an initially hidden failed load reports its construction error once', async (context) => {
  if (inject('reactMajor') !== '19') context.skip();
  const sink = observeErrorSink();
  const onError = vi.fn();
  const ref = createRef<FormHandle>();
  const valid = { type: 'number' } as const;
  const invalid = {
    ...valid,
    controls: { visible: true, unknownControl: true },
  };
  const first = { compile: () => () => [], compileGuard: () => () => true };
  const second = { ...first };
  const form = (bad: boolean) => (
    <Form
      ref={ref}
      jsonSchema={bad ? invalid : valid}
      defaultValue={0}
      validatorFactory={bad ? first : second}
      validationMode={ValidationMode.None}
      onError={onError}
    >
      <span />
    </Form>
  );
  const view = render(
    <React.Activity mode="hidden">{form(true)}</React.Activity>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(onError).not.toHaveBeenCalled();
  view.rerender(<React.Activity mode="hidden">{form(false)}</React.Activity>);
  view.rerender(<React.Activity mode="visible">{form(false)}</React.Activity>);
  expect(onError).toHaveBeenCalledTimes(1);
  const failure: unknown = onError.mock.calls[0][0].error;
  expect(failure).toBeDefined();
  expect(sink.errors().filter((error) => error === failure)).toHaveLength(1);
  expect(ref.current?.getValue()).toBe(0);
  view.rerender(<React.Activity mode="hidden">{form(false)}</React.Activity>);
  view.rerender(<React.Activity mode="visible">{form(false)}</React.Activity>);
  expect(onError).toHaveBeenCalledTimes(1);
});

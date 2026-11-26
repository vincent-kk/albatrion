import { StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  type FormProps,
} from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import { FormErrorCode } from '@/schema-form/errors';
import { ErrorVisibility } from '@/schema-form/types';

import { observeErrorSink } from '../../../__tests__/helpers/observeErrorSink';

afterEach(cleanup);

/** `plan` is active only for a pro tier; the expression throws while the context lacks `user`. */
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    plan: {
      type: 'string',
      controls: { active: '@.user.plan.tier === "pro"' },
    },
  },
} as const;

/** Stable empty context, so a re-render does not count as a context change. */
const context = {};

/** Two always-active `allOf` branches declare `shared` with different types, so the load keeps no root. */
const conflictSchema = {
  type: 'object',
  allOf: [
    {
      controls: { active: 'true' },
      properties: { shared: { type: 'number' } },
    },
    {
      controls: { active: 'true' },
      properties: { shared: { type: 'string' } },
    },
  ],
} as const;

/** The `oneOf` branches give the discriminator `kind` constants of different types, so construction fails. */
const unbuildableSchema = {
  type: 'object',
  controls: { discriminator: 'kind' },
  oneOf: [
    { properties: { kind: { const: 'a' } } },
    { properties: { kind: { const: 1 } } },
  ],
} as const;

const issue = { dataPath: '/name', message: 'external name' };

/**
 * Assert that the external issue reached the `/name` node, the handle and the screen.
 * @param handle - Ref of the form under test
 * @param container - Render container holding the form
 */
const expectExternalErrorShown = (
  handle: ReturnType<typeof createRef<FormHandle>>,
  container: HTMLElement,
) => {
  expect(handle.current?.node?.diagnostics.status).toBe('degraded');
  expect(handle.current?.findNode('/name')?.errors).toEqual([issue]);
  expect(handle.current?.getErrors()).toEqual([issue]);
  expect(container.querySelector('[data-path="/name"] em')?.textContent).toBe(
    issue.message,
  );
};

/**
 * Assert that the throwing expression was reported once to the form and once to the host.
 * @param onError - Form error observer
 * @param sink - Host sink observer for this render
 */
const expectExpressionReportedOnce = (
  onError: ReturnType<typeof vi.fn>,
  sink: ReturnType<typeof observeErrorSink>,
) => {
  const records = onError.mock.calls
    .map(([record]) => record)
    .filter((record) => record.code === FormErrorCode.ExpressionThrew);
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({ origin: 'load' });
  expect(
    sink.errors().filter((error) => error === records[0].error),
  ).toHaveLength(1);
};

it.each([false, true])(
  'REACT-007 applies the initial errors when the mount throws (StrictMode=%s)',
  (strict) => {
    const sink = observeErrorSink();
    const onError = vi.fn();
    const handle = createRef<FormHandle>();
    const form = (
      <Form
        ref={handle}
        onError={onError}
        validationMode={ValidationMode.None}
        errorVisibility={ErrorVisibility.Always}
        jsonSchema={schema}
        context={context}
        errors={[issue]}
      />
    );
    const view = render(strict ? <StrictMode>{form}</StrictMode> : form);
    expectExternalErrorShown(handle, view.container);
    expect(onError).toHaveBeenCalledTimes(1);
    expectExpressionReportedOnce(onError, sink);
  },
);

it('REACT-007 keeps the initial errors through an unrelated re-render and an equal new array', () => {
  const sink = observeErrorSink();
  const onError = vi.fn();
  const handle = createRef<FormHandle>();
  const element = (errors: FormProps['errors'], onChange: () => void) => (
    <Form
      ref={handle}
      onError={onError}
      onChange={onChange}
      validationMode={ValidationMode.None}
      errorVisibility={ErrorVisibility.Always}
      jsonSchema={schema}
      context={context}
      errors={errors}
    />
  );
  const errors = [issue];
  const view = render(element(errors, () => {}));
  view.rerender(element(errors, () => {}));
  expectExternalErrorShown(handle, view.container);
  view.rerender(element([{ ...issue }], () => {}));
  expectExternalErrorShown(handle, view.container);
  expect(onError).toHaveBeenCalledTimes(1);
  expectExpressionReportedOnce(onError, sink);
});

it('REACT-007 keeps the load fallback when a shared conflict fails the mount with initial errors', () => {
  observeErrorSink();
  const onError = vi.fn();
  const handle = createRef<FormHandle>();
  const view = render(
    <Form
      ref={handle}
      onError={onError}
      validationMode={ValidationMode.None}
      jsonSchema={{
        type: 'object',
        allOf: [
          {
            controls: { active: 'true' },
            properties: { shared: { type: 'number' } },
          },
          {
            controls: { active: 'true' },
            properties: { shared: { type: 'string' } },
          },
        ],
      }}
      errors={[{ dataPath: '/shared', message: 'external shared' }]}
    />,
  );
  expect(handle.current).not.toBeNull();
  expect(handle.current?.node).toBeUndefined();
  expect(view.getByRole('alert').textContent).toBe('Unable to load form.');
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0][0]).toMatchObject({
    code: FormErrorCode.SharedNodeConflict,
    origin: 'load',
  });
});

it('REACT-007 applies the initial errors when input-map recovery mounts into a throwing expression', () => {
  const sink = observeErrorSink();
  const onError = vi.fn();
  const handle = createRef<FormHandle>();
  const element = (fieldInputMap?: FormProps['fieldInputMap']) => (
    <Form
      ref={handle}
      onError={onError}
      validationMode={ValidationMode.None}
      errorVisibility={ErrorVisibility.Always}
      fieldInputMap={fieldInputMap}
      jsonSchema={schema}
      context={context}
      errors={[issue]}
    />
  );
  const view = render(
    element({ '^/**': () => <input aria-label="Mapped input" /> }),
  );
  expect(view.getByRole('alert').textContent).toBe('Unable to load form.');
  view.rerender(element());
  expectExternalErrorShown(handle, view.container);
  expect(onError.mock.calls.map(([record]) => record.code)).toEqual([
    FormErrorCode.FieldInputMap,
    FormErrorCode.ExpressionThrew,
  ]);
  expectExpressionReportedOnce(onError, sink);
});

it.each([
  {
    source: 'a shared-conflict fallback',
    initial: conflictSchema,
    trigger: 'handle.reset()',
  },
  {
    source: 'a shared-conflict fallback',
    initial: conflictSchema,
    trigger: 'a validatorFactory change',
  },
  {
    source: 'a construction failure',
    initial: unbuildableSchema,
    trigger: 'handle.reset()',
  },
  {
    source: 'a construction failure',
    initial: unbuildableSchema,
    trigger: 'a validatorFactory change',
  },
] as const)(
  'WRITE-045 applies the errors prop when $trigger mounts a throwing expression after $source',
  ({ initial, trigger }) => {
    const sink = observeErrorSink();
    const onError = vi.fn();
    const handle = createRef<FormHandle>();
    const first = { compile: () => () => null, compileGuard: () => () => true };
    const second = {
      compile: () => () => null,
      compileGuard: () => () => true,
    };
    const element = (
      jsonSchema: FormProps['jsonSchema'],
      validatorFactory: FormProps['validatorFactory'],
    ) => (
      <Form
        ref={handle}
        onError={onError}
        validationMode={ValidationMode.None}
        errorVisibility={ErrorVisibility.Always}
        validatorFactory={validatorFactory}
        jsonSchema={jsonSchema}
        context={context}
        errors={[issue]}
      />
    );
    const view = render(element(initial, first));
    view.rerender(element(schema, first));
    expect(handle.current?.node).toBeUndefined();
    onError.mockClear();
    const isCallerReset = trigger === 'handle.reset()';
    let thrown: unknown;
    if (isCallerReset)
      act(() => {
        try {
          handle.current?.reset();
        } catch (error) {
          thrown = error;
        }
      });
    else view.rerender(element(schema, second));
    expectExternalErrorShown(handle, view.container);
    expect(onError).toHaveBeenCalledTimes(1);
    const [record] = onError.mock.calls[0];
    expect(record).toMatchObject({
      code: FormErrorCode.ExpressionThrew,
      origin: 'load',
    });
    expect(thrown).toBe(isCallerReset ? record.error : undefined);
    expect(
      sink.errors().filter((error) => error === record.error),
    ).toHaveLength(isCallerReset ? 0 : 1);
  },
);

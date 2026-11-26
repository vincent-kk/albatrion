import { StrictMode, createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import { FormErrorCode } from '@/schema-form/errors';
import { ErrorVisibility } from '@/schema-form/types';

import { observeErrorSink } from '../../../__tests__/helpers/observeErrorSink';

afterEach(cleanup);

/** Both active `allOf` branches give `shared` a different kind while `first` and `second` are true. */
const conflictSchema = {
  type: 'object',
  properties: { first: { type: 'boolean' }, second: { type: 'boolean' } },
  allOf: [
    {
      controls: { active: './first' },
      properties: { shared: { type: 'number' } },
    },
    {
      controls: { active: './second' },
      properties: { shared: { type: 'string' } },
    },
  ],
} as const;

const conflictValue = { first: true, second: true };

/** The `oneOf` branches give the discriminator `kind` constants of different types, so no tree is built. */
const unbuildableSchema = {
  type: 'object',
  controls: { discriminator: 'kind' },
  oneOf: [
    { properties: { kind: { const: 'a' } } },
    { properties: { kind: { const: 1 } } },
  ],
} as const;

it.each([false, true])(
  'ERROR-077 keeps the degraded form when the mount meets a shared conflict (StrictMode=%s)',
  async (strict) => {
    const sink = observeErrorSink();
    const onError = vi.fn();
    const handle = createRef<FormHandle>();
    const form = (
      <Form
        ref={handle}
        onError={onError}
        validationMode={ValidationMode.None}
        jsonSchema={conflictSchema}
        defaultValue={conflictValue}
      />
    );
    const view = render(strict ? <StrictMode>{form}</StrictMode> : form);
    expect(handle.current?.node?.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'sharedConflict',
    });
    expect(view.container.querySelector('[data-path="/first"]')).not.toBeNull();
    expect(
      view.container.querySelector('[data-path="/second"]'),
    ).not.toBeNull();
    expect(view.queryByText('Unable to load form.')).toBeNull();
    const records = onError.mock.calls.map(([record]) => record);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      code: FormErrorCode.SharedNodeConflict,
      origin: 'load',
    });
    expect(
      sink.errors().filter((error) => error === records[0].error),
    ).toHaveLength(1);
    await expect(handle.current!.submit()).rejects.toMatchObject({
      code: FormErrorCode.SubmitWhileDegraded,
    });
  },
);

it('ERROR-077 renders the conflicting form without calling consumer callbacks during render', () => {
  observeErrorSink();
  const callbacks = {
    onError: vi.fn(),
    onChange: vi.fn(),
    onStateChange: vi.fn(),
    onValidate: vi.fn(),
    onDiagnosticsChange: vi.fn(),
  };
  const html = renderToString(
    <Form
      {...callbacks}
      jsonSchema={conflictSchema}
      defaultValue={conflictValue}
    />,
  );
  expect(html).toContain('data-path="/first"');
  expect(html).not.toContain('Unable to load form.');
  for (const callback of Object.values(callbacks))
    expect(callback).not.toHaveBeenCalled();
});

it('REACT-007 applies the errors prop to a shared-conflict mount', () => {
  observeErrorSink();
  const issue = { dataPath: '/first', message: 'external first' };
  const handle = createRef<FormHandle>();
  const view = render(
    <Form
      ref={handle}
      onError={() => {}}
      validationMode={ValidationMode.None}
      errorVisibility={ErrorVisibility.Always}
      jsonSchema={conflictSchema}
      defaultValue={conflictValue}
      errors={[issue]}
    />,
  );
  expect(handle.current?.node?.diagnostics.cause).toBe('sharedConflict');
  expect(handle.current?.findNode('/first')?.errors).toEqual([issue]);
  expect(handle.current?.getErrors()).toEqual([issue]);
  expect(
    view.container.querySelector('[data-path="/first"] em')?.textContent,
  ).toBe(issue.message);
});

it('ERROR-077 keeps the load fallback for a construction failure', () => {
  observeErrorSink();
  const onError = vi.fn();
  const handle = createRef<FormHandle>();
  const view = render(
    <Form ref={handle} onError={onError} jsonSchema={unbuildableSchema} />,
  );
  expect(handle.current?.node).toBeUndefined();
  expect(view.getByRole('alert').textContent).toBe('Unable to load form.');
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0][0]).toMatchObject({ origin: 'load' });
});

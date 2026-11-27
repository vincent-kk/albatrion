import { StrictMode, createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form,
  FormErrorCode,
  type FormHandle,
  ValidationMode,
} from '../../index';
import { observeErrorSink } from '../helpers/observeErrorSink';

afterEach(cleanup);

it.each([false, true])(
  'reports a throwing active expression once at a development mount and keeps the form degraded (StrictMode: %s)',
  (isStrict) => {
    const sink = observeErrorSink();
    const onError = vi.fn();
    const handle = createRef<FormHandle>();
    const form = (
      <Form
        ref={handle}
        onError={onError}
        validationMode={ValidationMode.None}
        jsonSchema={{
          type: 'object',
          properties: {
            name: { type: 'string' },
            discount: {
              type: 'number',
              controls: { active: '@.user.plan.tier === "pro"' },
            },
          },
        }}
      />
    );
    const view = render(isStrict ? <StrictMode>{form}</StrictMode> : form);
    expect(handle.current?.node?.diagnostics.status).toBe('degraded');
    expect(view.container.querySelector('[data-path="/name"]')).not.toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
    const [record] = onError.mock.calls[0];
    expect(record).toMatchObject({
      code: FormErrorCode.ExpressionThrew,
      origin: 'load',
    });
    expect(
      sink.errors().filter((error) => error === record.error),
    ).toHaveLength(1);
  },
);

it('keeps reporting an if guard failure at a development mount as a record without degrading the form', () => {
  const sink = observeErrorSink();
  const onError = vi.fn();
  const handle = createRef<FormHandle>();
  const view = render(
    <Form
      ref={handle}
      onError={onError}
      validationMode={ValidationMode.None}
      validatorFactory={{
        compile: () => () => null,
        compileGuard: () => {
          throw new Error('bad guard');
        },
      }}
      jsonSchema={{
        type: 'object',
        properties: { enabled: { type: 'boolean' } },
        if: { properties: { enabled: { const: true } } },
        then: { properties: { extra: { type: 'string' } } },
      }}
      defaultValue={{ enabled: true }}
    />,
  );
  expect(handle.current?.node?.diagnostics.status).toBe('stable');
  expect(handle.current?.findNode('/extra')).toBeNull();
  expect(view.container.querySelector('[data-path="/enabled"]')).not.toBeNull();
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0][0]).toMatchObject({
    code: FormErrorCode.GuardFailed,
    origin: 'load',
  });
  expect(sink.errors()).toEqual([]);
});

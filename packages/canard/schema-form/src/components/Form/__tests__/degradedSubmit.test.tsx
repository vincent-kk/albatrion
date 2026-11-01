import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ValidationMode } from '@/schema-form/core';
import { FormErrorCode } from '@/schema-form/errors';

import { FormCore, type FormHandle } from '../components/FormCore';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('DR-11 explicit validate on a degraded form already reports an execution rejection once', async () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  render(
    <FormCore
      ref={ref}
      jsonSchema={{
        type: 'string',
        controls: { derived: '(() => { throw new Error("degraded") })()' },
      }}
      onError={onError}
      validationMode={ValidationMode.OnRequest}
      validatorFactory={{
        compile: () => () => {
          throw new Error('validator');
        },
        compileGuard: () => () => true,
      }}
    >
      <span />
    </FormCore>,
  );
  expect(ref.current!.node?.diagnostics.status).toBe('degraded');
  onError.mockClear();
  host.mockClear();
  await expect(ref.current!.validate()).rejects.toMatchObject({
    code: FormErrorCode.ValidatorThrew,
  });
  expect(
    onError.mock.calls.map(([record]) => ({
      code: record.code,
      origin: record.origin,
    })),
  ).toEqual([{ code: FormErrorCode.ValidatorThrew, origin: 'validate' }]);
  expect(host).not.toHaveBeenCalled();
});

it('DR-11 reports degraded submit rejection to onError before rejecting the caller', async () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  const view = render(
    <FormCore
      ref={ref}
      jsonSchema={{
        type: 'string',
        controls: { derived: '(() => { throw new Error("degraded") })()' },
      }}
      onError={onError}
      validationMode={ValidationMode.None}
    >
      <span />
    </FormCore>,
  );
  expect(ref.current!.node?.diagnostics.status).toBe('degraded');
  onError.mockClear();
  host.mockClear();
  await expect(ref.current!.submit()).rejects.toMatchObject({
    code: FormErrorCode.SubmitWhileDegraded,
  });
  expect
    .soft(
      onError.mock.calls.map(([record]) => ({
        code: record.code,
        origin: record.origin,
      })),
    )
    .toEqual([{ code: FormErrorCode.SubmitWhileDegraded, origin: 'submit' }]);
  expect(host).not.toHaveBeenCalled();
  onError.mockClear();
  await act(async () => {
    fireEvent.submit(view.container.querySelector('form')!);
  });
  expect(
    onError.mock.calls.map(([record]) => ({
      code: record.code,
      origin: record.origin,
    })),
  ).toEqual([{ code: FormErrorCode.SubmitWhileDegraded, origin: 'submit' }]);
  expect(host).toHaveBeenCalledOnce();
});

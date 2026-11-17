import { createRef, useLayoutEffect } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  FieldNodeEventType,
  Form,
  FormErrorCode,
  type FormHandle,
  type FormProps,
  ValidationMode,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('DR-17 red native submit sends validator failure then handler by identity', async () => {
  createValidationFrameClock();
  const E = new Error('validator execution');
  const H = new Error('handler');
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  const onError = vi.fn<NonNullable<FormProps['onError']>>((record) => {
    if (record.code === FormErrorCode.ValidatorThrew) throw H;
  });
  const view = render(
    <Form
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.OnRequest}
      validatorFactory={{
        compile: () => () => {
          throw E;
        },
        compileGuard: () => () => true,
      }}
      onError={onError}
    />,
  );
  await act(async () => {
    fireEvent.submit(view.container.querySelector('form')!);
  });
  expect(onError).toHaveBeenCalledOnce();
  expect(onError.mock.calls[0][0].code).toBe(FormErrorCode.ValidatorThrew);
  expect(host).toHaveBeenCalledTimes(2);
  expect(host.mock.calls[0][0]).toBe(onError.mock.calls[0][0].error);
  expect(host.mock.calls[1][0]).toBe(H);
});

it('DR-17 guard explicit submit rejects one bundle without host delivery', async () => {
  createValidationFrameClock();
  const E = new Error('validator execution');
  const H = new Error('handler');
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>((record) => {
    if (record.code === FormErrorCode.ValidatorThrew) throw H;
  });
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.OnRequest}
      validatorFactory={{
        compile: () => () => {
          throw E;
        },
        compileGuard: () => () => true,
      }}
      onError={onError}
    />,
  );
  let rejection: unknown;
  await act(async () => {
    try {
      await ref.current!.submit();
    } catch (error) {
      rejection = error;
    }
  });
  expect(onError).toHaveBeenCalledOnce();
  expect(rejection).toMatchObject({
    code: FormErrorCode.MultipleErrors,
    details: { errors: [onError.mock.calls[0][0].error, H] },
  });
  expect(host).not.toHaveBeenCalled();
});

it('DR-17 red load sends two derived failures in record identity order', () => {
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          a: {
            type: 'string',
            controls: { derived: '(() => { throw new Error("derived A") })()' },
          },
          b: {
            type: 'string',
            controls: { derived: '(() => { throw new Error("derived B") })()' },
          },
        },
      }}
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );
  expect(
    onError.mock.calls.map(([record]) => ({
      code: record.code,
      origin: record.origin,
    })),
  ).toEqual([
    { code: FormErrorCode.ExpressionThrew, origin: 'load' },
    { code: FormErrorCode.ExpressionThrew, origin: 'load' },
  ]);
  expect(host).toHaveBeenCalledTimes(2);
  expect(host.mock.calls[0][0]).toBe(onError.mock.calls[0][0].error);
  expect(host.mock.calls[1][0]).toBe(onError.mock.calls[1][0].error);
});

it.each([false, true])(
  'DR-17 red validation wave keeps handler-first leaf order (handler=%s)',
  async (throwHandler) => {
    createValidationFrameClock();
    const A = new Error('listener A'),
      B = new Error('listener B'),
      H = new Error('handler H');
    const host = vi.fn();
    vi.stubGlobal('reportError', host);
    const ref = createRef<FormHandle>();
    const onError = vi.fn<NonNullable<FormProps['onError']>>((record) => {
      if (throwHandler && record.error === A) throw H;
    });
    const Field = ({ node }: FieldInputProps) => {
      useLayoutEffect(() => {
        const offA = node.subscribe((event) => {
          if (event.type & FieldNodeEventType.UpdateError) throw A;
        });
        const offB = node.subscribe((event) => {
          if (event.type & FieldNodeEventType.UpdateError) throw B;
        });
        return () => {
          offA();
          offB();
        };
      }, [node]);
      return <span />;
    };
    render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            a: { type: 'string', presentation: { FieldInput: Field } },
          },
        }}
        defaultValue={{ a: 'x' }}
        validationMode={ValidationMode.OnRequest}
        onError={onError}
        validatorFactory={{
          compile: () => () => [
            { dataPath: '/a', keyword: 'minLength', message: 'short' },
          ],
          compileGuard: () => () => true,
        }}
      />,
    );
    await act(async () => {
      await ref.current!.validate();
    });
    expect(
      onError.mock.calls.map(([record]) => ({
        code: record.code,
        origin: record.origin,
      })),
    ).toEqual([
      { code: FormErrorCode.ListenerThrew, origin: 'validate' },
      { code: FormErrorCode.ListenerThrew, origin: 'validate' },
    ]);
    const expected = throwHandler ? [H, A, B] : [A, B];
    expect(host).toHaveBeenCalledTimes(expected.length);
    for (const [index, error] of expected.entries())
      expect(host.mock.calls[index][0]).toBe(error);
  },
);

it('DR-17 guard automatic OnChange failure keeps handler before validator', async () => {
  const clock = createValidationFrameClock();
  const E = new Error('validator E'),
    H = new Error('handler H');
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  let armed = false;
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>((record) => {
    if (record.code === FormErrorCode.ValidatorThrew) throw H;
  });
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.OnChange}
      onError={onError}
      validatorFactory={{
        compile: () => () => {
          if (armed) throw E;
          return null;
        },
        compileGuard: () => () => true,
      }}
    />,
  );
  await act(async () => {
    clock.frame();
    await vi.runOnlyPendingTimersAsync();
    await clock.task();
  });
  onError.mockClear();
  host.mockClear();
  armed = true;
  await act(async () => {
    ref.current!.setValue('next');
  });
  await act(async () => {
    clock.frame();
    await vi.runOnlyPendingTimersAsync();
    await clock.task();
  });
  expect(onError).toHaveBeenCalledOnce();
  expect(onError.mock.calls[0][0].code).toBe(FormErrorCode.ValidatorThrew);
  expect(host).toHaveBeenCalledTimes(2);
  expect(host.mock.calls[0][0]).toBe(H);
  expect(host.mock.calls[1][0]).toBe(onError.mock.calls[0][0].error);
});

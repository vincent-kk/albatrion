import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  FieldNodeEventType,
  Form,
  FormErrorCode,
  type FormHandle,
  type FormProps,
  FormWarningCode,
  ValidationMode,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { observeErrorSink } from '../helpers/observeErrorSink';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const expectRecords = (
  onError: ReturnType<typeof vi.fn<NonNullable<FormProps['onError']>>>,
  expected: { code: string; origin: string }[],
) =>
  expect(
    onError.mock.calls.map(([record]) => ({
      code: record.code,
      origin: record.origin,
    })),
  ).toEqual(expected);

it.each(['reset', 'rebuild', 'validator'] as const)(
  'A1 %s through the handle reports reset-chain failures as load',
  (operation) => {
    createValidationFrameClock();
    const ref = createRef<FormHandle>();
    const onError = vi.fn<NonNullable<FormProps['onError']>>();
    const validator = {
      compile: () => () => [],
      compileGuard: () => () => true,
    };
    let fail = false;
    const failure = new Error('reset-chain onChange');
    const form = (next = validator) => (
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        defaultValue="initial"
        validatorFactory={next}
        validationMode={ValidationMode.None}
        onError={onError}
        onChange={() => {
          if (fail) throw failure;
        }}
      />
    );
    const view = render(form());
    act(() => ref.current!.setValue('changed'));
    onError.mockClear();
    fail = true;
    if (operation === 'validator') {
      observeErrorSink();
      vi.spyOn(console, 'error').mockImplementation(() => {});
      view.rerender(form({ ...validator }));
    } else
      act(() => {
        expect(() => ref.current![operation]()).toThrow(failure);
      });
    expectRecords(onError, [
      { code: FormErrorCode.ListenerThrew, origin: 'load' },
    ]);
    expect(onError.mock.calls[0][0].error).toBe(failure);
  },
);

it('T2 reset onChange nested writes retain the outer load origin', () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  let nested = false;
  const failure = new Error('nested');
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="initial"
      validationMode={ValidationMode.None}
      onError={onError}
      onChange={() => {
        if (nested) {
          nested = false;
          ref.current!.setValue('inner');
          throw failure;
        }
      }}
    />,
  );
  act(() => ref.current!.setValue('changed'));
  const innerFailure = new Error('inner listener');
  ref.current!.node!.subscribe((event) => {
    if (
      event.type & FieldNodeEventType.UpdateValue &&
      ref.current!.getValue() === 'inner'
    )
      throw innerFailure;
  });
  onError.mockClear();
  nested = true;
  act(() => {
    expect(() => ref.current!.reset()).toThrow();
  });
  expectRecords(onError, [
    { code: FormErrorCode.ListenerThrew, origin: 'load' },
    { code: FormErrorCode.ListenerThrew, origin: 'load' },
  ]);
  expect(onError.mock.calls.map(([record]) => record.error)).toEqual([
    innerFailure,
    failure,
  ]);
});

it('P3-4 a write node listener calling reset keeps write across adoption', () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );
  const old = ref.current!.node!;
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'number',
        controls: { derived: '(() => { throw new Error("nested reset") })()' },
      }}
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );
  const unsubscribe = old.subscribe(() => {
    unsubscribe();
    ref.current!.reset();
  });
  onError.mockClear();
  act(() => {
    expect(() => old.setValue('next')).toThrow();
  });
  expectRecords(onError, [
    { code: FormErrorCode.ExpressionThrew, origin: 'write' },
  ]);
});

it('P3-4 a validation-result listener failure carries validate', async () => {
  createValidationFrameClock();
  observeErrorSink();
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  const failure = new Error('verdict listener');
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.OnRequest}
      onError={onError}
      validatorFactory={{
        compile: () => () => [{ dataPath: '', message: 'invalid' }],
        compileGuard: () => () => true,
      }}
    />,
  );
  ref.current!.node!.subscribe(() => {
    throw failure;
  });
  onError.mockClear();
  await act(async () => {
    await ref.current!.validate();
  });
  expectRecords(onError, [
    { code: FormErrorCode.ListenerThrew, origin: 'validate' },
  ]);
  expect(onError.mock.calls[0][0].error).toBe(failure);
});

it('P3-4 standalone setState after a load never retains stale load origin', () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );
  act(() => ref.current!.reset());
  const failure = new Error('state listener');
  ref.current!.node!.subscribe(() => {
    throw failure;
  });
  onError.mockClear();
  act(() => {
    expect(() => ref.current!.node!.setState({ touched: true })).toThrow(
      failure,
    );
  });
  expectRecords(onError, [
    { code: FormErrorCode.ListenerThrew, origin: 'write' },
  ]);
  expect(onError.mock.calls[0][0].error).toBe(failure);
});

it('P3-4 external errors at first commit use load and prop changes use write', () => {
  observeErrorSink();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  const failure = new Error('external errors callback');
  const form = (message: string, fail = true) => (
    <Form
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.None}
      errors={[{ dataPath: '', message }]}
      onError={onError}
      onValidate={() => {
        if (fail) throw failure;
      }}
    />
  );
  const view = render(form('first'));
  expectRecords(onError, [
    { code: FormErrorCode.ListenerThrew, origin: 'load' },
  ]);
  expect(onError.mock.calls[0][0].error).toBe(failure);
  view.unmount();
  const next = render(form('first', false));
  onError.mockClear();
  next.rerender(form('second'));
  expectRecords(onError, [
    { code: FormErrorCode.ListenerThrew, origin: 'write' },
  ]);
  expect(onError.mock.calls[0][0].error).toBe(failure);
});

it.each([false, true])(
  'round b replaced mount keeps construction load and guard opener (listener=%s)',
  (listener) => {
    createValidationFrameClock();
    const ref = createRef<FormHandle>();
    const onError = vi.fn<NonNullable<FormProps['onError']>>();
    const validator = {
      compile: () => () => [],
      compileGuard: () => {
        throw new Error('replacement guard compile');
      },
    };
    const initial = {
      type: 'object',
      properties: { value: { type: 'string' } },
    } as const;
    const replacement = {
      type: 'object',
      properties: { value: { type: 'string' } },
      allOf: [
        {
          if: { properties: { value: { const: 'gated' } } },
          then: { properties: { extra: { type: 'string' } } },
          not: { required: ['ignored'] },
        },
      ],
    } as const;
    const form = (jsonSchema: typeof initial | typeof replacement) => (
      <Form
        ref={ref}
        jsonSchema={jsonSchema}
        defaultValue={{ value: 'initial' }}
        validatorFactory={validator}
        validationMode={ValidationMode.OnRequest}
        onError={onError}
      />
    );
    const view = render(form(initial));
    const old = ref.current!.node!;
    view.rerender(form(replacement));
    onError.mockClear();
    if (listener) {
      const unsubscribe = old.subscribe(() => {
        unsubscribe();
        ref.current!.reset();
      });
      act(() => {
        expect(() => old.setValue({ value: 'next' })).not.toThrow();
      });
    } else
      act(() => {
        expect(() => ref.current!.reset()).not.toThrow();
      });
    expectRecords(onError, [
      { code: FormWarningCode.AllOfKeywordIgnoredForForm, origin: 'load' },
      { code: FormErrorCode.GuardFailed, origin: listener ? 'write' : 'load' },
    ]);
  },
);

it('round b T2 stamps a failing inner guard with the enclosing reset load', () => {
  createValidationFrameClock();
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  let nested = false;
  const failure = new Error('outer onChange');
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: { value: { type: 'string' } },
        if: { properties: { value: { const: 'inner' } } },
        then: { properties: { extra: { type: 'string' } } },
      }}
      defaultValue={{ value: 'initial' }}
      validationMode={ValidationMode.OnRequest}
      onError={onError}
      validatorFactory={{
        compile: () => () => [],
        compileGuard: () => (value: unknown) => {
          if (Reflect.get(Object(value), 'value') === 'inner')
            throw new Error('inner guard');
          return false;
        },
      }}
      onChange={() => {
        if (nested) {
          nested = false;
          ref.current!.setValue({ value: 'inner' });
          throw failure;
        }
      }}
    />,
  );
  act(() => ref.current!.setValue({ value: 'changed' }));
  onError.mockClear();
  nested = true;
  let thrown: unknown;
  act(() => {
    try {
      ref.current!.reset();
    } catch (error) {
      thrown = error;
    }
  });
  expect(thrown).toMatchObject({ code: FormErrorCode.MultipleErrors });
  expectRecords(onError, [
    { code: FormErrorCode.GuardFailed, origin: 'load' },
    { code: FormErrorCode.ListenerThrew, origin: 'load' },
  ]);
});

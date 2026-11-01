import { StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  type FieldRendererProps,
  Form,
  FormErrorCode,
  type FormHandle,
  type JSONSchema,
  ShowError,
  ValidationMode,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { isValidationPending } from '../helpers/isValidationPending';
import { observeErrorSink } from '../helpers/observeErrorSink';

const loadSlots = vi.hoisted(() => ({
  callbacks: [] as (() => void)[],
  entries: vi.fn(),
}));
vi.mock('@/schema-form/core', async (importOriginal) => {
  const core = await importOriginal<typeof import('@/schema-form/core')>();
  return {
    ...core,
    scheduleValidationSlot: (callback: () => void) =>
      loadSlots.callbacks.push(callback),
    startFieldNodeLoadValidation: (
      root: Parameters<typeof core.startFieldNodeLoadValidation>[0],
    ) => {
      loadSlots.entries();
      return core.startFieldNodeLoadValidation(root);
    },
  };
});

beforeEach(() => {
  loadSlots.callbacks = [];
  loadSlots.entries.mockClear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const releaseSlots = async () => {
  await act(async () => {
    const callbacks = loadSlots.callbacks.splice(0);
    for (const callback of callbacks) callback();
    await Promise.resolve();
  });
};

it.each([false, true])(
  'T1 OnRequest compiles only in the load slot (failure=%s)',
  async (failure) => {
    const clock = createValidationFrameClock();
    vi.stubGlobal('reportError', vi.fn());
    const sink = observeErrorSink();
    const onError = vi.fn();
    const validate = vi.fn(() => []);
    const compile = vi.fn(() => {
      if (failure) throw new Error('compile');
      return validate;
    });
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        validationMode={ValidationMode.OnRequest}
        validatorFactory={{ compile, compileGuard: () => () => true }}
        onError={onError}
      />,
    );
    expect(compile).not.toHaveBeenCalled();
    await act(async () => {
      clock.frame();
      await clock.task();
    });
    expect(compile).not.toHaveBeenCalled();
    await releaseSlots();
    expect(compile).toHaveBeenCalledTimes(1);
    expect(validate).not.toHaveBeenCalled();
    if (failure) {
      expect(onError).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          code: FormErrorCode.ValidatorCompileFailed,
          surface: 'sink',
        }),
      );
      expect(sink.errors()).toHaveLength(1);
      await expect(ref.current!.validate()).rejects.toMatchObject({
        code: FormErrorCode.ValidatorCompileFailed,
      });
      await expect(ref.current!.submit()).rejects.toMatchObject({
        code: FormErrorCode.ValidatorCompileFailed,
      });
      expect(onError).toHaveBeenCalledTimes(1);
      expect(sink.errors()).toHaveLength(1);
    }
  },
);

it.each([true, ShowError.Always])(
  'T2 Always defers compile and first verdict (policy=%s)',
  async (showError) => {
    const clock = createValidationFrameClock();
    const onValidate = vi.fn();
    const validate = vi.fn(() => [{ dataPath: '', message: 'required' }]);
    const compile = vi.fn(() => validate);
    const view = render(
      <StrictMode>
        <Form
          jsonSchema={{ type: 'string' }}
          showError={showError}
          FieldRenderer={({
            Input,
            errorVisible,
            errorMessage,
          }: FieldRendererProps) => (
            <>
              <Input />
              <span>{errorVisible ? errorMessage : null}</span>
            </>
          )}
          validatorFactory={{ compile, compileGuard: () => () => true }}
          onValidate={onValidate}
          formatError={(issue) => issue.message ?? null}
        />
      </StrictMode>,
    );
    expect(compile).not.toHaveBeenCalled();
    expect(onValidate).not.toHaveBeenCalled();
    expect(view.queryByText('required')).toBeNull();
    expect(loadSlots.callbacks).toHaveLength(1);
    await act(async () => {
      clock.frame();
      await clock.task();
    });
    await releaseSlots();
    expect(compile).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(onValidate).toHaveBeenCalledTimes(1);
    expect(view.getByText('required')).toBeTruthy();
  },
);

it('T4 same-schema reset leaves pending false until the load slot and runs one verdict', async () => {
  const clock = createValidationFrameClock();
  const ref = createRef<FormHandle>();
  const validate = vi.fn(() => [{ dataPath: '', message: 'invalid' }]);
  const onValidate = vi.fn();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="default"
      onValidate={onValidate}
      validatorFactory={{
        compile: () => validate,
        compileGuard: () => () => true,
      }}
    />,
  );
  await releaseSlots();
  validate.mockClear();
  onValidate.mockClear();
  act(() => ref.current!.reset());
  expect(isValidationPending(ref.current!.node!)).toBe(false);
  await act(async () => {
    clock.frame();
    await clock.task();
  });
  expect(validate).not.toHaveBeenCalled();
  await releaseSlots();
  expect(validate).toHaveBeenCalledExactlyOnceWith('default');
  expect(onValidate).toHaveBeenLastCalledWith([
    { dataPath: '', message: 'invalid' },
  ]);
});

it.each([false, true])(
  'T5 a write before the slot supersedes its verdict (reset=%s)',
  async (reset) => {
    const clock = createValidationFrameClock();
    const ref = createRef<FormHandle>();
    const validate = vi.fn(() => []);
    render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        defaultValue="default"
        validatorFactory={{
          compile: () => validate,
          compileGuard: () => () => true,
        }}
      />,
    );
    if (reset) {
      await releaseSlots();
      validate.mockClear();
      const slotsBeforeReset = loadSlots.callbacks.length;
      act(() => ref.current!.reset());
      expect(loadSlots.callbacks).toHaveLength(slotsBeforeReset + 1);
    }
    act(() => ref.current!.setValue('typed'));
    await act(async () => {
      clock.frame();
      await clock.task();
    });
    await releaseSlots();
    expect(validate).toHaveBeenCalledExactlyOnceWith('typed');
  },
);

it('T6 None never compiles across every guard-free load kind', async () => {
  createValidationFrameClock();
  const compile = vi.fn(() => () => []);
  const ref = createRef<FormHandle>();
  const validator = { compile, compileGuard: () => () => true };
  const form = (jsonSchema: JSONSchema, validatorFactory = validator) => (
    <Form
      ref={ref}
      jsonSchema={jsonSchema}
      validationMode={ValidationMode.None}
      validatorFactory={validatorFactory}
    />
  );
  const schema = { type: 'string' } as const;
  const view = render(form(schema));
  await releaseSlots();
  act(() => ref.current!.reset());
  await releaseSlots();
  view.rerender(form({ type: 'number' }));
  act(() => ref.current!.reset());
  await releaseSlots();
  act(() => ref.current!.rebuild());
  await releaseSlots();
  view.rerender(form({ type: 'number' }, { ...validator }));
  await releaseSlots();
  expect(compile).not.toHaveBeenCalled();
});

it.each(['same', 'replacement', 'failing'] as const)(
  'T8 superseded %s slot does not enter the engine',
  async (kind) => {
    createValidationFrameClock();
    vi.stubGlobal('reportError', vi.fn());
    const sink = observeErrorSink();
    const onError = vi.fn();
    const ref = createRef<FormHandle>();
    const validate = vi.fn(() => []);
    const validator = {
      compile: () => {
        if (kind === 'failing') throw new Error('compile');
        return validate;
      },
      compileGuard: () => () => true,
    };
    const form = (jsonSchema: JSONSchema) => (
      <Form
        ref={ref}
        jsonSchema={jsonSchema}
        validatorFactory={validator}
        onError={onError}
      />
    );
    const view = render(form({ type: 'string' }));
    const handle = ref.current!;
    if (kind !== 'same') view.rerender(form({ type: 'number' }));
    act(() => {
      handle.reset();
      handle.reset();
    });
    loadSlots.entries.mockClear();
    const stale = loadSlots.callbacks.shift()!;
    await act(async () => stale());
    expect(loadSlots.entries).not.toHaveBeenCalled();
    await releaseSlots();
    expect(loadSlots.entries).toHaveBeenCalledTimes(1);
    if (kind === 'failing') {
      expect(onError).toHaveBeenCalledTimes(1);
      expect(sink.errors()).toHaveLength(1);
    } else expect(validate).toHaveBeenCalledTimes(1);
  },
);

import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  Form,
  FormErrorCode,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { hideCommittedForm } from '../helpers/hideCommittedForm';
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

it.each([
  ['reset', false],
  ['reset', true],
  ['rebuild', false],
  ['rebuild', true],
  ['validator', false],
  ['validator', true],
] as const)(
  'T3 %s retains a usable replacement on slot compile failure (hidden=%s)',
  async (operation, hidden) => {
    createValidationFrameClock();
    vi.stubGlobal('reportError', vi.fn());
    const sink = observeErrorSink();
    const onError = vi.fn();
    const ref = createRef<FormHandle>();
    const initial = {
      type: 'object',
      properties: { old: { type: 'string' } },
    } as const;
    const replacement = {
      type: 'object',
      properties: { next: { type: 'string' } },
    } as const;
    const good = {
      compile: (schema: JSONSchema) => {
        if (schema.properties?.next) throw new Error('replacement');
        return () => [];
      },
      compileGuard: () => () => true,
    };
    const bad = {
      compile: () => {
        throw new Error('replacement');
      },
      compileGuard: () => () => true,
    };
    const element = (jsonSchema: JSONSchema, validatorFactory: typeof good) => (
      <Form
        ref={ref}
        jsonSchema={jsonSchema}
        validatorFactory={validatorFactory}
        onError={onError}
        validationMode={ValidationMode.OnRequest}
      />
    );
    const view = render(hideCommittedForm(element(initial, good), false));
    const handle = ref.current!;
    const old = handle.node;
    await releaseSlots();
    view.rerender(
      hideCommittedForm(
        element(operation === 'validator' ? initial : replacement, good),
        false,
      ),
    );
    if (hidden)
      view.rerender(
        hideCommittedForm(
          element(operation === 'validator' ? initial : replacement, good),
          true,
        ),
      );
    if (operation === 'validator') {
      view.rerender(hideCommittedForm(element(initial, bad), false));
      if (hidden) view.rerender(hideCommittedForm(element(initial, bad), true));
    } else
      act(() => {
        expect(() =>
          operation === 'reset' ? handle.reset() : handle.rebuild(),
        ).not.toThrow();
      });
    expect(handle.node).not.toBe(old);
    act(() =>
      handle.setValue(
        operation === 'validator' ? { old: 'usable' } : { next: 'usable' },
      ),
    );
    expect(handle.getValue()).toEqual(
      operation === 'validator' ? { old: 'usable' } : { next: 'usable' },
    );
    expect(onError).not.toHaveBeenCalled();
    await releaseSlots();
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        code: FormErrorCode.ValidatorCompileFailed,
        origin: 'validate',
      }),
    );
    expect(sink.errors()).toHaveLength(1);
    await expect(handle.validate()).rejects.toMatchObject({
      code: FormErrorCode.ValidatorCompileFailed,
    });
    if (hidden)
      view.rerender(
        hideCommittedForm(
          element(
            operation === 'validator' ? initial : replacement,
            operation === 'validator' ? bad : good,
          ),
          false,
        ),
      );
    if (operation !== 'validator')
      expect(view.container.querySelector('[data-path="/next"]')).toBeTruthy();
  },
);

it.each([false, true])(
  'T9 explicit compile rejection before slot is isolated by load generation (reset=%s)',
  async (reset) => {
    createValidationFrameClock();
    vi.stubGlobal('reportError', vi.fn());
    const sink = observeErrorSink();
    const onError = vi.fn();
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        onError={onError}
        validatorFactory={{
          compile: () => {
            throw new Error('compile');
          },
          compileGuard: () => () => true,
        }}
      />,
    );
    let promise: Promise<unknown>;
    act(() => {
      promise = ref.current!.validate();
      if (reset) ref.current!.reset();
    });
    await expect(promise!).rejects.toMatchObject({
      code: FormErrorCode.ValidatorCompileFailed,
    });
    await releaseSlots();
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ origin: 'validate' }),
    );
    expect(sink.errors()).toHaveLength(reset ? 1 : 0);
  },
);

it('B3 a new same-id schema with different content compiles after old-root release', async () => {
  createValidationFrameClock();
  const onError = vi.fn();
  const registered = new Set<unknown>();
  const validator = {
    compile: (schema: JSONSchema) => {
      if (registered.size) throw new Error('schema with key already exists');
      registered.add(schema);
      return (value: unknown) =>
        typeof value === schema.type
          ? []
          : [{ dataPath: '', message: 'wrong schema' }];
    },
    compileGuard: () => () => true,
    release: (schema: JSONSchema) => {
      registered.delete(schema);
    },
  };
  const ref = createRef<FormHandle>();
  const form = (jsonSchema: JSONSchema) => (
    <Form
      ref={ref}
      jsonSchema={jsonSchema}
      validatorFactory={validator}
      onError={onError}
    />
  );
  const view = render(form({ $id: 'urn:load-slot', type: 'string' }));
  await releaseSlots();
  view.rerender(form({ $id: 'urn:load-slot', type: 'number' }));
  act(() => ref.current!.reset());
  await releaseSlots();
  expect(onError).not.toHaveBeenCalled();
  act(() => ref.current!.setValue(42));
  await act(async () => {
    await expect(ref.current!.validate()).resolves.toEqual([]);
  });
});

it.each([ValidationMode.OnRequest, ValidationMode.OnChange])(
  'round b native submit reuses the slot compile rejection (mode=%s)',
  async (validationMode) => {
    const clock = createValidationFrameClock();
    vi.stubGlobal('reportError', vi.fn());
    const sink = observeErrorSink();
    const onError = vi.fn();
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        validationMode={validationMode}
        validatorFactory={{
          compile: () => {
            throw new Error('native compile');
          },
          compileGuard: () => () => true,
        }}
        onError={onError}
      />,
    );
    await releaseSlots();
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        code: FormErrorCode.ValidatorCompileFailed,
        origin: 'validate',
      }),
    );
    const rejection: unknown = onError.mock.calls[0][0].error;
    expect(sink.errors()).toEqual([rejection]);
    await act(async () => {
      fireEvent.submit(view.container.querySelector('form')!);
      await clock.task();
    });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(sink.errors()).toEqual([rejection, rejection]);
    await expect(ref.current!.submit()).rejects.toBe(rejection);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(sink.errors()).toHaveLength(2);
  },
);

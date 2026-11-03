import { createRef } from 'react';

import { plugin } from '@canard/schema-form-ajv8-plugin';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  Form,
  FormErrorCode,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { observeErrorSink } from '../helpers/observeErrorSink';

/** Captures the production slot boundary while frames remain independently controlled. */
const slots = vi.hoisted(() => ({ callbacks: new Array<() => void>() }));
vi.mock('@/schema-form/core', async (importOriginal) => {
  const core = await importOriginal<typeof import('@/schema-form/core')>();
  return {
    ...core,
    scheduleValidationSlot: (callback: () => void) =>
      slots.callbacks.push(callback),
  };
});

beforeEach(() => {
  slots.callbacks.length = 0;
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** Drain deferred load work after the host chooses to release it.
 * @returns A settled React update containing the queued slot callbacks. */
const releaseSlots = async () => {
  await act(async () => {
    for (const callback of slots.callbacks.splice(0)) callback();
  });
};

/** Conditional fixture with an observable effective field constraint. */
const schema: JSONSchema = {
  type: 'object',
  properties: { kind: { type: 'string' }, field: { type: 'string' } },
  if: { properties: { kind: { const: 'a' } }, required: ['kind'] },
  then: { properties: { field: { minLength: 2 } } },
};

it('G red None if-schema mounts and every replacement load never whole compile', async () => {
  createValidationFrameClock();
  const compile = vi.fn(() => () => null);
  const validator = { compile, compileGuard: () => () => true };
  const ref = createRef<FormHandle>();
  const form = (jsonSchema: JSONSchema, validatorFactory = validator) => (
    <Form
      ref={ref}
      jsonSchema={jsonSchema}
      validationMode={ValidationMode.None}
      validatorFactory={validatorFactory}
    />
  );
  const view = render(form(schema));
  const handle = ref.current;
  if (!handle) throw new Error('Missing form handle');
  await releaseSlots();
  act(() => handle.reset());
  await releaseSlots();
  view.rerender(form({ ...schema }));
  act(() => handle.reset());
  await releaseSlots();
  act(() => handle.rebuild());
  await releaseSlots();
  view.rerender(form({ ...schema }, { ...validator }));
  await releaseSlots();
  expect(compile).not.toHaveBeenCalled();
});

it('G red OnChange if-schema compiles after the first frame in the load slot', async () => {
  const clock = createValidationFrameClock();
  const validate = vi.fn(() => null);
  const compile = vi.fn(() => validate);
  render(
    <Form
      jsonSchema={schema}
      validationMode={ValidationMode.OnChange}
      validatorFactory={{ compile, compileGuard: () => () => true }}
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
  expect(validate).toHaveBeenCalledTimes(1);
});

it.each(['mount', 'reset', 'replacement', 'rebuild', 'validator'])(
  'G characterization preserves conditional effective schema across %s',
  async (kind) => {
    createValidationFrameClock();
    const ref = createRef<FormHandle>();
    const form = (
      jsonSchema: JSONSchema,
      validatorFactory = plugin.validator,
    ) => (
      <Form
        ref={ref}
        jsonSchema={jsonSchema}
        defaultValue={{ kind: 'a', field: 'x' }}
        validationMode={ValidationMode.OnRequest}
        validatorFactory={validatorFactory}
      />
    );
    const view = render(form(schema));
    const handle = ref.current;
    if (!handle) throw new Error('Missing form handle');
    await releaseSlots();
    if (kind === 'reset') act(() => handle.reset());
    if (kind === 'replacement') {
      view.rerender(form({ ...schema }));
      act(() => handle.reset());
    }
    if (kind === 'rebuild') act(() => handle.rebuild());
    if (kind === 'validator')
      view.rerender(form(schema, { ...plugin.validator }));
    await releaseSlots();
    expect(handle.node?.find('/field')?.jsonSchema).toHaveProperty(
      'minLength',
      2,
    );
    await act(async () => {
      expect(await handle.validate()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ keyword: 'minLength' }),
        ]),
      );
    });
    act(() => handle.setValue({ kind: 'b', field: 'x' }));
    expect(handle.node?.find('/field')?.jsonSchema).not.toHaveProperty(
      'minLength',
    );
    await act(async () => {
      expect(await handle.validate()).toEqual([]);
    });
    act(() => handle.setValue({ kind: 'a', field: 'x' }));
    expect(handle.node?.find('/field')?.jsonSchema).toHaveProperty(
      'minLength',
      2,
    );
  },
);

it.each(['slot', 'validate', 'submit'])(
  'G characterization keeps whole-compile failure reporting through %s',
  async (surface) => {
    createValidationFrameClock();
    vi.stubGlobal('reportError', vi.fn());
    const sink = observeErrorSink();
    const onError = vi.fn();
    const ref = createRef<FormHandle>();
    const failure = new Error('whole compile probe');
    const compile = vi.fn(() => {
      throw failure;
    });
    render(
      <Form
        ref={ref}
        jsonSchema={schema}
        validationMode={ValidationMode.OnRequest}
        validatorFactory={{ compile, compileGuard: () => () => true }}
        onError={onError}
      />,
    );
    const handle = ref.current;
    if (!handle) throw new Error('Missing form handle');
    if (surface === 'slot') {
      await releaseSlots();
      expect(sink.errors()).toHaveLength(1);
    } else
      await act(async () => {
        await expect(
          surface === 'validate' ? handle.validate() : handle.submit(),
        ).rejects.toMatchObject({
          code: FormErrorCode.ValidatorCompileFailed,
          details: { error: failure },
        });
      });
    expect(onError).toHaveBeenCalledTimes(1);
    await act(async () => {
      await expect(handle.validate()).rejects.toMatchObject({
        code: FormErrorCode.ValidatorCompileFailed,
      });
    });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(compile).toHaveBeenCalledTimes(1);
  },
);

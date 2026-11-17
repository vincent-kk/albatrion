import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import * as core from '@/schema-form/core';
import { FormWarningCode } from '@/schema-form/errors';

const slots: (() => void)[] = [];
beforeEach(() => {
  slots.length = 0;
  vi.spyOn(core, 'scheduleValidationSlot').mockImplementation((callback) => {
    slots.push(callback);
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const releaseSlots = async () => {
  await act(async () => {
    for (const callback of slots.splice(0)) callback();
    await Promise.resolve();
  });
};

it.each([
  ['validate', false],
  ['validate', true],
  ['submit', false],
  ['submit', true],
  ['load', false],
  ['load', true],
  ['activation', false],
  ['activation', true],
] as const)(
  'discards late %s publication after None (failure=%s) while settling its caller',
  async (kind, failure) => {
    const ref = createRef<FormHandle>();
    const host = vi.fn();
    vi.stubGlobal('reportError', host);
    const onError = vi.fn(),
      onValidate = vi.fn(),
      onSubmit = vi.fn();
    let resolve!: (issues: { dataPath: string; message: string }[]) => void;
    let reject!: (error: unknown) => void;
    const validate = vi.fn(
      () =>
        new Promise<{ dataPath: string; message: string }[]>((yes, no) => {
          resolve = yes;
          reject = no;
        }),
    );
    const compile = vi.fn(() => validate);
    const validator = { compile, compileGuard: () => () => true };
    const schema = { type: 'string' } as const;
    const form = (validationMode: core.ValidationMode) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        validationMode={validationMode}
        validatorFactory={validator}
        onError={onError}
        onValidate={onValidate}
        onSubmit={onSubmit}
      >
        <span />
      </Form>
    );
    const view = render(
      form(
        kind === 'load'
          ? core.ValidationMode.OnChange
          : core.ValidationMode.OnRequest,
      ),
    );
    await releaseSlots();
    let call: Promise<unknown> | undefined;
    if (kind === 'activation') {
      view.rerender(form(core.ValidationMode.OnChange));
      await releaseSlots();
    } else if (kind !== 'load')
      call =
        kind === 'validate' ? ref.current!.validate() : ref.current!.submit();
    expect(validate).toHaveBeenCalledOnce();
    const settled = call?.then(
      (value) => ({ value }),
      (error: unknown) => ({ error }),
    );
    view.rerender(form(core.ValidationMode.None));
    onValidate.mockClear();
    await act(async () => {
      if (failure) reject(new Error('late validator failure'));
      else resolve([{ dataPath: '', message: 'late invalid' }]);
      await settled;
      await Promise.resolve();
    });
    if (settled) {
      const result = await settled;
      expect(result).toHaveProperty(
        failure || kind === 'submit' ? 'error' : 'value',
      );
    }
    expect(ref.current!.getErrors()).toEqual([]);
    expect(onValidate).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(host).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  },
);

it.each(['before-load', 'queued', 'settled'] as const)(
  'cancels %s automatic work and creates a usable cadence on reactivation',
  async (phase) => {
    const clock = createValidationFrameClock();
    const ref = createRef<FormHandle>();
    const validate = vi.fn(() => []);
    const validator = {
      compile: () => validate,
      compileGuard: () => () => true,
    };
    const schema = { type: 'string' } as const;
    const form = (validationMode: core.ValidationMode) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="a"
        validationMode={validationMode}
        validatorFactory={validator}
      >
        <span />
      </Form>
    );
    const view = render(form(core.ValidationMode.OnChange));
    if (phase !== 'before-load') await releaseSlots();
    if (phase !== 'before-load') act(() => ref.current!.setValue('b'));
    if (phase === 'settled')
      await act(async () => {
        clock.frame();
        await clock.task();
      });
    view.rerender(form(core.ValidationMode.None));
    validate.mockClear();
    await act(async () => {
      clock.frame();
      await clock.task();
    });
    await releaseSlots();
    expect(validate).not.toHaveBeenCalled();
    view.rerender(form(core.ValidationMode.OnChange));
    await releaseSlots();
    expect(validate).toHaveBeenCalledOnce();
    act(() => ref.current!.setValue('c'));
    await act(async () => {
      clock.frame();
      await clock.task();
    });
    expect(validate).toHaveBeenCalledTimes(2);
  },
);

it('None → OnChange → None invalidates both load and activation slots', async () => {
  const validate = vi.fn(() => []),
    compile = vi.fn(() => validate);
  const validator = { compile, compileGuard: () => () => true };
  const schema = { type: 'string' } as const;
  const form = (validationMode: core.ValidationMode) => (
    <Form
      jsonSchema={schema}
      validationMode={validationMode}
      validatorFactory={validator}
    >
      <span />
    </Form>
  );
  const view = render(form(core.ValidationMode.None));
  view.rerender(form(core.ValidationMode.OnChange));
  view.rerender(form(core.ValidationMode.None));
  await releaseSlots();
  expect(compile).not.toHaveBeenCalled();
  expect(validate).not.toHaveBeenCalled();
});

it('a compile rejection discarded by None never marks the current mode unavailable', async () => {
  const ref = createRef<FormHandle>();
  const host = vi.fn(),
    onError = vi.fn();
  vi.stubGlobal('reportError', host);
  const validator = {
    compile: () => {
      throw new Error('compile failed');
    },
    compileGuard: () => () => true,
  };
  const schema = { type: 'string' } as const;
  const form = (validationMode: core.ValidationMode) => (
    <Form
      ref={ref}
      jsonSchema={schema}
      validationMode={validationMode}
      validatorFactory={validator}
      onError={onError}
    >
      <span />
    </Form>
  );
  const view = render(form(core.ValidationMode.OnRequest));
  const pending = ref.current!.validate();
  view.rerender(form(core.ValidationMode.None));
  await expect(pending).rejects.toBeDefined();
  expect(onError).not.toHaveBeenCalled();
  expect(host).not.toHaveBeenCalled();
});

it('mode toggles retain the load compile failure and its one report', async () => {
  const host = vi.fn(),
    onError = vi.fn(),
    compile = vi.fn(() => {
      throw new Error('compile failed');
    });
  vi.stubGlobal('reportError', host);
  const validator = { compile, compileGuard: () => () => true };
  const schema = { type: 'string' } as const;
  const form = (validationMode: core.ValidationMode) => (
    <Form
      jsonSchema={schema}
      validationMode={validationMode}
      validatorFactory={validator}
      onError={onError}
    >
      <span />
    </Form>
  );
  const view = render(form(core.ValidationMode.OnRequest));
  await releaseSlots();
  view.rerender(form(core.ValidationMode.None));
  view.rerender(form(core.ValidationMode.OnChange));
  await releaseSlots();
  expect(compile).toHaveBeenCalledOnce();
  expect(onError).toHaveBeenCalledOnce();
  expect(host).toHaveBeenCalledOnce();
});

it('first activation without a validator warns once and never synthesizes a verdict', async () => {
  const onError = vi.fn(),
    onValidate = vi.fn();
  const schema = { type: 'string' } as const;
  const form = (validationMode: core.ValidationMode) => (
    <Form
      jsonSchema={schema}
      validationMode={validationMode}
      validatorFactory={undefined}
      onError={onError}
      onValidate={onValidate}
    >
      <span />
    </Form>
  );
  const view = render(form(core.ValidationMode.None));
  await releaseSlots();
  view.rerender(form(core.ValidationMode.OnRequest));
  await releaseSlots();
  expect(onError).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ code: FormWarningCode.ValidatorMissing }),
  );
  view.rerender(form(core.ValidationMode.None));
  view.rerender(form(core.ValidationMode.OnChange));
  await releaseSlots();
  expect(onError).toHaveBeenCalledOnce();
  expect(onValidate).not.toHaveBeenCalled();
});

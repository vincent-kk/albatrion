import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';
import { isValidationPending } from '@/schema-form/__tests__/helpers/isValidationPending';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import * as core from '@/schema-form/core';

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

it.each([
  [core.ValidationMode.None, false],
  [core.ValidationMode.None, true],
  [core.ValidationMode.OnRequest, false],
  [core.ValidationMode.OnRequest, true],
] as const)(
  'drops an in-flight write-triggered verdict after switching to %s (failure=%s)',
  async (mode, failure) => {
    const clock = createValidationFrameClock();
    const ref = createRef<FormHandle>();
    const onError = vi.fn(),
      onValidate = vi.fn(),
      host = vi.fn();
    vi.stubGlobal('reportError', host);
    let asyncRun = false;
    let resolve!: (issues: { dataPath: string; message: string }[]) => void;
    let reject!: (failure: unknown) => void;
    const validate = vi.fn(() =>
      asyncRun
        ? new Promise<{ dataPath: string; message: string }[]>((yes, no) => {
            resolve = yes;
            reject = no;
          })
        : [],
    );
    const validator = {
      compile: () => validate,
      compileGuard: () => () => true,
    };
    const schema = { type: 'string' } as const;
    const form = (validationMode: core.ValidationMode) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue="initial"
        validationMode={validationMode}
        validatorFactory={validator}
        onError={onError}
        onValidate={onValidate}
      >
        <span />
      </Form>
    );
    const view = render(form(core.ValidationMode.OnChange));
    await act(async () => {
      for (const callback of slots.splice(0)) callback();
    });
    asyncRun = true;
    act(() => ref.current!.setValue('current'));
    await act(async () => {
      clock.frame();
      await clock.task();
    });
    expect(validate).toHaveBeenCalledTimes(2);
    expect(isValidationPending(ref.current!.node!)).toBe(true);
    view.rerender(form(mode));
    expect(isValidationPending(ref.current!.node!)).toBe(false);
    onValidate.mockClear();
    await act(async () => {
      if (failure) reject(new Error('late automatic failure'));
      else resolve([{ dataPath: '', message: 'late automatic verdict' }]);
      await clock.task();
    });
    expect(ref.current!.getErrors()).toEqual([]);
    expect(onError).not.toHaveBeenCalled();
    expect(onValidate).not.toHaveBeenCalled();
    expect(host).not.toHaveBeenCalled();
  },
);

import { StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import * as core from '@/schema-form/core';
import { ExternalFormContextProvider as FormProvider } from '@/schema-form/providers/ExternalFormContext';

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

/** Drain only the current batch so an activation cannot recursively consume a later slot. */
const releaseSlots = async () => {
  await act(async () => {
    for (const callback of slots.splice(0)) callback();
    await Promise.resolve();
  });
};

const { None, OnRequest, OnChange } = core.ValidationMode;

it.each([
  [OnChange, None, 0, 0],
  [OnRequest, None, 0, 0],
  [OnChange, OnRequest, 1, 0],
  [None, OnRequest, 1, 0],
  [None, OnChange, 1, 1],
  [OnRequest, OnChange, 1, 1],
] as const)(
  'transitions %s → %s preserve the tree and apply the next policy',
  async (from, to, compiles, verdicts) => {
    const clock = createValidationFrameClock();
    const ref = createRef<FormHandle>();
    const issue = { dataPath: '/name', message: 'invalid' };
    const external = [{ dataPath: '/name', message: 'server' }];
    const validate = vi.fn(() => [issue]);
    const compile = vi.fn(() => validate);
    const validator = { compile, compileGuard: () => () => true };
    const schema = {
      type: 'object',
      properties: { name: { type: 'string' } },
    } as const;
    const form = (validationMode: core.ValidationMode) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={{ name: 'current' }}
        errors={external}
        validationMode={validationMode}
        validatorFactory={validator}
      >
        <span />
      </Form>
    );
    const view = render(form(from));
    await releaseSlots();
    if (from !== None)
      await act(async () => {
        await ref.current!.validate();
      });
    const root = ref.current!.node!;
    const node = ref.current!.findNode('/name')!;
    act(() => node.setState({ [core.FieldNodeState.Edited]: true }));
    const value = root.value,
      state = node.state,
      errors = node.errors;
    validate.mockClear();
    view.rerender(form(to));
    expect(ref.current!.node).toBe(root);
    expect(root.value).toBe(value);
    expect(node.state).toBe(state);
    expect(node.errors).toEqual(to === None ? external : errors);
    expect(validate).not.toHaveBeenCalled();
    await releaseSlots();
    expect(compile).toHaveBeenCalledTimes(from === None ? compiles : 1);
    expect(validate).toHaveBeenCalledTimes(verdicts);
    if (to === OnRequest || to === None) {
      act(() => node.setValue('next'));
      await act(async () => {
        clock.frame();
        await clock.task();
      });
      expect(validate).toHaveBeenCalledTimes(verdicts);
    }
  },
);

it.each([None, OnRequest, OnChange, OnChange | OnRequest])(
  'same effective mode replay does no work (%s)',
  async (mode) => {
    const ref = createRef<FormHandle>();
    const validate = vi.fn(() => []);
    const compile = vi.fn(() => validate);
    const validator = { compile, compileGuard: () => () => true };
    const schema = { type: 'string' } as const;
    const form = (validationMode: core.ValidationMode) => (
      <StrictMode>
        <Form
          ref={ref}
          jsonSchema={schema}
          validationMode={validationMode}
          validatorFactory={validator}
        >
          <span />
        </Form>
      </StrictMode>
    );
    const view = render(form(mode));
    expect(slots).toHaveLength(1);
    await releaseSlots();
    const before = validate.mock.calls.length;
    const errors = ref.current!.node!.errors;
    view.rerender(form(mode === OnChange ? OnChange | OnRequest : mode));
    await releaseSlots();
    expect(validate).toHaveBeenCalledTimes(before);
    expect(ref.current!.node!.errors).toBe(errors);
    expect(compile).toHaveBeenCalledTimes(mode === None ? 0 : 1);
  },
);

it.each(['root', 'subtree', 'automatic', 'subtree-reset'] as const)(
  'activation is replaced only by a full request (%s)',
  async (kind) => {
    const clock = createValidationFrameClock();
    const ref = createRef<FormHandle>();
    const verdict = [
      { dataPath: '/a', message: 'a' },
      { dataPath: '/b', message: 'b' },
    ];
    const validate = vi.fn(() => verdict);
    const validator = {
      compile: () => validate,
      compileGuard: () => () => true,
    };
    const schema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
    } as const;
    const form = (validationMode: core.ValidationMode) => (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={{ a: 'a', b: 'b' }}
        validationMode={validationMode}
        validatorFactory={validator}
      >
        <span />
      </Form>
    );
    const view = render(form(OnRequest));
    await releaseSlots();
    await act(async () => {
      await ref.current!.validate();
    });
    view.rerender(form(None));
    view.rerender(form(OnChange));
    validate.mockClear();
    const a = ref.current!.findNode('/a')!;
    if (kind === 'root' || kind === 'subtree')
      await act(async () => {
        await (kind === 'root' ? ref.current!.node! : a).validate();
      });
    else
      act(() => (kind === 'automatic' ? a.setValue('next') : a.resetSubtree()));
    await act(async () => {
      clock.frame();
      await clock.task();
    });
    await releaseSlots();
    expect(validate).toHaveBeenCalledTimes(kind === 'subtree' ? 2 : 1);
    expect(ref.current!.findNode('/b')!.errors).toEqual([verdict[1]]);
  },
);

it('Provider fallback changes apply without resetting an overridden Form', async () => {
  const ref = createRef<FormHandle>();
  const validate = vi.fn(() => []);
  const validator = { compile: () => validate, compileGuard: () => () => true };
  const schema = { type: 'string' } as const;
  const form = (mode: core.ValidationMode, override?: core.ValidationMode) => (
    <FormProvider validationMode={mode}>
      <Form
        ref={ref}
        jsonSchema={schema}
        validationMode={override}
        validatorFactory={validator}
      >
        <span />
      </Form>
    </FormProvider>
  );
  const view = render(form(None));
  await releaseSlots();
  const root = ref.current!.node;
  view.rerender(form(OnChange));
  await releaseSlots();
  expect(validate).toHaveBeenCalledOnce();
  view.rerender(form(None, OnChange));
  await releaseSlots();
  expect(validate).toHaveBeenCalledOnce();
  expect(ref.current!.node).toBe(root);
});

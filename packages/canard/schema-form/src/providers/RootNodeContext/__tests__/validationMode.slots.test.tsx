import { Suspense, createRef, startTransition, useState } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

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
});
const releaseSlots = async () => {
  await act(async () => {
    for (const callback of slots.splice(0)) callback();
  });
};

it('load, activation and same-root reset share one valid slot', async () => {
  const ref = createRef<FormHandle>();
  const validate = vi.fn(() => []);
  const validator = { compile: () => validate, compileGuard: () => () => true };
  const schema = { type: 'string' } as const;
  const entries = vi.spyOn(core, 'startFieldNodeLoadValidation');
  const form = (mode: core.ValidationMode) => (
    <Form
      ref={ref}
      jsonSchema={schema}
      validationMode={mode}
      validatorFactory={validator}
    >
      <span />
    </Form>
  );
  const view = render(form(core.ValidationMode.None));
  const root = ref.current!.node;
  view.rerender(form(core.ValidationMode.OnChange));
  act(() => ref.current!.reset());
  await releaseSlots();
  expect(entries).toHaveBeenCalledOnce();
  expect(validate).toHaveBeenCalledOnce();
  expect(ref.current!.node).toBe(root);
});

it('switching an unreleased initial load to OnRequest prepares only compilation', async () => {
  const validate = vi.fn(() => []),
    compile = vi.fn(() => validate);
  const validator = { compile, compileGuard: () => () => true };
  const schema = { type: 'string' } as const;
  const form = (mode: core.ValidationMode) => (
    <Form
      jsonSchema={schema}
      validationMode={mode}
      validatorFactory={validator}
    >
      <span />
    </Form>
  );
  const view = render(form(core.ValidationMode.OnChange));
  view.rerender(form(core.ValidationMode.OnRequest));
  await releaseSlots();
  expect(compile).toHaveBeenCalledOnce();
  expect(validate).not.toHaveBeenCalled();
});

it('an abandoned render cannot apply speculative mode or write defaults', async () => {
  const ref = createRef<FormHandle>();
  let setSpeculative!: (value: boolean) => void;
  const pending = new Promise<never>(() => undefined);
  const validate = vi.fn(() => []);
  const validator = { compile: () => validate, compileGuard: () => () => true };
  const schema = {
    type: 'object',
    properties: {
      a: { type: 'string' },
      b: { type: 'string', controls: { derived: '../a' } },
    },
  } as const;
  const Suspend = ({ active }: { active: boolean }) => {
    if (active) throw pending;
    return null;
  };
  const App = () => {
    const [speculative, set] = useState(false);
    setSpeculative = set;
    return (
      <>
        <Form
          ref={ref}
          jsonSchema={schema}
          validationMode={
            speculative
              ? core.ValidationMode.None
              : core.ValidationMode.OnRequest
          }
          disableAutomaticWrites={speculative}
          validatorFactory={validator}
        >
          <span />
        </Form>
        <Suspend active={speculative} />
      </>
    );
  };
  render(
    <Suspense fallback={<span>pending</span>}>
      <App />
    </Suspense>,
  );
  await releaseSlots();
  const handle = ref.current!;
  act(() => startTransition(() => setSpeculative(true)));
  act(() => handle.findNode('/a')!.setValue('committed'));
  await act(async () => {
    await handle.validate();
  });
  expect(handle.findNode('/b')!.value).toBe('committed');
  expect(validate).toHaveBeenCalledOnce();
  act(() => setSpeculative(false));
  expect(handle.node).toBe(ref.current!.node);
});

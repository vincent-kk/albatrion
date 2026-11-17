import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, inject, it, vi } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '@/schema-form';

import { hideCommittedForm } from '../helpers/hideCommittedForm';
import { settleValidation } from '../helpers/settleValidation';

afterEach(cleanup);

it('IR-7 T8 L2 hidden props update onError immediately and other callbacks only after show', async (context) => {
  if (inject('reactMajor') !== '19') context.skip();
  const ref = createRef<FormHandle>();
  const old = {
    onChange: vi.fn(),
    onStateChange: vi.fn(),
    onValidate: vi.fn(),
    onDiagnosticsChange: vi.fn(),
    onError: vi.fn(),
  };
  const next = {
    onChange: vi.fn(),
    onStateChange: vi.fn(),
    onValidate: vi.fn(),
    onDiagnosticsChange: vi.fn(),
    onError: vi.fn(),
  };
  const schema = { type: 'number' } as const;
  const validator = {
    compileGuard: () => () => true,
    compile: () => (value: unknown) => [
      { dataPath: '', message: String(value) },
    ],
  };
  const form = (callbacks: typeof old) => (
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={0}
      validatorFactory={validator}
      validationMode={ValidationMode.OnRequest}
      {...callbacks}
    >
      <span />
    </Form>
  );
  const view = render(hideCommittedForm(form(old), false));
  const handle = ref.current!;
  view.rerender(hideCommittedForm(form(old), true));
  await act(async () => {
    view.rerender(hideCommittedForm(form(next), true));
    await Promise.resolve();
  });
  expect(ref.current).toBeNull();
  act(() => {
    handle.setValue('bad');
    handle.setState({ touched: true });
  });
  await act(async () => {
    await handle.validate();
  });
  act(() => handle.reset());
  for (const key of [
    'onChange',
    'onStateChange',
    'onValidate',
    'onDiagnosticsChange',
  ] as const) {
    expect(old[key]).toHaveBeenCalled();
    expect(next[key]).not.toHaveBeenCalled();
  }
  expect(old.onError).not.toHaveBeenCalled();
  expect(next.onError).toHaveBeenCalledTimes(1);
  view.rerender(hideCommittedForm(form(next), false));
  act(() => {
    handle.setValue(7);
    handle.setState({ touched: false });
  });
  await act(async () => {
    await handle.validate();
  });
  act(() => handle.reset());
  await settleValidation(() => handle.node);
  for (const key of [
    'onChange',
    'onStateChange',
    'onValidate',
    'onDiagnosticsChange',
  ] as const)
    expect(next[key]).toHaveBeenCalled();
});

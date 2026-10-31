import { createRef, useLayoutEffect } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, inject, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type FormHandle,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { readFieldNodeRuntime } from '../helpers/readFieldNodeRuntime';
import { settleValidation } from '../helpers/settleValidation';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it('IR-6 D React18 legacy release preserves a reentrant layout write history (React19 has no legacy root)', async (context) => {
  if (inject('reactMajor') !== '18') context.skip();
  const ref = createRef<FormHandle>();
  let armed = false;
  let writes = 0;
  const Input = ({ node, errorVisible }: FieldInputProps) => {
    useLayoutEffect(() => {
      if (!armed || !errorVisible) return;
      armed = false;
      writes++;
      node.setState({ 4: false });
      node.setValue('abc');
      node.setState({ 4: true });
    }, [node, errorVisible]);
    return <input value={String(node.value)} readOnly />;
  };
  const Renderer = ({
    Input,
    errorVisible,
    errorMessage,
  }: FieldRendererProps) => (
    <>
      <Input />
      <span data-testid="error">{errorVisible ? errorMessage : ''}</span>
    </>
  );
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="ab"
      showError={true}
      FieldRenderer={Renderer}
      fieldInputMap={{ '': Input }}
      validatorFactory={{
        compileGuard: () => () => true,
        compile: () => (value: unknown) =>
          value === 'abc'
            ? new Promise<readonly { dataPath: string; message: string }[]>(
                () => undefined,
              )
            : [{ dataPath: '', message: 'too short' }],
      }}
      formatError={(error) => error.message ?? null}
    />,
    { legacyRoot: true },
  );
  await settleValidation(() => ref.current?.node);
  const clock = createValidationFrameClock();
  act(() => {
    ref.current!.setValue('ac');
    ref.current!.node!.setState({ 4: false });
    ref.current!.node!.setState({ 4: true });
  });
  expect(view.getByTestId('error').textContent).toBe('');
  armed = true;
  await ref.current!.validate();
  expect(writes).toBe(1);
  expect(ref.current!.node!.value).toBe('abc');
  expect(readFieldNodeRuntime(ref.current!.node!).validationPending).toBe(true);
  expect(view.getByTestId('error').textContent).toBe('');
  await act(async () => {
    clock.frame();
    await clock.task();
  });
  expect(view.getByTestId('error').textContent).toBe('');
});

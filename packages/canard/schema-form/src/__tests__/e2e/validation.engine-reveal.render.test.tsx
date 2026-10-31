import { StrictMode, createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type FormHandle,
  FormProvider,
  ShowError,
  useChildFieldErrors,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { settleValidation } from '../helpers/settleValidation';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const Input = ({ errorVisible, errors }: FieldInputProps) => (
  <span data-testid="input-error">
    {errorVisible ? errors[0]?.message : ''}
  </span>
);
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
const validator = {
  compileGuard: () => () => true,
  compile: () => (value: unknown) =>
    value === 'valid' ? [] : [{ dataPath: '', message: 'old error' }],
};
const fixture = async () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue=""
      showError={false}
      FieldRenderer={Renderer}
      fieldInputMap={{ '': Input }}
      validatorFactory={validator}
      formatError={(error) => error.message ?? null}
    />,
  );
  await settleValidation(() => ref.current?.node);
  const clock = createValidationFrameClock();
  return {
    ref,
    view,
    clock,
    revealState: () => ref.current!.node!.setState({ 4: true }),
    revealPolicy: () => ref.current!.showError(),
  };
};
it('IR-6 Y1 a standalone ErrorVisible reveal followed by a same-task value write holds the old verdict', async () => {
  const f = await fixture();
  act(f.revealState);
  expect(f.view.getByTestId('error').textContent).toBe('');
  act(() => f.ref.current!.setValue('valid'));
  expect(f.view.getByTestId('error').textContent).toBe('');
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
  expect(f.view.getByTestId('error').textContent).toBe('');
});
it('IR-6 Y1 handle showError followed by a same-task value write holds through its policy baseline', async () => {
  const f = await fixture();
  act(f.revealPolicy);
  expect(f.view.getByTestId('error').textContent).toBe('');
  act(() => f.ref.current!.setValue('valid'));
  expect(f.view.getByTestId('error').textContent).toBe('');
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
});
it('IR-6 Y1 a state reveal in another task before the same paint still holds a subsequent write', async () => {
  const f = await fixture();
  act(f.revealState);
  await f.clock.task();
  act(() => f.ref.current!.setValue('valid'));
  expect(f.view.getByTestId('error').textContent).toBe('');
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
});
it('IR-6 Y1 a policy reveal in another task before the same paint still holds a subsequent write', async () => {
  const f = await fixture();
  act(f.revealPolicy);
  await f.clock.task();
  act(() => f.ref.current!.setValue('valid'));
  expect(f.view.getByTestId('error').textContent).toBe('');
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
});
it('IR-6 Y1 a painted state reveal keeps its eligible error through the next value verdict', async () => {
  const f = await fixture();
  act(f.revealState);
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
  act(() => f.ref.current!.setValue('valid'));
  expect(f.view.getByTestId('error').textContent).toBe('old error');
  await act(async () => {
    f.clock.frame();
    expect(f.view.getByTestId('error').textContent).toBe('old error');
    await f.clock.task();
  });
  expect(f.view.getByTestId('error').textContent).toBe('');
});
it('IR-6 Y1 a painted policy reveal keeps its eligible error through the next value verdict', async () => {
  const f = await fixture();
  act(f.revealPolicy);
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
  act(() => f.ref.current!.setValue('valid'));
  expect(f.view.getByTestId('error').textContent).toBe('old error');
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
});
it('IR-6 H a reveal recorded inside rAF stays held through the following pending write', async () => {
  const f = await fixture();
  requestAnimationFrame(() => f.revealState());
  act(() => f.clock.frame());
  expect(f.view.getByTestId('error').textContent).toBe('');
  act(() => f.ref.current!.setValue('valid'));
  expect(f.view.getByTestId('error').textContent).toBe('');
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
});
it('IR-6 Y3 the parent own entry cannot reveal a child aggregate until its current verdict', async () => {
  const ref = createRef<FormHandle>();
  const Branch = ({ node, ChildFields }: FieldInputProps) => {
    const result = useChildFieldErrors(node);
    return (
      <>
        <span data-testid="aggregate">{result.errorMessage}</span>
        {ChildFields.map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    );
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'object', properties: { a: { type: 'string' } } }}
      defaultValue={{ a: '' }}
      showError={false}
      fieldInputDefinitions={[
        { test: { type: 'object' }, Component: Branch },
        { test: () => true, Component: Input },
      ]}
      validatorFactory={{
        compileGuard: () => () => true,
        compile: () => () => [{ dataPath: '/a', message: 'child error' }],
      }}
      formatError={(error) => error.message ?? null}
    />,
  );
  await settleValidation(() => ref.current?.node);
  const clock = createValidationFrameClock();
  act(() => {
    ref.current!.setValue({ a: 'new' });
    ref.current!.setState({ 4: true });
  });
  expect(view.getByTestId('aggregate').textContent).toBe('');
  await act(async () => {
    clock.frame();
    await clock.task();
  });
  expect(view.getByTestId('aggregate').textContent).toBe('child error');
});
it('IR-6 Y1 a second React display uses an already eligible baseline during pending', async () => {
  const ref = createRef<FormHandle>();
  const props = {
    jsonSchema: { type: 'string' as const },
    defaultValue: '',
    showError: true,
    validatorFactory: validator,
    fieldInputMap: { '': Input },
  };
  const view = render(
    <Form ref={ref} {...props}>
      <Form.Input path="" />
    </Form>,
  );
  await settleValidation(() => ref.current?.node);
  const clock = createValidationFrameClock();
  act(() => ref.current!.setValue('valid'));
  view.rerender(
    <Form ref={ref} {...props}>
      <Form.Input key="one" path="" />
      <Form.Input key="two" path="" />
    </Form>,
  );
  expect(
    view.getAllByTestId('input-error').map((item) => item.textContent),
  ).toEqual(['old error', 'old error']);
  await act(async () => {
    clock.frame();
    await clock.task();
  });
});

it('IR-6 Y1 a retained handle records the current painted showError policy', async () => {
  const f = await fixture();
  const retained = f.ref.current!;
  act(() => retained.showError());
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
  act(() => retained.showError());
  act(() => retained.setValue('valid'));
  expect(f.view.getByTestId('error').textContent).toBe('old error');
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
});
it('IR-6 Y1 StrictMode keeps an eligible verdict through replay and the next pending frame', async () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <StrictMode>
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        defaultValue=""
        showError={true}
        FieldRenderer={Renderer}
        fieldInputMap={{ '': Input }}
        validatorFactory={validator}
        formatError={(error) => error.message ?? null}
      />
    </StrictMode>,
  );
  await settleValidation(() => ref.current?.node);
  expect(view.getByTestId('error').textContent).toBe('old error');
  const clock = createValidationFrameClock();
  act(() => ref.current!.setValue('valid'));
  expect(view.getByTestId('error').textContent).toBe('old error');
  await act(async () => {
    clock.frame();
    expect(view.getByTestId('error').textContent).toBe('old error');
    await clock.task();
  });
  expect(view.getByTestId('error').textContent).toBe('');
});
it('IR-6 H a FormProvider policy reveal holds the previous pending verdict', async () => {
  const ref = createRef<FormHandle>();
  const form = (
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue=""
      FieldRenderer={Renderer}
      fieldInputMap={{ '': Input }}
      validatorFactory={validator}
      formatError={(error) => error.message ?? null}
    />
  );
  const view = render(<FormProvider showError={false}>{form}</FormProvider>);
  await settleValidation(() => ref.current?.node);
  const clock = createValidationFrameClock();
  act(() => ref.current!.setValue('valid'));
  view.rerender(<FormProvider showError={true}>{form}</FormProvider>);
  expect(view.getByTestId('error').textContent).toBe('');
  await act(async () => {
    clock.frame();
    await clock.task();
  });
});
it.each([true, false])(
  'IR-6 Y1 standalone blur painted=%s preserves other-field lag or holds the same-field edit',
  async (painted) => {
    const ref = createRef<FormHandle>();
    const Text = ({ path }: FieldInputProps) => <input aria-label={path} />;
    const Branch = ({ ChildFields }: FieldInputProps) => (
      <>
        {ChildFields.map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    );
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: { a: { type: 'string' }, b: { type: 'string' } },
        }}
        defaultValue={{ a: '', b: '' }}
        showError={ShowError.Touched}
        FieldRenderer={({ Input, path, errorVisible, errorMessage }) => (
          <>
            <Input />
            <span data-testid={'blur-error:' + path}>
              {errorVisible ? errorMessage : ''}
            </span>
          </>
        )}
        fieldInputDefinitions={[
          { test: { type: 'object' }, Component: Branch },
          { test: () => true, Component: Text },
        ]}
        validatorFactory={{
          compileGuard: () => () => true,
          compile: () => () => [{ dataPath: '/a', message: 'first error' }],
        }}
        formatError={(error) => error.message ?? null}
      />,
    );
    await settleValidation(() => ref.current?.node);
    const clock = createValidationFrameClock();
    fireEvent.blur(view.getByLabelText('/a'));
    await act(async () => {
      clock.frame();
      await clock.task();
    });
    expect(ref.current!.findNode('/a')!.state[2]).toBe(true);
    expect(view.getByTestId('blur-error:/a').textContent).toBe('');
    if (painted)
      await act(async () => {
        clock.frame();
        await clock.task();
      });
    act(() => ref.current!.findNode(painted ? '/b' : '/a')!.setValue('new'));
    expect(view.getByTestId('blur-error:/a').textContent).toBe(
      painted ? 'first error' : '',
    );
    await act(async () => {
      clock.frame();
      expect(view.getByTestId('blur-error:/a').textContent).toBe(
        painted ? 'first error' : '',
      );
      await clock.task();
    });
    expect(view.getByTestId('blur-error:/a').textContent).toBe('first error');
  },
);

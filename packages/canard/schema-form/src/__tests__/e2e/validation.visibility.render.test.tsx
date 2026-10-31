import { createRef, useLayoutEffect } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type FormHandle,
  ShowError,
  ValidationMode,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { observeErrorSink } from '../helpers/observeErrorSink';
import { settleValidation } from '../helpers/settleValidation';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const commits: { kind: string; visible: boolean; message?: unknown }[] = [];
const Input = ({ value, onChange, errorVisible }: FieldInputProps) => {
  useLayoutEffect(() => {
    commits.push({ kind: 'input', visible: errorVisible });
  });
  return (
    <input
      aria-label="value"
      value={String(value ?? '')}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};
const Renderer = ({
  Input,
  errorVisible,
  errorMessage,
}: FieldRendererProps) => {
  useLayoutEffect(() => {
    commits.push({
      kind: 'renderer',
      visible: errorVisible,
      message: errorMessage,
    });
  });
  return (
    <>
      <Input />
      <span data-testid="error">{errorVisible ? errorMessage : null}</span>
    </>
  );
};

it('IR-6 a touched field never commits its previous error when the first character makes it valid', async () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue=""
      showError={ShowError.DirtyTouched}
      FieldRenderer={Renderer}
      fieldInputDefinitions={[{ test: () => true, Component: Input }]}
      formatError={(error) => error.message ?? null}
      validatorFactory={{
        compile: () => (value) =>
          value ? [] : [{ dataPath: '', message: 'required' }],
        compileGuard: () => () => true,
      }}
    />,
  );
  await settleValidation(() => ref.current?.node);
  act(() => ref.current!.node!.setState({ 2: true }));
  commits.length = 0;
  fireEvent.change(view.getByLabelText('value'), { target: { value: 'a' } });
  expect(view.getByTestId('error').textContent).toBe('');
  expect(commits.filter((commit) => commit.visible)).toEqual([]);
  await settleValidation(() => ref.current?.node);
  expect(view.getByTestId('error').textContent).toBe('');
  expect(commits.some((commit) => commit.message === 'required')).toBe(false);
});

it.each(['required', 'changed'])(
  'IR-6 a newly revealed %s message appears only after the verdict',
  async (next) => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        defaultValue=""
        FieldRenderer={Renderer}
        fieldInputMap={{ '': Input }}
        formatError={(error) => error.message ?? null}
        validatorFactory={{
          compile: () => (value) => [
            { dataPath: '', message: value ? next : 'required' },
          ],
          compileGuard: () => () => true,
        }}
      />,
    );
    await settleValidation(() => ref.current?.node);
    act(() => ref.current!.node!.setState({ 2: true }));
    commits.length = 0;
    fireEvent.change(view.getByLabelText('value'), { target: { value: 'a' } });
    expect(view.getByTestId('error').textContent).toBe('');
    expect(commits.filter((commit) => commit.visible)).toEqual([]);
    await settleValidation(() => ref.current?.node);
    expect(view.getByTestId('error').textContent).toBe(next);
    expect(
      commits.some((commit) => commit.kind === 'input' && commit.visible),
    ).toBe(true);
    if (next === 'changed')
      expect(commits.some((commit) => commit.message === 'required')).toBe(
        false,
      );
  },
);

it('IR-6 an already visible error stays visible until its valid verdict, and hiding is immediate', async () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue=""
      FieldRenderer={Renderer}
      fieldInputMap={{ '': Input }}
      formatError={(error) => error.message ?? null}
      validatorFactory={{
        compile: () => (value) =>
          value ? [] : [{ dataPath: '', message: 'required' }],
        compileGuard: () => () => true,
      }}
    />,
  );
  await settleValidation(() => ref.current?.node);
  act(() => ref.current!.node!.setState({ 1: true, 2: true }));
  expect(view.getByTestId('error').textContent).toBe('required');
  fireEvent.change(view.getByLabelText('value'), { target: { value: 'a' } });
  expect(view.getByTestId('error').textContent).toBe('required');
  act(() => ref.current!.node!.setState({ 2: false }));
  expect(view.getByTestId('error').textContent).toBe('');
  await settleValidation(() => ref.current?.node);
  expect(view.getByTestId('error').textContent).toBe('');
});

it.each([ValidationMode.None, ValidationMode.OnRequest])(
  'IR-6 mode %s never holds a newly enabled external error',
  async (mode) => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        validationMode={mode}
        onError={() => undefined}
        errors={[{ dataPath: '', message: 'external' }]}
        FieldRenderer={Renderer}
        fieldInputMap={{ '': Input }}
        formatError={(error) => error.message ?? null}
      />,
    );
    act(() => {
      ref.current!.setValue('a');
      ref.current!.showError();
    });
    expect(view.getByTestId('error').textContent).toBe('external');
  },
);

it('IR-6 no validator releases external errors revealed by showError after a write', async () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      onError={() => undefined}
      errors={[{ dataPath: '', message: 'external' }]}
      FieldRenderer={Renderer}
      fieldInputMap={{ '': Input }}
      formatError={(error) => error.message ?? null}
    />,
  );
  await settleValidation(() => ref.current?.node);
  act(() => {
    ref.current!.setValue('a');
    ref.current!.showError();
  });
  expect(view.getByTestId('error').textContent).toBe('');
  await settleValidation(() => ref.current?.node);
  expect(view.getByTestId('error').textContent).toBe('external');
});

it('IR-6 submit releases a touched field hold using its immediate root verdict', async () => {
  const ref = createRef<FormHandle>();
  const submitted = vi.fn();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue=""
      FieldRenderer={Renderer}
      fieldInputMap={{ '': Input }}
      formatError={(error) => error.message ?? null}
      onSubmit={submitted}
      validatorFactory={{
        compile: () => (value) =>
          value ? [] : [{ dataPath: '', message: 'required' }],
        compileGuard: () => () => true,
      }}
    />,
  );
  await settleValidation(() => ref.current?.node);
  act(() => ref.current!.node!.setState({ 2: true }));
  act(() => ref.current!.setValue('valid'));
  await act(async () => {
    await ref.current!.submit();
  });
  expect(submitted).toHaveBeenCalled();
  expect(view.getByTestId('error').textContent).toBe('');
});

it('IR-6 Touched mode holds the previous error when blur writes a trimmed value', async () => {
  const ref = createRef<FormHandle>();
  const TrimmingInput = ({ value, onChange }: FieldInputProps) => (
    <input
      aria-label="value"
      value={String(value ?? '')}
      onBlur={() => {
        onChange('valid');
        ref.current!.node!.setState({ 2: true });
      }}
      onChange={(event) => onChange(event.target.value)}
    />
  );
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue=" "
      showError={ShowError.Touched}
      FieldRenderer={Renderer}
      fieldInputMap={{ '': TrimmingInput }}
      formatError={(error) => error.message ?? null}
      validatorFactory={{
        compile: () => (value) =>
          value === 'valid' ? [] : [{ dataPath: '', message: 'required' }],
        compileGuard: () => () => true,
      }}
    />,
  );
  await settleValidation(() => ref.current?.node);
  commits.length = 0;
  fireEvent.blur(view.getByLabelText('value'));
  expect(view.getByTestId('error').textContent).toBe('');
  expect(commits.some((commit) => commit.message === 'required')).toBe(false);
  await settleValidation(() => ref.current?.node);
  expect(view.getByTestId('error').textContent).toBe('');
});

it.each(['execute', 'compile'] as const)(
  'IR-6 %s failure releases a newly revealed external error',
  async (mode) => {
    const ref = createRef<FormHandle>();
    const sink = observeErrorSink();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        defaultValue="old"
        onError={() => undefined}
        errors={[{ dataPath: '', message: 'external' }]}
        FieldRenderer={Renderer}
        fieldInputMap={{ '': Input }}
        formatError={(error) => error.message ?? null}
        validatorFactory={{
          compile: () => {
            if (mode === 'compile') throw new Error('compile');
            return (value) => {
              if (value === 'new') throw new Error('execute');
              return [];
            };
          },
          compileGuard: () => () => true,
        }}
      />,
    );
    if (mode === 'execute') await settleValidation(() => ref.current?.node);
    act(() => {
      ref.current!.setValue('new');
      ref.current!.showError();
    });
    expect(view.getByTestId('error').textContent).toBe('');
    await settleValidation(() => ref.current?.node);
    expect(view.getByTestId('error').textContent).toBe('external');
    expect(sink.errors().length).toBeGreaterThan(0);
  },
);

it('IR-6 a newly enabled display during synchronous continuous input reveals at the next 100ms cap', async () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="old"
      FieldRenderer={Renderer}
      fieldInputMap={{ '': Input }}
      formatError={(error) => error.message ?? null}
      validatorFactory={{
        compile: () => () => [{ dataPath: '', message: 'invalid' }],
        compileGuard: () => () => true,
      }}
    />,
  );
  await settleValidation(() => ref.current?.node);
  const clock = createValidationFrameClock();
  vi.spyOn(performance, 'now').mockImplementation(clock.now);
  for (let frame = 0; frame < 8; frame++) {
    await act(async () => {
      ref.current!.setValue(String(frame));
      if (frame === 1) ref.current!.showError();
      clock.frame();
      await clock.task();
    });
    if (frame > 0 && frame < 7)
      expect(view.getByTestId('error').textContent).toBe('');
  }
  expect(view.getByTestId('error').textContent).toBe('invalid');
});

it('IR-6 one settled delivery in 2000 fields rerenders only the holding leaf displays', async () => {
  const ref = createRef<FormHandle>();
  const counts = new Map<string, number>();
  const CountingInput = ({
    node,
    ChildFields,
    errorVisible,
  }: FieldInputProps) => {
    useLayoutEffect(() => {
      counts.set(node.path, (counts.get(node.path) ?? 0) + 1);
    });
    return ChildFields.length ? (
      <>
        {ChildFields.map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    ) : (
      <span data-testid={node.path}>{String(errorVisible)}</span>
    );
  };
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: Object.fromEntries(
          Array.from({ length: 2000 }, (_, index) => [
            'f' + index,
            { type: 'string' },
          ]),
        ),
      }}
      fieldInputDefinitions={[{ test: () => true, Component: CountingInput }]}
      validatorFactory={{
        compile: () => () => [{ dataPath: '/f0', message: 'invalid' }],
        compileGuard: () => () => true,
      }}
    />,
  );
  await settleValidation(() => ref.current?.node);
  act(() => {
    const leaf = ref.current!.findNode('/f0')!;
    leaf.setValue('new');
    leaf.setState({ 4: true });
  });
  counts.clear();
  await settleValidation(() => ref.current?.node);
  expect(counts.get('/f0')).toBe(1);
  expect(
    [...counts.keys()].filter((path) => path !== '' && path !== '/f0'),
  ).toEqual([]);
});

it.each([ValidationMode.None, ValidationMode.OnRequest])(
  'IR-6 replacement reset switching to mode %s releases a visible hold',
  async (mode) => {
    const ref = createRef<FormHandle>();
    const validator = {
      compile: () => () => [],
      compileGuard: () => () => true,
    };
    const props = {
      jsonSchema: { type: 'string' } as const,
      validatorFactory: validator,
      errors: [{ dataPath: '', message: 'external' }],
      FieldRenderer: Renderer,
      fieldInputMap: { '': Input },
      formatError: (error: { message?: string }) => error.message ?? null,
    };
    const view = render(<Form ref={ref} {...props} />);
    await settleValidation(() => ref.current?.node);
    act(() => {
      ref.current!.setValue('new');
      ref.current!.showError();
    });
    expect(view.getByTestId('error').textContent).toBe('');
    view.rerender(
      <Form
        ref={ref}
        {...props}
        validationMode={mode}
        validatorFactory={{ ...validator }}
      />,
    );
    act(() => {
      ref.current!.reset();
      ref.current!.showError();
    });
    expect(view.getByTestId('error').textContent).toBe('external');
    await settleValidation(() => ref.current?.node);
  },
);

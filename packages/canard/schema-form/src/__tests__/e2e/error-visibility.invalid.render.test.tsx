import { StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  ErrorVisibility,
  FieldNodeState,
  type FieldRendererProps,
  Form,
  FormErrorCode,
  type FormHandle,
  FormProvider,
  type JSONSchema,
  ValidationMode,
} from '@/schema-form';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const schema = { type: 'string' } as const;
const validator = { compile: () => () => [], compileGuard: () => () => true };
const Renderer = ({ Input, errorVisible }: FieldRendererProps) => (
  <>
    <Input />
    <span data-testid="visible">{String(errorVisible)}</span>
  </>
);

it.each([true, 4, 'unknown'])(
  'reports invalid initial %s once at commit and recovers with a valid policy',
  (invalid) => {
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    const host = vi.fn();
    vi.stubGlobal('reportError', host);
    const element = (policy: unknown) => (
      <StrictMode>
        <Form
          ref={ref}
          jsonSchema={schema}
          validatorFactory={validator}
          validationMode={ValidationMode.OnRequest}
          FieldRenderer={Renderer}
          errorVisibility={policy as ErrorVisibility}
          onError={onError}
        />
      </StrictMode>
    );
    const view = render(element(invalid));
    expect(ref.current!.node).toBeUndefined();
    expect(view.getByRole('alert').textContent).toBe('Unable to load form.');
    view.rerender(element(invalid));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toMatchObject({
      code: FormErrorCode.InvalidErrorVisibility,
      origin: 'load',
    });
    expect(host).toHaveBeenCalledTimes(1);
    view.rerender(element(ErrorVisibility.Always));
    expect(ref.current!.node).toBeDefined();
    expect(view.queryByRole('alert')).toBeNull();
    expect(view.getByTestId('visible').textContent).toBe('true');
  },
);

it('an invalid live value keeps the tree and last valid policy; recovery applies live', () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  vi.stubGlobal('reportError', vi.fn());
  const element = (policy: unknown) => (
    <Form
      ref={ref}
      jsonSchema={schema}
      validatorFactory={validator}
      validationMode={ValidationMode.OnRequest}
      FieldRenderer={Renderer}
      errorVisibility={policy as ErrorVisibility}
      onError={onError}
    />
  );
  const view = render(element(ErrorVisibility.Always));
  const node = ref.current!.node!;
  act(() => {
    node.setValue('kept');
    node.setState({ [FieldNodeState.Edited]: true });
  });
  const state = node.state;
  const input = view.container.querySelector('input');
  view.rerender(element(false));
  expect(view.getByTestId('visible').textContent).toBe('true');
  view.rerender(element(false));
  expect(onError).toHaveBeenCalledTimes(1);
  view.rerender(element(ErrorVisibility.Never));
  expect(view.getByTestId('visible').textContent).toBe('false');
  expect(ref.current!.node).toBe(node);
  expect(view.container.querySelector('input')).toBe(input);
  expect(node.value).toBe('kept');
  expect(node.state).toBe(state);
  view.rerender(element(false));
  expect(onError).toHaveBeenCalledTimes(2);
  expect(
    onError.mock.calls.every(
      ([record]) =>
        record.code === FormErrorCode.InvalidErrorVisibility &&
        record.origin === 'load',
    ),
  ).toBe(true);
});

it('invalid inherited Provider policy follows the same commit reporting and recovery path', () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  vi.stubGlobal('reportError', vi.fn());
  const element = (policy: unknown) => (
    <FormProvider errorVisibility={policy as ErrorVisibility}>
      <Form
        ref={ref}
        jsonSchema={schema}
        validatorFactory={validator}
        onError={onError}
        validationMode={ValidationMode.OnRequest}
      />
    </FormProvider>
  );
  const view = render(element('bad'));
  expect(ref.current!.node).toBeUndefined();
  view.rerender(element(ErrorVisibility.Never));
  expect(ref.current!.node).toBeDefined();
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0][0].code).toBe(
    FormErrorCode.InvalidErrorVisibility,
  );
});

it('a masked Provider update does not report the same invalid Form value again', () => {
  const onError = vi.fn();
  vi.stubGlobal('reportError', vi.fn());
  const element = (provider: ErrorVisibility) => (
    <FormProvider errorVisibility={provider}>
      <Form
        jsonSchema={schema}
        validatorFactory={validator}
        onError={onError}
        errorVisibility={false as unknown as ErrorVisibility}
      />
    </FormProvider>
  );
  const view = render(element(ErrorVisibility.Always));
  view.rerender(element(ErrorVisibility.Never));
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0][0].code).toBe(
    FormErrorCode.InvalidErrorVisibility,
  );
});

it('policy recovery with an invalid schema keeps the load fallback and the handle', () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  vi.stubGlobal('reportError', vi.fn());
  const invalidSchema = { type: 'unsupported' } as unknown as JSONSchema;
  const element = (policy: unknown) => (
    <Form
      ref={ref}
      jsonSchema={invalidSchema}
      errorVisibility={policy as ErrorVisibility}
      onError={onError}
    />
  );
  const view = render(element(false));
  view.rerender(element(ErrorVisibility.Always));
  expect(ref.current).not.toBeNull();
  expect(ref.current!.node).toBeUndefined();
  expect(view.getByRole('alert').textContent).toBe('Unable to load form.');
  view.rerender(element(ErrorVisibility.Always));
  expect(
    onError.mock.calls.filter(
      ([record]) => record.code === FormErrorCode.InvalidErrorVisibility,
    ),
  ).toHaveLength(1);
});

it('applies a validator replacement deferred by an invalid live policy when the policy recovers', async () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  vi.stubGlobal('reportError', vi.fn());
  const first = {
    compile: () => () => [{ dataPath: '', message: 'first' }],
    compileGuard: () => () => true,
  };
  const second = {
    compile: () => () => [{ dataPath: '', message: 'second' }],
    compileGuard: () => () => true,
  };
  const element = (policy: unknown, validatorFactory: typeof first) => (
    <Form
      ref={ref}
      jsonSchema={schema}
      validatorFactory={validatorFactory}
      validationMode={ValidationMode.OnRequest}
      errorVisibility={policy as ErrorVisibility}
      onError={onError}
    />
  );
  const view = render(element(ErrorVisibility.Always, first));
  const root = ref.current!.node!;
  view.rerender(element(false, second));
  expect(ref.current!.node).toBe(root);
  view.rerender(element(ErrorVisibility.Always, second));
  expect(ref.current!.node).not.toBe(root);
  await act(async () => {
    expect(await ref.current!.validate()).toEqual([
      { dataPath: '', message: 'second' },
    ]);
  });
  expect(
    onError.mock.calls.filter(
      ([record]) => record.code === FormErrorCode.InvalidErrorVisibility,
    ),
  ).toHaveLength(1);
});

import { StrictMode, createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  FieldNodeState,
  Form,
  FormErrorCode,
  type FormHandle,
  type FormProps,
  FormProvider,
  ValidationMode,
} from '@/schema-form';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const schema = {
  type: 'object',
  properties: { a: { type: 'string' }, b: { type: 'string' } },
} as const;
const errors = [{ dataPath: '/a', message: 'external' }];
const A = ({ path, defaultValue, onChange }: FieldInputProps) => (
  <input
    aria-label={path}
    data-kind="a"
    defaultValue={defaultValue as string}
    onChange={(event) => onChange(event.target.value)}
  />
);
const B = ({ path, defaultValue }: FieldInputProps) => (
  <input
    aria-label={path}
    data-kind="b"
    defaultValue={defaultValue as string}
  />
);

/** Observe public state and DOM across configuration-only rerenders. */
const fixture = (props: Partial<FormProps> = {}) => {
  const ref = createRef<FormHandle>();
  const element = (next: Partial<FormProps>) => (
    <Form
      ref={ref}
      jsonSchema={schema}
      errors={errors}
      defaultValue={{ a: 'saved', b: 'peer' }}
      validationMode={ValidationMode.None}
      {...next}
    />
  );
  const view = render(element(props));
  act(() =>
    ref.current!.findNode('/a')!.setState({
      [FieldNodeState.Edited]: true,
      [FieldNodeState.Touched]: true,
    }),
  );
  return {
    ref,
    view,
    rerender: (next: Partial<FormProps>) => view.rerender(element(next)),
  };
};

it('swaps only the input whose selected component changes and preserves values, state and external errors', () => {
  const f = fixture({ fieldInputMap: { '/a': A, '/b': A } });
  const root = f.ref.current!.node;
  const node = f.ref.current!.findNode('/a')!;
  fireEvent.change(f.view.getByLabelText('/a'), {
    target: { value: 'edited' },
  });
  act(() => node.setExternalErrors(errors));
  const state = node.state;
  const issues = node.errors;
  const a = f.view.getByLabelText('/a');
  const b = f.view.getByLabelText('/b');
  f.rerender({ fieldInputMap: { '/a': B, '/b': A } });
  expect(f.view.getByLabelText('/a').getAttribute('data-kind')).toBe('b');
  expect(f.view.getByLabelText('/a')).not.toBe(a);
  expect(f.view.getByLabelText('/b')).toBe(b);
  expect(f.ref.current!.node).toBe(root);
  expect(node.state).toBe(state);
  expect(node.errors).toBe(issues);
  expect(f.ref.current!.getValue()).toEqual({ a: 'edited', b: 'peer' });
  expect((f.view.getByLabelText('/a') as HTMLInputElement).value).toBe(
    'edited',
  );
});

it('keeps every input DOM when an unrelated map key changes', () => {
  const f = fixture({ fieldInputMap: { '/a': A, '/b': A, '/unused': A } });
  const inputs = Array.from(f.view.container.querySelectorAll('input'));
  f.rerender({ fieldInputMap: { '/a': A, '/b': A, '/unused': B } });
  Array.from(f.view.container.querySelectorAll('input')).forEach(
    (input, index) => expect(input).toBe(inputs[index]),
  );
});

it.each(['form', 'provider'] as const)(
  'reselects %s definitions and retains identical selected components',
  (owner) => {
    const ref = createRef<FormHandle>();
    const definitions = (Component: typeof A) => [
      { test: { path: '/a' }, Component },
      { test: { path: '/b' }, Component: A },
    ];
    const element = (fieldInputDefinitions: ReturnType<typeof definitions>) => (
      <FormProvider
        {...(owner === 'provider' ? { fieldInputDefinitions } : {})}
      >
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue={{ a: 'saved', b: 'peer' }}
          validationMode={ValidationMode.None}
          {...(owner === 'form' ? { fieldInputDefinitions } : {})}
        />
      </FormProvider>
    );
    const view = render(element(definitions(A)));
    const root = ref.current!.node;
    const b = view.getByLabelText('/b');
    view.rerender(element(definitions(B)));
    expect(view.getByLabelText('/a').getAttribute('data-kind')).toBe('b');
    expect(view.getByLabelText('/b')).toBe(b);
    const a = view.getByLabelText('/a');
    view.rerender(element(definitions(B)));
    expect(view.getByLabelText('/a')).toBe(a);
    expect(ref.current!.node).toBe(root);
    expect(ref.current!.getValue()).toEqual({ a: 'saved', b: 'peer' });
  },
);

it('retains the adapter and DOM when the same component moves from map to definition', () => {
  const f = fixture({ fieldInputMap: { '/a': A, '/b': A } });
  const a = f.view.getByLabelText('/a');
  f.rerender({
    fieldInputDefinitions: [{ test: { type: 'string' }, Component: A }],
  });
  expect(f.view.getByLabelText('/a')).toBe(a);
});

it.each([false, true])(
  'reports each new invalid map once and preserves the last valid input (StrictMode=%s)',
  (strict) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('reportError', vi.fn());
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    const element = (fieldInputMap: FormProps['fieldInputMap']) => {
      const form = (
        <Form
          ref={ref}
          jsonSchema={schema}
          fieldInputMap={fieldInputMap}
          onError={onError}
          validationMode={ValidationMode.None}
        />
      );
      return strict ? <StrictMode>{form}</StrictMode> : form;
    };
    const view = render(element({ '/a': A }));
    const root = ref.current!.node;
    const input = view.getByLabelText('/a');
    const invalid = { '^/**': B };
    view.rerender(element(invalid));
    view.rerender(element(invalid));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenLastCalledWith(
      expect.objectContaining({
        code: FormErrorCode.FieldInputMap,
        origin: 'load',
      }),
    );
    expect(view.getByLabelText('/a')).toBe(input);
    expect(ref.current!.node).toBe(root);
    view.rerender(element({ '^/next/**': B }));
    expect(onError).toHaveBeenCalledTimes(2);
    view.rerender(element({ '/a': B }));
    expect(view.getByLabelText('/a').getAttribute('data-kind')).toBe('b');
    expect(ref.current!.node).toBe(root);
  },
);

it('recovers an invalid initial map when a valid map arrives', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal('reportError', vi.fn());
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  const element = (fieldInputMap: FormProps['fieldInputMap']) => (
    <Form
      ref={ref}
      jsonSchema={schema}
      fieldInputMap={fieldInputMap}
      onError={onError}
      validationMode={ValidationMode.None}
    />
  );
  const view = render(element({ '^/**': A }));
  expect(ref.current!.node).toBeUndefined();
  view.rerender(element({ '/a': A }));
  expect(view.getByLabelText('/a')).toBeTruthy();
  expect(ref.current!.node).toBeDefined();
  expect(onError).toHaveBeenCalledTimes(1);
});

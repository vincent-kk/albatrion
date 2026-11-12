import { createRef, useLayoutEffect, useRef, useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { readFieldNodeRuntime } from '@/schema-form/__tests__/helpers/readFieldNodeRuntime';
import { releaseFieldNodeRevealHistory } from '@/schema-form/__tests__/helpers/releaseFieldNodeRevealHistory';
import { settleValidation } from '@/schema-form/__tests__/helpers/settleValidation';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import { isArrayNode } from '@/schema-form/core';
import type { FieldNode } from '@/schema-form/core';
import {
  type ErrorMessageRendererProps,
  ErrorVisibility,
  type FieldInputProps,
  type FieldRendererProps,
  type InputRendererProps,
  type LabelRendererProps,
} from '@/schema-form/types';

import { useFieldErrors } from '../fieldNode/useFieldErrors';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it.each(['input', 'frame', 'label', 'error'] as const)(
  'matches the group through eligibility, edits, release and policy changes in %s',
  async (role) => {
    const ref = createRef<FormHandle>();
    const expected = new Map<string, FieldRendererProps>();
    const actual = new Map<string, ReturnType<typeof useFieldErrors>>();
    const useObservation = (node: FieldNode, owner: typeof role) => {
      const result = useFieldErrors(node);
      if (role === owner) actual.set(node.path, result);
    };
    const Input = (props: FieldInputProps) => {
      useObservation(props.node, 'input');
      return (
        <input
          id={props.path}
          value={props.value ?? ''}
          onChange={(event) => props.onChange(event.target.value)}
        />
      );
    };
    const Frame = ({ node, children }: InputRendererProps) => {
      useObservation(node, 'frame');
      return <section>{children}</section>;
    };
    const Label = ({ node, children }: LabelRendererProps) => {
      useObservation(node, 'label');
      return <label>{children}</label>;
    };
    const Error = ({ node }: ErrorMessageRendererProps) => {
      useObservation(node, 'error');
      return null;
    };
    const Group = (props: FieldRendererProps) => {
      expected.set(props.node.path, props);
      useLayoutEffect(() => {
        const result = actual.get('/a');
        const group = expected.get('/a');
        if (result && group && group.node.isPresent) {
          expect(result.errors).toBe(group.errors);
          expect(result.errorVisible).toBe(group.errorVisible);
          expect(result.errorMessage).toBe(group.errorMessage);
          expect(result.formatError).toBe(group.formatError);
        }
      });
      return props.isRoot ? (
        <props.Input unwrapped />
      ) : (
        <>
          <props.Label />
          <props.Input />
          <props.ErrorMessage />
        </>
      );
    };
    const schema = {
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        a: { type: 'string', controls: { visible: '../show === true' } },
      },
    } as const;
    const validator = {
      compile: () => () => [{ dataPath: '/a', message: 'bad' }],
      compileGuard: () => () => true,
    };
    const definitions = [
      { test: { type: 'string' as const }, Component: Input, controlled: true },
    ];
    const props = {
      ref,
      jsonSchema: schema,
      defaultValue: { show: true, a: '' },
      validatorFactory: validator,
      fieldInputDefinitions: definitions,
      FieldRenderer: Group,
      InputRenderer: Frame,
      LabelRenderer: Label,
      ErrorMessageRenderer: Error,
    };
    const view = render(<Form {...props} />);
    await settleValidation(() => ref.current?.node);
    act(() =>
      ref
        .current!.findNode('/a')!
        .setExternalErrors([{ dataPath: '/a', message: 'external' }]),
    );
    fireEvent.change(view.container.querySelector('input[id="/a"]')!, {
      target: { value: 'edited' },
    });
    act(() => ref.current!.findNode('/a')!.setState({ 2: true }));
    await settleValidation(() => ref.current?.node);
    act(() => ref.current!.revealErrors());
    act(() => releaseFieldNodeRevealHistory(ref.current!.node!));
    expect(actual.get('/a')?.errorVisible).toBe(true);
    act(() => ref.current!.findNode('/show')!.setValue(false));
    expect(view.container.querySelector('input[id="/a"]')).toBeNull();
    act(() => ref.current!.findNode('/show')!.setValue(true));
    await settleValidation(() => ref.current?.node);
    view.rerender(
      <Form
        {...props}
        errorVisibility={ErrorVisibility.Never}
        formatError={(error) => 'next:' + error.message}
      />,
    );
    expect(actual.get('/a')?.errorMessage).toBeNull();
    view.rerender(
      <Form
        {...props}
        errorVisibility={ErrorVisibility.Always}
        formatError={(error) => 'next:' + error.message}
      />,
    );
    act(() => releaseFieldNodeRevealHistory(ref.current!.node!));
    expect(actual.get('/a')?.errorMessage).toBe('next:bad');
  },
);

it('keeps the result reference when all four values stay equal after a value write', () => {
  const ref = createRef<FormHandle>();
  const results: ReturnType<typeof useFieldErrors>[] = [];
  const Input = ({ node, value }: FieldInputProps) => {
    results.push(useFieldErrors(node));
    return <span>{value}</span>;
  };
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'object', properties: { a: { type: 'string' } } }}
      validationMode={0}
      errorVisibility={ErrorVisibility.Never}
      fieldInputDefinitions={[
        { test: { type: 'string' }, Component: Input, controlled: true },
      ]}
    />,
  );
  const first = results.at(-1);
  act(() => ref.current!.findNode('/a')!.setValue('new'));
  expect(results.length).toBeGreaterThan(1);
  expect(results.at(-1)).toBe(first);
});

it('connects release listeners only through repeated held intervals of the same input', async () => {
  const ref = createRef<FormHandle>();
  const instances = new Set<object>();
  const Input = ({ node }: FieldInputProps) => {
    const state = useFieldErrors(node);
    const instance = useRef({});
    instances.add(instance.current);
    return <span>{String(state.errorVisible)}</span>;
  };
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'object', properties: { a: { type: 'string' } } }}
      validatorFactory={{
        compile: () => () => [{ dataPath: '/a', message: 'bad' }],
        compileGuard: () => () => true,
      }}
      fieldInputDefinitions={[
        { test: { type: 'string' }, Component: Input, controlled: true },
      ]}
    />,
  );
  await settleValidation(() => ref.current?.node);
  const node = ref.current!.findNode('/a')!;
  const runtime = readFieldNodeRuntime(node);
  expect(runtime.revealReleaseListeners?.size ?? 0).toBe(0);
  for (let index = 0; index < 3; index++) {
    act(() => node.setState({ 4: false }));
    act(() => releaseFieldNodeRevealHistory(node));
    act(() => node.setState({ 4: true }));
    expect(runtime.revealReleaseListeners?.size).toBe(2);
    act(() => releaseFieldNodeRevealHistory(node));
    expect(runtime.revealReleaseListeners?.size ?? 0).toBe(0);
  }
  expect(instances.size).toBe(1);
});

it('reads the new path after array removal with a path-dependent formatter', () => {
  const ref = createRef<FormHandle>();
  const Input = ({ node }: FieldInputProps) => (
    <span data-message={node.path}>{useFieldErrors(node).errorMessage}</span>
  );
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'array', items: { type: 'string' } }}
      defaultValue={['first', 'second']}
      validationMode={0}
      errorVisibility={ErrorVisibility.Always}
      formatError={(_error, node) => node.path}
      fieldInputDefinitions={[
        { test: { type: 'string' }, Component: Input, controlled: true },
      ]}
    />,
  );
  act(() =>
    ref
      .current!.findNode('/1')!
      .setExternalErrors([{ dataPath: '/1', message: 'bad' }]),
  );
  expect(view.container.querySelector('[data-message="/1"]')?.textContent).toBe(
    '/1',
  );
  act(() => {
    const node = ref.current!.node;
    if (!node || !isArrayNode(node)) throw new Error('missing array');
    node.remove(0);
  });
  expect(view.container.querySelector('[data-message="/0"]')?.textContent).toBe(
    '/0',
  );
});

it('lets an error renderer show all errors without children and follow formatter replacement', () => {
  const Error = ({ node }: ErrorMessageRendererProps) => {
    const state = useFieldErrors(node);
    return (
      <em>
        {state.errors
          ?.map((error) => state.formatError(error, node, {}))
          .join('|')}
      </em>
    );
  };
  const Group = ({ Input, ErrorMessage }: FieldRendererProps) => (
    <>
      <Input />
      <ErrorMessage />
    </>
  );
  const props = {
    jsonSchema: { type: 'string' as const },
    validationMode: 0,
    errorVisibility: ErrorVisibility.Always,
    errors: [
      { dataPath: '', message: 'one' },
      { dataPath: '', message: 'two' },
    ],
    FieldRenderer: Group,
    ErrorMessageRenderer: Error,
  };
  const view = render(
    <Form {...props} formatError={(error) => error.message} />,
  );
  expect(view.getByText('one|two')).toBeTruthy();
  view.rerender(
    <Form {...props} formatError={(error) => 'next:' + error.message} />,
  );
  expect(view.getByText('next:one|next:two')).toBeTruthy();
});

it('isolates a formatter thrown from the input hook from a healthy sibling', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  let shouldThrow = false;
  let replace!: () => void;
  const HookInput = ({ node }: Pick<FieldInputProps, 'node'>) => (
    <input
      aria-label={node.name}
      data-message={String(useFieldErrors(node).errorMessage)}
    />
  );
  const Input = ({ node }: FieldInputProps) => {
    const [generation, setGeneration] = useState(0);
    if (node.path === '/a') replace = () => setGeneration((value) => value + 1);
    return <HookInput key={generation} node={node} />;
  };
  const props = {
    jsonSchema: {
      type: 'object' as const,
      properties: {
        a: { type: 'string' as const },
        b: { type: 'string' as const },
      },
    },
    validationMode: 0,
    errorVisibility: ErrorVisibility.Always,
    errors: [{ dataPath: '/a', message: 'bad' }],
    fieldInputDefinitions: [
      { test: { type: 'string' as const }, Component: Input },
    ],
  };
  const view = render(
    <Form
      {...props}
      formatError={(error, node) => {
        if (shouldThrow && node.path === '/a')
          throw new Error('input formatter');
        return error.message;
      }}
    />,
  );
  const sibling = view.getByLabelText('b');
  expect(view.getByLabelText('a')).toBeTruthy();
  shouldThrow = true;
  act(() => replace());
  expect(view.queryByLabelText('a')).toBeNull();
  expect(view.container.querySelector('label[for="/a"]')).not.toBeNull();
  view.rerender(<Form {...props} formatError={(error) => error.message} />);
  expect(view.queryByLabelText('a')).toBeNull();
  expect(view.getByLabelText('b')).toBe(sibling);
  expect(view.container.querySelector('label[for="/a"]')).not.toBeNull();
});

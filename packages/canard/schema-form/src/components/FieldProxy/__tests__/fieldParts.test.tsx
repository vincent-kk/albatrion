import { createRef, useMemo } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode, isArrayNode } from '@/schema-form/core';
import {
  type ErrorMessageRendererProps,
  ErrorVisibility,
  type FieldRendererProps,
  type LabelRendererProps,
} from '@/schema-form/types';

/** Two sibling fields expose isolation and stable part identities. */
const schema = {
  type: 'object',
  required: ['a'],
  properties: {
    a: { type: 'string', title: 'Alpha' },
    b: { type: 'string', title: 'Beta' },
  },
} as const;

/** Compose only public renderer props; the root retains the default child traversal. */
function Parts({
  isRoot,
  Input,
  Label,
  ErrorMessage,
  errorMessage,
}: FieldRendererProps) {
  return isRoot ? (
    <Input />
  ) : (
    <>
      <Label />
      <Input />
      <ErrorMessage>{errorMessage}</ErrorMessage>
    </>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('binds label defaults without implicitly passing errors or context', () => {
  const ref = createRef<FormHandle>();
  const label = vi.fn(({ children, htmlFor, id }: LabelRendererProps) => (
    <label htmlFor={htmlFor} id={id}>
      {children}
    </label>
  ));
  const renderer = vi.fn(Parts);
  render(
    <Form
      ref={ref}
      jsonSchema={schema}
      validationMode={ValidationMode.None}
      FieldRenderer={renderer}
      LabelRenderer={label}
      context={{ source: 'form' }}
    >
      <Form.Field path="/a" required={false} />
    </Form>,
  );
  const node = ref.current!.findNode('/a')!;
  const props = label.mock.calls.find(([props]) => props.path === '/a')![0];
  expect(props).toMatchObject({
    node,
    path: node.path,
    name: node.name,
    jsonSchema: node.jsonSchema,
    required: false,
    htmlFor: '/a',
    id: 'label:/a',
    children: node.name,
  });
  expect(props.required).toBe(
    renderer.mock.calls.find(([props]) => props.node === node)![0].required,
  );
  expect(node.isRequired).toBe(true);
  for (const key of [
    'context',
    'errors',
    'errorVisible',
    'errorMessage',
    'formatError',
  ])
    expect(props).not.toHaveProperty(key);
});

it('preserves explicit undefined, null children and caller props while owning node', () => {
  const label = vi.fn(({ children }: LabelRendererProps) => (
    <label>{children}</label>
  ));
  const context = { source: 'caller' };
  const Group = ({ isRoot, Input, Label, node }: FieldRendererProps) =>
    isRoot ? (
      <Input />
    ) : (
      <>
        <Label
          context={context}
          foo={1}
          node={node.parentNode!}
          htmlFor={undefined}
          id={undefined}
          path={undefined}
        >
          Override
        </Label>
        <Label children={null} />
        <Label children={undefined} />
      </>
    );
  render(
    <Form
      jsonSchema={schema}
      validationMode={ValidationMode.None}
      FieldRenderer={Group}
      LabelRenderer={label}
    />,
  );
  const calls = label.mock.calls
    .filter(([props]) => props.node.path === '/a')
    .map(([props]) => props);
  expect(calls[0]).toMatchObject({
    context,
    foo: 1,
    children: 'Override',
    path: undefined,
    htmlFor: undefined,
    id: undefined,
  });
  expect(calls[0].node.path).toBe('/a');
  expect(calls[1].children).toBeNull();
  expect(calls[2].children).toBe(calls[2].name);
});

it('passes explicit error children and leaves omitted children undefined', () => {
  const error = vi.fn(({ children }: ErrorMessageRendererProps) => (
    <em>{children}</em>
  ));
  const Group = ({
    isRoot,
    Input,
    ErrorMessage,
    errorMessage,
    node,
  }: FieldRendererProps) =>
    isRoot ? (
      <Input />
    ) : (
      <>
        <ErrorMessage node={node.parentNode!} foo={1} required={undefined}>
          {errorMessage}
        </ErrorMessage>
        <ErrorMessage />
      </>
    );
  render(
    <Form
      jsonSchema={schema}
      validationMode={ValidationMode.None}
      errorVisibility={ErrorVisibility.Always}
      errors={[{ dataPath: '/a', message: 'Issue' }]}
      FieldRenderer={Group}
      ErrorMessageRenderer={error}
    />,
  );
  const calls = error.mock.calls
    .filter(([props]) => props.node.path === '/a')
    .map(([props]) => props);
  expect(calls.some(({ children }) => children === 'Issue')).toBe(true);
  expect(calls.some(({ children }) => children === undefined)).toBe(true);
  expect(calls.find(({ children }) => children === 'Issue')).toMatchObject({
    required: undefined,
    foo: 1,
  });
  for (const key of [
    'context',
    'errors',
    'errorVisible',
    'errorMessage',
    'formatError',
  ])
    expect(calls[0]).not.toHaveProperty(key);
});

it('updates a memo-cached error element after external errors change', () => {
  const ref = createRef<FormHandle>();
  const Group = ({
    isRoot,
    Input,
    ErrorMessage,
    errorMessage,
  }: FieldRendererProps) => {
    const error = useMemo(
      () => <ErrorMessage>{errorMessage}</ErrorMessage>,
      [ErrorMessage, errorMessage],
    );
    return isRoot ? (
      <Input />
    ) : (
      <>
        <Input />
        {error}
      </>
    );
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      validationMode={ValidationMode.None}
      errorVisibility={ErrorVisibility.Always}
      errors={[{ dataPath: '/a', message: 'First' }]}
      FieldRenderer={Group}
    />,
  );
  expect(view.getByText('First')).toBeTruthy();
  act(() =>
    ref
      .current!.findNode('/a')!
      .setExternalErrors([{ dataPath: '/a', message: 'Second' }]),
  );
  expect(view.getByText('Second')).toBeTruthy();
  expect(view.queryByText('First')).toBeNull();
});

it('updates a memo-cached label address after array reordering', () => {
  const ref = createRef<FormHandle>();
  const Group = ({ isRoot, Input, Label }: FieldRendererProps) => {
    const label = useMemo(() => <Label />, [Label]);
    return isRoot ? (
      <Input />
    ) : (
      <>
        {label}
        <Input />
      </>
    );
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'array',
        items: { type: 'object', properties: { name: { type: 'string' } } },
      }}
      defaultValue={[{ name: 'first' }, { name: 'second' }]}
      validationMode={ValidationMode.None}
      FieldRenderer={Group}
    />,
  );
  expect(view.container.querySelector('label[for="/1/name"]')?.id).toBe(
    'label:/1/name',
  );
  act(() => {
    const node = ref.current!.node;
    if (!node || !isArrayNode(node)) throw new Error('missing array');
    node.remove(0);
  });
  expect(view.container.querySelector('label[for="/0/name"]')?.id).toBe(
    'label:/0/name',
  );
  expect(view.container.querySelector('label[for="/1/name"]')).toBeNull();
  expect(
    view.container.querySelector<HTMLInputElement>('input[id="/0/name"]')
      ?.value,
  ).toBe('second');
});

it('retains label calls and DOM through formatter, visibility, context and input changes', () => {
  const label = vi.fn(({ children, htmlFor }: LabelRendererProps) => (
    <label htmlFor={htmlFor}>{children}</label>
  ));
  const props = {
    jsonSchema: schema,
    validationMode: ValidationMode.None,
    errors: [{ dataPath: '/a', message: 'same' }],
    FieldRenderer: Parts,
    LabelRenderer: label,
  };
  const view = render(
    <Form
      {...props}
      errorVisibility={ErrorVisibility.Always}
      formatError={() => 'same'}
    />,
  );
  const labelNode = view.container.querySelector('label[for="/a"]');
  const errorNode = view.getByText('same');
  const calls = label.mock.calls.length;
  view.rerender(
    <Form
      {...props}
      context={{ revision: 1 }}
      errorVisibility={ErrorVisibility.Never}
      formatError={() => 'same'}
    />,
  );
  view.rerender(
    <Form
      {...props}
      context={{ revision: 2 }}
      errorVisibility={ErrorVisibility.Always}
      formatError={() => 'same'}
    />,
  );
  expect(view.getByText('same')).toBe(errorNode);
  fireEvent.change(view.container.querySelector('input[id="/a"]')!, {
    target: { value: 'typed' },
  });
  expect(view.container.querySelector('label[for="/a"]')).toBe(labelNode);
  expect(view.container.querySelector('[data-path="/a"] em')).toBe(errorNode);
  expect(label).toHaveBeenCalledTimes(calls);
});

it('isolates formatter failures and recovers without replacing a healthy sibling input', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const props = {
    jsonSchema: schema,
    validationMode: ValidationMode.None,
    errorVisibility: ErrorVisibility.Always,
    errors: [{ dataPath: '/a', message: 'Issue' }],
    FieldRenderer: Parts,
  };
  const view = render(
    <Form
      {...props}
      formatError={(error, node) => {
        if (node.path === '/a') throw new Error('formatter');
        return error.message;
      }}
    />,
  );
  const sibling = view.container.querySelector('input[id="/b"]');
  expect(sibling).not.toBeNull();
  expect(view.container.querySelector('input[id="/a"]')).toBeNull();
  view.rerender(<Form {...props} formatError={(error) => error.message} />);
  expect(view.container.querySelector('input[id="/a"]')).not.toBeNull();
  expect(view.container.querySelector('input[id="/b"]')).toBe(sibling);
});

it.each(['LabelRenderer', 'ErrorMessageRenderer'] as const)(
  'recovers when a throwing %s changes',
  (slot) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = ({
      node,
    }: LabelRendererProps | ErrorMessageRendererProps) => {
      if (node.path === '/a') throw new Error('part');
      return null;
    };
    const Healthy = ({
      children,
    }: LabelRendererProps | ErrorMessageRendererProps) => (
      <span>{children}</span>
    );
    const props = {
      jsonSchema: schema,
      validationMode: ValidationMode.None,
      FieldRenderer: Parts,
    };
    const view = render(<Form {...props} {...{ [slot]: Broken }} />);
    const sibling = view.container.querySelector('input[id="/b"]');
    expect(sibling).not.toBeNull();
    expect(view.container.querySelector('input[id="/a"]')).toBeNull();
    view.rerender(<Form {...props} {...{ [slot]: Healthy }} />);
    expect(view.container.querySelector('input[id="/a"]')).not.toBeNull();
    expect(view.container.querySelector('input[id="/b"]')).toBe(sibling);
  },
);

it('replaces each renderer independently without remounting healthy peers', () => {
  const FirstLabel = ({ children, htmlFor }: LabelRendererProps) => (
    <label htmlFor={htmlFor}>{children}</label>
  );
  const NextLabel = ({ children, htmlFor }: LabelRendererProps) => (
    <label htmlFor={htmlFor}>{children}</label>
  );
  const FirstError = ({ children }: ErrorMessageRendererProps) => (
    <em>{children}</em>
  );
  const NextError = ({ children }: ErrorMessageRendererProps) => (
    <em>{children}</em>
  );
  const props = {
    jsonSchema: schema,
    validationMode: ValidationMode.None,
    errorVisibility: ErrorVisibility.Always,
    errors: [{ dataPath: '/a', message: 'Issue' }],
    FieldRenderer: Parts,
  };
  const view = render(
    <Form
      {...props}
      LabelRenderer={FirstLabel}
      ErrorMessageRenderer={FirstError}
    />,
  );
  const input = view.container.querySelector('input[id="/a"]');
  const label = view.container.querySelector('label[for="/a"]');
  const error = view.getByText('Issue');
  view.rerender(
    <Form
      {...props}
      LabelRenderer={NextLabel}
      ErrorMessageRenderer={FirstError}
    />,
  );
  const nextLabel = view.container.querySelector('label[for="/a"]');
  expect(nextLabel).not.toBe(label);
  expect(view.getByText('Issue')).toBe(error);
  expect(view.container.querySelector('input[id="/a"]')).toBe(input);
  view.rerender(
    <Form
      {...props}
      LabelRenderer={NextLabel}
      ErrorMessageRenderer={NextError}
    />,
  );
  expect(view.container.querySelector('label[for="/a"]')).toBe(nextLabel);
  expect(view.getByText('Issue')).not.toBe(error);
  expect(view.container.querySelector('input[id="/a"]')).toBe(input);
});

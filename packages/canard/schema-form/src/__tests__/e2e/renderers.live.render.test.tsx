import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  ErrorVisibility,
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type FormHandle,
  type FormProps,
  FormProvider,
  ValidationMode,
} from '@/schema-form';

afterEach(cleanup);

const schema = { type: 'string' } as const;
const errors = [{ dataPath: '', message: 'issue' }];
const A = ({ Input }: FieldRendererProps) => (
  <div data-renderer="a">
    <Input />
  </div>
);
const B = ({ Input }: FieldRendererProps) => (
  <div data-renderer="b">
    <Input />
  </div>
);
const Message = ({ Input, errorMessage }: FieldRendererProps) => (
  <>
    <Input />
    <span>{errorMessage}</span>
  </>
);

it.each(['form', 'provider'] as const)(
  'updates the %s field renderer without replacing the root',
  (owner) => {
    const ref = createRef<FormHandle>();
    const element = (FieldRenderer: typeof A) => (
      <FormProvider {...(owner === 'provider' ? { FieldRenderer } : {})}>
        <Form
          ref={ref}
          jsonSchema={schema}
          validationMode={ValidationMode.None}
          {...(owner === 'form' ? { FieldRenderer } : {})}
        />
      </FormProvider>
    );
    const view = render(element(A));
    const root = ref.current!.node;
    act(() => ref.current!.setValue('edited'));
    view.rerender(element(B));
    expect(view.container.querySelector('[data-renderer="b"]')).not.toBeNull();
    expect(ref.current!.node).toBe(root);
    expect(ref.current!.getValue()).toBe('edited');
  },
);

it.each([
  'LabelRenderer',
  'InputRenderer',
  'ErrorMessageRenderer',
] as const)('updates %s from Form and Provider', (key) => {
  const PieceA = () => <span>piece-a</span>;
  const PieceB = () => <span>piece-b</span>;
  const Piece =
    key === 'LabelRenderer'
      ? Form.Label
      : key === 'InputRenderer'
        ? Form.Input
        : Form.ErrorMessage;
  const element = (local: FormProps, external: FormProps) => (
    <FormProvider {...external}>
      <Form {...local} validationMode={ValidationMode.None}>
        <Piece path="#" />
      </Form>
    </FormProvider>
  );
  const view = render(
    element(
      { jsonSchema: schema, [key]: PieceA },
      { jsonSchema: schema, [key]: PieceA },
    ),
  );
  view.rerender(
    element(
      { jsonSchema: schema, [key]: PieceB },
      { jsonSchema: schema, [key]: PieceA },
    ),
  );
  expect(view.getByText('piece-b')).toBeTruthy();
  view.rerender(
    element({ jsonSchema: schema }, { jsonSchema: schema, [key]: PieceA }),
  );
  expect(view.getByText('piece-a')).toBeTruthy();
  view.rerender(
    element({ jsonSchema: schema }, { jsonSchema: schema, [key]: PieceB }),
  );
  expect(view.getByText('piece-b')).toBeTruthy();
});

it.each(['form', 'provider'] as const)(
  'updates the %s formatter while retaining input DOM and errors',
  (owner) => {
    const ref = createRef<FormHandle>();
    const first = () => 'first-message';
    const second = () => 'second-message';
    const element = (formatError: typeof first) => (
      <FormProvider {...(owner === 'provider' ? { formatError } : {})}>
        <Form
          ref={ref}
          jsonSchema={schema}
          errors={errors}
          FieldRenderer={Message}
          errorVisibility={ErrorVisibility.Always}
          validationMode={ValidationMode.None}
          {...(owner === 'form' ? { formatError } : {})}
        />
      </FormProvider>
    );
    const view = render(element(first));
    expect(view.getByText('first-message')).toBeTruthy();
    const input = view.container.querySelector('input');
    const originalErrors = ref.current!.node!.errors;
    view.rerender(element(second));
    expect(view.getByText('second-message')).toBeTruthy();
    expect(view.container.querySelector('input')).toBe(input);
    expect(ref.current!.node!.errors).toBe(originalErrors);
  },
);

it('updates a child renderer prop without rebuilding the child component cache', () => {
  const objectSchema = {
    type: 'object',
    properties: { a: { type: 'string' } },
  } as const;
  const Branch = ({ ChildFields, context }: FieldInputProps) => (
    <>
      {ChildFields.map((Child) => (
        <Child
          key={Child.key}
          FieldRenderer={(context as { renderer: typeof A }).renderer}
        />
      ))}
    </>
  );
  const definitions = [
    { test: { type: 'object' as const }, Component: Branch },
  ];
  const element = (renderer: typeof A) => (
    <Form
      jsonSchema={objectSchema}
      fieldInputDefinitions={definitions}
      context={{ renderer }}
      validationMode={ValidationMode.None}
    />
  );
  const view = render(element(A));
  view.rerender(element(B));
  expect(view.container.querySelector('[data-renderer="b"]')).not.toBeNull();
});

it('keeps a Form renderer override and its DOM when only the Provider changes', () => {
  const element = (FieldRenderer: typeof A) => (
    <FormProvider FieldRenderer={FieldRenderer}>
      <Form
        jsonSchema={schema}
        FieldRenderer={A}
        validationMode={ValidationMode.None}
      />
    </FormProvider>
  );
  const view = render(element(A));
  const input = view.container.querySelector('input');
  view.rerender(element(B));
  expect(view.container.querySelector('input')).toBe(input);
  expect(view.container.querySelector('[data-renderer="a"]')).not.toBeNull();
});

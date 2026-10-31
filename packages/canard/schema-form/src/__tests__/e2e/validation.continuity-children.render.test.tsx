import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type FormHandle,
  useChildFieldErrors,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { settleValidation } from '../helpers/settleValidation';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const Renderer = ({
  path,
  Input,
  errorVisible,
  errorMessage,
}: FieldRendererProps) => (
  <>
    <Input />
    <span data-testid={'renderer:' + path}>
      {errorVisible ? errorMessage : ''}
    </span>
  </>
);
const Leaf = ({ path, errorVisible, errors }: FieldInputProps) => (
  <span data-testid={'input:' + path}>
    {errorVisible ? errors[0]?.message : ''}
  </span>
);

it('IR-6 Y3 hidden children stay in the aggregate while enabled re-shows await release', async () => {
  const ref = createRef<FormHandle>();
  const Branch = ({ node, ChildFields }: FieldInputProps) => {
    const { showErrors, formattedErrors } = useChildFieldErrors(node);
    return (
      <>
        <span data-testid="card">
          {showErrors[0] ? formattedErrors[0] : null}
        </span>
        {ChildFields.map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    );
  };
  const form = (
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          a: { type: 'string', controls: { visible: '../show === true' } },
          show: { type: 'boolean' },
        },
      }}
      defaultValue={{ a: '', show: true }}
      showError={true}
      FieldRenderer={Renderer}
      formatError={(error) => error.message ?? null}
      fieldInputDefinitions={[
        { test: { type: 'object' }, Component: Branch },
        { test: () => true, Component: Leaf },
      ]}
      validatorFactory={{
        compileGuard: () => () => true,
        compile: () => (value: any) =>
          value.a ? [] : [{ dataPath: '/a', message: 'old error' }],
      }}
    />
  );
  const view = render(form);
  await settleValidation(() => ref.current?.node);
  expect(view.getByTestId('card').textContent).toBe('old error');
  const clock = createValidationFrameClock();
  act(() => ref.current!.setValue({ a: '', show: false }));
  expect(view.getByTestId('card').textContent).toBe('old error');
  await Promise.resolve();
  act(() => ref.current!.setValue({ a: 'valid', show: false }));
  act(() => ref.current!.setValue({ a: 'valid', show: true }));
  expect(view.getByTestId('card').textContent).toBe('old error');
  for (const id of ['renderer:/a', 'input:/a'])
    expect(view.getByTestId(id).textContent).toBe('');
  await act(async () => {
    clock.frame();
    await clock.task();
    clock.frame();
    await clock.task();
  });
  for (const id of ['card', 'renderer:/a', 'input:/a'])
    expect(view.getByTestId(id).textContent).toBe('');
});

it('IR-6 X1 an object shared by parent and own child-error hooks survives one hook unmounting', async () => {
  const ref = createRef<FormHandle>();
  const ParentCard = ({ node }: Pick<FieldInputProps, 'node'>) => {
    const { showErrors, formattedErrors } = useChildFieldErrors(node);
    return (
      <span data-testid="parent">
        {showErrors[0] ? formattedErrors[0] : null}
      </span>
    );
  };
  const Root = ({
    node,
    ChildFields,
    context,
  }: FieldInputProps<any, { parent: boolean }>) => (
    <>
      {context.parent && <ParentCard node={node} />}
      {ChildFields.map((Child) => (
        <Child key={Child.key} />
      ))}
    </>
  );
  const Group = ({ node, ChildFields }: FieldInputProps) => {
    const { showError } = useChildFieldErrors(node);
    return (
      <>
        <span data-testid="own">
          {showError ? node.errors[0]?.message : ''}
        </span>
        {ChildFields.map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    );
  };
  const schema = {
    type: 'object',
    properties: {
      group: { type: 'object', properties: { a: { type: 'string' } } },
    },
  } as const;
  const props = {
    jsonSchema: schema,
    defaultValue: { group: { a: '' } },
    showError: true,
    formatError: (error: { message?: string }) => error.message ?? null,
    fieldInputDefinitions: [
      { test: (hint: { path: string }) => hint.path === '', Component: Root },
      {
        test: (hint: { path: string }) => hint.path === '/group',
        Component: Group,
      },
      { test: () => true, Component: Leaf },
    ],
    validatorFactory: {
      compileGuard: () => () => true,
      compile: () => (value: any) =>
        value?.group?.a ? [] : [{ dataPath: '/group', message: 'group error' }],
    },
  };
  const view = render(<Form ref={ref} {...props} context={{ parent: true }} />);
  await settleValidation(() => ref.current?.node);
  expect(view.getByTestId('parent').textContent).toBe('group error');
  expect(view.getByTestId('own').textContent).toBe('group error');
  view.rerender(<Form ref={ref} {...props} context={{ parent: false }} />);
  await Promise.resolve();
  act(() => ref.current!.setValue({ group: { a: 'valid' } }));
  expect(view.getByTestId('own').textContent).toBe('group error');
  await settleValidation(() => ref.current?.node);
});

it('IR-6 Y3 a previously hidden child holds renderer and input while its hidden errors remain aggregated', async () => {
  const ref = createRef<FormHandle>();
  const Branch = ({ node, ChildFields }: FieldInputProps) => {
    const { showErrors, formattedErrors } = useChildFieldErrors(node);
    return (
      <>
        <span data-testid="hidden-card">
          {showErrors[0] ? formattedErrors[0] : null}
        </span>
        {ChildFields.map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    );
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          a: { type: 'string', controls: { visible: '../show === true' } },
          show: { type: 'boolean' },
        },
      }}
      defaultValue={{ a: '', show: false }}
      showError={true}
      FieldRenderer={Renderer}
      fieldInputDefinitions={[
        { test: { type: 'object' }, Component: Branch },
        { test: () => true, Component: Leaf },
      ]}
      validatorFactory={{
        compileGuard: () => () => true,
        compile: () => (value: any) =>
          value.a ? [] : [{ dataPath: '/a', message: 'hidden error' }],
      }}
      formatError={(error) => error.message ?? null}
    />,
  );
  await settleValidation(() => ref.current?.node);
  expect(view.getByTestId('hidden-card').textContent).toBe('hidden error');
  const clock = createValidationFrameClock();
  act(() => ref.current!.setValue({ a: 'valid', show: true }));
  expect(view.getByTestId('renderer:/a').textContent).toBe('');
  expect(view.getByTestId('input:/a').textContent).toBe('');
  expect(view.getByTestId('hidden-card').textContent).toBe('hidden error');
  await act(async () => {
    clock.frame();
    await clock.task();
  });
  expect(view.getByTestId('hidden-card').textContent).toBe('');
});
it('IR-6 Y3 limit i re-enabling the hook disabled argument reveals the current verdict immediately', async () => {
  const ref = createRef<FormHandle>();
  const Branch = ({
    node,
    ChildFields,
    context,
  }: FieldInputProps<any, { off: boolean }>) => {
    const result = useChildFieldErrors(node, context.off);
    return (
      <>
        <span data-testid="disabled-card">{result.errorMessage}</span>
        {ChildFields.map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    );
  };
  const props = {
    jsonSchema: {
      type: 'object' as const,
      properties: { a: { type: 'string' as const } },
    },
    defaultValue: { a: '' },
    showError: true,
    fieldInputDefinitions: [
      { test: { type: 'object' as const }, Component: Branch },
      { test: () => true, Component: Leaf },
    ],
    validatorFactory: {
      compileGuard: () => () => true,
      compile: () => () => [{ dataPath: '/a', message: 'current error' }],
    },
    formatError: (error: { message?: string }) => error.message ?? null,
  };
  const view = render(<Form ref={ref} {...props} context={{ off: true }} />);
  await settleValidation(() => ref.current?.node);
  const clock = createValidationFrameClock();
  act(() => ref.current!.setValue({ a: 'new' }));
  view.rerender(<Form ref={ref} {...props} context={{ off: false }} />);
  expect(view.getByTestId('disabled-card').textContent).toBe('current error');
  await act(async () => {
    clock.frame();
    await clock.task();
  });
});

it('IR-6 Y3 hidden values validate but inactive children leave the error aggregate', async () => {
  const ref = createRef<FormHandle>();
  const Branch = ({ node, ChildFields }: FieldInputProps) => {
    const { errorMessage } = useChildFieldErrors(node);
    return (
      <>
        <span data-testid="active-card">{errorMessage}</span>
        {ChildFields.map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    );
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          a: {
            type: 'string',
            controls: {
              visible: '../show === true',
              active: '../active === true',
            },
          },
          show: { type: 'boolean' },
          active: { type: 'boolean' },
        },
      }}
      defaultValue={{ a: 'bad', show: false, active: true }}
      showError={true}
      fieldInputDefinitions={[
        { test: { type: 'object' }, Component: Branch },
        { test: () => true, Component: Leaf },
      ]}
      validatorFactory={{
        compileGuard: () => () => true,
        compile: () => (value: any) =>
          value.a === undefined
            ? []
            : [{ dataPath: '/a', message: 'hidden is validated' }],
      }}
      formatError={(error) => error.message ?? null}
    />,
  );
  await settleValidation(() => ref.current?.node);
  expect(ref.current!.getValue()).toEqual({
    a: 'bad',
    show: false,
    active: true,
  });
  expect(view.getByTestId('active-card').textContent).toBe(
    'hidden is validated',
  );
  const clock = createValidationFrameClock();
  act(() => ref.current!.setValue({ a: 'bad', show: false, active: false }));
  expect(ref.current!.getValue()).toEqual({ show: false, active: false });
  expect(view.getByTestId('active-card').textContent).toBe('');
  await act(async () => {
    clock.frame();
    await clock.task();
  });
  expect(ref.current!.getErrors()).toEqual([]);
});

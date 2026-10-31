import { createRef, useLayoutEffect } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { flushSync } from 'react-dom';
import { afterEach, expect, inject, it, vi } from 'vitest';

import {
  type FieldInputProps,
  FieldNodeEventType,
  type FieldRendererProps,
  Form,
  type FormHandle,
  useChildFieldErrors,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { settleValidation } from '../helpers/settleValidation';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const Renderer = ({
  Input,
  path,
  errorVisible,
  errorMessage,
}: FieldRendererProps) => (
  <>
    <Input />
    <span data-testid={'renderer:' + path} data-visible={String(errorVisible)}>
      {errorVisible ? errorMessage : null}
    </span>
  </>
);
const Leaf = ({
  path,
  errorVisible,
  onChange,
  context,
}: FieldInputProps<any, { normalize?: boolean }>) => {
  useLayoutEffect(() => {
    if (context.normalize && errorVisible && path === '/a') onChange('valid');
  }, [context.normalize, errorVisible, path, onChange]);
  return <span data-testid={'input:' + path}>{String(errorVisible)}</span>;
};
const Branch = ({ node, ChildFields }: FieldInputProps) => {
  const { showErrors } = useChildFieldErrors(node);
  return (
    <>
      <span data-testid="children">{String(showErrors[0])}</span>
      {ChildFields.map((Child) => (
        <Child key={Child.key} />
      ))}
    </>
  );
};
const schema = {
  type: 'object',
  properties: {
    a: { type: 'string', controls: { visible: '../show === true' } },
    show: { type: 'boolean' },
  },
} as const;
const validator = {
  compile: () => (value: any) =>
    value.a ? [] : [{ dataPath: '/a', message: 'required' }],
  compileGuard: () => () => true,
};
const definitions = [
  { test: { type: 'object' as const }, Component: Branch },
  { test: () => true, Component: Leaf },
];
const props = {
  jsonSchema: schema,
  defaultValue: { a: '', show: true },
  validatorFactory: validator,
  FieldRenderer: Renderer,
  fieldInputDefinitions: definitions,
  formatError: (error: { message?: string }) => error.message ?? null,
};

it('IR-6 W1 ancestor remount preserves renderer, input and child-errors visibility while pending', async () => {
  const ref = createRef<FormHandle>();
  const view = render(<Form ref={ref} {...props} />);
  await settleValidation(() => ref.current?.node);
  act(() => ref.current!.showError());
  expect(view.getByTestId('children').textContent).toBe('true');
  act(() => {
    ref.current!.setValue({ a: 'x', show: true });
    ref.current!.remount('');
  });
  expect(view.getByTestId('renderer:/a').getAttribute('data-visible')).toBe(
    'true',
  );
  expect(view.getByTestId('input:/a').textContent).toBe('true');
  expect(view.getByTestId('children').textContent).toBe('true');
  await settleValidation(() => ref.current?.node);
  expect(view.getByTestId('renderer:/a').textContent).toBe('');
});

it('IR-6 W1 hidden input and renderer forget their previous visible lifetime', async () => {
  const ref = createRef<FormHandle>();
  const view = render(<Form ref={ref} {...props} />);
  await settleValidation(() => ref.current?.node);
  act(() => ref.current!.showError());
  act(() => ref.current!.setValue({ a: '', show: false }));
  expect(view.queryByTestId('input:/a')).toBeNull();
  act(() => ref.current!.setValue({ a: '', show: true }));
  expect(view.getByTestId('renderer:/a').getAttribute('data-visible')).toBe(
    'false',
  );
  expect(view.getByTestId('input:/a').textContent).toBe('false');
  await settleValidation(() => ref.current?.node);
  expect(view.getByTestId('renderer:/a').textContent).toBe('required');
});

it('IR-6 W2 same-commit child normalization cannot promote a newly revealed old error', async () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      {...props}
      showError={false}
      context={{ normalize: false }}
    />,
  );
  await settleValidation(() => ref.current?.node);
  const clock = createValidationFrameClock();
  view.rerender(
    <Form
      ref={ref}
      {...props}
      showError={false}
      context={{ normalize: true }}
    />,
  );
  act(() => ref.current!.showError());
  expect(view.getByTestId('renderer:/a').textContent).toBe('');
  await act(async () => {
    clock.frame();
    expect(view.getByTestId('renderer:/a').textContent).toBe('');
    await clock.task();
    clock.frame();
    await clock.task();
  });
});

it('IR-6 W3 flushSync during value delivery already sees pending', async () => {
  const ref = createRef<FormHandle>();
  const view = render(<Form ref={ref} {...props} />);
  await settleValidation(() => ref.current?.node);
  const stop = ref.current!.findNode('/a')!.subscribe((event) => {
    if (event.type & FieldNodeEventType.UpdateValue)
      flushSync(() => ref.current!.showError());
  });
  act(() => ref.current!.setValue({ a: 'valid', show: true }));
  expect(view.getByTestId('renderer:/a').textContent).toBe('');
  expect(view.getByTestId('input:/a').textContent).toBe('false');
  stop();
  await settleValidation(() => ref.current?.node);
});

it('IR-6 W3 React18 legacy root sees pending for writes outside React events (React19 has no legacy root)', async (context) => {
  if (inject('reactMajor') !== '18') context.skip();
  const ref = createRef<FormHandle>();
  const view = render(<Form ref={ref} {...props} />, { legacyRoot: true });
  await settleValidation(() => ref.current?.node);
  const stop = ref.current!.findNode('/a')!.subscribe((event) => {
    if (event.type & FieldNodeEventType.UpdateValue) ref.current!.showError();
  });
  ref.current!.setValue({ a: 'valid', show: true });
  stop();
  expect(view.getByTestId('renderer:/a').textContent).toBe('');
  await settleValidation(() => ref.current?.node);
});

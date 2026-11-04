import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type FormHandle,
} from '@/schema-form';

import { VirtualizationBackfill } from '../../helpers/virtualization';
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
    <span data-testid={'renderer:' + path} data-visible={String(errorVisible)}>
      {errorVisible ? errorMessage : ''}
    </span>
  </>
);
const Input = ({
  path,
  ChildFields,
  errorVisible,
  errors,
}: FieldInputProps) => (
  <>
    <span data-testid={'input:' + path} data-visible={String(errorVisible)}>
      {errorVisible ? errors[0]?.message : ''}
    </span>
    {ChildFields.map((Child) => (
      <Child key={Child.key} />
    ))}
  </>
);
const schema = {
  type: 'object',
  properties: {
    a: { type: 'string' },
    b: { type: 'string' },
    c: { type: 'string' },
    d: { type: 'string' },
  },
} as const;
const props = {
  jsonSchema: schema,
  defaultValue: { a: '', b: '', c: '', d: '' },
  showError: true,
  FieldRenderer: Renderer,
  fieldInputDefinitions: [{ test: () => true, Component: Input }],
  formatError: (error: { message?: string }) => error.message ?? null,
  validatorFactory: {
    compileGuard: () => () => true,
    compile: () => (value: any) =>
      value.d ? [] : [{ dataPath: '/d', message: 'old error' }],
  },
};

const checkRemount = async (path: string) => {
  const ref = createRef<FormHandle>();
  const view = render(<Form ref={ref} {...props} />);
  await settleValidation(() => ref.current?.node);
  const clock = createValidationFrameClock();
  const visible = () =>
    ['renderer:/d', 'input:/d'].map((id) =>
      view.getByTestId(id).getAttribute('data-visible'),
    );
  expect(view.getByTestId('renderer:/d').textContent).toBe('old error');
  act(() => {
    ref.current!.setValue({ a: '', b: '', c: '', d: 'valid' });
    ref.current!.remount(path);
  });
  const samples = [visible()];
  for (let frame = 0; frame < 3; frame++)
    await act(async () => {
      clock.frame();
      samples.push(visible());
      await clock.task();
      samples.push(visible());
    });
  expect(samples.every((bits) => bits.every((bit) => bit === 'true'))).toBe(
    true,
  );
  expect(view.getByTestId('renderer:/d').textContent).toBe('');
};
it('IR-6 X1 a field version replacement keeps visible errors across every pending frame', async () => {
  await checkRemount('/d');
});
it('IR-6 X1 an ancestor version replacement keeps visible errors across every pending frame', async () => {
  await checkRemount('');
});

it('IR-6 X1 a virtualization placeholder becoming real shows its eligible baseline verdict', async () => {
  let deliver!: IntersectionObserverCallback;
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        deliver = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      {...props}
      virtualization={{
        threshold: 1,
        eagerCount: 1,
        backfill: VirtualizationBackfill.None,
      }}
    />,
  );
  await settleValidation(() => ref.current?.node);
  const placeholder = view.container.querySelector(
    '[data-path="/d"][data-deferred]',
  );
  expect(placeholder).not.toBeNull();
  const clock = createValidationFrameClock();
  act(() => ref.current!.setValue({ a: '', b: '', c: '', d: 'valid' }));
  await act(async () => {
    deliver(
      [
        {
          target: placeholder!,
          isIntersecting: true,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );
  });
  expect(view.getByTestId('renderer:/d').getAttribute('data-visible')).toBe(
    'true',
  );
  expect(view.getByTestId('input:/d').getAttribute('data-visible')).toBe(
    'true',
  );
  expect(view.getByTestId('renderer:/d').textContent).toBe('old error');
  await act(async () => {
    clock.frame();
    await clock.task();
    clock.frame();
    await clock.task();
  });
  expect(view.getByTestId('renderer:/d').textContent).toBe('');
});

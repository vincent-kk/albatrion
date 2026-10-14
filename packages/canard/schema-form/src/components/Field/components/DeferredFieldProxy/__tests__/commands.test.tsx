import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { VirtualizationBackfill } from '@/schema-form/helpers/virtualization';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('EVENT-063 REACT-028 reveals deferred inputs on focus, preserving defer on refresh', () => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'array', items: { type: 'string' } }}
      defaultValue={['a', 'b']}
      virtualization={{
        threshold: 1,
        eagerCount: 0,
        backfill: VirtualizationBackfill.None,
      }}
    />,
  );
  expect(view.container.querySelectorAll('[data-deferred]')).toHaveLength(2);
  act(() => ref.current!.refresh());
  expect(view.container.querySelectorAll('[data-deferred]')).toHaveLength(2);
  act(() => ref.current!.focus('/1'));
  const input = view.container.querySelector('input')!;
  expect(input.value).toBe('b');
  expect(document.activeElement).toBe(input);
});

it('ERROR-112 REACT-023 isolates a placeholder render exception and reports it once', () => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const error = new Error('placeholder');
  const Placeholder = () => {
    throw error;
  };
  const onError = vi.fn();
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'array', items: { type: 'string' } }}
      defaultValue={['a']}
      onError={onError}
      virtualization={{
        threshold: 1,
        eagerCount: 0,
        backfill: VirtualizationBackfill.None,
        Placeholder,
      }}
    />,
  );
  expect(view.container.querySelector('[data-deferred]')).not.toBeNull();
  expect(ref.current!.node).toBeDefined();
  expect(
    onError.mock.calls.filter(([record]) => record.error === error),
  ).toHaveLength(1);
});

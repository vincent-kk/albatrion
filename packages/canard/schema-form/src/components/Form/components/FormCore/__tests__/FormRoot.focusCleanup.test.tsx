import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { FieldLifecycle } from '@/schema-form/helpers/fieldLifecycle';
import type { FieldLifecycleRegistry } from '@/schema-form/helpers/fieldLifecycle/FieldLifecycleRegistry';
import { VirtualizationBackfill } from '@/schema-form/helpers/virtualization';
import { useFieldLifecycleContext } from '@/schema-form/providers/FieldLifecycleContext';
import type { FieldInputProps } from '@/schema-form/types';

import { FormCore } from '../FormCore';
import type { FormHandle } from '../types/handle';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// filid:contract exact-focus
it('removes the pending Mount reservation when the form unmounts before reveal commits', async () => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      /** Keep deferred positions closed until the form requests reveal. */
      observe() {}
      /** No observation work is retained by this browser double. */
      unobserve() {}
      /** Form teardown has no external observer resource to release. */
      disconnect() {}
    },
  );
  const registry: { current: FieldLifecycleRegistry | null } = {
    current: null,
  };
  const Input = ({ path }: FieldInputProps) => {
    registry.current = useFieldLifecycleContext();
    return <input id={path} />;
  };
  const handle = createRef<FormHandle>();
  const view = render(
    <FormCore
      ref={handle}
      jsonSchema={{
        type: 'object',
        properties: { first: { type: 'string' }, target: { type: 'string' } },
      }}
      fieldInputMap={{ '/first': Input }}
      virtualization={{
        threshold: 2,
        eagerCount: 1,
        backfill: VirtualizationBackfill.None,
      }}
    />,
  );
  const target = handle.current!.findNode('/target')!;
  expect(
    view.container.querySelector('[data-path="/target"][data-deferred]'),
  ).not.toBeNull();
  act(() => {
    handle.current!.focus('/target');
    expect(registry.current!.has(target, FieldLifecycle.Mount)).toBe(true);
    view.unmount();
  });
  await act(async () => {});
  expect(registry.current!.has(target, FieldLifecycle.Mount)).toBe(false);
});

import { type PropsWithChildren, StrictMode, useLayoutEffect } from 'react';

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { FieldRendererContextProvider } from '@/schema-form/providers';

import { useChildFieldErrors } from '../fieldNode/useChildFieldErrors';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** Render the ordinary error policy without installing a form. */
const Wrapper = ({ children }: PropsWithChildren) => (
  <FieldRendererContextProvider>{children}</FieldRendererContextProvider>
);

/** Build the public child-error surface with deterministic loaded children. */
const createRoot = () =>
  nodeFromJSONSchema({
    jsonSchema: { type: 'array', items: { type: 'string' } },
    defaultValue: ['a', 'b'],
    deferMountValidation: true,
    validationMode: 2,
  });

it('catches an error change between render and the subscription effect', () => {
  const root = createRoot();
  const child = (root.children ?? [])[0];
  if (!child) throw new Error('Missing loaded child');
  const issue = { dataPath: '/0', message: 'layout error' };
  const { result } = renderHook(
    () => {
      const value = useChildFieldErrors(root);
      useLayoutEffect(() => child.setExternalErrors([issue]), []);
      return value;
    },
    { wrapper: Wrapper },
  );
  expect(result.current.errorMatrix[0]).toEqual([issue]);
});

it('keeps fresh errors through StrictMode subscription cleanup and replay', () => {
  const root = createRoot();
  const child = (root.children ?? [])[0];
  if (!child) throw new Error('Missing loaded child');
  const { result, unmount } = renderHook(() => useChildFieldErrors(root), {
    wrapper: ({ children }: PropsWithChildren) => (
      <StrictMode>
        <Wrapper>{children}</Wrapper>
      </StrictMode>
    ),
  });
  act(() => child.setExternalErrors([{ dataPath: '/0', message: 'strict' }]));
  expect(result.current.errorMatrix[0][0]?.message).toBe('strict');
  unmount();
  expect(() => child.clearExternalErrors()).not.toThrow();
});

it('resubscribes after children change and ignores departed child notifications', () => {
  const root = createRoot();
  const old = (root.children ?? [])[0];
  if (!old) throw new Error('Missing loaded child');
  const { result } = renderHook(() => useChildFieldErrors(root), {
    wrapper: Wrapper,
  });
  act(() => root.remove(0));
  expect(result.current.errorMatrix).toHaveLength(1);
  const next = (root.children ?? [])[0];
  if (!next) throw new Error('Missing retained child');
  act(() => next.setExternalErrors([{ dataPath: '/0', message: 'retained' }]));
  expect(result.current.errorMatrix[0][0]?.message).toBe('retained');
  act(() => old.clearExternalErrors());
  expect(result.current.errorMatrix[0][0]?.message).toBe('retained');
});

it('catches changes made while disabled when subscription becomes enabled', () => {
  const root = createRoot();
  const child = (root.children ?? [])[0];
  if (!child) throw new Error('Missing loaded child');
  const { result, rerender } = renderHook(
    ({ disabled }) => useChildFieldErrors(root, disabled),
    {
      initialProps: { disabled: true },
      wrapper: Wrapper,
    },
  );
  act(() => child.setExternalErrors([{ dataPath: '/0', message: 'held' }]));
  expect(result.current.errorMatrix[0]).toEqual([]);
  rerender({ disabled: false });
  expect(result.current.errorMatrix[0][0]?.message).toBe('held');
  rerender({ disabled: true });
  expect(result.current.errorMatrix[0]).toEqual([]);
});

it('reacts to the parent UpdateChildren event with no child error event', () => {
  const root = createRoot();
  const { result } = renderHook(() => useChildFieldErrors(root), {
    wrapper: Wrapper,
  });
  act(() => root.push('new child'));
  expect(result.current.errorMatrix).toHaveLength(3);
});

it('preserves the scripted render invalidations for changed and identical error lists', () => {
  const root = createRoot();
  const child = (root.children ?? [])[0];
  if (!child) throw new Error('Missing loaded child');
  let renders = 0;
  const { result } = renderHook(
    () => {
      renders++;
      return useChildFieldErrors(root);
    },
    { wrapper: Wrapper },
  );
  const initial = renders;
  const issue = { dataPath: '/0', message: 'first' };
  const errors = [issue];
  act(() => child.setExternalErrors(errors));
  expect(renders).toBe(initial + 1);
  expect(result.current.errorMatrix[0][0]).toBe(issue);
  act(() => child.setExternalErrors(errors));
  expect(renders).toBe(initial + 1);
  act(() => child.setExternalErrors([issue]));
  expect(renders).toBe(initial + 2);
  act(() => child.clearExternalErrors());
  expect(renders).toBe(initial + 3);
  expect(result.current.errorMatrix[0]).toEqual([]);
  act(() => root.push('added'));
  expect(renders).toBe(initial + 4);
  expect(result.current.errorMatrix).toHaveLength(3);
});

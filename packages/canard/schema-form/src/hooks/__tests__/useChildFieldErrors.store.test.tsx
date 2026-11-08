import { type PropsWithChildren, StrictMode, useLayoutEffect } from 'react';

import { act, cleanup, render, renderHook } from '@testing-library/react';
import { afterEach, expect, inject, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { FieldRendererContextProvider } from '@/schema-form/providers';

import { hideCommittedForm } from '../../__tests__/helpers/hideCommittedForm';
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

it.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
])(
  'reconnects with stable error tokens (StrictMode=%s, changed=%s)',
  (strict, changed) => {
    const root = createRoot();
    const child = root.children![0];
    let renders = 0;
    const Probe = ({ tick }: { tick: number }) => {
      renders++;
      const { errorMatrix } = useChildFieldErrors(root);
      return (
        <output data-tick={tick}>{errorMatrix[0][0]?.message ?? 'none'}</output>
      );
    };
    const tree = (probe: React.ReactNode, hidden: boolean) => {
      const content = <Wrapper>{hideCommittedForm(probe, hidden)}</Wrapper>;
      return strict ? <StrictMode>{content}</StrictMode> : content;
    };
    const view = render(tree(<Probe tick={0} />, false));
    act(() => child.setExternalErrors([{ dataPath: '/0', message: 'before' }]));
    const probe = <Probe tick={1} />;
    view.rerender(tree(probe, false));
    const before = renders;
    view.rerender(tree(probe, true));
    if (changed)
      act(() =>
        child.setExternalErrors([{ dataPath: '/0', message: 'hidden' }]),
      );
    view.rerender(tree(probe, false));
    expect(view.container.querySelector('output')!.textContent).toBe(
      changed ? 'hidden' : 'before',
    );
    if (!changed || inject('reactMajor') === '19')
      expect(renders - before).toBe(changed ? (strict ? 2 : 1) : 0);
    console.info(
      `child-error reconnect strict=${strict} changed=${changed}: ${before}->${renders} renders`,
    );
  },
);

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

it.each([false, true])(
  'retains the cold-read token during a changed-prop reconnect (StrictMode=%s)',
  (strict) => {
    const root = createRoot();
    let value: ReturnType<typeof useChildFieldErrors>;
    let renders = 0;
    const Probe = ({ tick }: { tick: number }) => {
      renders++;
      value = useChildFieldErrors(root);
      return (
        <output data-tick={tick}>{value.errorMatrix[0][0]?.message}</output>
      );
    };
    const tree = (tick: number, hidden: boolean) => {
      const content = (
        <Wrapper>{hideCommittedForm(<Probe tick={tick} />, hidden)}</Wrapper>
      );
      return strict ? <StrictMode>{content}</StrictMode> : content;
    };
    const view = render(tree(0, false));
    act(() =>
      root.children![0].setExternalErrors([
        { dataPath: '/0', message: 'retained' },
      ]),
    );
    const subscribed = value!;
    view.rerender(tree(0, true));
    const before = renders;
    view.rerender(tree(1, false));
    expect(view.container.querySelector('output')!.textContent).toBe(
      'retained',
    );
    expect(value!).toBe(subscribed);
    expect(renders - before).toBe(strict ? 2 : 1);
  },
);

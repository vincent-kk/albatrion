import { StrictMode, createRef } from 'react';

import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import type { Nullish } from '@aileron/declare';

import { FieldNodeEventType } from '@/schema-form/core';

import { useFieldNodeTracker } from '../fieldNode/useFieldNodeTracker';
import { createHookNode } from './createHookNode';

/** Real node identities supplied by successive observation renders. */
type TrackerProps = { node: ReturnType<typeof createHookNode> | Nullish };

describe('useFieldNodeTracker nullish observation', () => {
  it.each([false, true])(
    'switches nodes and releases subscriptions (StrictMode=%s)',
    (strict) => {
      const first = createHookNode();
      const second = createHookNode();
      const active = [0, 0];
      [first, second].forEach((node, index) => {
        const subscribe = node.subscribe.bind(node);
        vi.spyOn(node, 'subscribe').mockImplementation((listener) => {
          active[index]++;
          const unsubscribe = subscribe(listener);
          return () => {
            active[index]--;
            unsubscribe();
          };
        });
      });
      const renders = vi.fn();
      const initialProps: TrackerProps = { node: null };
      const view = renderHook(
        ({ node }: TrackerProps) => {
          const revision = useFieldNodeTracker(
            node,
            FieldNodeEventType.UpdateValue,
          );
          renders(revision);
          return revision;
        },
        { initialProps, wrapper: strict ? StrictMode : undefined },
      );

      expect(view.result.current).toBe(0);
      expect(active).toEqual([0, 0]);
      view.rerender({ node: first });
      expect(active).toEqual([1, 0]);
      act(() => first.setValue('first'));
      expect(view.result.current).toBe(1);
      view.rerender({ node: undefined });
      expect(view.result.current).toBe(0);
      expect(active).toEqual([0, 0]);
      const absentRenders = renders.mock.calls.length;
      act(() => first.setValue('detached observer'));
      expect(renders).toHaveBeenCalledTimes(absentRenders);

      view.rerender({ node: second });
      expect(view.result.current).toBe(0);
      expect(active).toEqual([0, 1]);
      const secondRenders = renders.mock.calls.length;
      act(() => first.setValue('previous node'));
      expect(renders).toHaveBeenCalledTimes(secondRenders);
      act(() => second.setValue('second'));
      expect(view.result.current).toBe(1);
      view.unmount();
      expect(active).toEqual([0, 0]);
      const unmountedRenders = renders.mock.calls.length;
      act(() => second.setValue('after unmount'));
      expect(renders).toHaveBeenCalledTimes(unmountedRenders);
    },
  );

  it('interchanges undefined and null without observing a node', () => {
    const initialProps: TrackerProps = { node: undefined };
    const view = renderHook(
      ({ node }: TrackerProps) => useFieldNodeTracker(node),
      { initialProps },
    );
    expect(view.result.current).toBe(0);
    view.rerender({ node: null });
    expect(view.result.current).toBe(0);
    view.rerender({ node: undefined });
    expect(view.result.current).toBe(0);
  });

  it.each([null, undefined])('uses server snapshot 0 for %s', (node) => {
    /** Render the external-store server snapshot without committing a subscription. */
    const Probe = () => <output>{useFieldNodeTracker(node)}</output>;
    expect(renderToString(<Probe />)).toBe('<output>0</output>');
  });

  it('observes an assigned ref only after another render', () => {
    const formRef = createRef<{ node: ReturnType<typeof createHookNode> }>();
    const node = createHookNode();
    const subscribe = vi.spyOn(node, 'subscribe');
    const view = renderHook(() => useFieldNodeTracker(formRef.current?.node));
    act(() => {
      formRef.current = { node };
      node.setValue('before render');
    });
    expect(subscribe).not.toHaveBeenCalled();
    expect(view.result.current).toBe(0);
    view.rerender();
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(view.result.current).toBe(node.revision());
  });
});

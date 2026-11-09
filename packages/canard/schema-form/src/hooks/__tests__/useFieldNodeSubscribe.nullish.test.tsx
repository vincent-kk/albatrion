import { StrictMode } from 'react';

import { act, renderHook } from '@testing-library/react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import type { Nullish } from '@aileron/declare';

import type { StringNode } from '@/schema-form/core';
import { isStringNode } from '@/schema-form/core';

import { useFieldNodeSubscribe } from '../fieldNode/useFieldNodeSubscribe';
import { createHookNode } from './createHookNode';

/** The callback retains a required string subtype while observation may be absent. */
type SubscribeProps = { node: StringNode | Nullish };

describe('useFieldNodeSubscribe nullish observation', () => {
  it.each([false, true])(
    'catches up only on real nodes and releases each subscription (StrictMode=%s)',
    (strict) => {
      const first = createHookNode();
      const second = createHookNode();
      if (!isStringNode(first) || !isStringNode(second))
        throw new Error('Expected string fixture');
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
      const listener = vi.fn();
      const catchUps = vi.fn();
      const initialProps: SubscribeProps = { node: null };
      const view = renderHook(
        ({ node }: SubscribeProps) => {
          useFieldNodeSubscribe(node, listener, {
            onSubscribe: (current) => {
              expectTypeOf(current).toEqualTypeOf<StringNode>();
              catchUps(current, current.value);
            },
          });
        },
        { initialProps, wrapper: strict ? StrictMode : undefined },
      );

      expect(listener).not.toHaveBeenCalled();
      expect(catchUps).not.toHaveBeenCalled();
      act(() => first.setValue('before attach'));
      view.rerender({ node: first });
      expect(active).toEqual([1, 0]);
      expect(catchUps).toHaveBeenLastCalledWith(first, 'before attach');
      expect(catchUps).toHaveBeenCalledTimes(1);
      expect(listener).not.toHaveBeenCalled();
      act(() => first.setValue('first'));
      expect(listener).toHaveBeenCalledTimes(1);
      view.rerender({ node: undefined });
      expect(active).toEqual([0, 0]);
      act(() => first.setValue('absent observer'));
      expect(listener).toHaveBeenCalledTimes(1);
      expect(catchUps).toHaveBeenCalledTimes(1);
      view.rerender({ node: second });
      expect(active).toEqual([0, 1]);
      expect(catchUps).toHaveBeenCalledTimes(2);
      expect(catchUps).toHaveBeenLastCalledWith(second, second.value);
      act(() => first.setValue('previous node'));
      expect(listener).toHaveBeenCalledTimes(1);
      act(() => second.setValue('second'));
      expect(listener).toHaveBeenCalledTimes(2);
      view.unmount();
      expect(active).toEqual([0, 0]);
      act(() => second.setValue('after unmount'));
      expect(listener).toHaveBeenCalledTimes(2);
      expect(catchUps).toHaveBeenCalledTimes(2);
    },
  );

  it('interchanges undefined and null without calling either callback', () => {
    const listener = vi.fn();
    const onSubscribe = vi.fn<(node: StringNode) => void>();
    const initialProps: SubscribeProps = { node: undefined };
    const view = renderHook(
      ({ node }: SubscribeProps) =>
        useFieldNodeSubscribe(node, listener, { onSubscribe }),
      { initialProps },
    );
    view.rerender({ node: null });
    view.rerender({ node: undefined });
    expect(listener).not.toHaveBeenCalled();
    expect(onSubscribe).not.toHaveBeenCalled();
  });
});

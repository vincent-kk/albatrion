import { act, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useSchemaNodeSubscribe } from '../useSchemaNodeSubscribe';
import { createHookNode } from './createHookNode';

describe('useSchemaNodeSubscribe with a new-engine node', () => {
  it('catches up on attach without replaying a delivery from before subscribe', () => {
    const node = createHookNode();
    node.setValue('before');
    const deliveries: unknown[] = [];
    const catchUps: unknown[] = [];
    const Probe = () => {
      useSchemaNodeSubscribe(node, () => deliveries.push(node.value), {
        onSubscribe: (current) => catchUps.push(current.value),
      });
      return null;
    };

    render(<Probe />);
    expect(deliveries).toEqual([]);
    expect(catchUps).toEqual(['before']);
    act(() => node.setValue('after'));
    expect(deliveries).toEqual(['after']);
  });

  it('delivers once with one live subscription after StrictMode replay', () => {
    const node = createHookNode();
    const subscribe = node.subscribe.bind(node);
    let active = 0;
    vi.spyOn(node, 'subscribe').mockImplementation((listener) => {
      active += 1;
      const unsubscribe = subscribe(listener);
      return () => {
        active -= 1;
        unsubscribe();
      };
    });
    const listener = vi.fn();
    const Probe = () => {
      useSchemaNodeSubscribe(node, listener);
      return null;
    };

    const view = render(<StrictMode><Probe /></StrictMode>);
    expect(active).toBe(1);
    act(() => node.setValue('written'));
    expect(listener).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(active).toBe(0);
    act(() => node.setValue('after unmount'));
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

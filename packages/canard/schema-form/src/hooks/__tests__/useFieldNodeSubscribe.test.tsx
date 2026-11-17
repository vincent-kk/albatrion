import { StrictMode, useState } from 'react';

import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { hideCommittedForm } from '../../__tests__/helpers/hideCommittedForm';
import { useFieldNodeSubscribe } from '../fieldNode/useFieldNodeSubscribe';
import { createHookNode } from './createHookNode';

describe('useFieldNodeSubscribe with a new-engine node', () => {
  it('catches up on attach without replaying a delivery from before subscribe', () => {
    const node = createHookNode();
    node.setValue('before');
    const deliveries: unknown[] = [];
    const catchUps: unknown[] = [];
    const Probe = () => {
      useFieldNodeSubscribe(node, () => deliveries.push(node.value), {
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
      useFieldNodeSubscribe(node, listener);
      return null;
    };

    const view = render(
      <StrictMode>
        <Probe />
      </StrictMode>,
    );
    expect(active).toBe(1);
    act(() => node.setValue('written'));
    expect(listener).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(active).toBe(0);
    act(() => node.setValue('after unmount'));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])(
    'catches up on the same node after hidden writes (StrictMode=%s)',
    (strict) => {
      const node = createHookNode();
      node.setValue('initial');
      const deliveries = vi.fn();
      const Probe = () => {
        const [value, setValue] = useState(node.value);
        useFieldNodeSubscribe(
          node,
          () => {
            deliveries(node.value);
            setValue(node.value);
          },
          { onSubscribe: (current) => setValue(current.value) },
        );
        return <output>{String(value ?? '')}</output>;
      };
      const probe = <Probe />;
      const wrap = (hidden: boolean) => {
        const child = hideCommittedForm(probe, hidden);
        return strict ? <StrictMode>{child}</StrictMode> : child;
      };
      const view = render(wrap(false));
      for (let cycle = 0; cycle < 20; cycle += 1) {
        view.rerender(wrap(true));
        deliveries.mockClear();
        act(() => node.setValue(`hidden-${cycle}`));
        expect(deliveries).not.toHaveBeenCalled();
        view.rerender(wrap(false));
        expect(view.container.querySelector('output')!.textContent).toBe(
          node.value,
        );
        expect(deliveries).not.toHaveBeenCalled();
      }
      view.unmount();
    },
  );
});

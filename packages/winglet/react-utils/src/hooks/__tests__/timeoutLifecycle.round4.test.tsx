import { Activity, StrictMode, useEffect, useLayoutEffect } from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimeout } from '../useTimeout';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('timeout scheduling across effect lifetimes', () => {
  for (const lifecycle of ['mount', 'strict', 'activity'] as const) {
    for (const phase of ['layout', 'passive', 'child-layout', 'child-passive', 'event'] as const) {
      it(`${lifecycle} ${phase}`, () => {
        const callback = vi.fn();
        const Child = ({ schedule }: { schedule: () => void }) => {
          useLayoutEffect(() => { if (phase === 'child-layout') schedule(); }, [schedule]);
          useEffect(() => { if (phase === 'child-passive') schedule(); }, [schedule]);
          return null;
        };
        const Probe = () => {
          const { schedule } = useTimeout(callback, 50);
          useLayoutEffect(() => { if (phase === 'layout') schedule(); }, [schedule]);
          useEffect(() => { if (phase === 'passive') schedule(); }, [schedule]);
          return <button onClick={schedule}><Child schedule={schedule} /></button>;
        };
        const App = ({ mode }: { mode: 'visible' | 'hidden' }) => lifecycle === 'activity'
          ? <Activity mode={mode}><Probe /></Activity>
          : lifecycle === 'strict' ? <StrictMode><Probe /></StrictMode> : <Probe />;
        const view = render(<App mode="visible" />);
        if (phase === 'event') fireEvent.click(view.getByRole('button'));
        act(() => vi.advanceTimersByTime(100));
        const first = callback.mock.calls.length;
        expect(first).toBe(1);
        if (lifecycle === 'activity') {
          view.rerender(<App mode="hidden" />);
          act(() => vi.advanceTimersByTime(100));
          expect(callback).toHaveBeenCalledTimes(first);
          view.rerender(<App mode="visible" />);
          if (phase === 'event') fireEvent.click(view.getByRole('button'));
          act(() => vi.advanceTimersByTime(100));
          expect(callback.mock.calls.length - first).toBe(first);
        }
        view.unmount();
        act(() => vi.advanceTimersByTime(100));
        expect(callback).toHaveBeenCalledTimes(lifecycle === 'activity' ? 2 : 1);
      });
    }
  }
  it('a retained schedule stays inactive after unmount', () => {
    const callback = vi.fn(); let schedule = () => {};
    const Probe = () => { schedule = useTimeout(callback, 50).schedule; return null; };
    const view = render(<Probe />); view.unmount(); schedule();
    act(() => vi.advanceTimersByTime(100)); expect(callback).not.toHaveBeenCalled();
  });
});

import {
  Activity,
  StrictMode,
  type ReactNode,
  useEffect,
  useLayoutEffect,
} from 'react';

import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTimeout } from '../../hooks/useTimeout';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

type Schedule = () => void;

/** A child that starts its parent's timer when it mounts, as a consumer of a provider's timer would. */
const Child = ({ schedule }: { schedule: Schedule }) => {
  useEffect(() => {
    schedule();
  }, [schedule]);
  return null;
};

describe('useTimeout schedule() from effects that run before the hook re-arms (LC3, sibling of round-3 react-utils 3)', () => {
  const runChildCase = (wrap: (node: ReactNode) => ReactNode) => {
    const callback = vi.fn();
    const Parent = () => {
      const { schedule } = useTimeout(callback, 50);
      return <Child schedule={schedule} />;
    };
    render(<>{wrap(<Parent />)}</>);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    return callback.mock.calls.length;
  };

  it('control: a child mount effect schedules the parent timer once (no StrictMode)', () => {
    expect(runChildCase((node) => node)).toBe(1);
  });

  it('StrictMode: a child mount effect still schedules the parent timer', () => {
    expect(
      runChildCase((node) => <StrictMode>{node}</StrictMode>),
    ).toBe(1);
  });

  const runLayoutCase = (strict: boolean) => {
    const callback = vi.fn();
    const Probe = () => {
      const { schedule } = useTimeout(callback, 50);
      useLayoutEffect(() => {
        schedule();
      }, [schedule]);
      return null;
    };
    render(strict ? <StrictMode><Probe /></StrictMode> : <Probe />);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    return callback.mock.calls.length;
  };

  it('control: a layout mount effect schedules the timer once (no StrictMode)', () => {
    expect(runLayoutCase(false)).toBe(1);
  });

  it('StrictMode: a layout mount effect in the same component still schedules the timer', () => {
    expect(runLayoutCase(true)).toBe(1);
  });

  it('Activity: a child effect that re-runs on reveal schedules again, like the first mount', () => {
    const callback = vi.fn();
    const Parent = () => {
      const { schedule } = useTimeout(callback, 50);
      return <Child schedule={schedule} />;
    };
    const App = ({ mode }: { mode: 'visible' | 'hidden' }) => (
      <Activity mode={mode}>
        <Parent />
      </Activity>
    );
    const view = render(<App mode="visible" />);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    const afterFirstMount = callback.mock.calls.length;
    view.rerender(<App mode="hidden" />);
    view.rerender(<App mode="visible" />);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect({
      afterFirstMount,
      afterReveal: callback.mock.calls.length - afterFirstMount,
    }).toEqual({ afterFirstMount: 1, afterReveal: 1 });
  });
});

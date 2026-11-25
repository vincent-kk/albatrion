import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTimeout } from '../index';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('r3 react-utils: useTimeout after unmount (JSDoc: "Auto-cleanup: Prevents memory leaks on unmount")', () => {
  it('schedule() called after unmount does not run the callback', async () => {
    vi.useFakeTimers();
    try {
      const callback = vi.fn();
      let controls: ReturnType<typeof useTimeout> | null = null;
      const Probe = () => {
        controls = useTimeout(callback, 50);
        return null;
      };
      const view = render(<Probe />);
      view.unmount();
      // e.g. an awaited request resolves after the user navigated away
      controls!.schedule();
      vi.advanceTimersByTime(100);
      expect({
        calls: callback.mock.calls.length,
        idle: controls!.isIdle(),
      }).toEqual({ calls: 0, idle: true });
    } finally {
      vi.useRealTimers();
    }
  });
});

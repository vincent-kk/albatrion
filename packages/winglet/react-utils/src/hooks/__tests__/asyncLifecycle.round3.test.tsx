import { Suspense, startTransition, useState } from 'react';

import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useHandle } from '../useHandle';
import { useTimeout } from '../useTimeout';

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

describe('r3 react-utils: useHandle and an uncommitted transition render', () => {
  it('the stable handle reads the committed render, not a suspended transition', async () => {
    let resolveData: () => void = () => undefined;
    const data = new Promise<void>((resolve) => {
      resolveData = resolve;
    });
    let ready = false;
    void data.then(() => {
      ready = true;
    });
    const Gate = ({ value }: { value: string }) => {
      if (value === 'B' && !ready) throw data;
      return <span data-testid="shown">{value}</span>;
    };
    let handle: (() => string) | null = null;
    let setValue: (value: string) => void = () => undefined;
    const App = () => {
      const [value, set] = useState('A');
      setValue = set;
      handle = useHandle(() => value);
      return (
        <Suspense fallback={<span>loading</span>}>
          <Gate value={value} />
        </Suspense>
      );
    };
    const view = render(<App />);
    await act(async () => {
      startTransition(() => setValue('B'));
    });
    const shown = view.getByTestId('shown').textContent;
    const handled = handle!();
    resolveData();
    await act(async () => {
      await data;
    });
    expect({ shown, handled }).toEqual({ shown: 'A', handled: 'A' });
  });
});

import { Suspense, startTransition, useState } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';

import { useModalAnimation } from '../useModalAnimation';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it('keeps animation callbacks from the last committed render during suspension', () => {
  const frames: FrameRequestCallback[] = [];
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  const called = vi.fn();
  let change!: () => void;
  const pending = new Promise<void>(() => {});
  function Animation({ speculative }: { speculative: boolean }) {
    useModalAnimation(true, { onVisible: () => called(speculative) });
    if (speculative) throw pending;
    return null;
  }
  function App() {
    const [speculative, set] = useState(false);
    change = () => set(true);
    return (
      <Suspense fallback={null}>
        <Animation speculative={speculative} />
      </Suspense>
    );
  }
  render(<App />);
  act(() => {
    startTransition(change);
  });
  act(() => {
    for (const callback of frames) callback(0);
  });
  expect(called).toHaveBeenCalledWith(false);
});

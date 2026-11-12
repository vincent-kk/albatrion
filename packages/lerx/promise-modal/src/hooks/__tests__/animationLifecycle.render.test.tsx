import { Suspense, startTransition, useState } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { BootstrapProvider } from '@/promise-modal/bootstrap';
import { alertHandler } from '@/promise-modal/core';
import type { ModalFrameProps } from '@/promise-modal/types/modal';

import { useDestroyAfter } from '../useDestroyAfter';
import { useModalAnimation } from '../useModalAnimation';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it('reschedules settled destruction when the duration argument changes', () => {
  vi.useFakeTimers();
  function Frame({ id, context }: ModalFrameProps) {
    if (!('delay' in context) || typeof context.delay !== 'number')
      throw new Error('Expected delay');
    useDestroyAfter(id, context.delay);
    return null;
  }
  const view = render(
    <BootstrapProvider
      ForegroundComponent={Frame}
      context={{ delay: 200 }}
      options={{ manualDestroy: true }}
    />,
  );
  let handled!: ReturnType<typeof alertHandler>;
  act(() => {
    handled = alertHandler({});
  });
  act(() => {
    handled.modalNode?.onConfirm();
  });
  view.rerender(
    <BootstrapProvider
      ForegroundComponent={Frame}
      context={{ delay: 10 }}
      options={{ manualDestroy: true }}
    />,
  );
  act(() => {
    vi.advanceTimersByTime(10);
  });
  expect(handled.modalNode?.alive).toBe(false);
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

it('normalizes invalid destruction duration only when its input or fallback changes', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  let duration = JSON.parse('"invalid"');
  function Frame({ id }: ModalFrameProps) {
    useDestroyAfter(id, duration);
    return null;
  }
  const mount = (tick: number, fallback = 30) => (
    <BootstrapProvider
      ForegroundComponent={Frame}
      context={{ tick }}
      options={{ duration: fallback, manualDestroy: true }}
    />
  );
  const view = render(mount(0));
  act(() => {
    alertHandler({});
  });
  expect(warn).toHaveBeenCalledTimes(1);
  view.rerender(mount(1));
  view.rerender(mount(2));
  expect(warn).toHaveBeenCalledTimes(1);
  duration = JSON.parse('"also invalid"');
  view.rerender(mount(3));
  expect(warn).toHaveBeenCalledTimes(2);
  view.rerender(mount(4, 60));
  expect(warn).toHaveBeenCalledTimes(3);
});

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { BootstrapProvider } from '@/promise-modal/bootstrap';
import { alertHandler } from '@/promise-modal/core';
import type { ModalFrameProps } from '@/promise-modal/types/frame';

import { useDestroyAfter } from '../hooks/useDestroyAfter';

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

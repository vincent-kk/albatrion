import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { nodeFactory } from '@/promise-modal/core';

import { usePathname } from '../hooks/useDefaultPathname';

/** Captured frames let route detection run without real animation timing. */
let frames: Map<number, FrameRequestCallback>;

beforeEach(() => {
  ModalManager.reset();
  frames = new Map();
  let sequence = 0;
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      frames.set(++sequence, callback);
      return sequence;
    }),
  );
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn((id: number) => frames.delete(id)),
  );
  vi.stubGlobal('navigation', undefined);
});

afterEach(() => {
  cleanup();
  ModalManager.reset();
  window.history.replaceState(null, '', '/');
  vi.unstubAllGlobals();
});

it('schedules no animation frames while the modal store is empty', () => {
  renderHook(usePathname);
  expect(requestAnimationFrame).not.toHaveBeenCalled();
});

it('polls hidden alive nodes and cancels the last frame on destruction', () => {
  const node = nodeFactory({
    type: 'alert',
    id: ModalManager.nextId(),
    initiator: '/',
  });
  ModalManager.register(node);
  const hook = renderHook(usePathname);
  act(() => node.onHide());
  window.history.pushState(null, '', '/hidden-route');
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    for (const callback of pending) callback(0);
  });
  expect(hook.result.current.pathname).toBe('/hidden-route');
  expect(frames.size).toBeGreaterThan(0);
  act(() => node.onDestroy());
  expect(frames.size).toBe(0);
});

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
  vi.useRealTimers();
}, 60_000);

const state = () =>
  Reflect.get(globalThis, Symbol.for('@lerx/promise-modal')) as {
    frames: Map<number, HTMLElement>;
    focusTargets: Map<number, unknown>;
    focused: Set<number>;
    nodeCleanups: Map<number, unknown>;
    listeners: Set<unknown>;
    inertElements: unknown[];
  };

it('settles 150 concurrent confirms correctly and leaves no per-node state behind', async () => {
  vi.useFakeTimers();
  render(<ModalProvider options={{ duration: 10 }} />);
  const listenersBefore = state().listeners.size;
  const results = new Map<number, boolean>();
  act(() => {
    for (let index = 0; index < 150; index++)
      void confirm({ title: `m${index}`, dimmed: index % 3 !== 0 }).then(
        (value) => results.set(index, value),
      );
  });
  expect(ModalManager.ids.length).toBe(150);
  // Settle from the top with Escape and by button in a seeded order.
  let seed = 7;
  for (let step = 0; step < 150; step++) {
    seed = (seed * 1103515245 + 12345) % 2 ** 31;
    act(() => {
      if (seed % 2) fireEvent.keyDown(document.body, { key: 'Escape' });
      else {
        const top = [...ModalManager.ids]
          .map((id) => ModalManager.node(id)!)
          .filter((node) => !node.settled)
          .sort((a, b) => b.order - a.order)[0];
        (
          (state().frames.get(top.id) as HTMLElement).querySelector('button') as HTMLElement
        ).click();
      }
    });
  }
  await act(async () => {
    vi.advanceTimersByTime(100);
  });
  expect(results.size).toBe(150);
  expect(ModalManager.ids.length).toBe(0);
  const s = state();
  expect({
    frames: s.frames.size,
    focusTargets: s.focusTargets.size,
    focused: s.focused.size,
    nodeCleanups: s.nodeCleanups.size,
    inert: s.inertElements.length,
    listeners: s.listeners.size,
  }).toEqual({
    frames: 0,
    focusTargets: 0,
    focused: 0,
    nodeCleanups: 0,
    inert: 0,
    listeners: listenersBefore,
  });
  expect(document.body.style.overflow).toBe('');
}, 60_000);

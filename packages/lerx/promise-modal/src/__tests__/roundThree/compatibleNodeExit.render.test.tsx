import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';
import {
  background,
  visible as backgroundVisible,
} from '@/promise-modal/components/Background/styles/style';
import { visible as foregroundVisible } from '@/promise-modal/components/Foreground/styles/style';

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

it('keeps the same shown exit for compatible nodes with or without the visibility observation', async () => {
  const outcomes = [];
  for (const hasObservation of [true, false]) {
    render(<ModalProvider options={{ manualDestroy: true }} />);
    const controller = new AbortController();
    act(() => {
      void confirm({ title: 'Delete?', signal: controller.signal });
    });
    const node = ModalManager.node(ModalManager.ids[0]);
    const foreground = screen.getByText('Confirm').closest('[tabindex="-1"]');
    const backdrop = document.querySelector(`.${background}`);
    if (!node || !foreground || !backdrop)
      throw new Error('modal fixture did not mount');
    // Compatible registry nodes can omit newer observations.
    if (!hasObservation)
      Object.defineProperty(node, 'isVisibleAtSettlement', {
        value: undefined,
      });
    await act(async () => controller.abort());
    outcomes.push({
      foreground: foreground.classList.contains(foregroundVisible),
      background: backdrop.classList.contains(backgroundVisible),
    });
    cleanup();
    ModalManager.reset();
  }
  expect(outcomes[0]).toEqual({ foreground: true, background: true });
  expect(outcomes[1]).toEqual(outcomes[0]);
});

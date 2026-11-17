import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { alertHandler } from '@/promise-modal/core';

import { BootstrapProvider } from '../BootstrapProvider';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  window.history.replaceState(null, '', '/');
  vi.restoreAllMocks();
});

it('records the opening pathname after navigation during an idle interval', () => {
  render(<BootstrapProvider />);
  window.history.pushState(null, '', '/opened-after-idle');
  let handled!: ReturnType<typeof alertHandler>;
  act(() => {
    handled = alertHandler({ title: 'Current route' });
  });
  expect(handled.modalNode?.initiator).toBe('/opened-after-idle');
  expect(handled.modalNode?.visible).toBe(true);
});

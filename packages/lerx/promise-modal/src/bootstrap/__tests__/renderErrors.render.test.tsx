import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { alertHandler, promptHandler } from '@/promise-modal/core';

import { BootstrapProvider } from '../BootstrapProvider';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});
it('R6 rejects only the failed content and renders peers and later modals', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const error = new Error('broken content');
  const rejected = vi.fn();
  render(<BootstrapProvider />);
  act(() => {
    alertHandler({ title: 'peer' });
  });
  act(() => {
    alertHandler({
      content: () => {
        throw error;
      },
    }).promiseHandler.catch(rejected);
  });
  await act(async () => {
    await Promise.resolve();
  });
  expect(rejected).toHaveBeenCalledWith(error);
  expect(screen.getByText('peer')).toBeDefined();
  act(() => {
    alertHandler({ title: 'later' });
  });
  expect(await screen.findByText('later')).toBeDefined();
});
it('R6 rejects a failed prompt Input through its presenter boundary', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const error = new Error('broken input');
  const rejected = vi.fn();
  render(<BootstrapProvider />);
  act(() => {
    promptHandler({
      Input: () => {
        throw error;
      },
    }).promiseHandler.catch(rejected);
  });
  await act(async () => {
    await Promise.resolve();
  });
  expect(rejected).toHaveBeenCalledWith(error);
});

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { alertHandler } from '@/promise-modal/core';
import * as providers from '@/promise-modal/providers';

import { BootstrapProvider } from '../BootstrapProvider';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});
it('rejects every alive node on AnchorInner failure and waits for registration before retrying', async () => {
  const logs = vi.spyOn(console, 'error').mockImplementation(() => {});
  const original = providers.useConfigurationOptions;
  let broken = false;
  const error = new Error('anchor render failed');
  let attempts = 0;
  vi.spyOn(providers, 'useConfigurationOptions').mockImplementation(() => {
    const options = original();
    return {
      ...options,
      get backdrop() {
        if (broken) {
          attempts++;
          throw error;
        }
        return options.backdrop;
      },
    };
  });
  render(<BootstrapProvider />);
  const first = vi.fn();
  const second = vi.fn();
  act(() => {
    alertHandler({ title: 'existing' }).promiseHandler.catch(first);
  });
  broken = true;
  act(() => {
    alertHandler({ title: 'triggers failure' }).promiseHandler.catch(second);
  });
  await act(async () => {
    await Promise.resolve();
  });
  expect(first).toHaveBeenCalledWith(error);
  expect(second).toHaveBeenCalledWith(error);
  expect(ModalManager.ids).toHaveLength(0);
  const stoppedAt = attempts;
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  expect(attempts).toBe(stoppedAt);
  expect(
    logs.mock.calls.some((args) =>
      args.some((arg) => String(arg).includes('Maximum update depth')),
    ),
  ).toBe(false);
  broken = false;
  act(() => {
    alertHandler({ title: 'recovered anchor' });
  });
  expect(await screen.findByText('recovered anchor')).toBeDefined();
});

it('updates zIndex for existing frames when provider options change', async () => {
  const view = render(<BootstrapProvider options={{ zIndex: 100 }} />);
  act(() => {
    alertHandler({ title: 'position' });
  });
  const frame = document.querySelector<HTMLElement>('[class^="presenter-"]')!;
  expect(frame.style.zIndex).toBe('101');
  view.rerender(<BootstrapProvider options={{ zIndex: 500 }} />);
  expect(frame.style.zIndex).toBe('501');
});

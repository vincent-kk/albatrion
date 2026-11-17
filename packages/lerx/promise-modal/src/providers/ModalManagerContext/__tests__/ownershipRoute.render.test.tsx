import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { BootstrapProvider } from '@/promise-modal/bootstrap';
import { confirmHandler } from '@/promise-modal/core';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

/** A routing hook that never reports the default provider's window path. */
const useFeaturePathname = () => ({ pathname: '/feature' });

it('keeps a live modal visible when ownership transfers to a waiter with another pathname hook', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const view = render(
    <>
      <BootstrapProvider key="shell" />
      <BootstrapProvider key="feature" usePathname={useFeaturePathname} />
    </>,
  );
  let handle!: ReturnType<typeof confirmHandler>;
  act(() => {
    handle = confirmHandler({ title: 'live request' });
  });
  expect(handle.modalNode?.visible).toBe(true);

  view.rerender(
    <BootstrapProvider key="feature" usePathname={useFeaturePathname} />,
  );
  await act(async () => {});

  expect(handle.modalNode?.alive).toBe(true);
  expect(handle.modalNode?.settled).toBe(false);
  expect(handle.modalNode?.visible).toBe(true);
  expect(handle.modalNode?.initiator).toBe('/feature');
});

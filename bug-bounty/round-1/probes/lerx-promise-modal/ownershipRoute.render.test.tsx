import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { ModalProvider, confirm } from '@/promise-modal';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

const useFeaturePathname = () => ({ pathname: '/feature' });

it('keeps a live modal visible when ownership transfers to a waiter with another pathname hook', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const view = render(
    <>
      <ModalProvider key="shell" />
      <ModalProvider key="feature" usePathname={useFeaturePathname} />
    </>,
  );
  let result: boolean | undefined;
  act(() => {
    void confirm({ title: 'live request' }).then((value) => {
      result = value;
    });
  });
  expect(screen.getByText('live request')).toBeDefined();
  view.rerender(
    <>
      <ModalProvider key="feature" usePathname={useFeaturePathname} />
    </>,
  );
  await act(async () => {});
  const ids = ModalManager.ids;
  expect(ids.length).toBe(1);
  // The request is neither settled nor visible: it waits for a route
  // ('/'), which the receiving provider's pathname hook can never report.
  expect(result).toBeUndefined();
  expect(ModalManager.node(ids[0])?.visible).toBe(true);
});

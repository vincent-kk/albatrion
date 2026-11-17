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
/** A second routing hook used to hide a request before ownership moves. */
const useOtherPathname = () => ({ pathname: '/other' });

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
  // Known limit: adoption decides visibility only; the node keeps the previous owner's initiator.
  expect(handle.modalNode?.initiator).toBe(window.location.pathname);
});

it('hides and restores an adopted modal on the receiving provider route', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  let pathname = '/feature';
  const useMovingPathname = () => ({ pathname });
  const view = render(
    <>
      <BootstrapProvider key="shell" />
      <BootstrapProvider key="feature" usePathname={useMovingPathname} />
    </>,
  );
  let handle!: ReturnType<typeof confirmHandler>;
  act(() => {
    handle = confirmHandler({ title: 'adopted request' });
  });
  view.rerender(
    <BootstrapProvider key="feature" usePathname={useMovingPathname} />,
  );
  await act(async () => {});
  expect(handle.modalNode?.visible).toBe(true);

  pathname = '/elsewhere';
  view.rerender(
    <BootstrapProvider key="feature" usePathname={() => useMovingPathname()} />,
  );
  expect(handle.modalNode?.visible).toBe(false);

  pathname = '/feature';
  view.rerender(
    <BootstrapProvider key="feature" usePathname={() => useMovingPathname()} />,
  );
  expect(handle.modalNode?.visible).toBe(true);
  expect(handle.modalNode?.settled).toBe(false);
});

it('keeps a route-hidden modal on its original route after ownership transfers', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  let pathname = '/shell';
  const useShellPathname = () => ({ pathname });
  const view = render(
    <>
      <BootstrapProvider key="shell" usePathname={useShellPathname} />
      <BootstrapProvider key="feature" usePathname={useOtherPathname} />
    </>,
  );
  let handle!: ReturnType<typeof confirmHandler>;
  act(() => {
    handle = confirmHandler({ title: 'hidden request' });
  });
  pathname = '/elsewhere';
  view.rerender(
    <>
      <BootstrapProvider key="shell" usePathname={() => useShellPathname()} />
      <BootstrapProvider key="feature" usePathname={useOtherPathname} />
    </>,
  );
  expect(handle.modalNode?.visible).toBe(false);

  view.rerender(
    <BootstrapProvider key="feature" usePathname={useOtherPathname} />,
  );
  await act(async () => {});

  expect(handle.modalNode?.visible).toBe(false);
  expect(handle.modalNode?.initiator).toBe('/shell');
});

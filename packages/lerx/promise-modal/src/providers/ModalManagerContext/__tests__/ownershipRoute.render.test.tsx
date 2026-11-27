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

/** A second routing hook used to hide a request before ownership moves. */
const useOtherPathname = () => ({ pathname: '/other' });

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

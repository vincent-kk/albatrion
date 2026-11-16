import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { confirmHandler } from '@/promise-modal/core';

import { BootstrapProvider } from '../BootstrapProvider';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});
it('queued requests transferred to waiter use the waiter options', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const ownerPath = () => ({ pathname: '/owner' });
  const waiterPath = () => ({ pathname: '/waiter' });
  const owner = { duration: 1100, closeOnEscape: false };
  const waiter = { duration: 0, closeOnEscape: true };
  const view = render(
    <>
      <BootstrapProvider key="owner" usePathname={ownerPath} options={owner} />
      <BootstrapProvider
        key="waiter"
        usePathname={waiterPath}
        options={waiter}
      />
    </>,
  );
  view.rerender(
    <>
      <BootstrapProvider
        key="owner"
        root={null}
        usePathname={ownerPath}
        options={owner}
      />
      <BootstrapProvider
        key="waiter"
        usePathname={waiterPath}
        options={waiter}
      />
    </>,
  );
  const request = confirmHandler({ title: 'queued' });
  expect(request.modalNode).toBeUndefined();
  view.rerender(
    <>
      <BootstrapProvider
        key="waiter"
        usePathname={waiterPath}
        options={waiter}
      />
    </>,
  );
  expect(await screen.findByText('queued')).toBeDefined();
  expect(request.modalNode?.visible).toBe(true);
  expect(request.modalNode?.duration).toBe(0);
  expect(request.modalNode?.closeOnEscape).toBe(true);
  expect(request.modalNode?.initiator).toBe('/waiter');
  fireEvent.keyDown(document, { key: 'Escape' });
  await expect(request.promiseHandler).resolves.toBe(false);
});

it('retains shared styles during handoff and removes them with the final owner', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const view = render(
    <>
      <BootstrapProvider key="owner" />
      <BootstrapProvider key="waiter" />
    </>,
  );
  const scope = document.querySelector('[id^="promise-modal-"]')!.className;
  await act(async () => {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
  });
  const style = Array.from(document.head.querySelectorAll('style')).find(
    (node) => node.textContent?.includes(scope),
  )!;
  expect(style).toBeDefined();
  view.rerender(<BootstrapProvider key="waiter" />);
  expect(style.isConnected).toBe(true);
  view.unmount();
  expect(style.isConnected).toBe(false);
});

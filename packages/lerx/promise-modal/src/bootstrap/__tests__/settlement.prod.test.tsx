import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { alertHandler, confirmHandler } from '@/promise-modal/core';

import { BootstrapProvider } from '../BootstrapProvider';

/** Flushes the production scheduler without React.act. */
const flush = async () => {
  for (let i = 0; i < 5; i++)
    await new Promise((resolve) => setTimeout(resolve, 0));
};
let root: ReturnType<typeof createRoot> | undefined;
let container: HTMLElement | undefined;
afterEach(async () => {
  root?.unmount();
  root = undefined;
  await flush();
  container?.remove();
  ModalManager.reset();
  vi.restoreAllMocks();
});
/** Mounts the real production portal in a disposable container. */
const mount = async () => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  root.render(<BootstrapProvider />);
  await flush();
};
it('R1 removes destroyed frames in production', async () => {
  await mount();
  const handled = alertHandler({ title: 'remove prod', duration: 0 });
  await flush();
  document.querySelector<HTMLButtonElement>('button')!.click();
  await handled.promiseHandler;
  await flush();
  expect(document.body.textContent).not.toContain('remove prod');
});
it('R2 cancels open requests on production unmount', async () => {
  await mount();
  const result = vi.fn();
  confirmHandler({}).promiseHandler.then(result);
  await flush();
  root!.unmount();
  root = undefined;
  await flush();
  expect(result).toHaveBeenCalledWith(false);
});
it('R6 isolates render failure and allows later production modals', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  await mount();
  const error = new Error('production failure');
  const result = vi.fn();
  alertHandler({ title: 'production peer' });
  await flush();
  alertHandler({
    content: () => {
      throw error;
    },
  }).promiseHandler.catch(result);
  await flush();
  expect(result).toHaveBeenCalledWith(error);
  expect(document.body.textContent).toContain('production peer');
  alertHandler({ title: 'production later' });
  await flush();
  expect(document.body.textContent).toContain('production later');
});

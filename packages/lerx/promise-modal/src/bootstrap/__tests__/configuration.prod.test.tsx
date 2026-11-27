import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { alertHandler } from '@/promise-modal/core';

import { BootstrapProvider } from '../BootstrapProvider';

const flush = async () => {
  for (let index = 0; index < 5; index++)
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

it('normalizes options and keeps component overrides fixed without production warnings', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  root.render(
    <BootstrapProvider
      ContentComponent={({ children }) => <article>{children}</article>}
      options={{ duration: 0.5 }}
    />,
  );
  await flush();
  const handled = alertHandler({
    content: 'production content',
    duration: undefined,
  });
  await flush();
  expect(handled.modalNode?.duration).toBe(0.5);
  root.render(
    <BootstrapProvider
      ContentComponent={({ children }) => <aside>{children}</aside>}
      options={{ duration: 0.5 }}
    />,
  );
  await flush();
  expect(document.querySelector('article')?.textContent).toBe(
    'production content',
  );
  expect(document.querySelector('aside')).toBeNull();
  expect(warn).not.toHaveBeenCalled();
});

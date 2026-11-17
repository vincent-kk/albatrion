// Exercises the public entry point as an application consumer.
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalProvider, confirm } from '../index';

afterEach(() => {
  cleanup();
  document.querySelector('modal-abort-peer')?.remove();
});

it('does not mount a queued request aborted by a synchronous inert observer', async () => {
  const controller = new AbortController();
  class AbortQueuedPeer extends HTMLElement {
    static observedAttributes = ['inert'];
    attributeChangedCallback(
      _name: string,
      _previous: string | null,
      value: string | null,
    ) {
      if (value !== null) controller.abort();
    }
  }
  customElements.define('modal-abort-peer', AbortQueuedPeer);
  document.body.append(document.createElement('modal-abort-peer'));

  const first = confirm({ title: 'first request', duration: 1000 });
  const second = confirm({
    title: 'aborted queued request',
    signal: controller.signal,
    duration: 1000,
  });
  const view = render(<ModalProvider />);

  await expect(second).resolves.toBe(false);
  expect(screen.queryByText('aborted queued request')).toBeNull();
  expect(screen.getByText('first request')).toBeDefined();
  view.unmount();
  await expect(first).resolves.toBe(false);
});

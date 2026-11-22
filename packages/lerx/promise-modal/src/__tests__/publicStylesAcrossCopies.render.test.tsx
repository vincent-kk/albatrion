import { render, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { loadCommonJS } from './dualPackageHooks/helpers/loadCommonJS';

it.each([false, true])(
  'releases compatible providers’ shared stylesheet in a shadow root=%s',
  async (shadow) => {
    const first = await import('@lerx/promise-modal');
    const peer = await loadCommonJS();
    expect(first.ModalProvider).not.toBe(peer.ModalProvider);
    const host = document.createElement('div');
    document.body.append(host);
    const destination = shadow
      ? host.attachShadow({ mode: 'open' })
      : document.body;
    const root = document.createElement('div');
    destination.appendChild(root);
    const styleRoot =
      shadow && destination instanceof ShadowRoot ? destination : document.head;
    const styleCount = () =>
      styleRoot.querySelectorAll('style').length +
      (styleRoot instanceof ShadowRoot
        ? (styleRoot.adoptedStyleSheets?.length ?? 0)
        : 0);
    const before = styleCount();
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const view = render(
      <>
        <first.ModalProvider key="first" root={root} />
        <peer.ModalProvider key="peer" root={root} />
      </>,
    );
    try {
      await waitFor(() => expect(styleCount()).toBeGreaterThan(before));
      view.rerender(<peer.ModalProvider key="peer" root={root} />);
      await waitFor(() => expect(styleCount()).toBeGreaterThan(before));
      view.rerender(<></>);
      await waitFor(() => expect(styleCount()).toBe(before));
    } finally {
      view.unmount();
      root.remove();
      host.remove();
      warning.mockRestore();
    }
  },
);

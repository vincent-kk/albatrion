
import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';

import { Portal } from '../index';

describe('round-2 react-utils 1: native portal ancestry and lifecycle', () => {
  it('hydrates the empty server anchor without a mismatch', async () => {
    const Page = Portal.with(() => (
      <>
        <Portal>
          <span>content</span>
        </Portal>
        <Portal.Anchor />
      </>
    ));
    const host = document.createElement('div');
    host.innerHTML = renderToString(<Page />);
    expect(host.querySelector('span')).toBeNull();
    document.body.appendChild(host);
    const error = vi.spyOn(console, 'error');
    const root = await act(async () => hydrateRoot(host, <Page />));
    expect(host.querySelector('span')?.textContent).toBe('content');
    expect(error).not.toHaveBeenCalled();
    await act(async () => root.unmount());
    error.mockRestore();
    host.remove();
  });
});

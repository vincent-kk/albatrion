import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { type ModalFrameProps, ModalProvider, confirm } from '../index';

function Frame({ initiator, visible }: ModalFrameProps) {
  return (
    <output data-testid="request" data-initiator={initiator}>
      {String(visible)}
    </output>
  );
}

afterEach(() => vi.restoreAllMocks());

it('adopts the receiving route while keeping the original request initiator', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const request = new AbortController();
  const originalPath = window.location.pathname;
  const app = (shell: boolean, pathname: string) => (
    <>
      {shell && <ModalProvider key="shell" ForegroundComponent={Frame} />}
      <ModalProvider
        key="receiver"
        ForegroundComponent={Frame}
        usePathname={() => ({ pathname })}
      />
    </>
  );
  const view = render(app(true, '/feature'));
  try {
    act(() => {
      void confirm({ title: 'Pending', signal: request.signal });
    });
    expect(screen.getByTestId('request').textContent).toBe('true');
    view.rerender(app(false, '/feature'));
    await act(async () => {});
    expect(screen.getByTestId('request').textContent).toBe('true');
    expect(screen.getByTestId('request').getAttribute('data-initiator')).toBe(
      originalPath,
    );

    view.rerender(app(false, '/elsewhere'));
    expect(screen.getByTestId('request').textContent).toBe('false');
    view.rerender(app(false, '/feature'));
    expect(screen.getByTestId('request').textContent).toBe('true');
  } finally {
    await act(async () => request.abort());
  }
});

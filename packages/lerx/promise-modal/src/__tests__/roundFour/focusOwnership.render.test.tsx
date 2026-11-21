import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

/** Settle a displayed request after moving focus along one ownership boundary. */
async function settle(position: string) {
  const view = render(
    <>
      <main>
        <button data-opener="">opener</button>
        <input data-page="" />
      </main>
      <ModalProvider options={{ duration: 0 }} />
    </>,
  );
  const opener = document.querySelector<HTMLButtonElement>('[data-opener]')!;
  const page = document.querySelector<HTMLInputElement>('[data-page]')!;
  opener.focus();
  const signal = new AbortController();
  act(() => {
    void confirm({
      content: () => <input data-inside="" />,
      signal: signal.signal,
    });
  });
  const inside = document.querySelector<HTMLInputElement>('[data-inside]')!;
  let portal: HTMLDivElement | undefined;
  if (position === 'body') inside.blur();
  else if (position === 'unrelated') page.focus();
  else if (position === 'portal') {
    portal = document.createElement('div');
    portal.setAttribute('role', 'listbox');
    const input = document.createElement('input');
    portal.append(input);
    document.body.append(portal);
    input.focus();
  }
  await act(async () => signal.abort());
  const result = {
    opener: document.activeElement === opener,
    page: document.activeElement === page,
  };
  portal?.remove();
  view.unmount();
  await act(async () => {});
  ModalManager.reset();
  return result;
}

it.each(['body', 'portal'])(
  'focus in %s restores like focus inside the displayed dialog',
  async (position) => {
    expect(await settle(position)).toEqual(await settle('inside'));
  },
);
it('preserves an unrelated page control instead of restoring the displayed request opener', async () => {
  expect(await settle('unrelated')).toEqual({ opener: false, page: true });
});

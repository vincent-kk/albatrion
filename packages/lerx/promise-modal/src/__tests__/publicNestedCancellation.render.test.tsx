import { useState } from 'react';

import { act, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { ModalProvider, confirm } from '../index';

/**
 * Exercise shared-signal cancellation after opening a modal from another modal.
 * @param suspended Whether the lower modal suspends again before cancellation.
 * @returns Both cancellation values, whether focus returned to the opener, its
 * inert state, and the number of remaining requests.
 */
async function nestedCancellation(suspended: boolean) {
  const gate = new Promise<void>(() => {});
  let block = () => {};
  function Content() {
    const [blocked, setBlocked] = useState(false);
    block = () => setBlocked(true);
    if (blocked) throw gate;
    return <button>Inner opener</button>;
  }
  const view = render(
    <>
      <main>
        <button>Page opener</button>
      </main>
      <ModalProvider options={{ duration: 0 }} />
    </>,
  );
  const opener = screen.getByText('Page opener');
  opener.focus();
  const signal = new AbortController();
  const results: boolean[] = [];
  act(() => {
    void confirm({ content: <Content />, signal: signal.signal }).then(
      (value) => results.push(value),
    );
  });
  screen.getByText('Inner opener').focus();
  act(() => {
    void confirm({
      content: <button>Top control</button>,
      signal: signal.signal,
    }).then((value) => results.push(value));
  });
  screen.getByText('Top control').focus();
  if (suspended) act(() => block());
  await act(async () => signal.abort());
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
  const outcome = {
    results,
    restored: document.activeElement === opener,
    inert: !!opener.closest('[inert]'),
    count: document.querySelectorAll('[role=dialog]').length,
  };
  view.unmount();
  await act(async () => {});
  return outcome;
}

it('shared cancellation with a suspended lower owner restores like the connected stack', async () => {
  const shown = await nestedCancellation(false);
  expect(shown).toEqual({
    results: [false, false],
    restored: true,
    inert: false,
    count: 0,
  });
  expect(await nestedCancellation(true)).toEqual(shown);
});

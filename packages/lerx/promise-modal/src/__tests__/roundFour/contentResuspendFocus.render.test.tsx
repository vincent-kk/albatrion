import { Suspense, lazy, useState } from 'react';
import type { PropsWithChildren } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

/**
 * Angles RG1 (round 3 item 1, the Suspense boundary inside each presenter) and
 * EQ5 (Suspense re-suspend against a plain mount).
 *
 * jsdom keeps focus on an element after React hides it with display: none; a
 * browser runs the HTML focus fixup and moves focus to the body. The probe applies
 * that fixup explicitly after each hide, as the browser would.
 */
afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

function browserFocusFixup() {
  const active = document.activeElement;
  if (
    active instanceof HTMLElement &&
    active !== document.body &&
    active.closest('[style*="none"]')
  )
    active.blur();
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve, done: false };
}

it('returns focus into a dialog whose content re-suspended and then revealed again', async () => {
  const page2 = deferred();
  void page2.promise.then(() => (page2.done = true));
  function Pager() {
    const [page, setPage] = useState(1);
    if (page === 2 && !page2.done) throw page2.promise;
    return (
      <div>
        <p>Page {page}</p>
        <button onClick={() => setPage(2)}>Next page</button>
      </div>
    );
  }
  render(
    <ModalProvider>
      <main>
        <button>Open</button>
      </main>
    </ModalProvider>,
  );
  screen.getByText('Open').focus();
  act(() => {
    void confirm({ title: 'Results', content: <Pager /> });
  });
  const next = screen.getByText('Next page');
  next.focus();
  act(() => fireEvent.click(next));
  expect(
    screen.getByText('Next page').closest('[style*="none"]'),
  ).not.toBeNull();
  browserFocusFixup();
  expect(document.activeElement).toBe(document.body);
  await act(async () => {
    page2.resolve();
    await page2.promise;
  });
  expect(screen.getByText('Page 2')).toBeTruthy();
  expect({
    focusInsideDialog: !!document.activeElement?.closest('[role="dialog"]'),
    pageInert: !!document.querySelector('main')?.closest('[inert]'),
  }).toEqual({ focusInsideDialog: true, pageInert: true });
});

const Suspender = lazy(() => new Promise<{ default: () => null }>(() => {}));
function Gate({ hidden, children }: PropsWithChildren<{ hidden: boolean }>) {
  return (
    <Suspense fallback={<span>loading</span>}>
      {children}
      {hidden && <Suspender />}
    </Suspense>
  );
}

it('control: returns focus into the dialog when the Provider re-suspends and reveals', async () => {
  const app = (hidden: boolean) => (
    <>
      <main>
        <button>Open</button>
      </main>
      <Gate hidden={hidden}>
        <ModalProvider />
      </Gate>
    </>
  );
  const view = render(app(false));
  screen.getByText('Open').focus();
  act(() => {
    void confirm({ title: 'Results', content: <button>Next page</button> });
  });
  screen.getByText('Next page').focus();
  await act(async () => view.rerender(app(true)));
  browserFocusFixup();
  await act(async () => view.rerender(app(false)));
  expect({
    focusInsideDialog: !!document.activeElement?.closest('[role="dialog"]'),
    pageInert: !!document.querySelector('main')?.closest('[inert]'),
  }).toEqual({ focusInsideDialog: true, pageInert: true });
});

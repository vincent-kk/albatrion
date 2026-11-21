import { useState } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

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

/** Content whose second page suspends until `gate` resolves. */
function makePager(gate: ReturnType<typeof deferred>) {
  void gate.promise.then(() => (gate.done = true));
  return function Pager() {
    const [page, setPage] = useState(1);
    if (page === 2 && !gate.done) throw gate.promise;
    return (
      <div>
        <p>Page {page}</p>
        <button onClick={() => setPage(2)}>Next page</button>
      </div>
    );
  };
}

describe('a displayed request whose content re-suspended, then aborted', () => {
  async function run(suspendFirst: boolean) {
    const gate = deferred();
    const Pager = makePager(gate);
    const view = render(
      <ModalProvider options={{ duration: 0 }}>
        <main>
          <button>Open</button>
        </main>
      </ModalProvider>,
    );
    const opener = screen.getByText('Open');
    opener.focus();
    const controller = new AbortController();
    let result: boolean | undefined;
    act(() => {
      void confirm({
        title: 'Results',
        content: <Pager />,
        signal: controller.signal,
      }).then((value) => (result = value));
    });
    const next = screen.getByText('Next page');
    next.focus();
    let pageInertWhileLoading: boolean | null = null;
    if (suspendFirst) {
      act(() => fireEvent.click(next));
      browserFocusFixup();
      expect(document.activeElement).toBe(document.body);
      pageInertWhileLoading = !!document
        .querySelector('main')
        ?.closest('[inert]');
    }
    await act(async () => controller.abort());
    const outcome = {
      result,
      pageInertWhileLoading,
      focusOnOpener: document.activeElement === opener,
      focusOnBody: document.activeElement === document.body,
    };
    view.unmount();
    await act(async () => {});
    ModalManager.reset();
    return outcome;
  }

  it('M1 returns focus to the opener, as the same abort does while the content is shown', async () => {
    const shown = await run(false);
    const loading = await run(true);
    expect(shown).toMatchObject({ result: false, focusOnOpener: true });
    expect(loading).toEqual({
      result: false,
      pageInertWhileLoading: true,
      focusOnOpener: true,
      focusOnBody: false,
    });
  });
});

describe('reconnected requests', () => {
  it('M2 a request whose root moved to another element still returns focus to the opener', async () => {
    function App() {
      const [target, setTarget] = useState<HTMLElement | null>(null);
      const [second, setSecond] = useState<HTMLElement | null>(null);
      const [useSecond, setUseSecond] = useState(false);
      return (
        <>
          <main>
            <button>Open</button>
            <button onClick={() => setUseSecond(true)}>Move</button>
          </main>
          <section ref={setTarget} />
          <aside ref={setSecond} />
          <ModalProvider
            root={useSecond ? second : target}
            options={{ duration: 0 }}
          />
        </>
      );
    }
    render(<App />);
    const opener = screen.getByText('Open');
    opener.focus();
    let resolved: boolean | undefined;
    act(() => {
      void confirm({
        title: 'Keep?',
        content: <input aria-label="Note" />,
      }).then((value) => (resolved = value));
    });
    const note = screen.getByLabelText('Note');
    note.focus();
    act(() => fireEvent.click(screen.getByText('Move')));
    note.focus();
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect({
      resolved,
      focusOnOpener: document.activeElement === opener,
    }).toEqual({
      resolved: false,
      focusOnOpener: true,
    });
  });

  it('M3 a request detached with root={null} and attached again returns focus to the opener', async () => {
    function App({ attached }: { attached: boolean }) {
      const [target, setTarget] = useState<HTMLElement | null>(null);
      return (
        <>
          <main>
            <button>Open</button>
          </main>
          <section ref={setTarget} />
          <ModalProvider
            root={attached ? target : null}
            options={{ duration: 0 }}
          />
        </>
      );
    }
    const view = render(<App attached />);
    const opener = screen.getByText('Open');
    opener.focus();
    let resolved: boolean | undefined;
    act(() => {
      void confirm({
        title: 'Keep?',
        content: <input aria-label="Note" />,
      }).then((value) => (resolved = value));
    });
    screen.getByLabelText('Note').focus();
    await act(async () => view.rerender(<App attached={false} />));
    await act(async () => view.rerender(<App attached />));
    const insideAfterReattach =
      !!document.activeElement?.closest('[role="dialog"]');
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect({
      insideAfterReattach,
      resolved,
      focusOnOpener: document.activeElement === opener,
    }).toEqual({
      insideAfterReattach: true,
      resolved: false,
      focusOnOpener: true,
    });
  });
});

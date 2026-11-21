import { Suspense, lazy, useLayoutEffect, useState } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalProvider, alert, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

/**
 * Angle FP4: a failing request followed by a valid one, against the valid one
 * alone. The failure surfaces once, and later requests behave the same.
 */
afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

function App() {
  return (
    <ModalProvider options={{ duration: 0 }}>
      <main>
        <button>Open</button>
      </main>
    </ModalProvider>
  );
}

async function validRequest() {
  let accepted: boolean | undefined;
  act(() => {
    void confirm({ title: 'Valid' }).then((value) => {
      accepted = value;
    });
  });
  const frameHasFocus = !!document.activeElement?.closest(
    '[role="dialog"]',
  );
  const inertWhileOpen = !!document.querySelector('main')?.closest('[inert]');
  act(() => {
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: 'Escape',
    });
  });
  await flush();
  return {
    frameHasFocus,
    inertWhileOpen,
    accepted,
    focus: document.activeElement?.textContent,
    inertAfter: !!document.querySelector('main')?.closest('[inert]'),
    overflow: document.body.style.overflow,
    live: ModalManager.ids.length,
  };
}

const baseline = {
  frameHasFocus: true,
  inertWhileOpen: true,
  accepted: false,
  focus: 'Open',
  inertAfter: false,
  overflow: '',
  live: 0,
};

function ThrowsInLayoutEffect() {
  useLayoutEffect(() => {
    throw new Error('layout failure');
  }, []);
  return <button>inside</button>;
}

function ThrowsAfterClick() {
  const [broken, setBroken] = useState(false);
  if (broken) throw new Error('update failure');
  return <button onClick={() => setBroken(true)}>Break</button>;
}

const failures = {
  render: () =>
    alert({
      title: 'Broken',
      content: () => {
        throw new Error('render failure');
      },
    }),
  layoutEffect: () =>
    alert({ title: 'Broken', content: <ThrowsInLayoutEffect /> }),
  update: () => alert({ title: 'Broken', content: <ThrowsAfterClick /> }),
  lazyReject: () => {
    const Content = lazy(() => Promise.reject(new Error('chunk failure')));
    return alert({ title: 'Broken', content: <Content /> });
  },
  lazyRejectInner: () => {
    const Content = lazy(() => Promise.reject(new Error('chunk failure')));
    return alert({
      title: 'Broken',
      content: (
        <Suspense fallback={null}>
          <Content />
        </Suspense>
      ),
    });
  },
};

it('control: a valid request alone', async () => {
  render(<App />);
  screen.getByText('Open').focus();
  expect(await validRequest()).toEqual(baseline);
});

for (const [name, open] of Object.entries(failures))
  it(`rejects once and leaves nothing behind after a ${name} failure`, async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<App />);
    screen.getByText('Open').focus();
    const errors: unknown[] = [];
    let resolved = 0;
    await act(async () => {
      void open().then(
        () => resolved++,
        (error: unknown) => errors.push(error),
      );
    });
    if (name === 'update') act(() => fireEvent.click(screen.getByText('Break')));
    await flush();
    await flush();
    expect({
      rejections: errors.length,
      resolved,
      focus: document.activeElement?.textContent,
      live: ModalManager.ids.length,
      inert: !!document.querySelector('main')?.closest('[inert]'),
      overflow: document.body.style.overflow,
    }).toEqual({
      rejections: 1,
      resolved: 0,
      focus: 'Open',
      live: 0,
      inert: false,
      overflow: '',
    });
    expect(await validRequest()).toEqual(baseline);
  });

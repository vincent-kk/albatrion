import * as React from 'react';
import { Suspense, createContext, lazy, useContext, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

/**
 * Angles RG1 (round 3 item 2, Provider hiding) and EQ5: a request that is not
 * displayed, because its route is hidden or its Provider is hidden, settles by
 * abort while the user works elsewhere on the page. SPECIFICATION.md:137 says only
 * `alive && visible && dimmed && !settled` modals participate in focus.
 */
const Activity = React.Activity;
const Suspender = lazy(() => new Promise<{ default: () => null }>(() => {}));

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

const Route = createContext('/editor');
const useAppPathname = () => ({ pathname: useContext(Route) });

let navigate: (path: string) => void = () => {};
function RoutedApp() {
  const [pathname, setPathname] = useState('/editor');
  navigate = setPathname;
  return (
    <Route.Provider value={pathname}>
      <header>
        <button>Save</button>
      </header>
      <ModalProvider usePathname={useAppPathname} options={{ duration: 0 }}>
        <main>{pathname === '/other' && <input aria-label="Search" />}</main>
      </ModalProvider>
    </Route.Provider>
  );
}

it('keeps focus in the page input when a request hidden by route is aborted', async () => {
  render(<RoutedApp />);
  const save = screen.getByText('Save');
  save.focus();
  const controller = new AbortController();
  let result: boolean | undefined;
  act(() => {
    void confirm({ title: 'Overwrite?', signal: controller.signal }).then(
      (value) => (result = value),
    );
  });
  await act(async () => navigate('/other'));
  const node = ModalManager.node(ModalManager.ids[0])!;
  expect(node.visible).toBe(false);
  const search = screen.getByLabelText('Search');
  search.focus();
  act(() => controller.abort());
  await act(async () => {});
  expect(result).toBe(false);
  expect(
    document.activeElement?.getAttribute('aria-label') ??
      document.activeElement?.textContent,
  ).toBe('Search');
});

function Visibility({
  hidden,
  kind,
  children,
}: PropsWithChildren<{ hidden: boolean; kind: 'activity' | 'suspense' }>) {
  if (kind === 'activity' && Activity)
    return <Activity mode={hidden ? 'hidden' : 'visible'}>{children}</Activity>;
  return (
    <Suspense fallback={<span>loading</span>}>
      {children}
      {hidden && <Suspender />}
    </Suspense>
  );
}

for (const kind of ['activity', 'suspense'] as const)
  it.skipIf(kind === 'activity' && !Activity)(
    `keeps focus in the page input when a request of a hidden Provider is aborted (${kind})`,
    async () => {
      const app = (hidden: boolean) => (
        <>
          <header>
            <button>Save</button>
          </header>
          <input aria-label="Search" />
          <Visibility hidden={hidden} kind={kind}>
            <ModalProvider options={{ duration: 0 }} />
          </Visibility>
        </>
      );
      const view = render(app(false));
      screen.getByText('Save').focus();
      const controller = new AbortController();
      act(() => {
        void confirm({ title: 'Overwrite?', signal: controller.signal });
      });
      await act(async () => view.rerender(app(true)));
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      const search = screen.getByLabelText('Search');
      search.focus();
      act(() => controller.abort());
      await act(async () => {});
      expect(
        document.activeElement?.getAttribute('aria-label') ??
          document.activeElement?.textContent,
      ).toBe('Search');
    },
  );

it('keeps focus in the page input when a request of a detached (root={null}) Provider is aborted', async () => {
  const app = (root: HTMLElement | null | undefined) => (
    <>
      <header>
        <button>Save</button>
      </header>
      <input aria-label="Search" />
      <ModalProvider root={root} options={{ duration: 0 }} />
    </>
  );
  const view = render(app(undefined));
  screen.getByText('Save').focus();
  const controller = new AbortController();
  act(() => {
    void confirm({ title: 'Overwrite?', signal: controller.signal });
  });
  await act(async () => view.rerender(app(null)));
  const search = screen.getByLabelText('Search');
  search.focus();
  act(() => controller.abort());
  await act(async () => {});
  expect(
    document.activeElement?.getAttribute('aria-label') ??
      document.activeElement?.textContent,
  ).toBe('Search');
});

it('control: returns focus to the opener when a displayed request is aborted', async () => {
  render(<RoutedApp />);
  screen.getByText('Save').focus();
  const controller = new AbortController();
  act(() => {
    void confirm({ title: 'Overwrite?', signal: controller.signal });
  });
  expect(document.activeElement?.textContent).not.toBe('Save');
  act(() => controller.abort());
  await act(async () => {});
  expect(document.activeElement?.textContent).toBe('Save');
});

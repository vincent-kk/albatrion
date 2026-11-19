import * as React from 'react';
import { Suspense, lazy } from 'react';
import type { PropsWithChildren } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { ModalProvider, alert } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

/**
 * Angle EQ5: the default pathname hook, Activity / Suspense hide of the Provider,
 * and a navigation that happens while the Provider is hidden.
 */
const Activity = (React as { Activity?: React.ComponentType<any> }).Activity;
const Suspender = lazy(() => new Promise<{ default: () => null }>(() => {}));

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

let navigation: EventTarget | undefined;
function installNavigationApi() {
  navigation = new EventTarget();
  (window as { navigation?: EventTarget }).navigation = navigation;
}
function navigate(path: string) {
  window.history.pushState(null, '', path);
  navigation?.dispatchEvent(new Event('currententrychange'));
}

beforeEach(() => {
  window.history.replaceState(null, '', '/a');
});
afterEach(() => {
  cleanup();
  ModalManager.reset();
  delete (window as { navigation?: EventTarget }).navigation;
  navigation = undefined;
  window.history.replaceState(null, '', '/');
  vi.restoreAllMocks();
});

async function scenario(
  kind: 'activity' | 'suspense',
  hideDuringNavigation: boolean,
) {
  const app = (hidden: boolean) => (
    <>
      <main>page</main>
      <Visibility hidden={hidden} kind={kind}>
        <ModalProvider />
      </Visibility>
    </>
  );
  const view = render(app(false));
  act(() => {
    void alert({ title: 'Opened on /a' });
  });
  const node = ModalManager.node(ModalManager.ids[0])!;
  expect(node.visible).toBe(true);
  if (hideDuringNavigation) await act(async () => view.rerender(app(true)));
  await act(async () => navigate('/b'));
  if (hideDuringNavigation) await act(async () => view.rerender(app(false)));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  return {
    visible: node.visible,
    settled: node.settled,
    inertPage: !!document.querySelector('main')?.closest('[inert]'),
  };
}

for (const kind of ['activity', 'suspense'] as const)
  it.skipIf(kind === 'activity' && !Activity)(
    `hides a modal opened on /a after a navigation to /b made while the Provider was hidden (${kind}, Navigation API)`,
    async () => {
      installNavigationApi();
      expect(await scenario(kind, true)).toEqual({
        visible: false,
        settled: false,
        inertPage: false,
      });
    },
  );

it('control: hides the modal when the navigation happens while the Provider is shown (Navigation API)', async () => {
  installNavigationApi();
  expect(await scenario('suspense', false)).toEqual({
    visible: false,
    settled: false,
    inertPage: false,
  });
});

for (const kind of ['activity', 'suspense'] as const)
  it.skipIf(kind === 'activity' && !Activity)(
    `control: hides the modal after a hidden-time navigation without the Navigation API (${kind}, polling)`,
    async () => {
      expect(await scenario(kind, true)).toEqual({
        visible: false,
        settled: false,
        inertPage: false,
      });
    },
  );

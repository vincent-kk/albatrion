import * as React from 'react';
import { Suspense } from 'react';
import type { PropsWithChildren } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

const blocked = new Promise<never>(() => {});
/** React keeps this boundary's existing DOM while its gate suspends. */
function Gate({ hidden }: { hidden: boolean }): null {
  if (hidden) throw blocked;
  return null;
}
function Visibility({
  hidden,
  mode,
  children,
}: PropsWithChildren<{ hidden: boolean; mode: string }>) {
  return mode === 'activity' ? (
    <React.Activity mode={hidden ? 'hidden' : 'visible'}>
      {children}
    </React.Activity>
  ) : (
    <Suspense fallback={<span>loading</span>}>
      {children}
      <Gate hidden={hidden} />
    </Suspense>
  );
}
afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  history.replaceState(null, '', '/');
});

/** Compare hidden/re-suspended lifetimes with the equivalent visible workflow. */
async function scenario(mode: string, action: string, hide: boolean) {
  history.replaceState(null, '', '/a');
  const navigation = new window.EventTarget();
  const previous = Object.getOwnPropertyDescriptor(window, 'navigation');
  Object.defineProperty(window, 'navigation', {
    configurable: true,
    value: navigation,
  });
  const controller = new AbortController();
  let setContentHidden = (_hidden: boolean) => {};
  function Content() {
    const [hidden, update] = React.useState(false);
    setContentHidden = update;
    if (hidden) throw blocked;
    return <input aria-label="modal input" />;
  }
  const app = (hidden: boolean) => (
    <Visibility mode={mode} hidden={hidden}>
      <ModalProvider options={{ duration: 0 }} />
    </Visibility>
  );
  const view = render(app(false));
  let settled = false;
  act(() => {
    void confirm({
      content: Content,
      manualDestroy: true,
      signal: controller.signal,
    }).then(() => {
      settled = true;
    });
  });
  const node = ModalManager.node(ModalManager.ids[0]);
  if (action === 'resuspend') {
    if (hide) {
      await act(async () => setContentHidden(true));
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      await act(async () => setContentHidden(false));
    }
  } else {
    if (hide) await act(async () => view.rerender(app(true)));
    if (action === 'settle-hidden') {
      if (!hide) act(() => node?.onHide());
      await act(async () => controller.abort());
    }
    if (action === 'navigate-hidden') {
      history.pushState(null, '', '/b');
      await act(async () =>
        navigation.dispatchEvent(new Event('currententrychange')),
      );
    }
    if (hide) await act(async () => view.rerender(app(false)));
  }
  await act(async () => {});
  const input = document.querySelector('[aria-label="modal input"]');
  const result = {
    sameNode: !node?.alive || ModalManager.node(node.id) === node,
    settled,
    displayed: Boolean(node?.visible && node.alive && !node.settled),
    pageLocked: document.body.style.overflow === 'hidden',
    focused:
      node?.visible && !node.settled ? input === document.activeElement : false,
    canAnimate: node?.settled ? node.isVisibleAtSettlement : undefined,
  };
  view.unmount();
  await act(async () => {});
  ModalManager.reset();
  if (previous) Object.defineProperty(window, 'navigation', previous);
  else Reflect.deleteProperty(window, 'navigation');
  return result;
}

it.for([
  ['activity', 'reveal'],
  ['suspense', 'reveal'],
  ['activity', 'resuspend'],
  ['suspense', 'resuspend'],
  ['activity', 'settle-hidden'],
  ['suspense', 'settle-hidden'],
  ['activity', 'navigate-hidden'],
  ['suspense', 'navigate-hidden'],
])(
  '%s %s matches the equivalent visible workflow',
  async ([mode, action], { skip }) => {
    if (mode === 'activity' && !React.Activity)
      skip('Activity requires React 19');
    const control = await scenario(mode, action, false);
    expect(await scenario(mode, action, true)).toEqual(control);
  },
);

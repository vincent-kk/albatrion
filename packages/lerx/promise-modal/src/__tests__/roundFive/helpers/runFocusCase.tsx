import * as React from 'react';
import { useState } from 'react';

import { act, render } from '@testing-library/react';

import { ModalProvider, useModal } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

/** Execute one display/settlement/focus row and return only observable outcomes.
 * @param state Whether content or the Provider is suspended or hidden.
 * @param settlement The public lifecycle event ending the request.
 * @param focus The focus ownership state just before settlement.
 * @returns Focus restoration, user-focus preservation and page isolation observations.
 */
export async function runFocusCase(
  state: 'shown' | 'first-suspended' | 'resuspended' | 'hidden' | 'activity',
  settlement: 'abort' | 'resolve' | 'cleanup',
  focus: 'inside' | 'body' | 'outside',
) {
  const gate = new Promise<void>(() => {});
  const controller = new AbortController();
  let open = () => {};
  let suspend = () => {};
  let caller = true;
  let activityHidden = false;
  function Content() {
    const [blocked, setBlocked] = useState(state === 'first-suspended');
    suspend = () => setBlocked(true);
    if (blocked) throw gate;
    return <input aria-label="inside" />;
  }
  function Caller() {
    const modal = useModal();
    open = () => {
      void modal.confirm({ content: <Content />, signal: controller.signal });
    };
    return null;
  }
  const app = () => (
    <>
      <main>
        <button>opener</button>
        <input aria-label="outside" />
      </main>
      {caller && <Caller />}
      {React.Activity ? (
        <React.Activity mode={activityHidden ? 'hidden' : 'visible'}>
          <ModalProvider options={{ duration: 0 }} />
        </React.Activity>
      ) : (
        <ModalProvider options={{ duration: 0 }} />
      )}
    </>
  );
  const view = render(app());
  const opener = view.getByText('opener');
  const outside = view.getByLabelText('outside');
  opener.focus();
  act(() => open());
  const node = ModalManager.node(ModalManager.ids[0]);
  if (!node) throw new Error('Request was not registered');
  const inside = view.queryByLabelText('inside');
  if (state === 'first-suspended' && focus === 'inside')
    throw new Error('No inside control exists before the first suspension');
  if (focus === 'inside' && inside) inside.focus();
  const focusedInsideBeforeTransition =
    focus === 'inside' && !!inside && document.activeElement === inside;
  if (state === 'resuspended') act(() => suspend());
  if (state === 'hidden') act(() => node.onHide());
  if (state === 'activity') {
    activityHidden = true;
    await act(async () => view.rerender(app()));
  }
  if (focus === 'outside') outside.focus();
  else if (focus === 'body' && document.activeElement instanceof HTMLElement)
    document.activeElement.blur();
  const active = document.activeElement;
  if (
    state !== 'shown' &&
    focus === 'inside' &&
    active instanceof HTMLElement &&
    inside?.contains(active)
  )
    active.blur();
  const before = document.activeElement;
  const isolated = !!opener.closest('[inert]');
  await act(async () => {
    if (settlement === 'abort') controller.abort();
    else if (settlement === 'resolve') node.onConfirm();
    else {
      caller = false;
      view.rerender(app());
    }
  });
  const outcome = {
    restored: document.activeElement === opener && before !== opener,
    focusedInsideBeforeTransition,
    preserved: document.activeElement === before,
    isolated,
  };
  view.unmount();
  await act(async () => {});
  ModalManager.reset();
  return outcome;
}

import { Activity, Suspense, lazy } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

const Suspender = lazy(() => new Promise<{ default: () => null }>(() => {}));
afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it.for([
  ['activity', 'show'],
  ['activity', 'remove'],
  ['activity', 'handover'],
  ['suspense', 'show'],
  ['suspense', 'remove'],
  ['suspense', 'handover'],
] as const)(
  'disconnects the hidden Provider observer on %s/%s',
  async ([kind, exit], { skip }) => {
    if (kind === 'activity' && !Activity) skip('Activity requires React 19');
    const live = new Set<MutationObserver>();
    const Original = globalThis.MutationObserver;
    class Tracked extends Original {
      constructor(callback: MutationCallback) {
        super(callback);
        live.add(this);
      }
      disconnect() {
        live.delete(this);
        super.disconnect();
      }
    }
    vi.stubGlobal('MutationObserver', Tracked);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const app = (hidden: boolean, owner = true) => (
      <>
        {owner &&
          (kind === 'activity' ? (
            <Activity mode={hidden ? 'hidden' : 'visible'}>
              <ModalProvider />
            </Activity>
          ) : (
            <Suspense fallback="loading">
              <ModalProvider />
              {hidden && <Suspender />}
            </Suspense>
          ))}
        {exit === 'handover' && <ModalProvider />}
      </>
    );
    const view = render(app(false));
    act(() => {
      void confirm({ title: 'Observed lifetime' });
    });
    await act(async () => view.rerender(app(true)));
    expect(live.size).toBe(1);
    await act(async () => {
      if (exit === 'show') view.rerender(app(false));
      else if (exit === 'handover') view.rerender(app(true, false));
      else view.unmount();
    });
    expect(live.size).toBe(0);
  },
);

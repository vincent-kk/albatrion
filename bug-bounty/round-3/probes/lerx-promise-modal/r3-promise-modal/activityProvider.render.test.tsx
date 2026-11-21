import { Activity, Suspense, lazy, useState } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

let setTab: (tab: 'editor' | 'settings') => void = () => {};

/** A tab layout that preserves each tab with Activity; the editor tab owns the Provider. */
function Tabs() {
  const [tab, select] = useState<'editor' | 'settings'>('editor');
  setTab = select;
  return (
    <>
      <Activity mode={tab === 'editor' ? 'visible' : 'hidden'}>
        <ModalProvider>
          <span>editor</span>
        </ModalProvider>
      </Activity>
      <Activity mode={tab === 'settings' ? 'visible' : 'hidden'}>
        <span>settings</span>
      </Activity>
    </>
  );
}

it.skipIf(!Activity)(
  'keeps a static confirm pending while Activity hides and then shows its Provider',
  async () => {
    render(<Tabs />);
    let result: boolean | undefined;
    act(() => {
      void confirm({ title: 'Still deciding' }).then((value) => {
        result = value;
      });
    });
    expect(ModalManager.ids.length).toBe(1);
    await act(async () => setTab('settings'));
    await act(async () => setTab('editor'));
    // Hiding is not an unmount; the README cancels only on owner unmount.
    expect(result).toBeUndefined();
    expect(ModalManager.ids.length).toBe(1);
  },
);

it('control: keeps a static confirm pending across an ordinary rerender', async () => {
  const view = render(
    <ModalProvider>
      <span>a</span>
    </ModalProvider>,
  );
  let result: boolean | undefined;
  act(() => {
    void confirm({ title: 'Still deciding' }).then((value) => {
      result = value;
    });
  });
  view.rerender(
    <ModalProvider>
      <span>b</span>
    </ModalProvider>,
  );
  await act(async () => {});
  expect(result).toBeUndefined();
});

let showReports: () => void = () => {};
let loadReports: () => void = () => {};
const reportsChunk = () =>
  new Promise<void>((resolve) => {
    loadReports = resolve;
  });

/** A page whose code-split panel suspends an app-level boundary above the Provider. */
function SuspendingPage() {
  const [Reports] = useState(() =>
    lazy(() => reportsChunk().then(() => ({ default: () => <p>reports</p> }))),
  );
  const [reports, setReports] = useState(false);
  showReports = () => setReports(true);
  return (
    <Suspense fallback={<p>loading</p>}>
      <ModalProvider>
        <span>page</span>
        {reports && <Reports />}
      </ModalProvider>
    </Suspense>
  );
}

it('keeps a static confirm pending while a sibling re-suspends the boundary above its Provider', async () => {
  render(<SuspendingPage />);
  let result: boolean | undefined;
  act(() => {
    void confirm({ title: 'Still deciding' }).then((value) => {
      result = value;
    });
  });
  await act(async () => showReports());
  await act(async () => loadReports());
  await act(async () => {});
  // A Suspense hide is not an unmount either.
  expect(result).toBeUndefined();
  expect(ModalManager.ids.length).toBe(1);
});

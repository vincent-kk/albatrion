import { Activity } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalProvider, useModal } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

let modal!: ReturnType<typeof useModal>;
function Caller() {
  modal = useModal();
  return <span>caller</span>;
}

function App({ mode }: { mode: 'visible' | 'hidden' }) {
  return (
    <ModalProvider>
      <Activity mode={mode}>
        <Caller />
      </Activity>
    </ModalProvider>
  );
}

it.skipIf(!Activity)('(round-2 promise-modal 5; React 19 Activity required) cancels a useModal request when the caller is hidden by Activity without unmounting', async () => {
  const view = render(<App mode="visible" />);
  let result: boolean | undefined;
  act(() => {
    void modal.confirm({ title: 'Still deciding' }).then((value) => {
      result = value;
    });
  });
  view.rerender(<App mode="hidden" />);
  await act(async () => {});
  view.rerender(<App mode="visible" />);
  await act(async () => {});
  expect(result).toBe(false);
});

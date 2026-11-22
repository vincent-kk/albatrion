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

function App({
  mode,
  mounted = true,
}: {
  mode: 'visible' | 'hidden';
  mounted?: boolean;
}) {
  return (
    <ModalProvider>
      <Activity mode={mode}>{mounted && <Caller />}</Activity>
    </ModalProvider>
  );
}

it.skipIf(!Activity)('preserves a pending request during Activity hiding and cancels on removal', async () => {
  const view = render(<App mode="visible" />);
  let result: boolean | undefined;
  act(() => {
    void modal.confirm({ title: 'Still deciding' }).then((value) => {
      result = value;
    });
  });
  view.rerender(<App mode="hidden" />);
  await act(async () => {});
  expect(result).toBeUndefined();
  view.rerender(<App mode="visible" />);
  await act(async () => {});
  expect(result).toBeUndefined();
  view.rerender(<App mode="hidden" mounted={false} />);
  await act(async () => {});
  expect(result).toBe(false);
});

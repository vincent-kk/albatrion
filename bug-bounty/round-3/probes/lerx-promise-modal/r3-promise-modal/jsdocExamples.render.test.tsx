import { useEffect, useRef } from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { confirm, useInitializeModal } from '@/promise-modal';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

/** The `useInitializeModal` JSDoc example from the published declarations, verbatim. */
function App() {
  const root = useRef<HTMLDivElement>(null);
  const { portal, initialize } = useInitializeModal({
    mode: 'manual',
    FooterComponent: ({ onConfirm, onCancel }) => <footer>
      {onCancel && <button onClick={onCancel}>Cancel</button>}
      <button onClick={onConfirm}>Confirm</button>
    </footer>,
  });
  useEffect(() => { if (root.current) initialize(root.current); }, [initialize]);
  return <>
    <div ref={root} />
    <button onClick={() => void confirm({ title: 'Continue?' })}>Open</button>
    {portal}
  </>;
}

it('runs the useInitializeModal JSDoc example without development warnings', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  render(<App />);
  await act(async () => {
    fireEvent.click(screen.getByText('Open'));
  });
  expect(screen.getByText('Continue?')).toBeTruthy();
  expect(warn.mock.calls.map((call) => String(call[0]))).toEqual([]);
});

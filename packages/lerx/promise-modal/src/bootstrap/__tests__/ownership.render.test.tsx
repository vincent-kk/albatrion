import { StrictMode } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import {
  alertHandler,
  confirmHandler,
  promptHandler,
} from '@/promise-modal/core';
import { useActiveModalCount } from '@/promise-modal/hooks/useActiveModalCount';

import { BootstrapProvider } from '../BootstrapProvider';

/** Counts actual portal anchors rather than their rendered children. */
const anchors = () =>
  document.querySelectorAll('[id^="promise-modal-"]').length;
afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

it('R13 renders a pre-mount request under StrictMode', async () => {
  const handled = alertHandler({ title: 'queued strict' });
  render(
    <StrictMode>
      <BootstrapProvider />
    </StrictMode>,
  );
  expect(await screen.findByText('queued strict')).toBeDefined();
  fireEvent.click(screen.getByText('Confirm'));
  await expect(handled.promiseHandler).resolves.toBeUndefined();
});

it('R9 hands open modals to the waiting provider when the owner unmounts', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const view = render(
    <>
      <BootstrapProvider key="owner" />
      <BootstrapProvider key="waiter" />
    </>,
  );
  act(() => {
    alertHandler({ title: 'transferred' });
  });
  view.rerender(<BootstrapProvider key="waiter" />);
  expect(await screen.findByText('transferred')).toBeDefined();
  expect(anchors()).toBe(1);
  expect(warn).toHaveBeenCalledTimes(1);
});

it('R9 removes a waiter before owner cleanup and cancels the remaining request', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const view = render(
    <>
      <BootstrapProvider key="owner" />
      <BootstrapProvider key="waiter" />
    </>,
  );
  const result = vi.fn();
  act(() => {
    confirmHandler({}).promiseHandler.then(result);
  });
  view.rerender(<BootstrapProvider key="owner" />);
  view.unmount();
  await act(async () => {
    await Promise.resolve();
  });
  expect(result).toHaveBeenCalledWith(false);
  expect(anchors()).toBe(0);
});

it('R9 keeps one portal when two providers mount together under StrictMode', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  render(
    <StrictMode>
      <BootstrapProvider />
      <BootstrapProvider />
    </StrictMode>,
  );
  act(() => {
    alertHandler({ title: 'single portal' });
  });
  expect(await screen.findAllByText('single portal')).toHaveLength(1);
  expect(anchors()).toBe(1);
  expect(warn).toHaveBeenCalledTimes(1);
});

it('R2 preserves pending prompt input during same-commit provider remount', async () => {
  const view = render(<BootstrapProvider key="a" />);
  const result = vi.fn();
  let handled!: ReturnType<typeof promptHandler<string>>;
  act(() => {
    handled = promptHandler<string>({
      Input: ({ value, onChange }) => (
        <input
          aria-label="input"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ),
    });
    handled.promiseHandler.then(result);
  });
  fireEvent.change(await screen.findByLabelText('input'), {
    target: { value: 'retained' },
  });
  view.rerender(<BootstrapProvider key="b" />);
  expect((await screen.findByLabelText<HTMLInputElement>('input')).value).toBe(
    'retained',
  );
  expect(result).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Confirm'));
  await expect(handled.promiseHandler).resolves.toBe('retained');
});

it('R10 leaves an existing frame untouched when another modal opens', () => {
  const frame = vi.fn(
    ({
      children,
    }: import('react').PropsWithChildren<
      import('@/promise-modal/types').ModalFrameProps
    >) => <div>{children}</div>,
  );
  render(<BootstrapProvider ForegroundComponent={frame} />);
  act(() => {
    alertHandler({ title: 'first' });
  });
  const calls = frame.mock.calls.length;
  act(() => {
    alertHandler({ title: 'second' });
  });
  expect(frame.mock.calls.length).toBe(calls + 1);
});

it('R16 updates active counts in ordinary provider children', () => {
  const Count = () => <output>{useActiveModalCount()}</output>;
  render(
    <BootstrapProvider>
      <Count />
    </BootstrapProvider>,
  );
  expect(screen.getByRole('status').textContent).toBe('0');
  act(() => {
    alertHandler({});
  });
  expect(screen.getByRole('status').textContent).toBe('1');
});

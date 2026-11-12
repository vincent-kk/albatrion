import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { confirmHandler } from '@/promise-modal/core';

import { BootstrapProvider } from '../BootstrapProvider';

/** Sends Tab without relying on jsdom's absent native tab navigation. */
const tab = (shiftKey = false) =>
  fireEvent.keyDown(document.activeElement || document, {
    key: 'Tab',
    shiftKey,
  });
/** Opens a focusable modal and returns its live handle. */
const open = (
  title: string,
  options: Parameters<typeof confirmHandler>[0] = {},
) => {
  let handle!: ReturnType<typeof confirmHandler>;
  act(() => {
    handle = confirmHandler({
      title,
      content: (
        <>
          <button>{title}-first</button>
          <button>{title}-last</button>
        </>
      ),
      footer: false,
      ...options,
    });
  });
  return handle;
};
afterEach(() => {
  cleanup();
  ModalManager.reset();
});

it('moves focus into a custom frame and restores its opener on settlement', () => {
  render(
    <BootstrapProvider
      ForegroundComponent={({ children }) => <section>{children}</section>}
    >
      <button>opener</button>
    </BootstrapProvider>,
  );
  const opener = screen.getByText('opener');
  opener.focus();
  const handle = open('dialog');
  expect(document.activeElement).toBe(screen.getByText('dialog-first'));
  act(() => handle.modalNode?.onConfirm());
  expect(document.activeElement).toBe(opener);
});

it('wraps Tab and Shift+Tab at the last and first controls', () => {
  render(<BootstrapProvider />);
  open('dialog');
  screen.getByText('dialog-last').focus();
  tab();
  expect(document.activeElement).toBe(screen.getByText('dialog-first'));
  tab(true);
  expect(document.activeElement).toBe(screen.getByText('dialog-last'));
});

it('focuses an empty wrapper and traps Tab there', () => {
  render(<BootstrapProvider />);
  let handle!: ReturnType<typeof confirmHandler>;
  act(() => {
    handle = confirmHandler({ title: 'empty', footer: false });
  });
  const wrapper = screen.getByText('empty').closest('[tabindex="-1"]');
  expect(wrapper).not.toBeNull();
  expect(document.activeElement).toBe(wrapper);
  tab();
  expect(document.activeElement).toBe(wrapper);
  act(() => handle.modalNode?.onClose());
});

it('preserves an autofocus control inside the modal', () => {
  render(<BootstrapProvider />);
  open('dialog', {
    content: (
      <>
        <button>before</button>
        <input aria-label="autofocus" autoFocus />
      </>
    ),
  });
  expect(document.activeElement).toBe(screen.getByLabelText('autofocus'));
  screen.getByText('before').focus();
  tab(true);
  expect(document.activeElement).toBe(screen.getByLabelText('autofocus'));
});

it('traps only the top frame and restores the remaining modal before the page', () => {
  render(
    <BootstrapProvider>
      <button>opener</button>
    </BootstrapProvider>,
  );
  const opener = screen.getByText('opener');
  opener.focus();
  const lower = open('lower');
  const upper = open('upper');
  screen.getByText('lower-last').focus();
  tab();
  expect(document.activeElement).toBe(screen.getByText('upper-first'));
  act(() => upper.modalNode?.onConfirm());
  expect(document.activeElement).toBe(screen.getByText('lower-first'));
  act(() => lower.modalNode?.onConfirm());
  expect(document.activeElement).toBe(opener);
});

it('does not steal focus from another pending modal when a lower one settles', () => {
  render(<BootstrapProvider />);
  const lower = open('lower');
  open('upper');
  expect(document.activeElement).toBe(screen.getByText('upper-first'));
  act(() => lower.modalNode?.onConfirm());
  expect(document.activeElement).toBe(screen.getByText('upper-first'));
});

it('falls back to the top modal when the recorded opener remains inert', () => {
  render(
    <BootstrapProvider>
      <button>opener</button>
    </BootstrapProvider>,
  );
  const opener = screen.getByText('opener');
  opener.focus();
  open('lower');
  opener.focus();
  const upper = open('upper');
  act(() => upper.modalNode?.onConfirm());
  expect(document.activeElement).toBe(screen.getByText('lower-first'));
});

it('ignores disconnected restore targets', () => {
  render(<BootstrapProvider />);
  const opener = document.createElement('button');
  document.body.append(opener);
  opener.focus();
  const handle = open('dialog');
  expect(document.activeElement).toBe(screen.getByText('dialog-first'));
  opener.remove();
  act(() => handle.modalNode?.onConfirm());
  expect(document.activeElement).not.toBe(opener);
});

it('inherits trapFocus false and supports per-call true overrides', () => {
  render(<BootstrapProvider options={{ trapFocus: false }} />);
  open('loose');
  screen.getByText('loose-last').focus();
  const freeEvent = new KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true,
  });
  fireEvent(document.activeElement!, freeEvent);
  expect(freeEvent.defaultPrevented).toBe(false);
  open('trapped', { trapFocus: true });
  screen.getByText('trapped-last').focus();
  tab();
  expect(document.activeElement).toBe(screen.getByText('trapped-first'));
});

it('excludes hidden and disabled controls without layout measurements', () => {
  render(<BootstrapProvider />);
  open('dialog', {
    content: (
      <>
        <button disabled>disabled</button>
        <button hidden>hidden</button>
        <span style={{ display: 'none' }}>
          <button>css-hidden</button>
        </span>
        <input type="hidden" />
        <button tabIndex={-1}>negative</button>
        <button>eligible</button>
      </>
    ),
  });
  expect(document.activeElement).toBe(screen.getByText('eligible'));
});

it('leaves toast focus untouched while still focusing a later dimmed modal', () => {
  render(
    <BootstrapProvider>
      <button>opener</button>
    </BootstrapProvider>,
  );
  const opener = screen.getByText('opener');
  opener.focus();
  open('toast', { dimmed: false });
  expect(document.activeElement).toBe(opener);
  open('dialog');
  expect(document.activeElement).toBe(screen.getByText('dialog-first'));
});

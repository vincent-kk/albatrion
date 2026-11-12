import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { BootstrapProvider } from '@/promise-modal/bootstrap';
import { alertHandler, confirmHandler } from '@/promise-modal/core';

import { ModalManager } from '../ModalManager';

/** Dispatches one cancelable Escape and returns it for default-policy assertions. */
const escape = () => {
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  });
  act(() => fireEvent(document, event));
  return event;
};

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

it('cancels a dimmed confirm below a non-accepting nondimmed request', async () => {
  render(<BootstrapProvider />);
  let lower!: ReturnType<typeof confirmHandler>;
  let upper!: ReturnType<typeof alertHandler>;
  const upperResult = vi.fn();
  act(() => {
    lower = confirmHandler({ title: 'dimmed confirm' });
    upper = alertHandler({
      title: 'nondimmed request',
      dimmed: false,
      closeOnBackdropClick: false,
    });
    void upper.promiseHandler.then(upperResult);
  });

  const event = escape();

  expect(lower.modalNode?.settled).toBe(true);
  await expect(lower.promiseHandler).resolves.toBe(false);
  expect(upper.modalNode?.visible).toBe(true);
  expect(upper.modalNode?.settled).toBe(false);
  expect(upperResult).not.toHaveBeenCalled();
  expect(event.defaultPrevented).toBe(true);
});

it('stops at a non-accepting dimmed modal below a nondimmed request', () => {
  render(<BootstrapProvider />);
  let bottom!: ReturnType<typeof confirmHandler>;
  let lower!: ReturnType<typeof confirmHandler>;
  let upper!: ReturnType<typeof alertHandler>;
  act(() => {
    bottom = confirmHandler({ title: 'accepting bottom' });
    lower = confirmHandler({ title: 'dimmed shield', closeOnEscape: false });
    upper = alertHandler({ dimmed: false, closeOnBackdropClick: false });
  });

  const event = escape();

  expect(bottom.modalNode?.settled).toBe(false);
  expect(lower.modalNode?.settled).toBe(false);
  expect(upper.modalNode?.settled).toBe(false);
  expect(event.defaultPrevented).toBe(false);
});

it('keeps a non-accepting dimmed top modal shielding an accepting modal', () => {
  render(<BootstrapProvider />);
  let lower!: ReturnType<typeof confirmHandler>;
  let upper!: ReturnType<typeof confirmHandler>;
  act(() => {
    lower = confirmHandler({ title: 'accepting lower' });
    upper = confirmHandler({ title: 'dimmed top', closeOnEscape: false });
  });

  const event = escape();

  expect(lower.modalNode?.settled).toBe(false);
  expect(upper.modalNode?.settled).toBe(false);
  expect(event.defaultPrevented).toBe(false);
});

it('skips two non-accepting nondimmed requests to cancel an accepting modal', async () => {
  render(<BootstrapProvider />);
  let lower!: ReturnType<typeof confirmHandler>;
  let middle!: ReturnType<typeof alertHandler>;
  let upper!: ReturnType<typeof alertHandler>;
  act(() => {
    lower = confirmHandler({ title: 'accepting lower' });
    middle = alertHandler({ dimmed: false, closeOnBackdropClick: false });
    upper = alertHandler({ dimmed: false, closeOnEscape: false });
  });

  const event = escape();

  expect(lower.modalNode?.settled).toBe(true);
  await expect(lower.promiseHandler).resolves.toBe(false);
  expect(middle.modalNode?.settled).toBe(false);
  expect(upper.modalNode?.settled).toBe(false);
  expect(event.defaultPrevented).toBe(true);
});

it('cancels an accepting nondimmed top request and keeps the lower modal pending', async () => {
  render(<BootstrapProvider />);
  let lower!: ReturnType<typeof confirmHandler>;
  let upper!: ReturnType<typeof alertHandler>;
  act(() => {
    lower = confirmHandler({ title: 'lower confirm' });
    upper = alertHandler({
      dimmed: false,
      closeOnBackdropClick: false,
      closeOnEscape: true,
    });
  });

  const event = escape();

  expect(upper.modalNode?.settled).toBe(true);
  await expect(upper.promiseHandler).resolves.toBeUndefined();
  expect(lower.modalNode?.visible).toBe(true);
  expect(lower.modalNode?.settled).toBe(false);
  expect(event.defaultPrevented).toBe(true);
});

it('cancels exactly one accepting modal per press after skipping a nondimmed request', async () => {
  render(<BootstrapProvider />);
  let lower!: ReturnType<typeof confirmHandler>;
  let middle!: ReturnType<typeof confirmHandler>;
  let upper!: ReturnType<typeof alertHandler>;
  act(() => {
    lower = confirmHandler({ title: 'accepting bottom' });
    middle = confirmHandler({
      title: 'accepting middle',
      dimmed: false,
      closeOnEscape: true,
    });
    upper = alertHandler({ dimmed: false, closeOnBackdropClick: false });
  });

  const event = escape();

  expect(middle.modalNode?.settled).toBe(true);
  await expect(middle.promiseHandler).resolves.toBe(false);
  expect(lower.modalNode?.settled).toBe(false);
  expect(upper.modalNode?.settled).toBe(false);
  expect(event.defaultPrevented).toBe(true);
});

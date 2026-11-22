import { act, cleanup, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import { BootstrapProvider } from '@/promise-modal/bootstrap';
import { confirmHandler } from '@/promise-modal/core';

import { ModalManager } from '../ModalManager';

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

it('moves focus into the remaining dimmed modal when the nested opener was removed', () => {
  let hideOpener!: () => void;
  const LowerContent = () => {
    const [shown, setShown] = useState(true);
    hideOpener = () => setShown(false);
    return (
      <>
        <button id="lower-first">lower-first</button>
        {shown && <button id="nested-opener">nested-opener</button>}
      </>
    );
  };
  render(<BootstrapProvider />);
  act(() => {
    void confirmHandler({ title: 'lower', content: LowerContent, footer: false });
  });
  (document.getElementById('nested-opener') as HTMLElement).focus();
  let upper!: ReturnType<typeof confirmHandler>;
  act(() => {
    upper = confirmHandler({
      title: 'upper',
      content: <button id="upper-button">upper</button>,
      footer: false,
    });
  });
  expect(document.activeElement?.id).toBe('upper-button');
  act(() => hideOpener());
  act(() => upper.modalNode?.onConfirm());
  const lowerFrame = screen
    .getByText('lower-first')
    .closest('[role="dialog"]');
  expect(lowerFrame?.contains(document.activeElement)).toBe(true);
});

it('keeps the previous behavior when no opener was recorded for the nested modal', () => {
  render(<BootstrapProvider />);
  act(() => {
    void confirmHandler({
      title: 'lower',
      content: <button id="lower-first">lower-first</button>,
      footer: false,
    });
  });
  const activeElement = vi
    .spyOn(document, 'activeElement', 'get')
    .mockReturnValue(null);
  let upper!: ReturnType<typeof confirmHandler>;
  act(() => {
    upper = confirmHandler({
      title: 'upper',
      content: <button id="upper-button">upper</button>,
      footer: false,
    });
  });
  activeElement.mockRestore();
  (document.getElementById('upper-button') as HTMLElement).focus();
  act(() => upper.modalNode?.onConfirm());
  const lowerFrame = screen
    .getByText('lower-first')
    .closest('[role="dialog"]');
  expect(lowerFrame?.contains(document.activeElement)).toBe(false);
});

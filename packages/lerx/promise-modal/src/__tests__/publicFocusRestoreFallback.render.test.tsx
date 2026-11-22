import { useState } from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { ModalProvider, confirm } from '../index';

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
  render(<ModalProvider />);
  act(() => {
    void confirm({ title: 'lower', content: LowerContent, footer: false });
  });
  (document.getElementById('nested-opener') as HTMLElement).focus();
  act(() => {
    void confirm({
      title: 'upper',
      content: <button id="upper-button">upper</button>,
    });
  });
  expect(document.activeElement?.id).toBe('upper-button');
  act(() => hideOpener());
  fireEvent.click(screen.getByText('Confirm'));
  const lowerFrame = screen.getByText('lower-first').closest('[role="dialog"]');
  expect(lowerFrame?.contains(document.activeElement)).toBe(true);
});

it('keeps the previous behavior when no opener was recorded for the nested modal', () => {
  render(<ModalProvider />);
  act(() => {
    void confirm({
      title: 'lower',
      content: <button id="lower-first">lower-first</button>,
      footer: false,
    });
  });
  const activeElement = vi
    .spyOn(document, 'activeElement', 'get')
    .mockReturnValue(null);
  act(() => {
    void confirm({
      title: 'upper',
      content: <button id="upper-button">upper</button>,
    });
  });
  activeElement.mockRestore();
  (document.getElementById('upper-button') as HTMLElement).focus();
  fireEvent.click(screen.getByText('Confirm'));
  const lowerFrame = screen.getByText('lower-first').closest('[role="dialog"]');
  expect(lowerFrame?.contains(document.activeElement)).toBe(false);
});

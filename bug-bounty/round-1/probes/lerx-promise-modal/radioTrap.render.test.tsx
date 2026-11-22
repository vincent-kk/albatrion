import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { ModalProvider, confirm } from '@/promise-modal';

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

const keyTab = (shiftKey = false) =>
  fireEvent.keyDown(document.activeElement || document, {
    key: 'Tab',
    shiftKey,
  });

it('traps Shift+Tab from the initially focused radio of an unchecked leading group', () => {
  render(<ModalProvider />);
  act(() => {
    void confirm({
      title: 't',
      content: (
        <>
          <input type="radio" name="g" id="r1" />
          <input type="radio" name="g" id="r2" />
          <button id="last">last</button>
        </>
      ),
      footer: false,
    });
  });
  // Initial focus lands on the first radio (forward entry).
  expect(document.activeElement?.id).toBe('r1');
  // Shift+Tab from the first radio natively leaves the group backwards, which is
  // outside the modal: the trap must intercept it.
  const notCancelled = keyTab(true);
  expect(notCancelled).toBe(false);
  expect(document.activeElement?.id).toBe('last');
});

it('traps Tab from a radio entered by Shift+Tab in an unchecked trailing group', () => {
  render(<ModalProvider />);
  act(() => {
    void confirm({
      title: 't',
      content: (
        <>
          <button id="first">first</button>
          <input type="radio" name="g" id="r1" />
          <input type="radio" name="g" id="r2" />
        </>
      ),
      footer: false,
    });
  });
  expect(document.activeElement?.id).toBe('first');
  keyTab(true); // wraps to the last boundary: r2 (directional entry)
  expect(document.activeElement?.id).toBe('r2');
  const notCancelled = keyTab(false);
  expect(notCancelled).toBe(false);
  expect(document.activeElement?.id).toBe('first');
});

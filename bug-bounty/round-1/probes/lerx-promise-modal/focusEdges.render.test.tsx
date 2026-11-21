import { useState } from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
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

class ShadowButtons extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = '<button id="s1">s1</button><button id="s2">s2</button>';
  }
}
if (!customElements.get('bounty-shadow-buttons'))
  customElements.define('bounty-shadow-buttons', ShadowButtons);

it('does not make controls inside an open shadow root unreachable by Tab', () => {
  render(<ModalProvider />);
  act(() => {
    void confirm({
      title: 't',
      content: (
        <>
          <button id="a">a</button>
          {/* @ts-expect-error custom element */}
          <bounty-shadow-buttons />
        </>
      ),
      footer: false,
    });
  });
  expect(document.activeElement?.id).toBe('a');
  // Native Tab from "a" moves into the shadow root (s1). The trap must not
  // cancel it and wrap back to "a", which makes s1/s2 unreachable.
  const notCancelled = keyTab(false);
  expect(notCancelled).toBe(true);
});

it('keeps Shift+Tab inside when focus sits on a tabindex=-1 element before the first control', () => {
  render(<ModalProvider />);
  act(() => {
    void confirm({
      title: 't',
      content: (
        <>
          <h2 id="heading" tabIndex={-1}>
            heading
          </h2>
          <button id="first">first</button>
          <button id="last">last</button>
        </>
      ),
      footer: false,
    });
  });
  // WAI-ARIA dialog pattern: focusing a static heading first is recommended.
  (document.getElementById('heading') as HTMLElement).focus();
  // Native Shift+Tab from the heading leaves the modal; the trap must wrap.
  const notCancelled = keyTab(true);
  expect(notCancelled).toBe(false);
  expect(document.activeElement?.id).toBe('last');
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
  render(<ModalProvider />);
  act(() => {
    void confirm({ title: 'lower', content: LowerContent, footer: false });
  });
  (document.getElementById('nested-opener') as HTMLElement).focus();
  let resolveUpper!: () => void;
  act(() => {
    void confirm({
      title: 'upper',
      content: ({ onConfirm }) => {
        resolveUpper = onConfirm;
        return <button id="upper-btn">upper</button>;
      },
      footer: false,
    });
  });
  expect(document.activeElement?.id).toBe('upper-btn');
  act(() => hideOpener());
  act(() => resolveUpper());
  // The lower dimmed modal is still pending and the page is inert; focus should
  // land inside it rather than stay on the closed upper modal (or the body).
  const lowerFrame = screen.getByText('lower-first').closest('[role="dialog"]');
  expect(lowerFrame?.contains(document.activeElement)).toBe(true);
});

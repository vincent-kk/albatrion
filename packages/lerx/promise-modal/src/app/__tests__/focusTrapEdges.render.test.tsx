import { act, cleanup, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, expect, it } from 'vitest';

import { BootstrapProvider } from '@/promise-modal/bootstrap';
import { confirmHandler } from '@/promise-modal/core';

import { ModalManager } from '../ModalManager';
import { getTabbableElements } from '../utils/getTabbableElements';

/** Sends Tab without relying on jsdom's absent native tab navigation; true means not cancelled. */
const tab = (shiftKey = false) =>
  fireEvent.keyDown(document.activeElement || document, {
    key: 'Tab',
    shiftKey,
  });
/** Opens a dimmed confirm whose frame holds only the given content. */
const open = (content: ReactNode) =>
  act(() => {
    void confirmHandler({ title: 't', content, footer: false });
  });
/** Reads the focused element inside open shadow roots, as the trap must. */
const deepActiveElement = () => {
  let current = document.activeElement;
  while (current?.shadowRoot?.activeElement)
    current = current.shadowRoot.activeElement;
  return current;
};

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

class TrapShadowControls extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    this.attachShadow({ mode: 'open' }).innerHTML =
      '<button id="c1">c1</button><input id="c2"><button id="c3">c3</button>';
  }
}
if (!customElements.get('trap-shadow-controls'))
  customElements.define('trap-shadow-controls', TrapShadowControls);

it.each([
  [
    'the light DOM',
    <>
      <button id="c1">c1</button>
      <input id="c2" />
      <button id="c3">c3</button>
    </>,
  ],
  [
    'an open shadow root',
    // @ts-expect-error custom element without JSX typing
    <trap-shadow-controls />,
  ],
])('gives the same tab order and wrapping for controls in %s', (_, content) => {
  render(<BootstrapProvider />);
  open(content);
  const frame = document.querySelector<HTMLElement>('[role="dialog"]')!;
  expect(getTabbableElements(frame).map((element) => element.id)).toEqual([
    'c1',
    'c2',
    'c3',
  ]);
  expect(deepActiveElement()?.id).toBe('c1');
  expect(tab(true)).toBe(false);
  expect(deepActiveElement()?.id).toBe('c3');
  expect(tab()).toBe(false);
  expect(deepActiveElement()?.id).toBe('c1');
  const middle = getTabbableElements(frame)[1];
  middle.focus();
  expect(tab()).toBe(true);
  expect(tab(true)).toBe(true);
});

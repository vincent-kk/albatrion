import { act, cleanup, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, expect, it } from 'vitest';

import { BootstrapProvider } from '@/promise-modal/bootstrap';
import { confirmHandler } from '@/promise-modal/core';

import { ModalManager } from '../ModalManager';

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

class TrapShadowButtons extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = '<button id="s1">s1</button><button id="s2">s2</button>';
  }
}
if (!customElements.get('trap-shadow-buttons'))
  customElements.define('trap-shadow-buttons', TrapShadowButtons);

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

it('wraps Shift+Tab from the initially focused radio of an unchecked leading group', () => {
  render(<BootstrapProvider />);
  open(
    <>
      <input type="radio" name="g" id="r1" />
      <input type="radio" name="g" id="r2" />
      <button id="last">last</button>
    </>,
  );
  expect(document.activeElement?.id).toBe('r1');
  expect(tab(true)).toBe(false);
  expect(document.activeElement?.id).toBe('last');
});

it('wraps Tab from a radio entered by Shift+Tab in an unchecked trailing group', () => {
  render(<BootstrapProvider />);
  open(
    <>
      <button id="first">first</button>
      <input type="radio" name="g" id="r1" />
      <input type="radio" name="g" id="r2" />
    </>,
  );
  expect(document.activeElement?.id).toBe('first');
  tab(true);
  expect(document.activeElement?.id).toBe('r2');
  expect(tab()).toBe(false);
  expect(document.activeElement?.id).toBe('first');
});

it('lets Tab move from a light control into an open shadow root', () => {
  render(<BootstrapProvider />);
  open(
    <>
      <button id="a">a</button>
      {/* @ts-expect-error custom element without JSX typing */}
      <trap-shadow-buttons />
    </>,
  );
  expect(document.activeElement?.id).toBe('a');
  expect(tab()).toBe(true);
  expect(document.activeElement?.id).toBe('a');
});

it('wraps Tab from the last control inside an open shadow root', () => {
  render(<BootstrapProvider />);
  open(
    <>
      <button id="a">a</button>
      {/* @ts-expect-error custom element without JSX typing */}
      <trap-shadow-buttons />
    </>,
  );
  const host = document.querySelector('trap-shadow-buttons')!;
  (host.shadowRoot!.getElementById('s2') as HTMLElement).focus();
  expect(deepActiveElement()?.id).toBe('s2');
  expect(tab()).toBe(false);
  expect(document.activeElement?.id).toBe('a');
});

it('wraps Shift+Tab from a tabindex=-1 heading before the first control', () => {
  render(<BootstrapProvider />);
  open(
    <>
      <h2 id="heading" tabIndex={-1}>
        heading
      </h2>
      <button id="first">first</button>
      <button id="last">last</button>
    </>,
  );
  (document.getElementById('heading') as HTMLElement).focus();
  expect(tab(true)).toBe(false);
  expect(document.activeElement?.id).toBe('last');
});

it('wraps Tab from a tabindex=-1 element after the last control', () => {
  render(<BootstrapProvider />);
  open(
    <>
      <button id="first">first</button>
      <button id="last">last</button>
      <p id="note" tabIndex={-1}>
        note
      </p>
    </>,
  );
  (document.getElementById('note') as HTMLElement).focus();
  expect(tab()).toBe(false);
  expect(document.activeElement?.id).toBe('first');
});

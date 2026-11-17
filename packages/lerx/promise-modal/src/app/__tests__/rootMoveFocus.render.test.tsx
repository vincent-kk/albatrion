import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { BootstrapProvider } from '@/promise-modal/bootstrap';
import { confirmHandler } from '@/promise-modal/core';

import { ModalManager } from '../ModalManager';

const roots: HTMLElement[] = [];

afterEach(() => {
  cleanup();
  ModalManager.reset();
  for (const root of roots.splice(0)) root.remove();
});

it('keeps the focused control inside the pending dimmed modal when the root element changes', () => {
  const first = document.createElement('div');
  const second = document.createElement('div');
  roots.push(first, second);
  document.body.append(first, second);
  const view = render(<BootstrapProvider root={first} />);
  act(() => {
    void confirmHandler({
      title: 't',
      content: (
        <>
          <button id="inside-first">inside-first</button>
          <input id="inside-input" />
        </>
      ),
      footer: false,
    });
  });
  (document.getElementById('inside-input') as HTMLElement).focus();
  view.rerender(<BootstrapProvider root={second} />);
  expect(second.contains(document.activeElement)).toBe(true);
  expect(document.activeElement?.id).toBe('inside-input');
});

class RootMoveShadowInput extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    this.attachShadow({ mode: 'open' }).innerHTML = '<input id="shadow-input">';
  }
}
if (!customElements.get('root-move-shadow-input'))
  customElements.define('root-move-shadow-input', RootMoveShadowInput);

it('keeps the focused control inside an open shadow root when the root element changes', () => {
  const first = document.createElement('div');
  const second = document.createElement('div');
  roots.push(first, second);
  document.body.append(first, second);
  const view = render(<BootstrapProvider root={first} />);
  act(() => {
    void confirmHandler({
      title: 't',
      content: (
        <>
          <button id="inside-first">inside-first</button>
          {/* @ts-expect-error custom element without JSX typing */}
          <root-move-shadow-input tabIndex={-1} />
        </>
      ),
      footer: false,
    });
  });
  // jsdom keeps shadow focus through the move that browsers blur; a focusable host
  // shows whether the manager refocuses the inner control or only its host.
  const host = document.querySelector('root-move-shadow-input')!;
  const input = host.shadowRoot!.getElementById('shadow-input') as HTMLElement;
  input.focus();
  view.rerender(<BootstrapProvider root={second} />);
  expect(document.activeElement).toBe(host);
  expect(host.shadowRoot!.activeElement).toBe(input);
});

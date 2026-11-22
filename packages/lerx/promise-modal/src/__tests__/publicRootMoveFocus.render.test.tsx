import { createContext, useContext } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalProvider, confirm } from '../index';

const roots: HTMLElement[] = [];

afterEach(() => {
  cleanup();
  for (const root of roots.splice(0)) root.remove();
});

it('keeps the focused control inside the pending dimmed modal when the root element changes', () => {
  const first = document.createElement('div');
  const second = document.createElement('div');
  roots.push(first, second);
  document.body.append(first, second);
  const view = render(<ModalProvider root={first} />);
  act(() => {
    void confirm({
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
  view.rerender(<ModalProvider root={second} />);
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
  const view = render(<ModalProvider root={first} />);
  act(() => {
    void confirm({
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
  view.rerender(<ModalProvider root={second} />);
  expect(document.activeElement).toBe(host);
  expect(host.shadowRoot!.activeElement).toBe(input);
});

it('leaves focus on the body if the focused control disappears during a root move', () => {
  const first = document.createElement('div');
  const second = document.createElement('div');
  roots.push(first, second);
  document.body.append(first, second);
  const Shown = createContext(true);
  function Content() {
    return useContext(Shown) ? (
      <button id="disappearing">focused</button>
    ) : null;
  }
  const app = (root: HTMLElement, shown: boolean) => (
    <Shown.Provider value={shown}>
      <ModalProvider root={root} />
    </Shown.Provider>
  );
  const view = render(app(first, true));
  act(() => {
    void confirm({ content: Content });
  });
  document.getElementById('disappearing')?.focus();
  expect(document.activeElement?.id).toBe('disappearing');
  view.rerender(app(second, false));
  expect(document.getElementById('disappearing')).toBeNull();
  expect(document.activeElement).toBe(document.body);
});

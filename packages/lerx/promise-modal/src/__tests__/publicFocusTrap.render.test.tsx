import { type ReactNode, createElement } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalProvider, confirm } from '../index';

/** Sends Tab without relying on jsdom's absent native tab navigation; true means not cancelled. */
const tab = (shiftKey = false) =>
  fireEvent.keyDown(document.activeElement || document, {
    key: 'Tab',
    shiftKey,
  });
/** Opens a dimmed confirm whose frame holds only the given content. */
const open = (content: ReactNode) =>
  act(() => {
    void confirm({ title: 't', content, footer: false });
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
  vi.unstubAllGlobals();
  cleanup();
});

it('wraps Shift+Tab from the initially focused radio of an unchecked leading group', () => {
  render(<ModalProvider />);
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
  render(<ModalProvider />);
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
  render(<ModalProvider />);
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
  render(<ModalProvider />);
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
  render(<ModalProvider />);
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
  render(<ModalProvider />);
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

it('keeps native Tab from a tabindex=-1 element between controls', () => {
  render(<ModalProvider />);
  open(
    <>
      <button id="first">first</button>
      <p id="note" tabIndex={-1}>
        note
      </p>
      <button id="last">last</button>
    </>,
  );
  (document.getElementById('note') as HTMLElement).focus();
  expect(tab()).toBe(true);
  expect(tab(true)).toBe(true);
});

it('keeps native Tab between controls inside an open shadow root', () => {
  render(<ModalProvider />);
  open(
    <>
      <button id="a">a</button>
      {/* @ts-expect-error custom element without JSX typing */}
      <trap-shadow-buttons />
    </>,
  );
  const host = document.querySelector('trap-shadow-buttons')!;
  (host.shadowRoot!.getElementById('s1') as HTMLElement).focus();
  expect(tab()).toBe(true);
  expect(deepActiveElement()?.id).toBe('s1');
});

it.each(['', 'plaintext-only', 'TRUE'])(
  'includes contenteditable=%j without DOM constructor globals',
  (editable) => {
    render(<ModalProvider />);
    vi.stubGlobal('NodeFilter', undefined);
    vi.stubGlobal('ShadowRoot', undefined);
    open(
      <>
        <button id="first">first</button>
        <div id="editor" ref={(node) => node?.setAttribute('contenteditable', editable)} />
      </>,
    );
    const editor = document.getElementById('editor')!;
    // jsdom does not assign the browser's tab index to an editing host.
    Object.defineProperty(editor, 'tabIndex', { configurable: true, value: 0 });
    const focus = vi.spyOn(editor, 'focus');
    expect(document.activeElement?.id).toBe('first');
    expect(tab(true)).toBe(false);
    expect(focus).toHaveBeenCalledOnce();
  },
);

class GroupedShadowControls extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    this.attachShadow({ mode: 'open' }).innerHTML =
      '<input id="shadow-radio" type="radio" checked name="group">';
  }
}
if (!customElements.get('grouped-shadow-controls'))
  customElements.define('grouped-shadow-controls', GroupedShadowControls);

it('keeps a same-named radio in each open tree and omits unslotted light children', () => {
  render(<ModalProvider />);
  open(
    <>
      <input id="light-radio" type="radio" name="group" defaultChecked />
      {createElement(
        'grouped-shadow-controls',
        null,
        <button id="unassigned">unslotted</button>,
      )}
    </>,
  );
  expect(deepActiveElement()?.id).toBe('light-radio');
  expect(tab(true)).toBe(false);
  expect(deepActiveElement()?.id).toBe('shadow-radio');
  expect(tab()).toBe(false);
  expect(deepActiveElement()?.id).toBe('light-radio');
});

class ClosedShadowControls extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'closed' }).innerHTML =
      '<button>Closed control</button>';
  }
}
if (!customElements.get('closed-shadow-controls'))
  customElements.define('closed-shadow-controls', ClosedShadowControls);

it('does not traverse private controls in a closed shadow root', () => {
  render(<ModalProvider />);
  open(
    <>
      <button id="light">Light control</button>
      {createElement('closed-shadow-controls')}
    </>,
  );
  expect(document.activeElement?.id).toBe('light');
  expect(tab(true)).toBe(false);
  expect(document.activeElement?.id).toBe('light');
});

it('can close two requests when an earlier window capture listener settles the top one', async () => {
  const controller = new AbortController();
  window.addEventListener('keydown', () => controller.abort(), {
    capture: true,
    once: true,
  });
  render(<ModalProvider />);
  let lower!: Promise<boolean>;
  let upper!: Promise<boolean>;
  act(() => {
    lower = confirm({ title: 'Lower' });
    upper = confirm({ title: 'Upper', signal: controller.signal });
  });
  await act(async () => {
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: 'Escape',
    });
  });
  await expect(Promise.all([lower, upper])).resolves.toEqual([false, false]);
});

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const flushFrames = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
};

/** A shadow host whose shadow tree holds the React modal root. */
function shadowMount() {
  const host = document.createElement('div');
  host.id = 'host';
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const mount = document.createElement('div');
  mount.id = 'mount';
  shadow.append(mount);
  return { host, shadow, mount };
}

it('control: a light-DOM root isolates page content outside the root', () => {
  const page = document.createElement('main');
  document.body.append(page);
  const mount = document.createElement('div');
  document.body.append(mount);
  render(<ModalProvider root={mount} />);
  act(() => {
    void confirm({ title: 'light' });
  });
  expect(page.hasAttribute('inert')).toBe(true);
});

it('isolates page content outside a shadow host when the root lives in a shadow root', () => {
  const page = document.createElement('main');
  page.innerHTML = '<button id="page-button">page</button>';
  document.body.append(page);
  const { mount } = shadowMount();
  render(<ModalProvider root={mount} />);
  act(() => {
    void confirm({ title: 'shadow' });
  });
  // The page outside the shadow host must not stay interactive behind a dimmed modal.
  expect(page.closest('[inert]')).not.toBeNull();
});

it('injects the modal stylesheet where the shadow-root anchor can match it', async () => {
  const { shadow, mount } = shadowMount();
  render(<ModalProvider root={mount} />);
  act(() => {
    void confirm({ title: 'styled?' });
  });
  await flushFrames();
  const documentHasStyles =
    document.head.querySelectorAll('style').length > 0 ||
    (document.adoptedStyleSheets?.length ?? 0) > 0;
  const shadowHasStyles =
    shadow.querySelectorAll('style').length > 0 ||
    (shadow.adoptedStyleSheets?.length ?? 0) > 0;
  expect(documentHasStyles).toBe(true);
  expect(shadowHasStyles).toBe(true);
});

it('lets Tab move from the first to the second control when the root lives in a shadow root', () => {
  const { shadow, mount } = shadowMount();
  render(<ModalProvider root={mount} />);
  act(() => {
    void confirm({ title: 'tab' });
  });
  const buttons = [...shadow.querySelectorAll('button')];
  expect(buttons.length).toBe(2);
  expect(shadow.activeElement).toBe(buttons[0]);
  // Not the boundary: the trap must leave native Tab alone.
  const event = fireEvent.keyDown(buttons[0], { key: 'Tab' });
  expect(event).toBe(true);
});

it('restores focus to the opener inside a shadow root after the modal closes', async () => {
  class Toolbar extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML =
        '<button id="one">one</button><button id="two">two</button>';
    }
  }
  if (!customElements.get('bounty-r2-toolbar'))
    customElements.define('bounty-r2-toolbar', Toolbar);
  const toolbar = document.createElement('bounty-r2-toolbar');
  document.body.append(toolbar);
  render(<ModalProvider />);
  const opener = toolbar.shadowRoot!.getElementById('two') as HTMLElement;
  opener.focus();
  expect(toolbar.shadowRoot!.activeElement).toBe(opener);
  let result: boolean | undefined;
  act(() => {
    void confirm({ title: 'from shadow opener' }).then((value) => {
      result = value;
    });
  });
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  await act(async () => {});
  expect(result).toBe(false);
  expect(toolbar.shadowRoot!.activeElement).toBe(opener);
});

import {
  act,
  cleanup,
  fireEvent,
  render,
  within,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

const hosts: HTMLElement[] = [];
afterEach(() => {
  cleanup();
  ModalManager.reset();
  for (const host of hosts.splice(0)) host.remove();
});

/** Whether the element or any composed (shadow-host-crossing) ancestor is inert. */
const isComposedInert = (element: Element): boolean => {
  for (let current: Element | null = element; current; ) {
    if (current.closest('[inert]')) return true;
    const tree = current.getRootNode();
    current = tree instanceof ShadowRoot ? tree.host : null;
  }
  return false;
};

/** A shell whose own toolbar sits beside the app's modal root. */
const createShell = (shadow: boolean) => {
  const shell = document.createElement('div');
  const root = document.createElement('div');
  const toolbar = document.createElement('button');
  toolbar.textContent = 'Shell toolbar';
  if (shadow) {
    // Shell chrome lives in the shadow tree; the app root is a slotted light child.
    const tree = shell.attachShadow({ mode: 'open' });
    tree.append(toolbar, document.createElement('slot'));
    shell.append(root);
  } else shell.append(toolbar, root);
  document.body.append(shell);
  hosts.push(shell);
  return { root, toolbar };
};

it('isolates slotted shadow chrome equivalently to the light DOM layout', () => {
  const outcomes = [false, true].map((shadow) => {
    const { root, toolbar } = createShell(shadow);
    render(<ModalProvider root={root} />);
    act(() => {
      void confirm({ title: 'Isolated?' });
    });
    expect(ModalManager.ids).toHaveLength(1);
    const isolated = isComposedInert(toolbar);
    cleanup();
    ModalManager.reset();
    for (const host of hosts.splice(0)) host.remove();
    return isolated;
  });
  expect(outcomes[0]).toBe(true);
  expect(outcomes[1]).toBe(outcomes[0]);
});

/** The page opener is light content slotted beside a modal root inside the shadow tree. */
const createSlottedOpener = (shadow: boolean) => {
  const shell = document.createElement('div');
  const root = document.createElement('div');
  const opener = document.createElement('button');
  opener.textContent = 'Open';
  if (shadow) {
    const tree = shell.attachShadow({ mode: 'open' });
    tree.append(document.createElement('slot'), root);
    shell.append(opener);
  } else shell.append(opener, root);
  document.body.append(shell);
  hosts.push(shell);
  return { root, opener };
};

it.each([false, true])(
  'moves focus into the remaining dimmed modal when the opener stays isolated (slotted opener=%s)',
  (shadow) => {
    const { root, opener } = createSlottedOpener(shadow);
    render(<ModalProvider root={root} />);
    opener.focus();
    act(() => {
      void confirm({ title: 'Lower' });
      void confirm({ title: 'Upper' });
    });
    const [lowerId, upperId] = ModalManager.ids;
    // The slot beside the root carries inert, so the slotted opener is a flat-tree
    // descendant of an inert element in a browser and refuses focus there.
    const slot =
      root.parentNode instanceof ShadowRoot
        ? root.parentNode.querySelector('slot')
        : null;
    if (shadow) expect(slot?.hasAttribute('inert')).toBe(true);
    const cancelButtons = within(root).getAllByText('Cancel');
    act(() => {
      fireEvent.click(cancelButtons[cancelButtons.length - 1]);
    });
    expect(ModalManager.node(upperId)?.settled).toBe(true);
    expect(ModalManager.node(lowerId)?.settled).toBe(false);
    const lowerFrame = within(root)
      .getByText('Lower')
      .closest<HTMLElement>('[tabindex="-1"]')!;
    const active = shadow
      ? (('activeElement' in root.getRootNode()
          ? Reflect.get(root.getRootNode(), 'activeElement')
          : null) ?? document.activeElement)
      : document.activeElement;
    expect(
      lowerFrame.contains(document.activeElement) ||
        lowerFrame.contains(active),
    ).toBe(true);
  },
);

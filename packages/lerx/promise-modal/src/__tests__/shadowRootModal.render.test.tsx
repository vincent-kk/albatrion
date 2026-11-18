import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

function scenario(shadowed: boolean) {
  const page = document.createElement('main');
  document.body.append(page);
  const host = document.createElement('div');
  document.body.append(host);
  const tree = shadowed ? host.attachShadow({ mode: 'open' }) : host;
  const root = document.createElement('div');
  tree.append(root);
  render(<ModalProvider root={root} />);
  act(() => {
    void confirm({ title: 'Tab' });
  });
  const buttons = tree.querySelectorAll('button');
  const initialFocus =
    (shadowed && tree instanceof ShadowRoot
      ? tree.activeElement
      : document.activeElement) === buttons[0];
  const nativeMiddleTab = fireEvent.keyDown(buttons[0], { key: 'Tab' });
  buttons[1].focus();
  const result = {
    isolated: page.hasAttribute('inert'),
    initialFocus,
    nativeMiddleTab,
    trapsLast: !fireEvent.keyDown(buttons[1], { key: 'Tab' }),
  };
  return { result, tree };
}

function reset() {
  cleanup();
  ModalManager.reset();
  document.body.innerHTML = '';
}
afterEach(reset);

it('(round-2 promise-modal 1) gives shadow and light roots equivalent isolation and Tab boundaries', () => {
  const light = scenario(false).result;
  reset();
  const shadow = scenario(true).result;
  expect(light).toEqual({
    isolated: true,
    initialFocus: true,
    nativeMiddleTab: true,
    trapsLast: true,
  });
  expect(shadow).toEqual(light);
});

it('(round-2 promise-modal 1) styles the tree containing the anchor in either root', async () => {
  scenario(false);
  await new Promise((resolve) => setTimeout(resolve, 50));
  const lightStyles =
    document.head.querySelectorAll('style').length +
    (document.adoptedStyleSheets?.length ?? 0);
  reset();
  const { tree } = scenario(true);
  await new Promise((resolve) => setTimeout(resolve, 50));
  const shadowStyles =
    tree.querySelectorAll('style').length +
    (tree instanceof ShadowRoot ? (tree.adoptedStyleSheets?.length ?? 0) : 0);
  expect(lightStyles).toBeGreaterThan(0);
  expect(shadowStyles).toBe(lightStyles);
});

it('(round-2 promise-modal 3) restores the exact opener in light and shadow trees', async () => {
  async function returnsToOpener(shadowed: boolean) {
    const host = document.createElement('div');
    document.body.append(host);
    const tree = shadowed ? host.attachShadow({ mode: 'open' }) : host;
    tree.innerHTML = '<button>one</button><button>two</button>';
    const opener = tree.querySelectorAll('button')[1];
    render(<ModalProvider />);
    opener.focus();
    let result!: Promise<boolean>;
    act(() => {
      result = confirm({ title: 'Return' });
    });
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await act(async () => {
      await result;
    });
    return (
      (tree instanceof ShadowRoot
        ? tree.activeElement
        : document.activeElement) === opener
    );
  }
  const light = await returnsToOpener(false);
  reset();
  const shadow = await returnsToOpener(true);
  expect(light).toBe(true);
  expect(shadow).toBe(light);
});

it('(round-2 promise-modal 1) moves styles with the same provider between light and shadow roots', async () => {
  const light = document.createElement('div');
  const host = document.createElement('div');
  document.body.append(light, host);
  const shadow = host.attachShadow({ mode: 'open' });
  const mount = document.createElement('div');
  shadow.append(mount);
  const view = render(<ModalProvider root={light} />);
  const styles = (tree: Document | ShadowRoot) =>
    tree.querySelectorAll('style').length +
    (tree.adoptedStyleSheets?.length ?? 0);
  await new Promise((resolve) => setTimeout(resolve, 50));
  const initialCount = styles(document);
  view.rerender(<ModalProvider root={mount} />);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(styles(shadow)).toBe(initialCount);
  expect(styles(document)).toBe(0);
  view.rerender(<ModalProvider root={light} />);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(styles(document)).toBe(initialCount);
  expect(styles(shadow)).toBe(0);
});

it('(round-2 promise-modal 1, 3) preserves the top peer focus when a lower modal settles in either tree', () => {
  function retainsPeer(shadowed: boolean) {
    const host = document.createElement('div'); document.body.append(host);
    const tree = shadowed ? host.attachShadow({ mode: 'open' }) : host;
    const mount = document.createElement('div'); tree.append(mount);
    render(<ModalProvider root={mount} />);
    act(() => { void confirm({ title: 'Base' }); });
    act(() => { void confirm({ title: 'Lower' }); });
    const lowerId = ModalManager.ids[1];
    act(() => { void confirm({ title: 'Top' }); });
    const before = tree instanceof ShadowRoot ? tree.activeElement : document.activeElement;
    act(() => ModalManager.node(lowerId)?.onClose());
    return (tree instanceof ShadowRoot ? tree.activeElement : document.activeElement) === before;
  }
  const light = retainsPeer(false); reset();
  const shadow = retainsPeer(true);
  expect(light).toBe(true); expect(shadow).toBe(light);
});

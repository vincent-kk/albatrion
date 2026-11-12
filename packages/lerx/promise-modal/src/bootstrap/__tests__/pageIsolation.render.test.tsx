import { StrictMode, useState } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import {
  active,
  background,
} from '@/promise-modal/components/Background/style';
import { confirmHandler } from '@/promise-modal/core';

import { BootstrapProvider } from '../BootstrapProvider';

/** Opens a request through the mounted provider. */
const open = (options: Parameters<typeof confirmHandler>[0] = {}) => {
  let handle!: ReturnType<typeof confirmHandler>;
  act(() => {
    handle = confirmHandler(options);
  });
  return handle;
};
afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
  document.body.style.cssText = '';
  document
    .querySelectorAll('[data-fixture]')
    .forEach((element) => element.remove());
});

it('gives the fallback frame dialog semantics without imposing them on custom frames', () => {
  const view = render(<BootstrapProvider />);
  open();
  expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true');
  view.unmount();
  render(
    <BootstrapProvider
      ForegroundComponent={({ children }) => <section>{children}</section>}
    />,
  );
  open();
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('blocks dimmed backdrop pointers without enabling click cancellation and leaves toasts pass-through', () => {
  render(<BootstrapProvider />);
  const modal = open({ closeOnBackdropClick: false });
  const backdrop = document.querySelector(`.${background}`)!;
  expect(backdrop.classList.contains(active)).toBe(true);
  fireEvent.click(backdrop);
  expect(modal.modalNode?.settled).toBe(false);
  open({ dimmed: false, closeOnBackdropClick: false });
  expect(
    document.querySelectorAll(`.${background}`)[1].classList.contains(active),
  ).toBe(false);
});

it('isolates ancestor-path siblings, preserves existing inert, and ignores later portals', () => {
  const page = document.createElement('main');
  page.dataset.fixture = 'page';
  const existing = document.createElement('aside');
  existing.setAttribute('inert', 'existing');
  existing.dataset.fixture = 'existing';
  document.body.append(existing);
  const container = document.createElement('div');
  page.append(container);
  document.body.append(page);
  const outer = document.createElement('div');
  outer.dataset.fixture = 'outer';
  document.body.append(outer);
  const sibling = document.createElement('div');
  outer.append(sibling);
  const root = document.createElement('div');
  root.dataset.fixture = 'root';
  outer.append(root);
  const innerSibling = document.createElement('div');
  root.append(innerSibling);
  render(<BootstrapProvider root={root} />, { container });
  const handle = open();
  expect(page.hasAttribute('inert')).toBe(true);
  expect(sibling.hasAttribute('inert')).toBe(true);
  expect(innerSibling.hasAttribute('inert')).toBe(true);
  const portal = document.createElement('div');
  portal.dataset.fixture = 'portal';
  document.body.append(portal);
  open();
  expect(portal.hasAttribute('inert')).toBe(false);
  act(() => {
    for (const id of ModalManager.ids) ModalManager.node(id)?.onClose();
  });
  expect(handle.modalNode?.settled).toBe(true);
  expect(page.hasAttribute('inert')).toBe(false);
  expect(sibling.hasAttribute('inert')).toBe(false);
  expect(innerSibling.hasAttribute('inert')).toBe(false);
  expect(existing.getAttribute('inert')).toBe('existing');
});

it('restores scroll properties only after the final counting modal settles', () => {
  document.body.style.overflow = 'scroll';
  document.body.style.paddingRight = '7px';
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(
    window.innerWidth - 15,
  );
  render(<BootstrapProvider />);
  const first = open();
  const second = open({ manualDestroy: true });
  expect(document.body.style.overflow).toBe('hidden');
  expect(document.body.style.paddingRight).toBe('22px');
  act(() => first.modalNode?.onClose());
  expect(document.body.style.overflow).toBe('hidden');
  act(() => second.modalNode?.onClose());
  expect(document.body.style.overflow).toBe('scroll');
  expect(document.body.style.paddingRight).toBe('7px');
});

it.each([0, 100, -1])(
  'does not compensate an implausible scrollbar width %s',
  (width) => {
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(
      window.innerWidth - width,
    );
    document.body.style.paddingRight = '7px';
    render(<BootstrapProvider />);
    open();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('7px');
  },
);

it('inherits lockScroll false while allowing per-modal override and inert isolation', () => {
  const view = render(
    <BootstrapProvider options={{ lockScroll: false }}>
      <main>page</main>
    </BootstrapProvider>,
  );
  open();
  expect(document.body.style.overflow).toBe('');
  expect(view.container.hasAttribute('inert')).toBe(true);
  open({ lockScroll: true });
  expect(document.body.style.overflow).toBe('hidden');
});

it('keeps a dimmed false modal from isolating or locking the page', () => {
  const view = render(<BootstrapProvider />);
  open({ dimmed: false });
  expect(document.body.style.overflow).toBe('');
  expect(view.container.hasAttribute('inert')).toBe(false);
  open();
  expect(document.body.style.overflow).toBe('hidden');
  expect(view.container.hasAttribute('inert')).toBe(true);
});

it('releases route-hidden modal effects and reapplies them on return', () => {
  let setPath!: (path: string) => void;
  const usePathname = () => {
    const [pathname, update] = useState('/a');
    setPath = update;
    return { pathname };
  };
  const view = render(<BootstrapProvider usePathname={usePathname} />);
  const handle = open({
    content: <button>route-control</button>,
    footer: false,
  });
  expect(document.activeElement).toBe(screen.getByText('route-control'));
  expect(document.body.style.overflow).toBe('hidden');
  act(() => setPath('/b'));
  expect(document.body.style.overflow).toBe('');
  expect(view.container.hasAttribute('inert')).toBe(false);
  act(() => setPath('/a'));
  expect(document.body.style.overflow).toBe('hidden');
  expect(handle.modalNode?.settled).toBe(false);
  expect(document.activeElement).toBe(screen.getByText('route-control'));
});

it('releases effects for a null root and resumes the same pending modal on reattach', () => {
  const root = document.createElement('div');
  root.dataset.fixture = 'root';
  document.body.append(root);
  const view = render(<BootstrapProvider root={root} />);
  const handle = open();
  expect(document.body.style.overflow).toBe('hidden');
  view.rerender(<BootstrapProvider root={null} />);
  expect(document.body.style.overflow).toBe('');
  expect(view.container.hasAttribute('inert')).toBe(false);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(handle.modalNode?.settled).toBe(false);
  view.rerender(<BootstrapProvider root={root} />);
  expect(document.body.style.overflow).toBe('hidden');
});

it('re-evaluates effects during same-commit remounts and cleans everything after unmount', () => {
  const view = render(
    <StrictMode>
      <BootstrapProvider key="a" />
      <button>opener</button>
    </StrictMode>,
  );
  const opener = screen.getByText('opener');
  opener.focus();
  const handle = open();
  expect(document.body.style.overflow).toBe('hidden');
  view.rerender(
    <StrictMode>
      <BootstrapProvider key="b" />
      <button>opener</button>
    </StrictMode>,
  );
  expect(document.body.style.overflow).toBe('hidden');
  expect(handle.modalNode?.settled).toBe(false);
  view.unmount();
  expect(document.body.style.overflow).toBe('');
  expect(document.querySelector('[inert]')).toBeNull();
});

it('reset restores body styles and inert attributes without waiting for React cleanup', () => {
  const view = render(<BootstrapProvider />);
  open();
  expect(document.body.style.overflow).toBe('hidden');
  act(() => ModalManager.reset());
  expect(document.body.style.overflow).toBe('');
  expect(view.container.hasAttribute('inert')).toBe(false);
});

it('moves the inert snapshot to the new root without settling the modal', () => {
  const firstRoot = document.createElement('div');
  const secondRoot = document.createElement('div');
  firstRoot.dataset.fixture = 'first-root';
  secondRoot.dataset.fixture = 'second-root';
  document.body.append(firstRoot, secondRoot);
  const view = render(<BootstrapProvider root={firstRoot} />);
  const handle = open();
  expect(firstRoot.hasAttribute('inert')).toBe(false);
  expect(secondRoot.hasAttribute('inert')).toBe(true);
  view.rerender(<BootstrapProvider root={secondRoot} />);
  expect(firstRoot.hasAttribute('inert')).toBe(true);
  expect(secondRoot.hasAttribute('inert')).toBe(false);
  expect(handle.modalNode?.settled).toBe(false);
  act(() => handle.modalNode?.onDestroy());
  expect(document.body.style.overflow).toBe('');
  expect(firstRoot.hasAttribute('inert')).toBe(false);
});
